<template>
  <Card>
    <CardHeader class="border border-black"> <Zap /> Trigger </CardHeader>
    <CardContent>
      <p>Conversation Opened</p>
    </CardContent>
  </Card>
</template>

<script setup>
import { Card, CardHeader, CardContent } from "../ui/card";
import { Zap } from "lucide-vue-next";

defineProps({
  id: String,
  data: Object,
});
</script>
