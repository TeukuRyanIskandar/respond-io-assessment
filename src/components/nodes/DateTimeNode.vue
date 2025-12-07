<template>
  <div class="node datetime-node">
    <h4>Business Hours</h4>

    <div class="hours" v-for="(t, i) in data.times" :key="i">
      <p>{{ t.day }}: {{ t.startTime }} - {{ t.endTime }}</p>
    </div>

    <p>Timezone: {{ data.timezone }}</p>
    <p>Action: {{ data.action }}</p>
  </div>
</template>

<script setup>
defineProps({
  id: String,
  data: Object
})
</script>

<style scoped>
.datetime-node {
  padding: 12px;
  background: #e8ffe8;
  border: 1px solid #86c786;
  border-radius: 6px;
}
.hours {
  font-size: 12px;
}
</style>
