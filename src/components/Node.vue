<template>
  <div class="flex flex-col items-center" @click.stop="handleNodeClick">
    <Card :class="[nodeBorder, nodeBackground]">
      <CardHeader>
        <CardTitle class="flex items-center gap-2" :class="[nodeText]">
          <component :is="nodeIcon" :class="[nodeIconColour]" v-if="nodeIcon" />
          {{ displayTitle }}
        </CardTitle>
      </CardHeader>
      <CardContent v-if="props.type !== 'dateTimeConnector'">
        <p>{{ displayDescription }}</p>
      </CardContent>
    </Card>
    <Button
      class="rounded-full"
      variant="outline"
      size="icon"
      @click.stop="handleButtonClick"
    >
      <Plus />
    </Button>
    <Dialog :open="showDialog" @update:open="handleDialogUpdate">
      <DialogContent @click.stop class="max-w-md">
        <DialogHeader>
          <DialogTitle>Create new node</DialogTitle>
          <!-- Validation Error -->
          <div v-if="validationError" class="p-3 bg-red-50 border border-red-200 rounded-md mt-2">
            <p class="text-sm text-red-700 flex items-center">
              <AlertCircle class="w-4 h-4 mr-2 flex-shrink-0" />
              {{ validationError }}
            </p>
          </div>
        </DialogHeader>
        <FormPopup ref="formPopupRef" />
        <DialogFooter class="sm:justify-between">
          <Button 
            variant="ghost" 
            @click="cancelDialog"
            class="hover:bg-red-200"
          >Cancel</Button>
          <Button 
            variant="ghost"
            @click="saveChanges" 
            :disabled="isSaving"
            :class="[
              'bg-gray-200 hover:bg-gray-400',
              isSaving ? 'opacity-50 cursor-not-allowed' : ''
            ]"
          >
            <span v-if="isSaving" class="flex items-center">
              <Loader2 class="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </span>
            <span v-else>Create Node</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { useFlowStore } from "@/stores/flowStore";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Zap,
  MessageSquareMore,
  SendHorizonal,
  CalendarDays,
  CircleCheck,
  CircleAlert,
  AlertCircle,
  Loader2,
} from "lucide-vue-next";
import FormPopup from "./FormPopup.vue";

const props = defineProps({
  id: String,
  data: Object,
  type: String,
});

const showDialog = ref(false);
const formPopupRef = ref(null);
const flowStore = useFlowStore();
const validationError = ref("");
const isSaving = ref(false);
const formValid = ref({
  nodeType: false,
  title: false,
  description: false,
  region: false,
  timezone: false,
});

// Get reactive node data from store
const storeNode = computed(() => flowStore.getNodeById(props.id));

// Reactive node data - combines props with store updates
const nodeData = computed(() => {
  return storeNode.value?.data || props.data;
});

const handleNodeClick = () => {
  if (!showDialog.value) {
    flowStore.selectNode(props.id);
  }
};

const handleButtonClick = (event) => {
  event.stopPropagation();
  showDialog.value = true;
  validationError.value = "";
  resetFormValidation();
};

const handleDialogUpdate = (value) => {
  showDialog.value = value;
  if (!value) {
    resetDialogState();
  }
};

const cancelDialog = () => {
  showDialog.value = false;
  resetDialogState();
};

const resetDialogState = () => {
  validationError.value = "";
  isSaving.value = false;
  resetFormValidation();
  if (formPopupRef.value) {
    formPopupRef.value.resetForm();
  }
};

const resetFormValidation = () => {
  formValid.value = {
    nodeType: false,
    title: false,
    description: false,
    region: false,
    timezone: false,
  };
};

// Validation functions
const validateForm = (formData) => {
  validationError.value = "";
  
  // 1. Validate node type
  if (!formData.nodeType || formData.nodeType.trim() === "") {
    validationError.value = "Please select a node type";
    formValid.value.nodeType = false;
    return false;
  }
  formValid.value.nodeType = true;
  
  // 2. Validate title
  if (!formData.title || formData.title.trim() === "") {
    validationError.value = "Title is required";
    formValid.value.title = false;
    return false;
  }
  
  if (formData.title.trim().length > 50) {
    validationError.value = "Title cannot exceed 50 characters";
    formValid.value.title = false;
    return false;
  }
  formValid.value.title = true;
  
  // 3. Validate based on node type
  switch (formData.nodeType) {
    case "sendMessage":
    case "addComment":
      // Validate description for message and comment nodes
      if (!formData.description || formData.description.trim() === "") {
        const fieldName = formData.nodeType === "sendMessage" ? "message" : "comment";
        validationError.value = `Please enter a ${fieldName}`;
        formValid.value.description = false;
        return false;
      }
      
      if (formData.description.trim().length > 1000) {
        validationError.value = `${formData.nodeType === "sendMessage" ? "Message" : "Comment"} cannot exceed 1000 characters`;
        formValid.value.description = false;
        return false;
      }
      formValid.value.description = true;
      break;
      
    case "dateTime":
      // Validate region for dateTime nodes
      if (!formData.region || formData.region.trim() === "") {
        validationError.value = "Please select a region";
        formValid.value.region = false;
        return false;
      }
      formValid.value.region = true;
      
      // Validate timezone for dateTime nodes
      if (!formData.timezone || formData.timezone.trim() === "") {
        validationError.value = "Please select a timezone";
        formValid.value.timezone = false;
        return false;
      }
      
      // Validate timezone format
      try {
        Intl.DateTimeFormat(undefined, { timeZone: formData.timezone });
      } catch (error) {
        validationError.value = "Invalid timezone selected";
        formValid.value.timezone = false;
        return false;
      }
      formValid.value.timezone = true;
      break;
  }
  
  // 4. Business logic validations
  if (formData.nodeType === "dateTime" && props.type === "dateTime") {
    validationError.value = "Cannot add a Business Hours node to another Business Hours node";
    return false;
  }
  
  if (formData.nodeType === "dateTimeConnector") {
    validationError.value = "Connector nodes cannot be created manually";
    return false;
  }
  
  return true;
};

const saveChanges = async () => {
  if (isSaving.value) return;
  
  const formData = formPopupRef.value.getFormData();
  
  // Validate form
  if (!validateForm(formData)) {
    // Scroll to top of dialog to show error
    nextTick(() => {
      const dialogContent = document.querySelector('.max-w-md');
      if (dialogContent) {
        dialogContent.scrollTop = 0;
      }
    });
    return;
  }
  
  isSaving.value = true;
  
  try {
    const defaultValues = {};
    if (formData.nodeType === "dateTime") {
      defaultValues.timezone = formData.timezone || "UTC";
    }
    
    await flowStore.addNodeWithEdge({
      parentId: props.id,
      formData,
      defaultValues,
    });
    
    formPopupRef.value.resetForm();
    showDialog.value = false;
    resetDialogState();
    
  } catch (error) {
    validationError.value = error.message || "Failed to create node. Please try again.";
    console.error("Error creating node:", error);
  } finally {
    isSaving.value = false;
  }
};

// Display computed properties (keep as is)
const displayTitle = computed(() => {
  return (
    nodeData.value?.name ||
    nodeData.value?.nodeData?.name ||
    (props.type === "trigger" ? "Trigger" : props.type || "Node")
  );
});

const displayDescription = computed(() => {
  const nodeDataValue = nodeData.value?.nodeData || nodeData.value?.data || {};
  switch (props.type) {
    case "trigger":
      return `Triggers on: ${
        nodeDataValue.type === "conversationOpened"
          ? "opening conversation"
          : "unknown"
      }`;
    case "sendMessage":
      const messages = nodeDataValue.payload || [];
      const textMessages = messages.filter((m) => m.type === "text");
      const attachments = messages.filter((m) => m.type === "attachment");
      if (messages.length === 0) return "No messages";
      if (textMessages.length === 1 && attachments.length === 0) {
        const text = textMessages[0].text || "";
        return text.length > 30 ? `${text.substring(0, 30)}...` : text;
      }
      const parts = [];
      if (textMessages.length > 0) parts.push(`${textMessages.length} text(s)`);
      if (attachments.length > 0)
        parts.push(`${attachments.length} attachment(s)`);
      return parts.join(", ");
    case "dateTime":
      const timezone = nodeDataValue.timezone || "UTC";
      return `Business Hours - ${formatTimezoneForDisplay(timezone)}`;
    case "dateTimeConnector":
      return `Connector: ${nodeDataValue.connectorType || "unknown"}`;
    case "addComment":
      return `${nodeDataValue.comment?.substring(0, 30) || "No comment"}...`;
    default:
      return JSON.stringify(nodeDataValue, null, 2);
  }
});

// Helper function to format timezone for display
const formatTimezoneForDisplay = (timezone) => {
  if (!timezone) return "UTC";

  try {
    if (timezone === "UTC") return "UTC";

    const parts = timezone.split("/");
    const city =
      parts.length > 1 ? parts[parts.length - 1].replace(/_/g, " ") : timezone;

    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "short",
    });
    const partsFormatted = formatter.formatToParts(now);
    const tzPart = partsFormatted.find((part) => part.type === "timeZoneName");

    if (tzPart) {
      const tzAbbr = tzPart.value.replace("GMT", "").replace("UTC", "");
      return `${city} (${tzAbbr})`;
    }

    return city;
  } catch (error) {
    console.error("Error formatting timezone:", error);
    return timezone;
  }
};

// Selection and styling computed properties (keep as is)
const isSelected = computed(() => flowStore.selectedNodeId === props.id);

const nodeBorder = computed(() => {
  if (!isSelected.value) return "";

  const data = nodeData.value?.nodeData || nodeData.value?.data || {};

  switch (props.type) {
    case "trigger":
      return "border-2 border-rose-500";
    case "addComment":
      return "border-2 border-gray-500";
    case "sendMessage":
      return "border-2 border-green-500";
    case "dateTime":
      return "border-2 border-amber-500";
    case "dateTimeConnector":
      return data.connectorType === "success"
        ? "border-2 border-blue-500"
        : "border-2 border-red-500";
    default:
      return "border-2 border-gray-400";
  }
});

const nodeBackground = computed(() => {
  if (props.type !== "dateTimeConnector") return "";

  const data = nodeData.value?.nodeData || nodeData.value?.data || {};

  return data.connectorType === "success" ? "bg-blue-500" : "bg-red-500";
});

const nodeText = computed(() => {
  if (props.type !== "dateTimeConnector") return "";

  return "text-white";
});

const nodeIcon = computed(() => {
  switch (props.type) {
    case "trigger":
      return Zap;
    case "addComment":
      return MessageSquareMore;
    case "sendMessage":
      return SendHorizonal;
    case "dateTime":
      return CalendarDays;
    default:
      return null;
  }
});

const nodeIconColour = computed(() => {
  switch (props.type) {
    case "trigger":
      return "text-rose-600";
    case "addComment":
      return "text-gray-600";
    case "sendMessage":
      return "text-green-600";
    case "dateTime":
      return "text-amber-600";
    default:
      return "";
  }
});
</script>