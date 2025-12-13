<template>
  <div class="flex flex-col items-center">
    <Card>
      <CardHeader>
        <CardTitle>{{ displayTitle }}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{{ displayDescription }}</p>
      </CardContent>
    </Card>

    <Button class="rounded-full" variant="outline" size="icon">
      <Plus />
    </Button>
  </div>
</template>

<script setup>
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-vue-next";

const props = defineProps({
  id: String,
  data: Object,
  type: String,
});

import { computed } from "vue";

const displayTitle = computed(() => {
  return props.data.name || props.data.nodeData?.name || props.type || "Node";
});

const displayDescription = computed(() => {
  const nodeData = props.data.nodeData || props.data.data || {};

  switch (props.type) {
    case "trigger":
      return `Triggers on: ${nodeData.type || "unknown"}`;

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
</script>
