<template>
  <Label>Comments</Label>

  <Textarea 
    v-model="comment"
    @focus="clearDefault"
    class="mt-2"
  />
</template>

<script setup>
import { computed } from "vue";
import { useFlowStore } from "@/stores/flowStore";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const flowStore = useFlowStore();

const node = computed(() => flowStore.selectedNodeNormalized);

const comment = computed({
  get() {
    return node.value?.nodeData?.comment || "Add comment...";
  },
  set(value) {
    if (!node.value) return;

    flowStore.updateNode(node.value.id, {
      data: {
        ...node.value.data,
        nodeData: {
          ...node.value.nodeData,
          comment: value,
        },
      },
    });
  },
});

const clearDefault = () => {
  if (comment.value === "Add comment...") {
    comment.value = ""
  }
}

</script>
