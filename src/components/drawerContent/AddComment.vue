<template>
  <div class="space-y-4">
    <Label>Comments</Label>
    <div class="space-y-2">
      <!-- Editable Textarea (when editing) -->
      <Textarea
        v-if="isEditing"
        v-model="editableComment"
        ref="commentTextareaRef"
        class="mt-2 min-h-[100px] resize-y"
        placeholder="Enter your comment..."
        @keyup.enter.ctrl="saveComment"
        @keydown.esc="cancelEdit"
        autofocus
      />
      <!-- Display Comment (when not editing) -->
      <div
        v-else
        class="mt-2 min-h-[100px] p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors duration-200"
        @click="startEditing"
      >
        <p v-if="displayComment" class="text-sm whitespace-pre-wrap">
          {{ displayComment }}
        </p>
        <p v-else class="text-sm text-muted-foreground italic">
          Click to add comment...
        </p>
      </div>
      <!-- Action Buttons -->
      <div v-if="isEditing" class="flex items-center gap-2">
        <Button size="sm" variant="ghost" @click="saveComment">
          Save Comment
        </Button>
        <Button size="sm" variant="ghost" @click="cancelEdit"> Cancel </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onUnmounted } from "vue";
import { useFlowStore } from "@/stores/flowStore";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const flowStore = useFlowStore();
const node = computed(() => flowStore.selectedNodeNormalized);

// Refs
const commentTextareaRef = ref(null);
const editableComment = ref("");
const originalComment = ref("");
const isEditing = ref(false);

// Watch for node changes
watch(
  node,
  (newNode) => {
    if (newNode) {
      const comment = newNode.nodeData?.comment || "";
      editableComment.value = comment;
      originalComment.value = comment;
      isEditing.value = false;
    }
  },
  { immediate: true }
);

// Display comment for non-editing mode
const displayComment = computed(() => {
  return editableComment.value || "";
});

// Start editing
const startEditing = () => {
  isEditing.value = true;
  nextTick(() => {
    if (commentTextareaRef.value) {
      commentTextareaRef.value.focus();
      // Move cursor to end
      const length = editableComment.value.length;
      commentTextareaRef.value.setSelectionRange(length, length);
    }
  });
};

const saveComment = () => {
  if (!node.value) return;
  const trimmedComment = editableComment.value.trim();
  if (trimmedComment === originalComment.value) {
    isEditing.value = false;
    return;
  }
  flowStore.updateNode(node.value.id, {
    data: {
      ...node.value.data,
      nodeData: {
        ...node.value.nodeData,
        comment: trimmedComment,
      },
    },
  });
  originalComment.value = trimmedComment;
  editableComment.value = trimmedComment;
  isEditing.value = false;
};

const cancelEdit = () => {
  editableComment.value = originalComment.value;
  isEditing.value = false;
};

const handleEscapeKey = (event) => {
  if (event.key === "Escape" && isEditing.value) {
    cancelEdit();
  }
};

if (typeof window !== "undefined") {
  window.addEventListener("keydown", handleEscapeKey);
}

onUnmounted(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("keydown", handleEscapeKey);
  }
});
</script>