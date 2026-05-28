'use client';
import { useRef, useState, useCallback, type MouseEvent } from 'react';
import { Plus, Trash2, Download, RotateCcw } from 'lucide-react';

interface MindNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  parentId: string | null;
}

const COLORS = ['#0fb8a0','#6366f1','#f97316','#ec4899','#3b82f6','#10b981','#f59e0b','#8b5cf6'];

function uid() { return Math.random().toString(36).slice(2); }

const ROOT_DEFAULT: MindNode = { id: 'root', label: 'My Topic', x: 400, y: 250, color: '#0fb8a0', parentId: null };

export function MindMap() {
  const [nodes, setNodes] = useState<MindNode[]>([ROOT_DEFAULT]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const addChild = useCallback((parentId: string) => {
    const parent = nodes.find(n => n.id === parentId)!;
    const siblings = nodes.filter(n => n.parentId === parentId).length;
    const angle = (siblings * 60 - 120) * (Math.PI / 180);
    const dist = 160;
    const colorIdx = nodes.length % COLORS.length;
    const child: MindNode = {
      id: uid(),
      label: 'New idea',
      x: parent.x + Math.cos(angle) * dist,
      y: parent.y + Math.sin(angle) * dist,
      color: COLORS[colorIdx],
      parentId,
    };
    setNodes(prev => [...prev, child]);
    setEditing(child.id);
    setEditText(child.label);
  }, [nodes]);

  function deleteNode(id: string) {
    if (id === 'root') return;
    const toDelete = new Set<string>();
    function collect(nid: string) {
      toDelete.add(nid);
      nodes.filter(n => n.parentId === nid).forEach(c => collect(c.id));
    }
    collect(id);
    setNodes(prev => prev.filter(n => !toDelete.has(n.id)));
    setSelected(null);
  }

  function startEdit(node: MindNode) {
    setEditing(node.id);
    setEditText(node.label);
  }

  function commitEdit() {
    if (!editing) return;
    setNodes(prev => prev.map(n => n.id === editing ? { ...n, label: editText || n.label } : n));
    setEditing(null);
  }

  function onMouseDown(e: MouseEvent, nodeId: string) {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId)!;
    const rect = containerRef.current!.getBoundingClientRect();
    setDragging(nodeId);
    setDragOffset({ x: e.clientX - rect.left - node.x, y: e.clientY - rect.top - node.y });
    setSelected(nodeId);
  }

  function onMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!dragging) return;
    const rect = containerRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;
    setNodes(prev => prev.map(n => n.id === dragging ? { ...n, x, y } : n));
  }

  function onMouseUp() { setDragging(null); }

  function reset() {
    setNodes([ROOT_DEFAULT]);
    setSelected(null);
    setEditing(null);
  }

  function exportSVG() {
    const svg = svgRef.current;
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'mindmap.svg'; a.click();
    URL.revokeObjectURL(url);
  }

  const W = 800, H = 500;

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-xs text-muted-foreground flex-1">
          <strong>Click</strong> to select · <strong>Drag</strong> to move · <strong>Double-click</strong> to rename · <strong>+</strong> to add child
        </p>
        {selected && selected !== 'root' && (
          <button onClick={() => deleteNode(selected)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive/20 transition-colors">
            <Trash2 size={12}/> Delete node
          </button>
        )}
        <button onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted text-muted-foreground text-xs font-semibold hover:bg-muted/80 transition-colors">
          <RotateCcw size={12}/> Reset
        </button>
        <button onClick={exportSVG} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors">
          <Download size={12}/> Export SVG
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onClick={() => setSelected(null)}
        className="relative bg-card border border-border/60 rounded-2xl overflow-hidden cursor-default select-none"
        style={{ height: H }}
      >
        {/* SVG lines */}
        <svg ref={svgRef} className="absolute inset-0 pointer-events-none" width={W} height={H} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {nodes.filter(n => n.parentId).map(n => {
            const parent = nodes.find(p => p.id === n.parentId);
            if (!parent) return null;
            return (
              <line key={n.id}
                x1={parent.x} y1={parent.y}
                x2={n.x} y2={n.y}
                stroke={n.color} strokeWidth="2" strokeOpacity="0.6"
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map(node => {
          const isSelected = selected === node.id;
          const isEditing = editing === node.id;
          const childCount = nodes.filter(n => n.parentId === node.id).length;
          const isRoot = node.id === 'root';

          return (
            <div
              key={node.id}
              style={{
                position: 'absolute',
                left: node.x,
                top: node.y,
                transform: 'translate(-50%, -50%)',
                zIndex: isSelected ? 10 : 1,
              }}
              onMouseDown={e => onMouseDown(e, node.id)}
              onDoubleClick={e => { e.stopPropagation(); startEdit(node); }}
              onClick={e => { e.stopPropagation(); setSelected(node.id); }}
              className="cursor-grab active:cursor-grabbing"
            >
              {isEditing ? (
                <input
                  autoFocus
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(null); }}
                  onClick={e => e.stopPropagation()}
                  className="px-3 py-1.5 rounded-full text-sm font-semibold border-2 outline-none text-center"
                  style={{ borderColor: node.color, minWidth: 100, maxWidth: 200 }}
                />
              ) : (
                <div
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-white text-sm shadow-lg transition-all"
                  style={{
                    backgroundColor: node.color,
                    fontSize: isRoot ? '1rem' : '0.8rem',
                    padding: isRoot ? '10px 20px' : '6px 14px',
                    boxShadow: isSelected ? `0 0 0 3px white, 0 0 0 5px ${node.color}` : `0 4px 12px ${node.color}40`,
                  }}
                >
                  {node.label}
                  {/* Add child button */}
                  <button
                    onClick={e => { e.stopPropagation(); addChild(node.id); }}
                    className="ml-1 w-4 h-4 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center transition-colors"
                    title="Add child"
                  >
                    <Plus size={9} strokeWidth={3}/>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-center text-muted-foreground">
        {nodes.length} node{nodes.length !== 1 ? 's' : ''} · Click <strong>+</strong> on any node to add a branch
      </p>
    </div>
  );
}
