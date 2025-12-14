<template>
  <SheetContent side="right" class="w-[420px]">
    <SheetHeader>
      <SheetTitle>
        {{ flowStore.selectedNode?.data?.name || "Node Details" }}
      </SheetTitle>
    </SheetHeader>

    <div class="mt-4 space-y-4">
      <div>
        <p class="text-sm text-muted-foreground">Node ID</p>
        <p class="font-mono text-sm">
          {{ flowStore.selectedNode?.id }}
        </p>
      </div>

      <div>
        <p class="text-sm text-muted-foreground">Type</p>
        <p class="text-sm">
          {{ flowStore.selectedNode?.type }}
        </p>
      </div>

      <div>
        <p class="text-sm text-muted-foreground">Data</p>
        <pre class="text-xs bg-muted p-3 rounded overflow-auto"
          >{{ flowStore.selectedNode?.data }}
            </pre
        >
      </div>
    </div>
  </SheetContent>
</template>

<script setup>
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

import { useFlowStore } from "@/stores/flowStore";

const flowStore = useFlowStore();

const props = defineProps({
  id: String,
  data: Object,
  type: String,
});
</script>
