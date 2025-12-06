<template>
  <div>
    <h2>Flow Items</h2>

    <div v-if="isLoading">Loading…</div>
    <div v-else-if="error">Error loading data</div>

    <pre v-else>{{ data }}</pre>
  </div>
</template>

<script setup>
import { useQuery } from '@tanstack/vue-query'

async function fetchLocalPayload() {
  const res = await fetch('/payload.json')
  if (!res.ok) throw new Error('Failed to load local JSON')
  return res.json()
}

const { data, isLoading, error } = useQuery({
  queryKey: ['flowData'],
  queryFn: fetchLocalPayload,
})
</script>
