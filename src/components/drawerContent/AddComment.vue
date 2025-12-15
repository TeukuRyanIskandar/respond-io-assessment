<template>
  <div class="space-y-4">
    <Label>Comments</Label>
    
    <div class="space-y-3">
      <Textarea 
        v-model="editableComment"
        ref="textareaRef"
        class="p-2 min-h-[100px] resize-y"
        placeholder="Add comment..."
        @input="handleInput"
      />
      
      <!-- Save/Cancel Buttons -->
      <div v-if="hasChanges" class="flex flex-row-reverse items-center gap-2">
        <Button 
          size="sm" 
          variant="ghost" 
          class="hover:bg-gray-200"
          @click="saveComment"
        >
          Save
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          class="hover:bg-red-200"
          @click="cancelEdit"
        >
          Cancel
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { useFlowStore } from "@/stores/flowStore";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const flowStore = useFlowStore();
const node = computed(() => flowStore.selectedNodeNormalized);

// Refs
const textareaRef = ref(null);
const editableComment = ref("");
const originalComment = ref("");
const hasChanges = ref(false);

// Watch for node changes
watch(
  node,
  (newNode) => {
    if (newNode) {
      const comment = newNode.nodeData?.comment || "";
      editableComment.value = comment;
      originalComment.value = comment;
      hasChanges.value = false;
    }
  },
  { immediate: true }
);

// Handle input changes
const handleInput = () => {
  hasChanges.value = editableComment.value !== originalComment.value;
};

// Save comment
const saveComment = () => {
  if (!node.value) return;

  const trimmedComment = editableComment.value.trim();
  
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
  hasChanges.value = false;
};

// Cancel edit
const cancelEdit = () => {
  editableComment.value = originalComment.value;
  hasChanges.value = false;
  
  // Focus the textarea after cancel
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.focus();
    }
  });
};

// Optional: Save on Ctrl+Enter
const handleKeydown = (event) => {
  if (event.ctrlKey && event.key === 'Enter') {
    if (hasChanges.value) {
      saveComment();
    }
  }
  if (event.key === 'Escape' && hasChanges.value) {
    cancelEdit();
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeydown);
}

import { onUnmounted } from 'vue';
onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeydown);
  }
});
</script>