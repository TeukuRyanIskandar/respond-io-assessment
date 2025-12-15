<template>
  <SheetContent
    side="right"
    class="w-[420px] flex flex-col"
    :class="[drawerBackground]"
  >
    <SheetHeader>
      <div class="space-y-2">
        <!-- Title Display -->
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <component
              :is="drawerIcon"
              class="w-5 h-5 flex-shrink-0"
              :class="[iconTextColour]"
            />
            <div class="relative flex-1">
              <!-- Editable Title Textarea (when editing and NOT dateTimeConnector) -->
              <Textarea
                v-if="isEditingTitle && !isDateTimeConnector"
                v-model="editableTitle"
                class="text-lg leading-7 font-semibold border-none bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[auto] focus:outline-none focus:shadow-none focus:border-none overflow-hidden transition-all duration-200"
                rows="1"
                @blur="saveTitle"
                @keyup.enter.ctrl="saveTitle"
                @keydown.esc="cancelTitleEdit"
                autofocus
                ref="titleTextareaRef"
              />
              <!-- Static Title (when not editing OR dateTimeConnector) -->
              <h3
                v-if="!isEditingTitle || isDateTimeConnector"
                :class="[
                  'text-lg font-semibold',
                  isDateTimeConnector
                    ? 'select-none'
                    : 'cursor-pointer hover:bg-black/5 p-1 -m-1 rounded transition-all duration-200',
                ]"
                @click="isDateTimeConnector ? null : startEditingTitle()"
              >
                {{ editableTitle || (isDateTimeConnector ? nodeTypeLabel : "Click to edit title") }}
              </h3>
            </div>
          </div>

          <!-- Title Action Buttons (only show if NOT dateTimeConnector) -->
          <div
            v-if="isEditingTitle && !isDateTimeConnector"
            class="flex items-center gap-2 pl-[1.75rem]"
          >
            <Button size="sm" variant="ghost" @click="saveTitle">
              Save Title
            </Button>
            <Button size="sm" variant="ghost" @click="cancelTitleEdit">
              Cancel
            </Button>
          </div>
        </div>
      </div>

      <!-- Description Display -->
      <SheetDescription>
        <div class="space-y-2">
          <div class="relative">
            <!-- Editable Description Textarea (when editing and NOT dateTimeConnector) -->
            <Textarea
              v-if="isEditingDescription && !isDateTimeConnector"
              v-model="editableDescription"
              class="min-h-[80px] w-full transition-all duration-200"
              placeholder="Enter description..."
              @blur="saveDescription"
              @keyup.enter.ctrl="saveDescription"
              @keydown.esc="cancelDescriptionEdit"
              autofocus
              ref="descriptionTextareaRef"
            />
            <!-- Static Description (when not editing OR dateTimeConnector) -->
            <p
              v-if="!isEditingDescription || isDateTimeConnector"
              :class="[
                'text-sm text-muted-foreground whitespace-pre-wrap',
                isDateTimeConnector
                  ? 'select-none p-2'
                  : 'cursor-pointer hover:bg-black/5 p-2 rounded transition-all duration-200',
              ]"
              @click="isDateTimeConnector ? null : startEditingDescription()"
            >
              {{ editableDescription || "Click to add description" }}
            </p>
          </div>

          <!-- Description Action Buttons (only show if NOT dateTimeConnector) -->
          <div v-if="isEditingDescription && !isDateTimeConnector" class="flex items-center gap-2">
            <Button size="sm" variant="ghost" @click="saveDescription">
              Save Description
            </Button>
            <Button size="sm" variant="ghost" @click="cancelDescriptionEdit">
              Cancel
            </Button>
          </div>
        </div>
      </SheetDescription>
    </SheetHeader>

    <div
      v-if="showDetailsSection && drawerComponent"
      class="space-y-4 flex-1 overflow-auto"
    >
      <component :is="drawerComponent" />
    </div>

    <SheetFooter class="mt-auto pt-6">
      <AlertDialog>
        <AlertDialogTrigger as-child>
          <Button variant="destructive" class="ml-auto">Delete</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Node?</AlertDialogTitle>
            <AlertDialogDescription>
              Deleting a node will also delete it's children
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              @click="handleDelete"
              class="bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SheetFooter>
  </SheetContent>
</template>

<script setup>
import { useFlowStore } from "@/stores/flowStore";
import { computed, ref, watch, nextTick, onUnmounted } from "vue";

import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetFooter,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  CalendarDays,
  CircleAlert,
  CircleCheck,
  MessageSquareMore,
  SendHorizonal,
  Zap,
} from "lucide-vue-next";

import AddComment from "./drawerContent/AddComment.vue";
import SendMessage from "./drawerContent/SendMessage.vue";
import DateTime from "./drawerContent/DateTime.vue";

const flowStore = useFlowStore();
const node = computed(() => flowStore.selectedNodeNormalized);

// Check if current node is dateTimeConnector
const isDateTimeConnector = computed(() => {
  return node.value?.type === "dateTimeConnector";
});

// Node type label (used for dateTimeConnector display)
const nodeTypeLabel = computed(() => {
  if (!node.value) return "";

  switch (node.value.type) {
    case "trigger":
      return "Trigger";
    case "addComment":
      return "Add Comment";
    case "sendMessage":
      return "Send Message";
    case "dateTime":
      return "Business Hours";
    case "dateTimeConnector":
      const type = node.value.nodeData?.connectorType || "";
      return type === "success" ? "Success Connector" : "Failure Connector";
    default:
      return node.value.type || "Node";
  }
});

// Refs for textarea focus
const titleTextareaRef = ref(null);
const descriptionTextareaRef = ref(null);

// Editable title
const editableTitle = ref("");
const originalTitle = ref("");
const isEditingTitle = ref(false);

// Editable description
const editableDescription = ref("");
const originalDescription = ref("");
const isEditingDescription = ref(false);

// Watch for node changes to update the editable fields
watch(
  node,
  (newNode) => {
    if (newNode) {
      // Update title
      const title = newNode.displayName || "";
      editableTitle.value = title;
      originalTitle.value = title;

      // Update description
      const description = getNodeDescription(newNode) || "";
      editableDescription.value = description;
      originalDescription.value = description;

      // Exit edit modes when node changes
      isEditingTitle.value = false;
      isEditingDescription.value = false;
    }
  },
  { immediate: true }
);

// Helper function to extract description from node
const getNodeDescription = (node) => {
  if (!node) return "";

  switch (node.type) {
    case "trigger":
      return `Triggers on: ${
        node.nodeData?.type === "conversationOpened"
          ? "opening conversation"
          : "unknown"
      }`;
    case "addComment":
      return node.nodeData?.comment || "";
    case "sendMessage":
      const messages = node.nodeData?.payload || [];
      if (messages.length === 0) return "No messages";

      const textMessages = messages.filter((m) => m.type === "text");
      if (textMessages.length > 0) {
        return textMessages[0].text || "";
      }
      return "Message with attachments";
    case "dateTime":
      const timezone = node.nodeData?.timezone || "UTC";
      return `Business Hours configured for ${timezone}`;
    case "dateTimeConnector":
      return `Actions to perform when condition ${
        node.nodeData?.connectorType === "success" ? "succeeds" : "fails"
      }`;
    default:
      return "";
  }
};

// Title editing functionality (disabled for dateTimeConnector)
const startEditingTitle = () => {
  if (isDateTimeConnector.value) return;
  
  isEditingTitle.value = true;
  nextTick(() => {
    if (titleTextareaRef.value) {
      titleTextareaRef.value.focus();
      // Move cursor to end
      const length = editableTitle.value.length;
      titleTextareaRef.value.setSelectionRange(length, length);
    }
  });
};

const saveTitle = async () => {
  if (isDateTimeConnector.value || !node.value || editableTitle.value === originalTitle.value) {
    isEditingTitle.value = false;
    return;
  }

  const updates = {
    data: {
      ...node.value.data,
      name: editableTitle.value.trim(),
      nodeData: {
        ...(node.value.data?.nodeData || {}),
        name: editableTitle.value.trim(),
      },
    },
  };

  flowStore.updateNode(node.value.id, updates);
  originalTitle.value = editableTitle.value.trim();
  isEditingTitle.value = false;
};

const cancelTitleEdit = () => {
  if (isDateTimeConnector.value) return;
  
  editableTitle.value = originalTitle.value;
  isEditingTitle.value = false;
};

// Description editing functionality (disabled for dateTimeConnector)
const startEditingDescription = () => {
  if (isDateTimeConnector.value) return;
  
  isEditingDescription.value = true;
  nextTick(() => {
    if (descriptionTextareaRef.value) {
      descriptionTextareaRef.value.focus();
      // Move cursor to end
      const length = editableDescription.value.length;
      descriptionTextareaRef.value.setSelectionRange(length, length);
    }
  });
};

const saveDescription = () => {
  if (isDateTimeConnector.value || !node.value) return;

  const description = editableDescription.value.trim();

  if (description === originalDescription.value) {
    isEditingDescription.value = false;
    return;
  }

  // Update the node based on its type
  let updates = {
    data: {
      ...node.value.data,
    },
  };

  switch (node.value.type) {
    case "addComment":
      updates.data.nodeData = {
        ...(node.value.data?.nodeData || {}),
        comment: description,
      };
      break;

    case "sendMessage":
      const messages = node.value.nodeData?.payload || [];
      if (messages.length === 0) {
        updates.data.nodeData = {
          ...(node.value.data?.nodeData || {}),
          payload: description ? [{ type: "text", text: description }] : [],
        };
      } else {
        // Update first text message or add one
        const updatedMessages = [...messages];
        const textMessageIndex = updatedMessages.findIndex(
          (m) => m.type === "text"
        );

        if (textMessageIndex !== -1) {
          updatedMessages[textMessageIndex] = {
            ...updatedMessages[textMessageIndex],
            text: description,
          };
        } else if (description) {
          updatedMessages.push({ type: "text", text: description });
        }

        updates.data.nodeData = {
          ...(node.value.data?.nodeData || {}),
          payload: updatedMessages,
        };
      }
      break;

    case "dateTime":
      // For dateTime nodes, we might want to store a custom description
      updates.data.nodeData = {
        ...(node.value.data?.nodeData || {}),
        customDescription: description,
      };
      break;

    default:
      // For other node types, store in a generic description field
      updates.data.nodeData = {
        ...(node.value.data?.nodeData || {}),
        description: description,
      };
  }

  flowStore.updateNode(node.value.id, updates);
  originalDescription.value = description;
  isEditingDescription.value = false;
};

const cancelDescriptionEdit = () => {
  if (isDateTimeConnector.value) return;
  
  editableDescription.value = originalDescription.value;
  isEditingDescription.value = false;
};

// Watch for Escape key press (only for non-dateTimeConnector nodes)
const handleEscapeKey = (event) => {
  if (event.key === "Escape" && !isDateTimeConnector.value) {
    if (isEditingTitle.value) {
      cancelTitleEdit();
    } else if (isEditingDescription.value) {
      cancelDescriptionEdit();
    }
  }
};

// Add global escape key listener
if (typeof window !== "undefined") {
  window.addEventListener("keydown", handleEscapeKey);
}

// Clean up event listener
onUnmounted(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("keydown", handleEscapeKey);
  }
});

// Computed properties for display
const showDetailsSection = computed(() => {
  const type = node.value?.type;
  return type !== "trigger" && type !== "dateTimeConnector";
});

const drawerComponent = computed(() => {
  if (!node.value) return null;

  switch (node.value.type) {
    case "addComment":
      return AddComment;
    case "sendMessage":
      return SendMessage;
    case "dateTime":
      return DateTime;
    default:
      return null;
  }
});

const drawerIcon = computed(() => {
  if (!node.value) return null;
  const data = node.value.nodeData;

  switch (node.value.type) {
    case "trigger":
      return Zap;
    case "addComment":
      return MessageSquareMore;
    case "sendMessage":
      return SendHorizonal;
    case "dateTime":
      return CalendarDays;
    case "dateTimeConnector":
      return data?.connectorType === "success" ? CircleCheck : CircleAlert;
    default:
      return null;
  }
});

const drawerBackground = computed(() => {
  if (!node.value) return "";
  const data = node.value.nodeData;

  switch (node.value.type) {
    case "trigger":
      return "bg-rose-100";
    case "addComment":
      return "bg-gray-100";
    case "sendMessage":
      return "bg-green-100";
    case "dateTime":
      return "bg-amber-100";
    case "dateTimeConnector":
      return data?.connectorType === "success" ? "bg-blue-100" : "bg-red-100";
    default:
      return "";
  }
});

const iconTextColour = computed(() => {
  if (!node.value) return "";
  const data = node.value.nodeData;

  switch (node.value.type) {
    case "trigger":
      return "text-rose-600";
    case "addComment":
      return "text-gray-600";
    case "sendMessage":
      return "text-green-600";
    case "dateTime":
      return "text-amber-600";
    case "dateTimeConnector":
      return data?.connectorType === "success"
        ? "text-blue-600"
        : "text-red-600";
    default:
      return "";
  }
});

const handleDelete = () => {
  if (!node.value) return;

  flowStore.deleteNodeAndChildren(node.value.id);
  flowStore.clearSelection();
};
</script>