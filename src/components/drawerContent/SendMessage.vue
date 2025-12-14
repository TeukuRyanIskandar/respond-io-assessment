<template>
  <div class="space-y-6">
    <!-- Text messages -->
    <div>
      <Label>Text Messages</Label>

      <Textarea
        v-for="(msg, index) in textModels"
        :key="index"
        v-model="msg.value"
        class="mt-2"
        @focus="clearDefault(index)"
      />
    </div>

    <!-- Attachments -->
    <div v-if="attachments.length">
      <Label>Attachments</Label>

      <div class="grid grid-cols-2 gap-3 mt-2">
        <Card
          v-for="(item, index) in attachments"
          :key="index"
          class="overflow-hidden"
        >
          <img
            :src="item.attachment"
            alt="Attachment preview"
            class="w-full h-32 object-cover"
          />
        </Card>
      </div>
    </div>

    <!-- Empty state -->
    <p
      v-if="!textModels.length && !attachments.length"
      class="text-sm text-muted-foreground"
    >
      No messages configured
    </p>
  </div>
</template>


<script setup>
import { computed } from "vue"
import { useFlowStore } from "@/stores/flowStore"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"

const flowStore = useFlowStore()
const node = computed(() => flowStore.selectedNodeNormalized)

const payload = computed(() => node.value?.nodeData?.payload || [])

const texts = computed(() =>
  payload.value.filter(item => item.type === "text")
)

const attachments = computed(() =>
  payload.value.filter(item => item.type === "attachment")
)

const textModels = computed(() =>
  texts.value.map((item, index) => ({
    get value() {
      return item.text || "Add message..."
    },
    set value(val) {
      if (!node.value) return

      const updatedPayload = [...payload.value]
      const payloadIndex = payload.value.findIndex(
        p => p === item
      )

      updatedPayload[payloadIndex] = {
        ...item,
        text: val,
      }

      flowStore.updateNode(node.value.id, {
        data: {
          ...node.value.data,
          nodeData: {
            ...node.value.nodeData,
            payload: updatedPayload,
          },
        },
      })
    },
  }))
)

const clearDefault = (index) => {
  if (textModels.value[index].value === "Add message...") {
    textModels.value[index].value = ""
  }
}
</script>
