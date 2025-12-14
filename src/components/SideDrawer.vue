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
    <div v-if="showDetailsSection && drawerComponent" class="mt-4 space-y-4">
      <component :is="drawerComponent" />
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
import AddComment from "./drawerContent/AddComment.vue";

const flowStore = useFlowStore();

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

const drawerComponent = computed(() => {
  if (!node.value) return null;

  switch (node.value.type) {
    case "addComment":
      return AddComment;

    // case "sendMessage":
    //   return SendMessage
    // case "dateTime":
    //   return BusinessHours

    default:
      return null;
  }
});
</script>
