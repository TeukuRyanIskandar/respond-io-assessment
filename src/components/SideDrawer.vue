<template>
  <SheetContent side="right" class="w-[420px]" :class="[drawerBackground]">
    <SheetHeader>
      <SheetTitle class="flex items-center gap-2">
        <component :is="drawerIcon" class="w-5 h-5" :class="[iconTextColour]" />
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
import SendMessage from "./drawerContent/SendMessage.vue";
import DateTime from "./drawerContent/DateTime.vue";
import {
  CalendarDays,
  CircleAlert,
  CircleCheck,
  MessageSquareMore,
  SendHorizonal,
  Zap,
} from "lucide-vue-next";

const flowStore = useFlowStore();
const node = computed(() => flowStore.selectedNodeNormalized);

const displayTitle = computed(() => node.value?.displayName);

const displayDescription = computed(() => {
  if (!node.value) return "";
  const data = node.value.nodeData;
  
  switch (node.value.type) {
    case "trigger":
      return `Triggers on: ${
        data?.type === "conversationOpened" ? "opening conversation" : "unknown"
      }`;
    case "dateTime":
      return "Configure business hours for each day of the week";
    case "dateTimeConnector":
      return `Actions to perform when condition ${
        data?.connectorType === "success" ? "succeeds" : "fails"
      }`;
    case "addComment":
      return "Internal notes and comments for this workflow step";
    case "sendMessage":
      return "Automated messages to send to customers";
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
      return data?.connectorType === "success" ? "text-blue-600" : "text-red-600";
    default:
      return "";
  }
});
</script>