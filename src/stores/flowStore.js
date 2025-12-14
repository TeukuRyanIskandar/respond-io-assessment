import { defineStore } from "pinia";
import { nextTick } from "vue";
import { nodePositioning } from "@/utils/nodePositioning";
import {
  DEFAULT_BUSINESS_HOURS,
  DEFAULT_TIMEZONE,
} from "@/constants/flowConstants";

export const useFlowStore = defineStore("flow", {
  state: () => ({
    nodes: [],
    edges: [],
    selectedNodeId: null,
  }),

  getters: {
    getNodeById: (state) => (nodeId) =>
      state.nodes.find((node) => node.id === nodeId),

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

    getEdgeById: (state) => (edgeId) =>
      state.edges.find((edge) => edge.id === edgeId),

    selectedNode: (state) =>
      state.nodes.find((node) => node.id === state.selectedNodeId) || null,

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

      const timezone = defaultValues.timezone || DEFAULT_TIMEZONE;

      const nodeDataByType = {
        addComment: {
          comment: formData.description || "",
        },

        sendMessage: {
          payload: formData.description
            ? [
                {
                  type: "text",
                  text: formData.description,
                },
              ]
            : [],
        },

        dateTime: {
          times: DEFAULT_BUSINESS_HOURS,
          timezone: timezone,
          action: "businessHours",
        },
      };

      const newNode = {
        id: newNodeId,
        type: formData.nodeType,
        position: { x: 0, y: 0 },
        data: {
          name: formData.title,
          nodeData: nodeDataByType[formData.nodeType] || {},
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

      // Create dateTimeConnector nodes if this is a dateTime node
      if (formData.nodeType === "dateTime") {
        // Add success connector
        const successConnectorId = `node-${Date.now() + 1}`;
        const successConnector = {
          id: successConnectorId,
          type: "dateTimeConnector",
          position: { x: 0, y: 0 },
          data: {
            name: "Success",
            nodeData: {
              connectorType: "success",
            },
          },
        };

        // Add failure connector
        const failureConnectorId = `node-${Date.now() + 2}`;
        const failureConnector = {
          id: failureConnectorId,
          type: "dateTimeConnector",
          position: { x: 0, y: 0 },
          data: {
            name: "Failure",
            nodeData: {
              connectorType: "failure",
            },
          },
        };

        // Add edges for connectors
        const successEdge = {
          id: `${newNodeId}-${successConnectorId}`,
          source: newNodeId,
          target: successConnectorId,
          type: "step",
          style: { strokeWidth: 5 },
        };

        const failureEdge = {
          id: `${newNodeId}-${failureConnectorId}`,
          source: newNodeId,
          target: failureConnectorId,
          type: "step",
          style: { strokeWidth: 5 },
        };

        // Add connectors and edges to store
        this.nodes.push(successConnector, failureConnector);
        this.edges.push(successEdge, failureEdge);

        // Update the dateTime node with connector references
        const dateTimeNode = this.nodes.find((n) => n.id === newNodeId);
        if (dateTimeNode) {
          dateTimeNode.data.nodeData.connectors = [
            successConnectorId,
            failureConnectorId,
          ];
        }
      }

      await nextTick();
      this.nodes = nodePositioning(this.nodes, this.edges);
    },

    deleteNodeAndChildren(nodeId) {
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
