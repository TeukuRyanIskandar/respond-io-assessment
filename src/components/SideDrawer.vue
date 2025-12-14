<template>
  <SheetContent side="right" class="w-[420px]">
    <SheetHeader>
      <SheetTitle>
        {{ displayTitle || "Node Details" }}
      </SheetTitle>
      <SheetDescription>
        {{ displayDescription || "Node description" }}
      </SheetDescription>
    </SheetHeader>
    <div v-if="showDetailsSection" class="mt-4 space-y-4">
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
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useFlowStore } from "@/stores/flowStore";
import { computed } from "vue";

const flowStore = useFlowStore();

const props = defineProps({
  id: String,
  data: Object,
  type: String,
});

const node = computed(() => flowStore.selectedNodeNormalized);

const displayTitle = computed(() => node.value?.displayName);

const displayDescription = computed(() => {
  if (!node.value) return "";

  const data = node.value.nodeData;

  switch (node.value.type) {
    case "trigger":
      return `Triggers on: ${
        data.type === "conversationOpened" ? "opening conversation" : "unknown"
      }`;

    case "dateTime":
      return `Business hours: ${data.times?.length || 0} days`;

    case "dateTimeConnector":
      return `Actions to perform  when condition ${
        data.connectorType === "success" ? "succeeds" : "fails"
      }`;

    case "addComment":
      return `Comment: ${data.comment || "No comment"}`;

    default:
      return "";
  }
});

const showDetailsSection = computed(() => {
  const type = node.value?.type;
  return type !== "trigger" && type !== "dateTimeConnector";
});
</script>
