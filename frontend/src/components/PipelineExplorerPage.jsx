import { useState, useMemo } from 'react';
import ReactFlow, { Background, Controls, MarkerType, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { Network, Server, Webhook, ShieldCheck, Activity, BrainCircuit, Box } from 'lucide-react';

const pipelines = {
  main: {
    name: 'Master Orchestration Flow',
    description: 'The complete enterprise lifecycle: technical input triggers the LangGraph agent, which orchestrates document retrieval, simplification, and validation before publishing.',
    nodes: [
      { id: '1', type: 'input', data: { label: 'Technical Input' }, position: { x: 50, y: 150 }, style: { background: '#1e293b', color: '#f8fafc', border: '1px solid #475569', borderRadius: '8px', padding: '10px' } },
      { id: '2', data: { label: 'FastAPI Backend' }, position: { x: 250, y: 150 }, style: { background: '#0f172a', color: '#38bdf8', border: '1px solid #0284c7', borderRadius: '8px' } },
      { id: '3', data: { label: 'LangGraph Agent (Brain)' }, position: { x: 475, y: 150 }, style: { background: '#3b0764', color: '#d8b4fe', border: '1px solid #a855f7', borderRadius: '8px' } },
      { id: '4', data: { label: 'MCP Server (Tools)' }, position: { x: 475, y: 300 }, style: { background: '#064e3b', color: '#6ee7b7', border: '1px solid #059669', borderRadius: '8px' } },
      { id: '5', data: { label: 'Enterprise Docs' }, position: { x: 275, y: 450 }, style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '8px' } },
      { id: '6', data: { label: 'Simplify Tool' }, position: { x: 475, y: 450 }, style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '8px' } },
      { id: '7', data: { label: 'Validate Tool' }, position: { x: 675, y: 450 }, style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '8px' } },
      { id: '9', data: { label: 'GitHub Tools' }, position: { x: 75, y: 450 }, style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '8px' } },
      { id: '8', type: 'output', data: { label: 'Enterprise Hub / Slack' }, position: { x: 800, y: 150 }, style: { background: '#0f172a', color: '#38bdf8', border: '1px solid #0284c7', borderRadius: '8px' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'e2-3', source: '2', target: '3', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#a855f7' }, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'e4-9', source: '4', target: '9', animated: true, label: 'Fetch Git Context', markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'e4-5', source: '4', target: '5', animated: true, label: 'Retrieve Docs', markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'e4-6', source: '4', target: '6', animated: true, label: 'Process', markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'e4-7', source: '4', target: '7', animated: true, label: 'Validate', markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'e3-8', source: '3', target: '8', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    ]
  },
  jira: {
    name: 'Jira-to-Slack Automation',
    description: 'When a Jira ticket is created/updated, a webhook triggers the AI agent. The ticket is simplified and published to a designated Slack channel.',
    nodes: [
      { id: '1', type: 'input', data: { label: 'Atlassian Jira Webhook' }, position: { x: 50, y: 150 }, style: { background: '#0052CC', color: '#ffffff', border: '1px solid #2684FF', borderRadius: '8px', padding: '10px' } },
      { id: '2', data: { label: 'FastAPI /jira/webhook' }, position: { x: 350, y: 150 }, style: { background: '#0f172a', color: '#38bdf8', border: '1px solid #0284c7', borderRadius: '8px' } },
      { id: '3', data: { label: 'LangGraph Pipeline' }, position: { x: 650, y: 150 }, style: { background: '#3b0764', color: '#d8b4fe', border: '1px solid #a855f7', borderRadius: '8px' } },
      { id: '4', data: { label: 'MCP Tools (Simplify)' }, position: { x: 650, y: 300 }, style: { background: '#064e3b', color: '#6ee7b7', border: '1px solid #059669', borderRadius: '8px' } },
      { id: '5', type: 'output', data: { label: 'Slack #jira-updates' }, position: { x: 950, y: 150 }, style: { background: '#4A154B', color: '#ffffff', border: '1px solid #E01E5A', borderRadius: '8px' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true, label: 'JSON Payload', markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'e2-3', source: '2', target: '3', animated: true, label: 'Ticket Description', markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#a855f7' }, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'e4-3', source: '4', target: '3', animated: true, style: { stroke: '#10b981' }, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'e3-5', source: '3', target: '5', animated: true, label: 'Simplified Message', style: { stroke: '#38bdf8' }, markerEnd: { type: MarkerType.ArrowClosed } },
    ]
  },
  refinement: {
    name: 'Validation & Refinement Loop',
    description: 'The autonomous ReAct loop where the agent retries if validation fails.',
    nodes: [
      { id: '1', data: { label: 'AI Generates Draft' }, position: { x: 250, y: 150 }, style: { background: '#3b0764', color: '#d8b4fe', border: '1px solid #a855f7', borderRadius: '8px' } },
      { id: '2', data: { label: 'Validate Tool' }, position: { x: 500, y: 150 }, style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '8px' } },
      { id: '3', data: { label: 'Feedback (Stricter Facts)' }, position: { x: 375, y: 300 }, style: { background: '#7f1d1d', color: '#fca5a5', border: '1px solid #ef4444', borderRadius: '8px' } },
      { id: '4', type: 'output', data: { label: 'Final Output' }, position: { x: 750, y: 150 }, style: { background: '#064e3b', color: '#6ee7b7', border: '1px solid #10b981', borderRadius: '8px' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'e2-3', source: '2', target: '3', animated: true, label: 'Fails', style: { stroke: '#ef4444' }, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'e3-1', source: '3', target: '1', animated: true, label: 'Retry', style: { stroke: '#ef4444' }, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'e2-4', source: '2', target: '4', animated: true, label: 'Passes', style: { stroke: '#10b981' }, markerEnd: { type: MarkerType.ArrowClosed } },
    ]
  },
  grounding: {
    name: 'Enterprise Context Grounding',
    description: 'Autonomous retrieval of project documentation using MCP filesystem tools to ground AI generations in real enterprise context.',
    nodes: [
      { id: '1', type: 'input', data: { label: 'Technical Input' }, position: { x: 50, y: 150 }, style: { background: '#1e293b', color: '#f8fafc', border: '1px solid #475569', borderRadius: '8px', padding: '10px' } },
      { id: '2', data: { label: 'Topic Detection Node' }, position: { x: 275, y: 150 }, style: { background: '#0f172a', color: '#38bdf8', border: '1px solid #0284c7', borderRadius: '8px' } },
      { id: '3', data: { label: 'MCP: list_enterprise_docs()' }, position: { x: 500, y: 150 }, style: { background: '#064e3b', color: '#6ee7b7', border: '1px solid #059669', borderRadius: '8px' } },
      { id: '4', data: { label: 'MCP: read_enterprise_doc()' }, position: { x: 725, y: 150 }, style: { background: '#064e3b', color: '#6ee7b7', border: '1px solid #059669', borderRadius: '8px' } },
      { id: '5', data: { label: 'Context-Aware Simplifier' }, position: { x: 950, y: 150 }, style: { background: '#3b0764', color: '#d8b4fe', border: '1px solid #a855f7', borderRadius: '8px' } },
      { id: '6', type: 'output', data: { label: 'Grounded Communication' }, position: { x: 1175, y: 150 }, style: { background: '#0f172a', color: '#38bdf8', border: '1px solid #0284c7', borderRadius: '8px' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'e2-3', source: '2', target: '3', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'e3-4', source: '3', target: '4', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'e4-5', source: '4', target: '5', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'e5-6', source: '5', target: '6', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    ]
  },
  github: {
    name: 'GitHub-to-Slack Automation',
    description: 'When a developer pushes code, a GitHub webhook triggers the AI agent. The agent uses MCP GitHub tools to gather commit, issue, and PR context, simplifies it for non-technical users, and publishes to Slack.',
    nodes: [
      { id: '1', type: 'input', data: { label: 'GitHub Webhook (Push)' }, position: { x: 50, y: 150 }, style: { background: '#24292e', color: '#ffffff', border: '1px solid #1b1f23', borderRadius: '8px', padding: '10px' } },
      { id: '2', data: { label: 'FastAPI /github/webhook' }, position: { x: 300, y: 150 }, style: { background: '#0f172a', color: '#38bdf8', border: '1px solid #0284c7', borderRadius: '8px' } },
      { id: '3', data: { label: 'LangGraph Agent' }, position: { x: 600, y: 150 }, style: { background: '#3b0764', color: '#d8b4fe', border: '1px solid #a855f7', borderRadius: '8px' } },
      { id: '4', data: { label: 'MCP GitHub Tools (Context)' }, position: { x: 600, y: 300 }, style: { background: '#064e3b', color: '#6ee7b7', border: '1px solid #059669', borderRadius: '8px' } },
      { id: '5', type: 'output', data: { label: 'Slack #updates' }, position: { x: 900, y: 150 }, style: { background: '#4A154B', color: '#ffffff', border: '1px solid #E01E5A', borderRadius: '8px' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true, label: 'Push Event Payload', markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'e2-3', source: '2', target: '3', animated: true, label: 'Trigger AI', markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'e3-4', source: '3', target: '4', animated: true, label: 'Fetch PRs & Issues', style: { stroke: '#a855f7' }, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'e4-3', source: '4', target: '3', animated: true, label: 'Rich Context', style: { stroke: '#10b981' }, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'e3-5', source: '3', target: '5', animated: true, label: 'Simplified Post', style: { stroke: '#38bdf8' }, markerEnd: { type: MarkerType.ArrowClosed } },
    ]
  }
};

export default function PipelineExplorerPage() {
  const [activePipeline, setActivePipeline] = useState('main');
  
  const currentFlow = useMemo(() => pipelines[activePipeline], [activePipeline]);
  const [nodes, setNodes] = useState(currentFlow.nodes);
  const [edges, setEdges] = useState(currentFlow.edges);

  useMemo(() => {
    setNodes(pipelines[activePipeline].nodes);
    setEdges(pipelines[activePipeline].edges);
  }, [activePipeline]);

  const onNodesChange = (changes) => setNodes((nds) => applyNodeChanges(changes, nds));
  const onEdgesChange = (changes) => setEdges((eds) => applyEdgeChanges(changes, eds));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 h-full flex flex-col pb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Network className="w-6 h-6 text-brand-500" /> MCP Pipeline Explorer
        </h2>
        <div className="flex gap-2">
          {Object.keys(pipelines).map((key) => (
            <button
              key={key}
              onClick={() => setActivePipeline(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                activePipeline === key 
                  ? 'bg-brand-600 border-brand-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' 
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {pipelines[key].name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[600px]">
        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel p-5">
            <h3 className="font-bold text-lg text-slate-100 mb-2">{currentFlow.name}</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              {currentFlow.description}
            </p>
            
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Key Components</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded bg-purple-900/50 border border-purple-500 flex items-center justify-center text-purple-400">
                    <BrainCircuit className="w-4 h-4" />
                  </div>
                  <span className="text-slate-300">LangGraph Agent</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded bg-emerald-900/50 border border-emerald-500 flex items-center justify-center text-emerald-400">
                    <Server className="w-4 h-4" />
                  </div>
                  <span className="text-slate-300">MCP Server (SSE)</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-400">
                    <Box className="w-4 h-4" />
                  </div>
                  <span className="text-slate-300">MCP Tools</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded bg-blue-900/50 border border-blue-500 flex items-center justify-center text-blue-400">
                    <Webhook className="w-4 h-4" />
                  </div>
                  <span className="text-slate-300">Slack / Webhooks</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-800">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Live Status</h4>
              <div className="flex items-center gap-2 text-sm text-green-400 bg-green-400/10 border border-green-400/20 px-3 py-2 rounded-lg">
                <Activity className="w-4 h-4 animate-pulse" />
                Orchestration Active
              </div>
            </div>
          </div>
        </div>

        {/* React Flow Container */}
        <div className="lg:col-span-3 glass-panel overflow-hidden border border-slate-700/50 relative">
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <span className="px-3 py-1 bg-slate-900/80 backdrop-blur rounded-full text-xs font-medium border border-slate-700 text-slate-300 shadow-xl">
              Interactive Graph
            </span>
          </div>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            attributionPosition="bottom-right"
          >
            <Background color="#334155" gap={16} />
            <Controls className="bg-slate-800 border-slate-700 fill-slate-300 text-slate-300" />
          </ReactFlow>
        </div>
      </div>
    </motion.div>
  );
}
