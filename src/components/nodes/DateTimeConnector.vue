<template>
  <div class="node datetime-connector-node">
    <h4>{{ data.name || "Connector" }}</h4>
    <p>Type: {{ data.connectorType }}</p>
  </div>
</template>

<script setup>
defineProps({
  id: String,
  data: Object
})
</script>

<style scoped>
.datetime-connector-node {
  padding: 12px;
  background: #fff;
  border: 1px dashed #888;
  border-radius: 6px;
}
</style>
