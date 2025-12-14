import { defineStore } from "pinia";
import { nextTick } from "vue";

import { nodePositioning } from "@/utils/nodePositioning";

export const useFlowStore = defineStore("flow", {
  state: () => ({
    nodes: [],
    edges: [],
    selectedNodeId: null,
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

    selectedNode: (state) => {
      return (
        state.nodes.find((node) => node.id === state.selectedNodeId) || null
      );
    },
    selectedNodeNormalized: (state) => {
      const node = state.nodes.find((n) => n.id === state.selectedNodeId);
      if (!node) return null;

      return {
        ...node,
        displayName:
          node.data?.name ||
          node.data?.nodeData?.name ||
          (node.type === "trigger" ? "Trigger" : node.type),

        nodeData: node.data?.nodeData || node.data || {},
      };
    },
  },

  actions: {
    loadFlowData(data) {
      this.nodes = data.nodes || [];
      this.edges = data.edges || [];
    },

    selectNode(nodeId) {
      this.selectedNodeId = nodeId;
    },

    clearSelection() {
      this.selectedNodeId = null;
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
    async addNodeWithEdge({ parentId, formData }) {
      const newNodeId = `node-${Date.now()}`;

      const newNode = {
        id: newNodeId,
        type: formData.nodeType,
        position: { x: 0, y: 0 }, // dagre decides
        data: {
          name: formData.title,
          nodeData: {
            description: formData.description,
          },
        },
      };

      const newEdge = {
        id: `${parentId}-${newNodeId}`,
        source: parentId,
        target: newNodeId,
        type: "step",
        style: { strokeWidth: 5 },
      };

      this.nodes.push(newNode);
      this.edges.push(newEdge);

      await nextTick();

      this.nodes = nodePositioning(this.nodes, this.edges);
    },
    deleteNodeAndChildren(nodeId) {
      // Find all direct children
      const childEdges = this.edges.filter((e) => e.source === nodeId);
      const childNodeIds = childEdges.map((e) => e.target);

      childNodeIds.forEach((childId) => {
        this.deleteNodeAndChildren(childId);
      });

      this.nodes = this.nodes.filter((n) => n.id !== nodeId);

      this.edges = this.edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      );
    },
  },
});
