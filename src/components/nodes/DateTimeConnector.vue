<template>
  <Card
    :class="[
      data?.connectorType === 'success'
        ? 'text-blue-700 bg-blue-400'
        : data?.connectorType === 'failure'
        ? 'text-red-700 bg-red-400'
        : 'bg-gray-200 text-gray-800'
    ]"
  >
    <CardHeader>
      <CardTitle>
        {{ data.name || name }}
      </CardTitle>
    </CardHeader>
  </Card>
</template>

<script setup>
import { Card, CardHeader, CardTitle } from "../ui/card";

defineProps({
  id: String,
  name: String,
  data: Object,
});
</script>
