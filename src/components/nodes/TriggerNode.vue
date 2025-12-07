<template>
  <div class="node trigger-node">
    <h4>Trigger</h4>
    <p>Type: {{ data.type }}</p>
    <p>Once per contact: {{ data.oncePerContact }}</p>
  </div>
</template>

<script setup>
defineProps({
  id: String,
  data: Object
})
</script>

<style scoped>
.trigger-node {
  padding: 12px;
  background: #fff8e6;
  border: 1px solid #e0c785;
  border-radius: 6px;
}
</style>
