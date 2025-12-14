<template>
  <div class="space-y-6">
    <!-- Business Hour Rows -->
    <div class="space-y-3">
      <div
        v-for="(item, index) in times"
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
    </div>

    <!-- Region -->
    <div class="space-y-1">
      <label class="text-xs font-semibold">Region</label>

      <Select v-model="selectedRegion">
        <SelectTrigger class="bg-white">
          <SelectValue placeholder="Select region" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="region in regions" :key="region" :value="region">
            {{ region }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Timezone -->
    <div v-if="selectedRegion" class="space-y-1">
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
                  v-for="tz in filteredTimezones"
                  :key="tz"
                  :value="tz"
                  @select="selectTimezone(tz)"
                >
                  <Check
                    class="mr-2 h-4 w-4"
                    :class="tz === timezone ? 'opacity-100' : 'opacity-0'"
                  />
                  {{ formatTimezone(tz) }}
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useFlowStore } from "@/stores/flowStore";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
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

const times = computed({
  get() {
    return node.value?.nodeData?.times || [];
  },
  set(value) {
    updateNode({ times: value });
  },
});

const timezone = computed({
  get() {
    return node.value?.nodeData?.timezone || "";
  },
  set(value) {
    updateNode({ timezone: value });
  },
});

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
};

const allTimezones = Intl.supportedValuesOf("timeZone");

const regions = computed(() => {
  const set = new Set();
  allTimezones.forEach((tz) => {
    const region = tz.split("/")[0];
    if (region !== "UTC" && region !== "Etc") {
      set.add(region);
    }
  });
  return [...set].sort();
});

const selectedRegion = ref("");
const open = ref(false);

const filteredTimezones = computed(() =>
  selectedRegion.value
    ? allTimezones.filter((tz) => tz.startsWith(selectedRegion.value + "/"))
    : []
);

const selectTimezone = (tz) => {
  timezone.value = tz;
  open.value = false;
};

const timezoneLabel = computed(() =>
  timezone.value ? formatTimezone(timezone.value) : "Select time zone..."
);

/**
 * Init region from timezone
 */
watch(
  timezone,
  (tz) => {
    if (tz) selectedRegion.value = tz.split("/")[0];
  },
  { immediate: true }
);

/**
 * Formatting helpers (unchanged logic)
 */
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

watch(selectedRegion, (newRegion) => {
  if (!timezone.value) return;

  const tzRegion = timezone.value.split("/")[0];
  if (tzRegion !== newRegion) {
    timezone.value = "";
  }
});
</script>
