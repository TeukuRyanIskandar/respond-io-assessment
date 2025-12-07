<template>
  <Card>
    <CardHeader class=""><Zap /> Add Comment </CardHeader>
    <CardContent>
      <p>User message during off hours</p>
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
