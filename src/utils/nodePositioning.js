import dagre from 'dagre'

export function nodePositioning(nodes, edges) {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))

  g.setGraph({
    rankdir: 'TB',   // top → bottom
    nodesep: 80,     // horizontal spacing
    ranksep: 140,    // vertical spacing
    marginx: 40,
    marginy: 40,
  })

  // IMPORTANT: match your real node size
  nodes.forEach((node) => {
    g.setNode(node.id, {
      width: 280,
      height: 180,
    })
  })

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target)
  })

  dagre.layout(g)

  return nodes.map((node) => {
    const { x, y } = g.node(node.id)

    return {
      ...node,
      position: {
        x: x - 280 / 2,
        y: y - 180 / 2,
      },
    }
  })
}
