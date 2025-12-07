import { defineStore } from 'pinia'

export const useFlowStore = defineStore('flow', {
  state: () => ({
    nodes: [],
    edges: [],
  }),

  actions: {
    loadFlowData(data) {
      this.nodes = data.nodes || []
      this.edges = data.edges || []
    },

    clear() {
      this.nodes = []
      this.edges = []
    }
  }
})
