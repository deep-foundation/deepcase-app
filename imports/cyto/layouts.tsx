export const layoutColaPreset = ({isAnimate=false}) => ({ 
  name: 'cola',
  animate: isAnimate, // whether to show the layout as it's running
  refresh: 10, // number of ticks per frame; higher is faster but more jerky
  maxSimulationTime: 100, // max length in ms to run the layout
  ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
  fit: false, // on every layout reposition of nodes, fit the viewport
  // padding: 30, // padding around the simulation
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  nodeDimensionsIncludeLabels: true, // whether labels should be included in determining the space used by a node

  // layout event callbacks
  ready: function(){}, // on layoutready
  stop: function(){}, // on layoutstop

  // positioning options
  randomize: false, // use random node positions at beginning of layout
  avoidOverlap: true, // if true, prevents overlap of node bounding boxes
  handleDisconnected: true, // if true, avoids disconnected components from overlapping
  convergenceThreshold: 0.01, // when the alpha value (system energy) falls below this value, the layout stops
  nodeSpacing: function( node ){ return 10; }, // extra spacing around nodes
  flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
  alignment: undefined, // relative alignment constraints on nodes, e.g. {vertical: [[{node: node1, offset: 0}, {node: node2, offset: 5}]], horizontal: [[{node: node3}, {node: node4}], [{node: node5}, {node: node6}]]}
  gapInequalities: undefined, // list of inequality constraints for the gap between the nodes, e.g. [{"axis":"y", "left":node1, "right":node2, "gap":25}]
  centerGraph: true, // adjusts the node positions initially to center the graph (pass false if you want to start the layout from the current position)

  // different methods of specifying edge length
  // each can be a constant numerical value or a function like `function( edge ){ return 2; }`
  edgeLength: function( edge ) {
    const baseLength = 30; // base edge length
    const extraLength = 10; // additional length of the edge to take into account the density of connections
    const sourceNode = edge.source();
    const targetNode = edge.target();

    // Calculate the number of connected edges for source nodes and target nodes
    const sourceConnectedEdges = sourceNode.connectedEdges().length;
    const targetConnectedEdges = targetNode.connectedEdges().length;

    // Increase edge length based on the number of connected edges
    return baseLength + (sourceConnectedEdges + targetConnectedEdges) * extraLength;
  },
  edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
  edgeJaccardLength: undefined, // jaccard edge length in simulation

  // iterations of cola algorithm; uses default values on undefined
  unconstrIter: undefined, // unconstrained initial layout iterations
  userConstIter: undefined, // initial layout iterations with user-specified constraints
  allConstIter: undefined, // initial layout iterations with all constraints including non-overlap
});

export const layoutD3ForcePreset = ({isAnimate=false, cy, deep}) => ({
  name: 'deep-d3-force',
  animate: isAnimate, // whether to show the layout as it's running; special 'end' value makes the layout animate like a discrete layout
  maxIterations: 0, // max iterations before the layout will bail out
  maxSimulationTime: 0, // max length in ms to run the layout
  ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
  fixedAfterDragging: false, // fixed node after dragging
  fit: false, // on every layout reposition of nodes, fit the viewport
  padding: 30, // padding around the simulation
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  /**d3-force API**/
  alpha: 0.8, // sets the current alpha to the specified number in the range [0,1]
  alphaMin: 0.001, // sets the minimum alpha to the specified number in the range [0,1]
  alphaDecay: 0.5, // sets the alpha decay rate to the specified number in the range [0,1]
  alphaTarget: 0.1, // sets the current target alpha to the specified number in the range [0,1]
  velocityDecay: 0.6, // sets the velocity decay factor to the specified number in the range [0,1]
  // collideRadius: 1, // sets the radius accessor to the specified number or function
  // collideStrength: 0.7, // sets the force strength to the specified number in the range [0,1]
  // collideIterations: 1, // sets the number of iterations per application to the specified number
  linkId: function id(d) {
    return d.id;
  }, // sets the node id accessor to the specified function
  linkDistance: 100, // sets the distance accessor to the specified number or function
  // linkStrength: function strength(link) {
  //   const sourceNode = cy.getElementById(link.source.id);
  //   const targetNode = cy.getElementById(link.target.id);
  //   return 1 / Math.min(sourceNode.degree(), targetNode.degree());
  // }, // sets the strength accessor to the specified number or function
  // linkIterations: 1, // sets the number of iterations per application to the specified number
  manyBodyStrength: -2000, // sets the strength accessor to the specified number or function
  // manyBodyTheta: 0.9, // sets the Barnes–Hut approximation criterion to the specified number
  // manyBodyDistanceMin: 1, // sets the minimum distance between nodes over which this force is considered
  // manyBodyDistanceMax: Infinity, // sets the maximum distance between nodes over which this force is considered
  xStrength: 0.09, // sets the strength accessor to the specified number or function
  xX: 0, // sets the x-coordinate accessor to the specified number or function
  yStrength: 0.09, // sets the strength accessor to the specified number or function
  yY: 0, // sets the y-coordinate accessor to the specified number or function
  // radialStrength: 0.05, // sets the strength accessor to the specified number or function
  // radialRadius: [40],// sets the circle radius to the specified number or function
  // radialX: 0, // sets the x-coordinate of the circle center to the specified number
  // radialY: 0, // sets the y-coordinate of the circle center to the specified number
  // layout event callbacks
  ready: function(){}, // on layoutready
  stop: function(){}, // on layoutstop
  tick: function(progress) {}, // on every iteration
  // positioning options
  randomize: false, // use random node positions at beginning of layout
  // infinite layout options
  infinite: true // overrides all other options for a forces-all-the-time mode
});


export const layouts = {
  'cola': layoutColaPreset,
  'deep-d3-force': layoutD3ForcePreset,
};