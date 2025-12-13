import { defineStore } from "pinia";

export const useFlowStore = defineStore("flow", {
  state: () => ({
    nodes: [],
    edges: [],
  }),

  getters: {
    getNodeById: (state) => (nodeId) => {
      return state.nodes.find((node) => node.id === nodeId);
    },

    getChildNodes: (state) => (parentId) => {
      const childEdges = state.edges.filter((edge) => edge.source === parentId);
      return childEdges
        .map((edge) => state.nodes.find((node) => node.id === edge.target))
        .filter(Boolean);
    },

    getParentNode: (state) => (nodeId) => {
      const parentEdge = state.edges.find((edge) => edge.target === nodeId);
      if (!parentEdge) return null;
      return state.nodes.find((node) => node.id === parentEdge.source);
    },

    getEdgeById: (state) => (edgeId) => {
      return state.edges.find((edge) => edge.id === edgeId);
    },
  },

  actions: {
    loadFlowData(data) {
      this.nodes = data.nodes || [];
      this.edges = data.edges || [];
    },

    clearNode() {
      this.nodes = [];
      this.edges = [];
    },

    addNode(node) {
      this.nodes.push(node);
    },

    addEdge(edge) {
      this.edges.push(edge);
    },

    updateNode(nodeId, updates) {
      const index = this.nodes.findIndex((n) => n.id === nodeId);
      if (index !== -1) {
        this.nodes[index] = { ...this.nodes[index], ...updates };
      }
    },

    deleteNode(nodeId) {
      this.nodes = this.nodes.filter((n) => n.id !== nodeId);
      this.edges = this.edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      );
    },

    deleteEdge(edgeId) {
      this.edges = this.edges.filter((e) => e.id !== edgeId);
    },
  },
});
