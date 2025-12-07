<template>
  <div class="flex flex-col items-center">
    <Card>
      <CardHeader>
        <CardTitle> <Zap class="items-center text-rose-500" /> Trigger </CardTitle>
      </CardHeader>
      <CardContent>
        <p>Conversation Opened</p>
      </CardContent>
    </Card>
    <Button class="rounded-full border-rose-500 text-rose-500" variant="outline" size="icon">
      <Plus />
    </Button>
  </div>
</template>

<script setup>
import { Card, CardHeader, CardContent, CardTitle } from "../ui/card";
import Button from "../ui/button/Button.vue";
import { Zap, Plus, Minus } from "lucide-vue-next";

defineProps({
  id: String,
  data: Object,
});
</script>
