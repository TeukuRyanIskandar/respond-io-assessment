<template>
  <Card>
    <CardHeader>
      <CardTitle>
        <CalendarDays class="text-amber-500"/> Business Hours 
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p>Business Hours - UTC</p>
    </CardContent>
  </Card>
</template>

<script setup>
import { Card, CardHeader, CardContent, CardTitle } from "../ui/card";
import { CalendarDays } from "lucide-vue-next";

defineProps({
  id: String,
  data: Object,
});
</script>
