<template>
  <Card>
    <CardHeader>
      <CardTitle>
        {{ data.connectorType }}
      </CardTitle>
    </CardHeader>
  </Card>
</template>

<script setup>
import { Card, CardHeader, CardTitle } from "../ui/card";
defineProps({
  id: String,
  data: Object,
});
</script>

<style scoped>
.datetime-connector-node {
  padding: 12px;
  background: #fff;
  border: 1px dashed #888;
  border-radius: 6px;
}
</style>
