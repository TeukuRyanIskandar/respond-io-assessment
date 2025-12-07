<template>
  <Card>
    <CardHeader>
      <CardTitle>
        <MessageSquareMore class="text-gray-500"/> Add Comment
      </CardTitle>  
    </CardHeader>
    <CardContent>
      <p>User message during off hours</p>
    </CardContent>
  </Card>
</template>

<script setup>
import { Card, CardHeader, CardContent, CardTitle } from "../ui/card";
import { MessageSquareMore } from "lucide-vue-next";

defineProps({
  id: String,
  data: Object,
});
</script>
