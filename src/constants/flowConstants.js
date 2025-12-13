import {
  Zap,
  SendHorizontal,
  CalendarDays,
  MessageSquareMore,
  CircleAlert,
  CircleCheck,
} from "lucide-vue-next";

import TriggerNode from "@/components/nodes/TriggerNode.vue";
import SendMessageNode from "@/components/nodes/SendMessageNode.vue";
import DateTimeConnector from "@/components/nodes/DateTimeConnector.vue";
import DateTimeNode from "@/components/nodes/DateTimeNode.vue";
import AddComment from "@/components/nodes/AddComment.vue";

export const ICON_MAP = {
  trigger: Zap,
  sendMessage: SendHorizontal,
  dateTime: CalendarDays,
  dateTimeConnector: {
    success: CircleCheck,
    failure: CircleAlert,
  },
  addComment: MessageSquareMore,
};

export const COLOR_CLASS_MAP = {
  trigger: "text-rose-500",
  sendMessage: "text-green-500",
  dateTime: "text-amber-500",
  addComment: "text-gray-500",
  dateTimeConnector: {
    success: "text-blue-500",
    failure: "text-red-500",
  },
};

export const BACKGROUND_COLOR_CLASS_MAP = {
  trigger: "bg-rose-100",
  sendMessage: "bg-green-100",
  dateTime: "bg-amber-100",
  addComment: "bg-gray-100",
  dateTimeConnector: {
    success: "bg-blue-100",
    failure: "bg-red-100",
  },
};

export const NODE_LABELS = {
  trigger: "Trigger",
  sendMessage: "Send Message",
  dateTime: "Date & Time",
  dateTimeConnector: "Condition",
  addComment: "Add Comment",
};

export const SIDEBAR_DESCRIPTIONS = {
  trigger: "Start of chatbot flow",
  sendMessage: "Automated messages to send to customers",
  dateTime: "Configure business hours for each day of the week",
  dateTimeConnector: {
    success: "Actions to perform when condition succeeds",
    failure: "Actions to perform when condition fails",
  },
  addComment: "Internal notes and comments for this workflow step",
};

export const POSITIONS_MAP = {
  1: { x: 600, y: 100 }, // Trigger node
  d09c08: { x: 600, y: 300 }, // Business hours
  "161f52": { x: 450, y: 500 }, // Success connector
  "28c4b9": { x: 850, y: 500 }, // Failure connector
  b6a0c1: { x: 725, y: 700 }, // Away message
  b0653a: { x: 345, y: 700 }, // Welcome message
  e879e4: { x: 752, y: 900 }, // Add comment
};
