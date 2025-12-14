<template>
  <div
    class="flex flex-col items-center"
    @click.stop="handleNodeClick"
  >
    <Card :class="[nodeBorder]">
      <CardHeader>
        <CardTitle>{{ displayTitle }}</CardTitle>
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
import { Plus } from "lucide-vue-next";
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
      return `Business hours: ${nodeData.times?.length || 0} days`;
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

const saveChanges = () => {
  const formData = formPopupRef.value.getFormData();
  if (!formData?.nodeType || !formData?.title) return;

  flowStore.addNodeWithEdge({
    parentId: props.id,
    formData,
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
    default:
      return "";
  }
});
</script>