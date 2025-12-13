<template>
  <Background variant="dots" :gap="16" :size="1" />
  <VueFlow
    v-model:nodes="flowStore.nodes"
    v-model:edges="flowStore.edges"
    :node-types="nodeTypes"
  />
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useFlowStore } from "@/stores/flowStore";
import { VueFlow } from "@vue-flow/core";
import { Background } from "@vue-flow/background";

import Node from "./Node.vue";

import { POSITIONS_MAP } from "@/constants/flowConstants";

const flowStore = useFlowStore();
const nodeTypes = {
  default: Node,
  // Add other node types if needed
};

onMounted(async () => {
  try {
    const response = await fetch("/payload.json");
    const data = await response.json();

    const nodesWithPos = data.map((node) => ({
      id: String(node.id),
      type: node.type || "default",
      data: {
        ...node,
        name: node.name || node.data?.name || null,
        nodeData: node.data,
      },
      position: POSITIONS_MAP[node.id] || { x: 50, y: 50 },
    }));

    const edges = data
      .filter((node) => node.parentId && node.parentId !== -1)
      .map((node) => ({
        id: `${node.parentId}-${node.id}`,
        source: String(node.parentId),
        target: String(node.id),
        type: "step",
        style: {
          strokeWidth: 5,
        },
      }));

    flowStore.loadFlowData({
      nodes: nodesWithPos,
      edges: edges,
    });
  } catch (error) {
    console.error("Error loading flow data:", error);
  }
});
</script>
