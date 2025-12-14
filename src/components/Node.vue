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
      <DialogContent @click.stop>
        <DialogHeader>
          <DialogTitle>Create new node</DialogTitle>
        </DialogHeader>
        <FormPopup ref="formPopupRef" />
        <DialogFooter>
          <Button variant="outline" @click="showDialog = false">Cancel</Button>
          <Button @click="saveChanges">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
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

const node = computed(() => flowStore.selectedNodeNormalized);

const handleNodeClick = () => {
  // Only select node if dialog is not open
  if (!showDialog.value) {
    flowStore.selectNode(props.id);
  }
};

const handleButtonClick = (event) => {
  event.stopPropagation();
  showDialog.value = true;
};

const handleDialogUpdate = (value) => {
  showDialog.value = value;
};

const displayTitle = computed(
  () =>
    props.data.name ||
    props.data.nodeData?.name ||
    (props.type === "trigger" ? "Trigger" : props.type || "Node")
);

const displayDescription = computed(() => {
  const nodeData = props.data.nodeData || props.data.data || {};
  switch (props.type) {
    case "trigger":
      return `Triggers on: ${
        nodeData.type === "conversationOpened"
          ? "opening conversation"
          : "unknown"
      }`;
    case "sendMessage":
      const messages = nodeData.payload || [];
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
      // Get timezone or default to UTC
      const timezone = nodeData.timezone || "UTC";
      // Format timezone nicely
      return `Business Hours - ${formatTimezoneForDisplay(timezone)}`;
    case "dateTimeConnector":
      return `Connector: ${nodeData.connectorType || "unknown"}`;
    case "addComment":
      return `Comment: ${
        nodeData.comment?.substring(0, 30) || "No comment"
      }...`;
    default:
      return JSON.stringify(nodeData, null, 2);
  }
});

// Helper function to format timezone for display
const formatTimezoneForDisplay = (timezone) => {
  if (!timezone) return "UTC";

  try {
    if (timezone === "UTC") return "UTC";

    // Extract city name
    const parts = timezone.split("/");
    const city =
      parts.length > 1 ? parts[parts.length - 1].replace(/_/g, " ") : timezone;

    // Get UTC offset
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "short",
    });
    const partsFormatted = formatter.formatToParts(now);
    const tzPart = partsFormatted.find((part) => part.type === "timeZoneName");

    if (tzPart) {
      // Format like "New York (EST)" or "London (GMT+1)"
      const tzAbbr = tzPart.value.replace("GMT", "").replace("UTC", "");
      return `${city} (${tzAbbr})`;
    }

    return city;
  } catch (error) {
    console.error("Error formatting timezone:", error);
    return timezone;
  }
};

const saveChanges = () => {
  const formData = formPopupRef.value.getFormData();
  if (!formData?.nodeType || !formData?.title) return;

  // For dateTime nodes, pass the timezone if selected
  const defaultValues = {};
  if (formData.nodeType === "dateTime" && formData.timezone) {
    defaultValues.timezone = formData.timezone;
  }

  flowStore.addNodeWithEdge({
    parentId: props.id,
    formData,
    defaultValues,
  });

  formPopupRef.value.resetForm();
  showDialog.value = false;
};

const isSelected = computed(() => node.value?.id === props.id);

const nodeBorder = computed(() => {
  // Only apply border if this node is selected
  if (!isSelected.value) return "";

  const data = props.data.nodeData || props.data.data || {};

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

  const data = props.data.nodeData || props.data.data || {};

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
