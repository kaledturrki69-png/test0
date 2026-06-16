'use client';

import * as React from 'react';
import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  type NodeChange,
  type EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  Handle,
  Position,
  ReactFlowProvider,
  useReactFlow,
  useUpdateNodeInternals
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { IconArrowLeft } from '@tabler/icons-react';
import { WorkflowService } from '@/services/workflow-service';

import {
  EntryConfig,
  GeneralDataConfig,
  HardSkillConfig,
  SoftSkillConfig,
  InterviewConfig,
  ConditionConfig,
  DeclineConfig,
  EndConfig
} from '@/components/workflow-config';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@/components/ui/popover';
import { toast } from 'sonner';
import {
  Brain,
  Users,
  ScrollText,
  FileWarning,
  Workflow,
  GitBranchPlus,
  Download,
  CheckCircle2,
  Database
} from 'lucide-react';
import { WorkflowJsonDialog } from '@/components/WorkflowJsonDialog';
import { useTranslations } from 'next-intl';

/* -------------------------------------------------------------------------- */
/*                                NODE TYPES                                  */
/* -------------------------------------------------------------------------- */

interface NodeData {
  id: string;
  label: string;
  type: string;
  config?: {
    caption?: string;
    branches?: Array<{
      expression: string;
      target: string;
      failsafe?: boolean;
    }>;
    [key: string]: any;
  };
}

const nodeTypes = {
  custom: CustomNode
};

const nodeColors: Record<string, string> = {
  entry: 'border-green-400 bg-green-50',
  enrichment: 'border-violet-400 bg-violet-50',
  hard: 'border-blue-400 bg-blue-50',
  soft: 'border-yellow-400 bg-yellow-50',
  interview: 'border-purple-400 bg-purple-50',
  condition: 'border-gray-400 bg-gray-50',
  decline: 'border-red-400 bg-red-50',
  end: 'border-slate-400 bg-slate-50'
};

const nodeIcons: Record<string, React.ReactNode> = {
  entry: <Workflow className='h-4 w-4 text-green-500' />,
  enrichment: <Database className='h-4 w-4 text-violet-500' />,
  hard: <Brain className='h-4 w-4 text-blue-500' />,
  soft: <Users className='h-4 w-4 text-yellow-500' />,
  interview: <GitBranchPlus className='h-4 w-4 text-purple-500' />,
  condition: <ScrollText className='h-4 w-4 text-gray-500' />,
  decline: <FileWarning className='h-4 w-4 text-red-500' />,
  end: <CheckCircle2 className='h-4 w-4 text-slate-500' />
};

/* -------------------------------------------------------------------------- */
/*                            CUSTOM NODE COMPONENT                           */
/* -------------------------------------------------------------------------- */

function CustomNode({ id, data }: { id: string; data: NodeData }) {
  const branches = data.config?.branches || [];
  const caption = data.config?.caption;

  // ✅ Hook from React Flow to manually trigger re-scan of handles
  const updateNodeInternals = useUpdateNodeInternals();

  // 🔁 When the number of branches changes, update the node internals
  const branchesLengthRef = React.useRef(branches.length);

  React.useEffect(() => {
    // Only update if branches length actually changed
    if (branchesLengthRef.current !== branches.length) {
      branchesLengthRef.current = branches.length;
      updateNodeInternals(id);
    }
  }, [id, branches.length, updateNodeInternals]);

  return (
    <div
      className={`relative w-56 rounded-xl border-2 p-3 text-xs shadow-sm ${nodeColors[data.type]}`}
    >
      {/* Header */}
      <div className='mb-1 flex items-center gap-2 text-sm font-medium'>
        {nodeIcons[data.type]}
        <span className='truncate'>{data.label}</span>
      </div>

      {/* Top handle (incoming) */}
      {data.type !== 'entry' && (
        <Handle type='target' position={Position.Top} isConnectable={true} />
      )}

      {/* Caption for non-condition nodes */}
      {data.type !== 'condition' && caption && (
        <div
          className='mt-1 mb-2 text-[11px] leading-tight text-gray-600'
          dangerouslySetInnerHTML={{ __html: caption }}
        />
      )}

      {/* ✅ Dynamic handles for condition nodes */}
      {data.type === 'condition' && (
        <div
          className='relative flex items-center justify-between pt-3'
          style={{ minHeight: 30 }}
        >
          {branches.map((branch, i) => {
            const isFailsafe = !!branch.failsafe;
            const handleId = isFailsafe
              ? `${id}-failsafe`
              : `${id}-branch-${i}`;

            return (
              <div
                key={handleId}
                className='relative flex flex-col items-center'
                style={{ flex: 1, minWidth: 24 }}
              >
                {branch.expression && (
                  <span className='mb-1 max-w-[60px] truncate text-[10px] text-gray-600'>
                    {branch.expression}
                  </span>
                )}
                <Handle
                  id={handleId}
                  type='source'
                  position={Position.Bottom}
                  isConnectable={true}
                  style={{
                    background: isFailsafe ? '#ef4444' : '#2563eb',
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    border: '2px solid white',
                    zIndex: 20,
                    cursor: 'crosshair'
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Default bottom handle for other nodes */}
      {data.type !== 'condition' && (
        <Handle type='source' position={Position.Bottom} isConnectable={true} />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                        EDGE CONDITION EDITOR POPOVER                       */
/* -------------------------------------------------------------------------- */

function ConditionEditor({
  edge,
  onChange
}: {
  edge: Edge;
  onChange: (edgeId: string, condition: string) => void;
}) {
  const t = useTranslations('workflows.designer');
  const conditionValue =
    typeof edge.data?.condition === 'string' ? edge.data.condition : '';
  const [val, setVal] = useState(conditionValue);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='sm' className='text-xs'>
          {conditionValue || t('set_condition')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-64'>
        <Label>{t('condition_expression')}</Label>
        <Input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={t('placeholder_condition')}
        />
        <Button
          size='sm'
          className='mt-2 w-full'
          onClick={() => {
            onChange(edge.id, val);
            toast.success(t('condition_updated'));
          }}
        >
          {t('save')}
        </Button>
      </PopoverContent>
    </Popover>
  );
}

/* -------------------------------------------------------------------------- */
/*                              FLOW DESIGNER PAGE                            */
/* -------------------------------------------------------------------------- */

const configComponents: Record<string, any> = {
  entry: EntryConfig,
  enrichment: GeneralDataConfig,
  hard: HardSkillConfig,
  soft: SoftSkillConfig,
  interview: InterviewConfig,
  condition: ConditionConfig,
  decline: DeclineConfig,
  end: EndConfig
};

function generateNodeName(type: string, existingNodes: Node[]): string {
  const sameType = existingNodes.filter((n) => n.data?.type === type);
  const numbers = sameType
    .map((n) => {
      const id = typeof n.data?.id === 'string' ? n.data.id : '';
      const match = id.match(new RegExp(`${type}-(\\d+)$`));
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(Boolean);
  const nextNum = numbers.length ? Math.max(...numbers) + 1 : 1;
  return `${type}-${nextNum}`;
}

function WorkflowDesignerCanvas({ positionId }: { positionId: number }) {
  const { screenToFlowPosition } = useReactFlow();
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('workflows.designer');

  const typeLabels = useMemo<Record<string, string>>(
    () => ({
      entry: t('type_labels.entry'),
      enrichment: t('type_labels.enrichment'),
      hard: t('type_labels.hard'),
      soft: t('type_labels.soft'),
      interview: t('type_labels.interview'),
      condition: t('type_labels.condition'),
      decline: t('type_labels.decline'),
      end: t('type_labels.end')
    }),
    [t]
  );

  const getNodeLabel = useCallback(
    (type: string, nodeId: string) => {
      const base = typeLabels[type] || type;
      const parts = nodeId.split('-');
      const suffix = parts.length > 1 ? parts.slice(1).join('-') : '';
      return suffix ? `${base} ${suffix}` : base;
    },
    [typeLabels]
  );

  const [nodes, setNodes] = useState<Node[]>(() => [
    {
      id: 'entry',
      type: 'custom',
      position: { x: 400, y: 50 },
      data: {
        id: 'entry',
        label: t('entry_label'),
        type: 'entry',
        config: {
          clientInterest: true,
          scoreMatching: 15,
          isAuto: true
        }
      }
    }
  ]);
  // Helper function to generate unique edge ID
  const generateEdgeId = useCallback(
    (source: string, target: string, sourceHandle?: string | null) => {
      if (sourceHandle) {
        return `${source}-${sourceHandle}-${target}`;
      }
      return `${source}-${target}`;
    },
    []
  );

  // Helper function to deduplicate edges
  const deduplicateEdges = useCallback(
    (edgeList: Edge[]): Edge[] => {
      const seen = new Map<string, Edge>();

      edgeList.forEach((edge) => {
        const key = generateEdgeId(edge.source, edge.target, edge.sourceHandle);

        // If we've seen this combination before, keep the one with the most complete data
        if (seen.has(key)) {
          const existing = seen.get(key)!;
          // Prefer edge with sourceHandle if one exists
          if (edge.sourceHandle && !existing.sourceHandle) {
            seen.set(key, {
              ...edge,
              id: edge.id || key,
              animated: edge.animated ?? true
            } as Edge);
          }
        } else {
          // Ensure edge has an ID and animated property
          const edgeWithId: Edge = {
            ...edge,
            id: edge.id || key,
            animated: edge.animated ?? true
          } as Edge;
          seen.set(key, edgeWithId);
        }
      });

      return Array.from(seen.values());
    },
    [generateEdgeId]
  );

  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [exportJson, setExportJson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [workflowConfigId, setWorkflowConfigId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  /* ------------------------------- Load Workflow Config -------------------------------- */
  useEffect(() => {
    const loadWorkflowConfig = async () => {
      if (!session?.accessToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const configs = await WorkflowService.getConfigs(
          session.accessToken,
          positionId
        );

        if (configs.length > 0) {
          const config = configs[0]; // Get first config for this position
          setWorkflowConfigId(config.id || null);
          const workflowData = JSON.parse(config.data);
          // Preserve enabled state from saved config
          if (workflowData.workflow) {
            // Restore nodes and edges from saved config
            if (workflowData.workflow.nodes) {
              const restoredNodes: Node[] = workflowData.workflow.nodes.map(
                (n: any, index: number) => ({
                  id: n.id,
                  type: 'custom',
                  // Restore position if saved, otherwise use staggered layout
                  position: n.position
                    ? { x: n.position.x, y: n.position.y }
                    : { x: 400, y: 50 + index * 150 },
                  data: {
                    id: n.id,
                    label:
                      typeof n.label === 'string' && n.label.trim()
                        ? n.label
                        : getNodeLabel(
                            typeof n.type === 'string' ? n.type : '',
                            n.id
                          ),
                    type: n.type,
                    config: n.config || {}
                  }
                })
              );
              setNodes(restoredNodes);
            }

            if (workflowData.workflow.edges) {
              // Track edge IDs to ensure uniqueness
              const usedIds = new Set<string>();

              // Group edges by source-target to identify condition branches
              const edgeGroups = new Map<string, any[]>();
              workflowData.workflow.edges.forEach((e: any) => {
                const key = `${e.source}-${e.target}`;
                if (!edgeGroups.has(key)) {
                  edgeGroups.set(key, []);
                }
                edgeGroups.get(key)!.push(e);
              });

              const restoredEdges: Edge[] = workflowData.workflow.edges.map(
                (e: any) => {
                  // Include sourceHandle in ID if it exists to ensure uniqueness
                  // For condition nodes with multiple branches, each branch needs a unique ID
                  let sourceHandle: string | undefined =
                    e.sourceHandle || e.handle || undefined;

                  // If sourceHandle is missing but this is a condition node with multiple edges to same target,
                  // try to infer the handle from the saved data
                  const sourceNode = workflowData.workflow.nodes?.find(
                    (n: any) => n.id === e.source
                  );
                  if (sourceNode?.type === 'condition' && !sourceHandle) {
                    const groupKey = `${e.source}-${e.target}`;
                    const groupEdges = edgeGroups.get(groupKey) || [];
                    const groupIndex = groupEdges.findIndex((ge) => ge === e);

                    // Try multiple strategies to recover the sourceHandle:
                    // 1. Check if saved edge ID contains branch information
                    if (e.id && typeof e.id === 'string') {
                      // Pattern: condition-1-branch-0-end-1
                      const branchMatch = e.id.match(/branch-(\d+)/);
                      if (branchMatch) {
                        sourceHandle = `${e.source}-branch-${branchMatch[1]}`;
                      } else if (e.id.includes('failsafe')) {
                        sourceHandle = `${e.source}-failsafe`;
                      }
                    }

                    // 2. If still no handle, use index-based handle (last resort)
                    if (
                      !sourceHandle &&
                      groupIndex >= 0 &&
                      groupEdges.length > 1
                    ) {
                      // Check if it's the failsafe branch (usually last)
                      const isFailsafe =
                        e.condition === 'failsafe' ||
                        (groupIndex === groupEdges.length - 1 &&
                          groupEdges.length > 1);
                      sourceHandle = isFailsafe
                        ? `${e.source}-failsafe`
                        : `${e.source}-branch-${groupIndex}`;
                    }
                  }

                  // Generate base edge ID using sourceHandle if available
                  let edgeId = sourceHandle
                    ? `${e.source}-${sourceHandle}-${e.target}`
                    : `${e.source}-${e.target}`;

                  // If ID already exists (shouldn't happen with proper sourceHandle, but safety check),
                  // add index to make it unique
                  let finalEdgeId = edgeId;
                  let counter = 0;
                  while (usedIds.has(finalEdgeId)) {
                    finalEdgeId = `${edgeId}-${counter}`;
                    counter++;
                  }
                  usedIds.add(finalEdgeId);

                  return {
                    id: finalEdgeId,
                    source: e.source,
                    target: e.target,
                    sourceHandle: sourceHandle,
                    animated: true,
                    data: {
                      condition: e.condition || 'always'
                    }
                  };
                }
              );
              // Deduplicate edges before setting
              setEdges(deduplicateEdges(restoredEdges));
            }
          }
        } else {
          // No config found, start with default entry node
          setNodes([
            {
              id: 'entry',
              type: 'custom',
              position: { x: 400, y: 50 },
              data: {
                id: 'entry',
                label: t('entry_label'),
                type: 'entry',
                config: {
                  clientInterest: true,
                  scoreMatching: 15,
                  isAuto: true
                }
              }
            }
          ]);
        }
      } catch (error) {
        //console.error('Failed to load workflow config:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWorkflowConfig();
  }, [session?.accessToken, positionId, deduplicateEdges, getNodeLabel, t]);

  /* ------------------------------- Handlers -------------------------------- */

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      // Ensure sourceHandle is preserved - it's critical for condition nodes
      // ReactFlow provides sourceHandle when connecting from a specific handle
      if (!connection.source || !connection.target) {
        return;
      }

      // Generate unique edge ID based on source, sourceHandle, and target
      const edgeId = generateEdgeId(
        connection.source,
        connection.target,
        connection.sourceHandle || undefined
      );

      setEdges((eds) => {
        // Check if edge already exists - must match source, target, AND sourceHandle
        const existingEdge = eds.find(
          (e) =>
            e.source === connection.source &&
            e.target === connection.target &&
            e.sourceHandle === (connection.sourceHandle || undefined)
        );
        if (existingEdge) {
          // Edge already exists, don't add duplicate
          return eds;
        }

        const newEdge: Edge = {
          ...connection,
          id: edgeId,
          source: connection.source,
          target: connection.target,
          sourceHandle: connection.sourceHandle || undefined,
          animated: true,
          label: connection.sourceHandle
            ? connection.sourceHandle.replace(`${connection.source}-`, '')
            : '',
          data: {
            condition: 'always'
          }
        };

        // Add the edge
        const updatedEdges = addEdge(newEdge, eds);
        // Deduplicate to ensure no duplicates slipped through
        return deduplicateEdges(updatedEdges);
      });
    },
    [generateEdgeId, deduplicateEdges]
  );

  const updateEdgeCondition = (edgeId: string, condition: string) => {
    setEdges((prev) =>
      prev.map((e) =>
        e.id === edgeId
          ? { ...e, data: { ...e.data, condition }, label: condition }
          : e
      )
    );
  };

  // const handleAddNode = (type: string) => {
  //   const newId = generateNodeName(type, nodes);
  //   const newNode: Node = {
  //     id: newId,
  //     type: 'custom',
  //     position: screenToFlowPosition({ x: 400, y: 150 + nodes.length * 70 }),
  //     data: {
  //       id: newId,
  //       label: newId.replace('-', ' ').toUpperCase(),
  //       type,
  //       config: type === 'condition' ? { branches: [] } : {}
  //     }
  //   };
  //   setNodes((prev) => [...prev, newNode]);
  // };

  const updateNodeConfig = useCallback((nodeId: string, config: any) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, config } } : node
      )
    );
    setSelectedNode((prev) =>
      prev && prev.id === nodeId
        ? { ...prev, data: { ...prev.data, config } }
        : prev
    );
  }, []);

  /* 🔁 Force re-render des handles quand les branches changent */
  const branchesLength = useMemo(() => {
    if (
      selectedNode?.data?.config &&
      typeof selectedNode.data.config === 'object' &&
      selectedNode.data.config !== null &&
      'branches' in selectedNode.data.config &&
      Array.isArray(selectedNode.data.config.branches)
    ) {
      return selectedNode.data.config.branches.length;
    }
    return 0;
  }, [selectedNode?.data?.config]);

  // Store refs to avoid including them in dependencies (prevents infinite loop)
  const nodesRef = React.useRef(nodes);
  const selectedNodeRef = React.useRef(selectedNode);
  const prevBranchesLengthRef = React.useRef(branchesLength);

  // Update refs when values change
  React.useEffect(() => {
    nodesRef.current = nodes;
    selectedNodeRef.current = selectedNode;
  }, [nodes, selectedNode]);

  useEffect(() => {
    // Only update if branches length actually changed and we have a condition node
    if (
      selectedNodeRef.current?.data?.type === 'condition' &&
      prevBranchesLengthRef.current !== branchesLength
    ) {
      prevBranchesLengthRef.current = branchesLength;
      const nodeId = selectedNodeRef.current.id;
      const node = nodesRef.current.find((n) => n.id === nodeId);
      // Only update if the node exists and config is different
      if (node && node.data?.config) {
        // Check if config actually changed to avoid infinite loop
        const configString = JSON.stringify(node.data.config);
        const selectedConfigString = JSON.stringify(
          selectedNodeRef.current.data.config
        );
        if (configString !== selectedConfigString) {
          updateNodeConfig(nodeId, node.data.config);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchesLength, selectedNode?.id, selectedNode?.data?.type]);
  const handleViewJson = () => {
    const exportData = {
      enabled: true,
      workflow: {
        nodes: nodes.map((n) => ({
          id: n.id,
          label: n.data.label,
          type: n.data.type,
          position: { x: n.position.x, y: n.position.y },
          config: n.data.config || {}
        })),
        edges: edges.map((e) => ({
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle || undefined,
          condition: e.data?.condition || 'always'
        }))
      }
    };
    setExportJson(exportData);
    setIsDialogOpen(true);
  };

  const handleExport = async () => {
    if (!session?.accessToken) {
      toast.error(t('sign_in_required'));
      return;
    }

    const exportData = {
      enabled: true, // Default to enabled when saving
      workflow: {
        nodes: nodes.map((n) => ({
          id: n.id,
          label: n.data.label,
          type: n.data.type,
          position: { x: n.position.x, y: n.position.y }, // Save node positions
          config: n.data.config || {}
        })),
        edges: edges.map((e) => ({
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle || undefined,
          condition: e.data?.condition || 'always'
        }))
      }
    };

    try {
      setSaving(true);

      // Load existing config to preserve enabled state
      let existingEnabled = true;
      if (workflowConfigId) {
        try {
          const existingConfig = await WorkflowService.getConfig(
            session.accessToken,
            workflowConfigId
          );
          const existingData = JSON.parse(existingConfig.data);
          existingEnabled = existingData.enabled !== false;
        } catch {
          // Use default enabled state if we can't load it
        }
      }

      // Preserve enabled state when saving
      exportData.enabled = existingEnabled;

      if (workflowConfigId) {
        // Update existing config
        await WorkflowService.updateConfig(
          session.accessToken,
          workflowConfigId,
          {
            position: positionId,
            data: JSON.stringify(exportData)
          }
        );
        toast.success(t('config_updated'));
      } else {
        // Create new config
        const newConfig = await WorkflowService.createConfig(
          session.accessToken,
          {
            position: positionId,
            data: JSON.stringify(exportData)
          }
        );
        setWorkflowConfigId(newConfig.id || null);
        toast.success(t('config_saved'));
      }

      // Commented out: JSON popup display
      // setExportJson(exportData);
      // setIsDialogOpen(true);
    } catch (error) {
      toast.error(t('config_save_failed'));
      //console.error('Error saving workflow:', error);
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------ Rendering -------------------------------- */

  if (loading) {
    return (
      <div className='flex h-[calc(100vh-4rem)] items-center justify-center'>
        <div className='text-center'>
          <div className='border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
          <p className='text-muted-foreground'>{t('loading_workflow')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-muted/20 flex h-[calc(100vh-4rem)] w-full'>
      <WorkflowJsonDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        data={exportJson}
        title={t('export_json_title')}
      />

      {/* Palette */}
      {/* Palette */}
      <div className='bg-background flex w-60 flex-col gap-2 border-r p-4'>
        <h2 className='text-muted-foreground mb-1 text-sm font-semibold uppercase'>
          {t('palette_title')}
        </h2>
        <p className='text-muted-foreground mb-3 text-xs'>
          {t('palette_hint')}
        </p>

        {[
          'enrichment',
          'hard',
          'soft',
          'interview',
          'condition',
          'decline',
          'end'
        ].map((type) => (
          <div
            key={type}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData('application/reactflow', type);
              event.dataTransfer.effectAllowed = 'move';
            }}
            className='hover:bg-muted flex cursor-grab items-center gap-2 rounded-md border px-2 py-1 select-none active:cursor-grabbing'
          >
            {nodeIcons[type]}
            <span className='capitalize'>{typeLabels[type] || type}</span>
          </div>
        ))}

        <Separator className='my-3' />
        <Button
          onClick={handleViewJson}
          variant='default'
          className='mt-auto flex items-center gap-2'
        >
          {t('view_json')}
        </Button>

        <Button
          onClick={handleExport}
          variant='default'
          className='mt-auto flex items-center gap-2'
          disabled={saving || loading}
        >
          {saving ? (
            <>
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
              {workflowConfigId ? t('updating') : t('saving')}
            </>
          ) : (
            <>
              <Download className='h-4 w-4' />{' '}
              {workflowConfigId ? t('update_workflow') : t('save_workflow')}
            </>
          )}
        </Button>
      </div>

      {/* Canvas */}
      <div className='relative flex-1'>
        {/* Back Button */}
        <Button
          variant='outline'
          size='sm'
          onClick={() => router.push(`/${locale}/dashboard/positions`)}
          className='absolute top-4 left-4 z-10'
        >
          <IconArrowLeft className='h-4 w-4' />
        </Button>
        <ReactFlow
          nodeTypes={nodeTypes}
          nodes={nodes}
          edges={(() => {
            // First, ensure all edges have proper IDs and sourceHandle
            const edgesWithIds = edges.map((edge, index) => {
              let edgeId = edge.id;
              if (!edgeId) {
                edgeId = generateEdgeId(
                  edge.source,
                  edge.target,
                  edge.sourceHandle || undefined
                );
              }

              // Final safety check: if still no ID, use index
              if (!edgeId) {
                edgeId = `edge-${index}`;
              }

              return {
                ...edge,
                id: edgeId,
                sourceHandle: edge.sourceHandle || undefined
              };
            });

            // Deduplicate edges - this ensures no duplicate keys
            const deduplicated = deduplicateEdges(edgesWithIds);

            // Final pass: ensure every edge has a unique ID
            const finalEdges: Edge[] = [];
            const idSet = new Set<string>();

            deduplicated.forEach((edge, index) => {
              let finalId = edge.id || `edge-${index}`;

              // Ensure ID is truly unique
              if (idSet.has(finalId)) {
                let counter = 0;
                while (idSet.has(finalId)) {
                  finalId = `${edge.id || 'edge'}-${counter}`;
                  counter++;
                }
              }

              idSet.add(finalId);
              finalEdges.push({
                ...edge,
                id: finalId
              });
            });

            return finalEdges;
          })()}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={(_, edge) => setSelectedEdge(edge)}
          onNodeClick={(_, node) => {
            const latestNode = nodes.find((n) => n.id === node.id) || node;
            setSelectedNode(latestNode);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
          }}
          onDrop={(event) => {
            event.preventDefault();

            // Get dropped type
            const type = event.dataTransfer.getData('application/reactflow');
            if (!type) return;

            // Get flow coordinates
            const position = screenToFlowPosition({
              x: event.clientX,
              y: event.clientY
            });

            const newId = generateNodeName(type, nodes);

            const newNode: Node = {
              id: newId,
              type: 'custom',
              position,
              data: {
                id: newId,
                label: getNodeLabel(type, newId),
                type,
                config: type === 'condition' ? { branches: [] } : {}
              }
            };

            setNodes((prev) => [...prev, newNode]);
          }}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background gap={16} />
        </ReactFlow>

        {selectedEdge && (
          <div className='absolute bottom-4 left-1/2 z-10 -translate-x-1/2'>
            <ConditionEditor
              edge={selectedEdge}
              onChange={updateEdgeCondition}
            />
          </div>
        )}
      </div>

      {/* Config Panel */}
      <div className='bg-background w-72 overflow-y-auto border-l p-4'>
        <h3 className='text-muted-foreground mb-2 text-sm font-semibold uppercase'>
          {t('config_panel')}
        </h3>
        {selectedNode ? (
          <>
            <p className='mb-2 font-medium'>
              {t('selected_node', {
                name:
                  typeof selectedNode.data?.label === 'string'
                    ? selectedNode.data.label
                    : t('unknown')
              })}
            </p>
            {(() => {
              const nodeType =
                typeof selectedNode.data?.type === 'string'
                  ? selectedNode.data.type
                  : '';
              const Comp = nodeType ? configComponents[nodeType] : undefined;
              return Comp ? (
                <Comp
                  node={selectedNode}
                  nodes={nodes}
                  edges={edges}
                  positionId={positionId}
                  onConfigChange={(config: any) =>
                    updateNodeConfig(selectedNode.id, config)
                  }
                />
              ) : (
                <p>{t('no_config')}</p>
              );
            })()}
          </>
        ) : (
          <p className='text-muted-foreground text-xs'>
            {t('select_node_prompt')}
          </p>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               PAGE WRAPPER                                 */
/* -------------------------------------------------------------------------- */

export default function WorkflowDesignerPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations('workflows.designer');
  const [positionId, setPositionId] = useState<string | null>(null);
  const [positionName, setPositionName] = useState<string | null>(null);

  useEffect(() => {
    params.then((resolvedParams) => {
      setPositionId(resolvedParams.id);
    });
  }, [params]);

  // Fetch position name for breadcrumbs
  useEffect(() => {
    if (!positionId) return;

    const fetchPosition = async () => {
      try {
        const response = await fetch(`/api/positions/${positionId}`);

        if (response.ok) {
          const position = await response.json();
          setPositionName(position.name);
        }
      } catch (error) {
        // Silently fail - breadcrumb will just show ID
      }
    };

    fetchPosition();
  }, [positionId]);

  // Update breadcrumb title
  useEffect(() => {
    if (!positionId) return;

    // Use usePathname from next/navigation for consistent pathname
    const pathname = window.location.pathname;
    if (pathname.includes('/workflows/designer/')) {
      // Update document title
      const title = positionName
        ? `${positionId} - ${positionName}`
        : positionId;
      document.title = `${t('page_title_prefix')} - ${title}`;

      // Update breadcrumb via custom event
      // Store the position name with the pathname as key
      const event = new CustomEvent('breadcrumb-update', {
        detail: {
          pathname,
          title: positionName ? `${positionId} - ${positionName}` : positionId
        }
      });
      window.dispatchEvent(event);
    }
  }, [positionId, positionName, t]);

  if (!positionId) {
    return <div>{t('loading')}</div>;
  }

  return (
    <ReactFlowProvider>
      <WorkflowDesignerCanvas positionId={parseInt(positionId, 10)} />
    </ReactFlowProvider>
  );
}
