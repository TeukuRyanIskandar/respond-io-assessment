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
    
    <!-- Dynamic Description Field for sendMessage and addComment -->
    <FormField v-if="showDescriptionField" :name="fieldName">
      <FormItem>
        <FormLabel>{{ fieldLabel }}</FormLabel>
        <FormControl>
          <Textarea
            v-model="form.description"
            :placeholder="fieldPlaceholder"
            rows="4"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    
    <!-- Region and Timezone Selection for dateTime -->
    <div v-else-if="form.nodeType === 'dateTime'" class="space-y-4">    
      <!-- Region Selection -->
      <FormField name="region">
        <FormItem>
          <FormLabel>Region</FormLabel>
          <FormControl>
            <Select v-model="form.region" @update:model-value="handleRegionChange">
              <SelectTrigger>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="region in regions" 
                  :key="region" 
                  :value="region"
                >
                  {{ region }}
                </SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      
      <!-- Timezone Selection (only shows when region is selected) -->
      <FormField v-if="form.region" name="timezone">
        <FormItem>
          <FormLabel>Time Zone</FormLabel>
          <Popover v-model:open="timezonePopoverOpen">
            <PopoverTrigger as-child>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  class="w-full justify-between"
                  :class="!form.timezone && 'text-muted-foreground'"
                >
                  {{ timezoneLabel }}
                  <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent class="w-full p-0">
              <Command>
                <CommandInput 
                  placeholder="Search timezone..." 
                  v-model="timezoneSearch"
                />
                <CommandList>
                  <CommandEmpty>No timezone found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      v-for="tz in filteredTimezones"
                      :key="tz"
                      :value="tz"
                      @select="selectTimezone(tz)"
                    >
                      <Check
                        class="mr-2 h-4 w-4"
                        :class="tz === form.timezone ? 'opacity-100' : 'opacity-0'"
                      />
                      {{ formatTimezone(tz) }}
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>
  </Form>
</template>

<script setup>
import { reactive, computed, ref, watch } from "vue";
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

// Get all available timezones
const allTimezones = Intl.supportedValuesOf("timeZone");

const form = reactive({
  nodeType: "",
  title: "",
  description: "",
  region: "",
  timezone: "",
});

const timezonePopoverOpen = ref(false);
const timezoneSearch = ref("");

// Computed properties for dynamic field configuration
const showDescriptionField = computed(() => {
  return form.nodeType === 'sendMessage' || form.nodeType === 'addComment';
});

const fieldName = computed(() => {
  if (form.nodeType === 'sendMessage') return 'message';
  if (form.nodeType === 'addComment') return 'comments';
  return 'description';
});

const fieldLabel = computed(() => {
  if (form.nodeType === 'sendMessage') return 'Add a message';
  if (form.nodeType === 'addComment') return 'Leave a comment';
  return 'Description';
});

const fieldPlaceholder = computed(() => {
  if (form.nodeType === 'sendMessage') return 'Enter your message';
  if (form.nodeType === 'addComment') return 'Enter your comment';
  return 'Enter description';
});

// Get unique regions from timezones
const regions = computed(() => {
  const regionSet = new Set();
  allTimezones.forEach((tz) => {
    const parts = tz.split("/");
    if (parts.length > 1) {
      const region = parts[0];
      // Filter out less common regions
      if (!["Etc", "GMT", "Universal", "Zulu"].includes(region)) {
        regionSet.add(region);
      }
    }
  });
  return Array.from(regionSet).sort();
});

// Filter timezones based on selected region
const filteredTimezones = computed(() => {
  if (!form.region) return [];
  
  let timezones = allTimezones.filter(tz => tz.startsWith(form.region + "/"));
  
  // Apply search filter if there's a search term
  if (timezoneSearch.value) {
    const searchTerm = timezoneSearch.value.toLowerCase();
    timezones = timezones.filter(tz => 
      tz.toLowerCase().includes(searchTerm) || 
      formatTimezone(tz).toLowerCase().includes(searchTerm)
    );
  }
  
  return timezones.sort();
});

const timezoneLabel = computed(() => {
  if (!form.timezone) return "Select time zone...";
  return formatTimezone(form.timezone);
});

// Format timezone for display
const formatTimezone = (tz) => {
  try {
    // Extract city name
    const city = tz.split("/").pop().replace(/_/g, " ");
    
    // Get UTC offset
    const now = new Date();
    const tzDate = new Date(now.toLocaleString("en-US", { timeZone: tz }));
    const utcDate = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
    const offset = (tzDate - utcDate) / (1000 * 60 * 60);
    
    // Format offset (e.g., +2, -5)
    const sign = offset >= 0 ? "+" : "-";
    const hours = Math.floor(Math.abs(offset));
    const minutes = Math.abs(offset % 1) * 60;
    
    let offsetStr = `${sign}${hours.toString().padStart(2, '0')}`;
    if (minutes > 0) {
      offsetStr += `:${minutes.toString().padStart(2, '0')}`;
    }
    
    return `${city} (UTC${offsetStr})`;
  } catch (error) {
    console.error("Error formatting timezone:", tz, error);
    return tz;
  }
};

// Handle region change
const handleRegionChange = (newRegion) => {
  form.region = newRegion;
  // Reset timezone when region changes
  if (form.timezone && !form.timezone.startsWith(newRegion + "/")) {
    form.timezone = "";
  }
};

// Select timezone from dropdown
const selectTimezone = (tz) => {
  form.timezone = tz;
  timezonePopoverOpen.value = false;
  timezoneSearch.value = ""; // Clear search
};

// Reset form
const resetForm = () => {
  form.nodeType = "";
  form.title = "";
  form.description = "";
  form.region = "";
  form.timezone = "";
  timezoneSearch.value = "";
};

// Expose methods
defineExpose({
  getFormData: () => ({ ...form }),
  resetForm
});
</script>