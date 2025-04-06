import { useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';

// Initial nodes for our dialogue tree
const initialNodes = [
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
const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e1-3', source: '1', target: '3', animated: true },
  { id: 'e2-4', source: '2', target: '4' },
  { id: 'e3-5', source: '3', target: '5' },
  { id: 'e3-6', source: '3', target: '6' },
];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div className="app-container">
      <div className="header-overlay">
        <h1 className="header-title">Dialogue Tree Builder</h1>
        <p className="header-subtitle">Create and visualize dialogue trees for your game or application</p>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        attributionPosition="bottom-right"
        className="react-flow-container"
      >
        <Controls />
        <MiniMap />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
}

export default App;