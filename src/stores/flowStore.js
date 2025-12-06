import { defineStore } from "pinia";

export const useFlowStore = defineStore("flow", {
  state: () => ({
    flowData: null,
    isLoading: false,
    error: null,
  }),

  actions: {
    async loadFlowData() {
      this.isLoading = true;
      this.error = null;

      try {
        const res = await fetch("/payload.json");
        if (!res.ok) throw new Error("Failed to load payload.json");

        this.flowData = await res.json();
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
