<template>
  <div class="space-y-6 mt-1">
    <!-- Business Hour Rows -->
    <div class="space-y-3">
      <div
        v-for="(item, index) in editableTimes"
        :key="item.day"
        class="flex items-center gap-2"
      >
        <span class="w-12 font-medium capitalize flex-shrink-0">
          {{ item.day }}
        </span>

        <Input
          type="time"
          v-model="item.startTime"
          class="flex-1 min-w-0 bg-white"
        />

        <span class="text-xs text-gray-500 flex-shrink-0">to</span>

        <Input
          type="time"
          v-model="item.endTime"
          class="flex-1 min-w-0 bg-white"
        />
      </div>
      <p v-if="timeError" class="text-xs text-red-500">{{ timeError }}</p>
    </div>

    <!-- Timezone -->
    <div class="space-y-1">
      <label class="text-xs font-semibold">Time Zone</label>

      <Popover v-model:open="open">
        <PopoverTrigger as-child>
          <Button
            variant="outline"
            role="combobox"
            class="w-full justify-between bg-white"
          >
            {{ timezoneLabel }}
            <ChevronsUpDown class="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent class="w-full p-0">
          <Command>
            <CommandInput placeholder="Search timezone..." />
            <CommandEmpty>No timezone found.</CommandEmpty>
            <CommandList>
              <CommandGroup>
                <CommandItem
                  v-for="tz in timezones"
                  :key="tz"
                  :value="tz"
                  @select="selectTimezone(tz)"
                >
                  <Check
                    class="mr-2 h-4 w-4"
                    :class="
                      tz === editableTimezone ? 'opacity-100' : 'opacity-0'
                    "
                  />
                  {{ formatTimezone(tz) }}
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <p v-if="timezoneError" class="text-xs text-red-500">
        {{ timezoneError }}
      </p>
    </div>

    <!-- Save / Cancel -->
    <div v-if="hasChanges" class="flex justify-end gap-2 mt-4">
      <Button variant="ghost" @click="cancelEdit" class="hover:bg-red-200">
        Cancel
      </Button>
      <Button
        variant="ghost"
        :disabled="!isValid"
        @click="saveEdit"
        class="hover:bg-gray-200"
      >
        Save
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useFlowStore } from "@/stores/flowStore";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-vue-next";

const flowStore = useFlowStore();
const node = computed(() => flowStore.selectedNodeNormalized);

// Editable state
const editableTimes = ref([]);
const editableTimezone = ref("");
const originalTimes = ref([]);
const originalTimezone = ref("");

watch(
  node,
  (n) => {
    if (n) {
      editableTimes.value = JSON.parse(JSON.stringify(n.nodeData.times || []));
      editableTimezone.value = n.nodeData.timezone || "UTC";

      // Save original for change detection
      originalTimes.value = JSON.parse(JSON.stringify(n.nodeData.times || []));
      originalTimezone.value = n.nodeData.timezone || "UTC";
    }
  },
  { immediate: true }
);

const updateNode = (partial) => {
  if (!node.value) return;

  flowStore.updateNode(node.value.id, {
    data: {
      ...node.value.data,
      nodeData: {
        ...node.value.nodeData,
        ...partial,
      },
    },
  });

  // Update originals after save
  originalTimes.value = JSON.parse(JSON.stringify(editableTimes.value));
  originalTimezone.value = editableTimezone.value;
};

// Validation
const timeError = computed(() => {
  for (const t of editableTimes.value) {
    if (!t.startTime || !t.endTime) return "Start and end times are required.";
    if (t.startTime >= t.endTime) return "Start time must be before end time.";
  }
  return "";
});

const timezoneError = computed(() => {
  if (!editableTimezone.value) return "Timezone is required.";
  return "";
});

const isValid = computed(() => !timeError.value && !timezoneError.value);

// Save / Cancel
const saveEdit = () => {
  if (!isValid.value) return;
  updateNode({
    times: editableTimes.value,
    timezone: editableTimezone.value,
  });
};

const cancelEdit = () => {
  editableTimes.value = JSON.parse(JSON.stringify(originalTimes.value));
  editableTimezone.value = originalTimezone.value;
};

// Detect changes
const hasChanges = computed(() => {
  return (
    JSON.stringify(editableTimes.value) !==
      JSON.stringify(originalTimes.value) ||
    editableTimezone.value !== originalTimezone.value
  );
});

// Hardcoded timezones
const timezones = [
  "UTC",
  "Asia/Kuala_Lumpur",
  "Europe/London",
  "America/New_York",
  "Australia/Sydney",
];

const open = ref(false);

const selectTimezone = (tz) => {
  editableTimezone.value = tz;
  open.value = false;
};

const timezoneLabel = computed(() =>
  editableTimezone.value
    ? formatTimezone(editableTimezone.value)
    : "Select time zone..."
);

const formatTimezone = (tz) => {
  try {
    const city = tz.split("/").pop().replace(/_/g, " ");
    const offset = getUTCOffset(tz);
    return `${city} (UTC${offset})`;
  } catch {
    return tz;
  }
};

const getUTCOffset = (tz) => {
  const now = new Date();
  const tzDate = new Date(now.toLocaleString("en-US", { timeZone: tz }));
  const utcDate = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
  const offset = (tzDate - utcDate) / (1000 * 60 * 60);
  const sign = offset >= 0 ? "+" : "";
  const hours = Math.floor(Math.abs(offset));
  return `${sign}${hours}`;
};
</script>
