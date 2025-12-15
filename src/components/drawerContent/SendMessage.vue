<template>
  <div class="space-y-6">
    <!-- Messages -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <Label>Messages</Label>
        <Button size="sm" variant="outline" @click="addNewMessage">
          <Plus class="w-4 h-4 mr-1" />
          Add Message
        </Button>
      </div>

      <!-- Messages List -->
      <div v-if="messages.length" class="space-y-4">
        <Card
          v-for="(message, index) in messages"
          :key="index"
          class="p-4 space-y-3"
        >
          <!-- Header -->
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-muted-foreground">
              Message {{ index + 1 }}
            </span>
            <Button
              size="sm"
              variant="ghost"
              class="text-red-500 hover:text-red-700"
              @click="deleteMessage(index)"
            >
              <Trash2 class="w-3 h-3" />
            </Button>
          </div>

          <!-- Message Content -->
          <div class="space-y-2">
            <Textarea
              v-model="message.editableText"
              ref="(el) => setTextareaRef(index, el)"
              class="min-h-[100px] resize-y"
              placeholder="Add message..."
              @input="handleMessageInput(index)"
            />

            <!-- Save / Cancel -->
            <div
              v-if="message.hasChanges"
              class="flex flex-row-reverse items-center gap-2"
            >
              <Button
                size="sm"
                variant="ghost"
                class="hover:bg-gray-200"
                @click="saveMessage(index)"
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                class="hover:bg-red-200"
                @click="cancelEdit(index)"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted"
        @click="addNewMessage"
      >
        <MessageSquare class="w-8 h-8 mx-auto text-muted-foreground mb-2" />
        <p class="text-sm">No messages yet</p>
      </div>
    </div>

    <!-- Attachments -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <Label>Attachments</Label>
        <Button size="sm" variant="outline" @click="triggerFileUpload">
          <Upload class="w-4 h-4 mr-1" />
          Upload
        </Button>
      </div>

      <input
        ref="fileInput"
        type="file"
        class="hidden"
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt"
        @change="handleFileUpload"
      />

      <div v-if="attachments.length" class="grid grid-cols-2 gap-3">
        <Card
          v-for="(item, index) in attachments"
          :key="index"
          class="relative overflow-hidden group"
        >
          <img
            v-if="isImage(item.attachment)"
            :src="item.attachment"
            class="w-full h-32 object-cover"
          />
          <div
            v-else
            class="w-full h-32 flex items-center justify-center bg-muted"
          >
            <File class="w-10 h-10 text-muted-foreground" />
          </div>

          <Button
            size="sm"
            variant="destructive"
            class="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
            @click="deleteAttachment(index)"
          >
            <Trash2 class="w-3 h-3" />
          </Button>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onUnmounted } from "vue";
import { useFlowStore } from "@/stores/flowStore";

import {
  Plus,
  Trash2,
  Upload,
  File,
  MessageSquare,
} from "lucide-vue-next";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const flowStore = useFlowStore();
const node = computed(() => flowStore.selectedNodeNormalized);

const messages = ref([]);
const textareaRefs = ref([]);
const fileInput = ref(null);

/* ---------- INIT FROM STORE ---------- */
watch(
  node,
  (newNode) => {
    if (!newNode) return;

    const payload = newNode.nodeData?.payload || [];
    const textItems = payload.filter((p) => p.type === "text");

    messages.value = textItems.map((item) => ({
      text: item.text || "",
      editableText: item.text || "",
      originalText: item.text || "",
      hasChanges: false,
    }));
  },
  { immediate: true }
);

/* ---------- MESSAGE LOGIC ---------- */
const handleMessageInput = (index) => {
  const msg = messages.value[index];
  msg.hasChanges = msg.editableText !== msg.originalText;
};

const saveMessage = (index) => {
  const msg = messages.value[index];
  const trimmed = msg.editableText.trim();

  msg.text = trimmed;
  msg.editableText = trimmed;
  msg.originalText = trimmed;
  msg.hasChanges = false;

  updateStorePayload();
};

const cancelEdit = (index) => {
  const msg = messages.value[index];
  msg.editableText = msg.originalText;
  msg.hasChanges = false;

  nextTick(() => {
    textareaRefs.value[index]?.focus();
  });
};

const addNewMessage = () => {
  messages.value.push({
    text: "",
    editableText: "",
    originalText: "",
    hasChanges: true,
  });

  nextTick(() => {
    textareaRefs.value[messages.value.length - 1]?.focus();
  });
};

const deleteMessage = (index) => {
  messages.value.splice(index, 1);
  updateStorePayload();
};

const updateStorePayload = () => {
  if (!node.value) return;

  const existing = node.value.nodeData?.payload || [];
  const nonText = existing.filter((p) => p.type !== "text");

  const textItems = messages.value
    .filter((m) => m.text.trim())
    .map((m) => ({ type: "text", text: m.text }));

  flowStore.updateNode(node.value.id, {
    data: {
      ...node.value.data,
      nodeData: {
        ...node.value.nodeData,
        payload: [...textItems, ...nonText],
      },
    },
  });
};

const setTextareaRef = (index, el) => {
  textareaRefs.value[index] = el;
};

/* ---------- KEYBOARD ---------- */
const handleKeydown = (e) => {
  const index = messages.value.findIndex((m) => m.hasChanges);
  if (index === -1) return;

  if (e.ctrlKey && e.key === "Enter") saveMessage(index);
  if (e.key === "Escape") cancelEdit(index);
};

window.addEventListener("keydown", handleKeydown);
onUnmounted(() => window.removeEventListener("keydown", handleKeydown));

/* ---------- ATTACHMENTS ---------- */
const attachments = computed(() =>
  node.value?.nodeData?.payload?.filter((p) => p.type === "attachment") || []
);

const isImage = (src) => {
  if (!src) return false;
  const clean = src.split("?")[0];
  return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(clean) || src.startsWith("blob:");
};

const triggerFileUpload = () => fileInput.value?.click();

const handleFileUpload = async (e) => {
  const files = Array.from(e.target.files || []);
  if (!files.length || !node.value) return;

  const payload = node.value.nodeData?.payload || [];

  const newAttachments = files.map((file) => ({
    type: "attachment",
    attachment: URL.createObjectURL(file),
  }));

  flowStore.updateNode(node.value.id, {
    data: {
      ...node.value.data,
      nodeData: {
        ...node.value.nodeData,
        payload: [...payload, ...newAttachments],
      },
    },
  });

  e.target.value = "";
};

const deleteAttachment = (index) => {
  const payload = node.value.nodeData?.payload || [];
  const attachmentsOnly = payload.filter((p) => p.type === "attachment");

  let count = 0;
  const realIndex = payload.findIndex((p) => {
    if (p.type === "attachment") {
      if (count === index) return true;
      count++;
    }
    return false;
  });

  if (realIndex !== -1) {
    const updated = [...payload];
    updated.splice(realIndex, 1);

    flowStore.updateNode(node.value.id, {
      data: {
        ...node.value.data,
        nodeData: {
          ...node.value.nodeData,
          payload: updated,
        },
      },
    });
  }
};
</script>
