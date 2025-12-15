<template>
  <div class="space-y-4">
    <div class="space-y-1">
      <Label>Comments</Label>
      <p class="text-xs text-muted-foreground">
        Add comments for this workflow step (max 1000 characters)
      </p>
    </div>
    
    <div class="space-y-3">
      <div class="relative">
        <Textarea 
          v-model="editableComment"
          ref="textareaRef"
          class="p-2 min-h-[100px] resize-y"
          :class="hasError ? 'border-red-300 focus-visible:ring-red-200' : ''"
          placeholder="Add comment..."
          @input="handleInput"
          maxlength="1000"
        />
        <!-- Character counter -->
        <div class="absolute bottom-2 right-2">
          <span 
            :class="[
              'text-xs',
              isNearLimit ? 'text-amber-600 font-medium' : 'text-muted-foreground'
            ]"
          >
            {{ editableComment.length }}/1000
          </span>
        </div>
      </div>

      <!-- Validation Error -->
      <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-200 rounded-md">
        <p class="text-sm text-red-700 flex items-center">
          <AlertCircle class="w-4 h-4 mr-2 flex-shrink-0" />
          {{ errorMessage }}
        </p>
      </div>

      <!-- Save/Cancel Buttons -->
      <div v-if="hasChanges" class="flex flex-row-reverse items-center gap-2">
        <Button 
          size="sm" 
          variant="ghost" 
          class="hover:bg-gray-200"
          :disabled="hasError"
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
import { AlertCircle } from "lucide-vue-next";

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
const errorMessage = ref("");
const hasError = ref(false);

// Computed properties
const isNearLimit = computed(() => {
  return editableComment.value.length > 900;
});

/* ---------- VALIDATION ---------- */
const validateComment = (comment) => {
  if (comment.trim().length === 0) {
    return { isValid: false, error: "Comment cannot be empty" };
  }
  if (comment.length > 1000) {
    return { isValid: false, error: "Comment cannot exceed 1000 characters" };
  }
  return { isValid: true, error: "" };
};

/* ---------- WATCH NODE CHANGES ---------- */
watch(
  node,
  (newNode) => {
    if (newNode) {
      const comment = newNode.nodeData?.comment || "";
      editableComment.value = comment;
      originalComment.value = comment;
      hasChanges.value = false;
      errorMessage.value = "";
      hasError.value = false;
      
      // Validate on load
      const validation = validateComment(comment);
      if (!validation.isValid) {
        errorMessage.value = validation.error;
        hasError.value = true;
      }
    }
  },
  { immediate: true }
);

/* ---------- HANDLE INPUT ---------- */
const handleInput = () => {
  hasChanges.value = editableComment.value !== originalComment.value;
  
  // Validate on input
  const validation = validateComment(editableComment.value);
  hasError.value = !validation.isValid;
  errorMessage.value = validation.error;
  
  // Clear error when user starts typing valid content
  if (validation.isValid && errorMessage.value) {
    errorMessage.value = "";
  }
};

/* ---------- SAVE COMMENT ---------- */
const saveComment = () => {
  if (!node.value) return;

  const trimmedComment = editableComment.value.trim();
  
  // Validate before saving
  const validation = validateComment(trimmedComment);
  if (!validation.isValid) {
    errorMessage.value = validation.error;
    hasError.value = true;
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
  hasChanges.value = false;
  errorMessage.value = "";
  hasError.value = false;
};

/* ---------- CANCEL EDIT ---------- */
const cancelEdit = () => {
  editableComment.value = originalComment.value;
  hasChanges.value = false;
  
  // Re-validate after cancel
  const validation = validateComment(editableComment.value);
  hasError.value = !validation.isValid;
  errorMessage.value = validation.error;
  
  // Focus the textarea after cancel
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.focus();
    }
  });
};

/* ---------- KEYBOARD SHORTCUTS ---------- */
const handleKeydown = (event) => {
  if (!hasChanges.value) return;
  
  if (event.ctrlKey && event.key === 'Enter') {
    event.preventDefault();
    saveComment();
  }
  if (event.key === 'Escape') {
    event.preventDefault();
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