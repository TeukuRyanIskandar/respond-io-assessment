<template>
  <Form class="space-y-6">
    <!-- Node Type -->
    <FormField name="nodeType">
      <FormItem>
        <FormLabel>Node Type</FormLabel>
        <FormControl>
          <Select v-model="form.nodeType">
            <SelectTrigger>
              <SelectValue placeholder="Select node type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sendMessage">Send Message</SelectItem>
              <SelectItem value="addComment">Add Comment</SelectItem>
              <SelectItem value="dateTime">Business Hours</SelectItem>
            </SelectContent>
          </Select>
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <!-- Title -->
    <FormField name="title">
      <FormItem>
        <FormLabel>Title</FormLabel>
        <FormControl>
          <Input
            v-model="form.title"
            placeholder="Enter title"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <!-- Description -->
    <FormField name="description">
      <FormItem>
        <FormLabel>Description</FormLabel>
        <FormControl>
          <Textarea
            v-model="form.description"
            placeholder="Enter description"
            rows="4"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
  </Form>
</template>

<script setup>
import { reactive } from "vue";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const form = reactive({
  nodeType: "",
  title: "",
  description: "",
});

defineExpose({
  getFormData: () => ({ ...form }),
  resetForm: () => {
    form.nodeType = "";
    form.title = "";
    form.description = "";
  }
});
</script>