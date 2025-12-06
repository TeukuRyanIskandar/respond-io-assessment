<template>
  <div>
    <h2>Flow Items</h2>

    <div v-if="store.isLoading">Loading…</div>
    <div v-else-if="store.error">Error: {{ store.error }}</div>

    <pre v-else>{{ store.flowData }}</pre>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useFlowStore } from '@/stores/flowStore'

const store = useFlowStore()

onMounted(() => {
  store.loadFlowData()
})
</script>
