<template>
  <Background variant="dots" :gap="16" :size="1" />
  <VueFlow
    v-model:nodes="flowStore.nodes"
    v-model:edges="flowStore.edges"
    :node-types="nodeTypes"
  />
</template>

<script setup>
import { onMounted, nextTick } from 'vue'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { useFlowStore } from '@/stores/flowStore'
import { nodePositioning } from '@/utils/nodePositioning'
import Node from './Node.vue'

const flowStore = useFlowStore()

const nodeTypes = {
  default: Node,
}

onMounted(async () => {
  const res = await fetch('/payload.json')
  const data = await res.json()

  const nodes = data.map((node) => ({
    id: String(node.id),
    type: node.type || 'default',
    data: {
      ...node,
      name: node.name || node.data?.name || null,
      nodeData: node.data,
    },
    position: { x: 0, y: 0 },
  }))

  const edges = data
    .filter((n) => n.parentId && n.parentId !== -1)
    .map((n) => ({
      id: `${n.parentId}-${n.id}`,
      source: String(n.parentId),
      target: String(n.id),
      type: 'step',
      style: { strokeWidth: 5 },
    }))

  const layoutedNodes = nodePositioning(nodes, edges)

  flowStore.loadFlowData({
    nodes: layoutedNodes,
    edges,
  })
})
</script>
