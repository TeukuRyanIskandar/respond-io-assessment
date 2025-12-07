<template>
  <Card class="max-w-xs">
    <CardHeader>
      <CardTitle>
        {{ data.name || "Send Message" }}
      </CardTitle>
    </CardHeader>

    <CardContent v-for="(msg, i) in data.payload" :key="i">
      <p>{{ msg.text }}</p>
    </CardContent>
  </Card>
</template>

<script setup>
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

defineProps({
  id: String,
  name: String,
  data: Object,
});
</script>
