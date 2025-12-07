<template>
  <div class="flex flex-col items-center">
    <Card>
      <CardHeader>
        <CardTitle>
          <CalendarDays class="items-center text-amber-500" /> Business Hours
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>Business Hours - UTC</p>
      </CardContent>
    </Card>
    <Button class="rounded-full border-amber-500 text-amber-500" variant="outline" size="icon">
      <Plus />
    </Button>
  </div>
</template>

<script setup>
import { Card, CardHeader, CardContent, CardTitle } from "../ui/card";
import Button from "../ui/button/Button.vue";
import { CalendarDays, Plus } from "lucide-vue-next";

defineProps({
  id: String,
  data: Object,
});
</script>
