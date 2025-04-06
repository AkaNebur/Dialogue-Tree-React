// Initial nodes for our dialogue tree
export const initialNodes = [
    {
      id: '1',
      type: 'input',
      data: { label: 'Start Conversation' },
      position: { x: 250, y: 0 },
      className: 'node-start',
    },
    {
      id: '2',
      data: { label: 'Hello, how are you?' },
      position: { x: 100, y: 100 },
      className: 'node-hello',
    },
    {
      id: '3',
      data: { label: 'Would you like to know more about our products?' },
      position: { x: 400, y: 100 },
      className: 'node-products',
    },
    {
      id: '4',
      data: { label: 'I\'m feeling great!' },
      position: { x: 100, y: 200 },
      className: 'node-great',
    },
    {
      id: '5',
      data: { label: 'Yes, tell me more' },
      position: { x: 300, y: 200 },
      className: 'node-more',
    },
    {
      id: '6',
      data: { label: 'No, maybe later' },
      position: { x: 500, y: 200 },
      className: 'node-later',
    },
  ];
  
  // Initial connections between nodes
  export const initialEdges = [
    { id: 'e1-2', source: '1', target: '2', animated: true },
    { id: 'e1-3', source: '1', target: '3', animated: true },
    { id: 'e2-4', source: '2', target: '4' },
    { id: 'e3-5', source: '3', target: '5' },
    { id: 'e3-6', source: '3', target: '6' },
  ];
  
  // Node dimensions for layout calculations
  export const NODE_DIMENSIONS = {
    WIDTH: 150,
    HEIGHT: 60,
  };
  
  // Layout spacing constants
  export const LAYOUT_CONSTANTS = {
    HORIZONTAL_NODE_DISTANCE: 250,
    VERTICAL_NODE_DISTANCE: 150,
    HORIZONTAL_LEVEL_DISTANCE: 300,
    VERTICAL_LEVEL_DISTANCE: 150,
    INITIAL_X_OFFSET: 50,
    INITIAL_Y_OFFSET: 50,
  };