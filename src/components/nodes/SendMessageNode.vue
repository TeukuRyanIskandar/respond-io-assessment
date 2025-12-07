<template>
  <div class="node send-message-node">
    <h4>{{ data.name || "Send Message" }}</h4>

    <div v-for="(msg, i) in data.payload" :key="i">
      <p v-if="msg.type === 'text'">{{ msg.text }}</p>

      <img
        v-else-if="msg.type === 'attachment'"
        :src="msg.attachment"
        alt="Attachment"
        class="attachment"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  id: String,
  data: Object
})
</script>

<style scoped>
.send-message-node {
  padding: 12px;
  background: #eef7ff;
  border: 1px solid #8bb7e0;
  border-radius: 6px;
}
.attachment {
  width: 120px;
  margin-top: 8px;
  border-radius: 4px;
}
</style>
