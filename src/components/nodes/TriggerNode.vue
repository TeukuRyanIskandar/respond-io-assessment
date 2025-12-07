<template>
  <Card>
    <CardHeader class="">
      <CardTitle>
        <Zap class="text-rose-500"/> Trigger 
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p>Conversation Opened</p>
    </CardContent>
  </Card>
</template>

<script setup>
import { Card, CardHeader, CardContent, CardTitle } from "../ui/card";
import { Zap } from "lucide-vue-next";

defineProps({
  id: String,
  data: Object,
});
</script>
