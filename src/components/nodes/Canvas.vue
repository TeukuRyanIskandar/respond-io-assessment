<template>
  <Background variant="dots" :gap="16" :size="1" />
  <VueFlow
    v-model:nodes="flowStore.nodes"
    v-model:edges="flowStore.edges"
    :node-types="nodeTypes"
  />
</template>

<script setup>
import { onMounted } from "vue";
import { useFlowStore } from "@/stores/flowStore";
import { VueFlow } from "@vue-flow/core";
import { Background } from "@vue-flow/background";

import TriggerNode from "@/components/nodes/TriggerNode.vue";
import SendMessageNode from "@/components/nodes/SendMessageNode.vue";
import DateTimeNode from "@/components/nodes/DateTimeNode.vue";
import DateTimeConnector from "@/components/nodes/DateTimeConnector.vue";
import AddComment from "@/components/nodes/AddComment.vue";

const nodeTypes = {
  trigger: TriggerNode,
  sendMessage: SendMessageNode,
  dateTime: DateTimeNode,
  dateTimeConnector: DateTimeConnector,
  addComment: AddComment,
};

const flowStore = useFlowStore();

onMounted(async () => {
  const res = await fetch("/payload.json");
  const data = await res.json();

  const positionsMap = {
    1: { x: 600, y: 100 }, // Trigger node
    d09c08: { x: 600, y: 300 }, // Business hours
    "161f52": { x: 450, y: 500 }, // Success connector
    "28c4b9": { x: 850, y: 500 }, // Failure connector
    b6a0c1: { x: 725, y: 700 }, // Away message
    b0653a: { x: 345, y: 700 }, // Welcome message
    e879e4: { x: 752, y: 900 }, // Add comment
  };

  const nodesWithPos = data.map((node) => ({
    id: String(node.id), // must be string
    type: node.type || "default", // fallback type if missing
    data: {
      ...node.data,
      name: node.name || node.data?.name || null,
    },
    position: positionsMap[node.id] || { x: 50, y: 50 },
  }));

  const edges = data
  .filter(node => node.parentId && node.parentId !== -1)
  .map(node => ({
    id: `${node.parentId}-${node.id}`,
    source: String(node.parentId),
    target: String(node.id),
  }));


  flowStore.loadFlowData({
    nodes: nodesWithPos,
    edges: edges, // edges can be added later
  });

  console.log("Nodes with positions:", nodesWithPos);
});
</script>
