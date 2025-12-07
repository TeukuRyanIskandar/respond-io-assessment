<template>
  <div class="flex flex-col items-center">
    <Card
      :class="[
        data?.connectorType === 'success'
          ? 'text-white bg-blue-400'
          : 'text-white bg-red-400',
      ]"
    >
      <CardHeader>
        <CardTitle>
          {{ data.name }}
        </CardTitle>
      </CardHeader>
    </Card>
    <Button
      :class="[
        data?.connectorType === 'success'
          ? 'text-blue-700 border-blue-400'
          : 'text-red-700 border-red-400',
        'rounded-full',
      ]"
      variant="outline"
      size="icon"
    >
      <Plus />
    </Button>
  </div>
</template>

<script setup>
import { Card, CardHeader, CardTitle } from "../ui/card";
import Button from "../ui/button/Button.vue";
import { Plus } from "lucide-vue-next";

defineProps({
  id: String,
  name: String,
  data: Object,
});
</script>
