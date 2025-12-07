<template>
  <Card>
    <CardHeader class="">
      <CardTitle>
        <Zap /> Business Hours 
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p>Business Hours - UTC</p>
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
