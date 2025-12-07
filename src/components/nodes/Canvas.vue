<template>
  <VueFlow
    v-model:nodes="flowStore.nodes"
    v-model:edges="flowStore.edges"
    :node-types="nodeTypes"
    class="flow-canvas"
  />
</template>

<script setup>
import { onMounted } from "vue";
import { useFlowStore } from "@/stores/flowStore";
import { VueFlow } from "@vue-flow/core";

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

  const nodesWithPos = data.map((node, index) => ({
    ...node,
    position: node.position || { x: 50 + index * 200, y: 50 },
  }));

  flowStore.loadFlowData({
    nodes: nodesWithPos,
    edges: [],
  });
});
</script>

<style scoped>
.flow-canvas {
  width: 100%;
  height: 100vh;
}
</style>
