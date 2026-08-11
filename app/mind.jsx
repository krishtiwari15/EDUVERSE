"use client";
import { useEffect, useMemo, useState } from "react";
import { ReactFlow, Background, Controls } from "@xyflow/react";
import { ArrowLeft, Sparkles, Plus } from "lucide-react";
import { Button, Surface, Reveal } from "@/components/ui";
import ConceptNode from "@/components/mentor/ConceptNode";

const nodeTypes = { concept: ConceptNode };

function buildGraph(concepts, studentLabel) {
  const bySubject = {};
  for (const c of concepts) (bySubject[c.subject] ||= []).push(c);
  const subjects = Object.keys(bySubject);
  const nodes = [{ id: "root", type: "concept", position: { x: 0, y: 0 }, data: { label: studentLabel || "You", isHub: true }, draggable: false }];
  const edges = [];
  const hubRadius = 260;

  subjects.forEach((subject, i) => {
    const angle = (i / subjects.length) * Math.PI * 2 - Math.PI / 2;
    const hx = Math.cos(angle) * hubRadius;
    const hy = Math.sin(angle) * hubRadius;
    const hubId = `hub-${subject}`;
    nodes.push({ id: hubId, type: "concept", position: { x: hx, y: hy }, data: { label: subject, isHub: true }, draggable: false });
    edges.push({ id: `root-${hubId}`, source: "root", target: hubId, style: { stroke: "rgba(255,255,255,0.2)" } });

    const items = bySubject[subject];
    const conceptRadius = 150;
    items.forEach((c, j) => {
      const cAngle = angle + (j - (items.length - 1) / 2) * 0.55;
      const cx = hx + Math.cos(cAngle) * conceptRadius;
      const cy = hy + Math.sin(cAngle) * conceptRadius;
      const id = `c-${c.id}`;
      nodes.push({ id, type: "concept", position: { x: cx, y: cy }, data: { label: c.name, subject: c.subject, mastery: c.mastery, mistakes: c.mistakes, lastReviewed: c.last_reviewed }, draggable: false });
      edges.push({ id: `${hubId}-${id}`, source: hubId, target: id, style: { stroke: `${c.mastery >= 0.7 ? "#FBBF24" : "#5EEAD4"}55` } });
    });
  });

  return { nodes, edges };
}

export default function Mind({ student, displayName, onBack }) {
  const [concepts, setConcepts] = useState(null); // null = loading
  const [goals, setGoals] = useState([]);
  const [goalText, setGoalText] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!student) return;
    fetch(`/api/mind?student=${encodeURIComponent(student)}`)
      .then((r) => r.json())
      .then((d) => { setConcepts(d.concepts || []); setGoals(d.goals || []); })
      .catch(() => setConcepts([]));
  }, [student]);

  const { nodes, edges } = useMemo(() => buildGraph(concepts || [], displayName), [concepts, displayName]);

  async function addGoal(e) {
    e.preventDefault();
    if (!goalText.trim()) return;
    const text = goalText.trim();
    setGoalText("");
    setGoals((g) => [{ id: "temp-" + Date.now(), text }, ...g]);
    try { await fetch("/api/mind", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ student, text }) }); } catch {}
  }

  return (
    <div className="relative z-10 w-full max-w-4xl mx-auto py-6 px-1">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} aria-label="Back" className="focus-ring flex items-center gap-1.5 text-white/70 hover:text-white font-semibold text-sm">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <Reveal>
        <p className="text-eyebrow mb-1.5">Obsidian Mind</p>
        <h1 className="text-display text-white">Your learning universe</h1>
        <p className="text-white/55 mt-1.5 max-w-lg">Every concept you and your mentor have worked through, connected — click one to see how far you&apos;ve come.</p>
      </Reveal>

      {concepts === null ? (
        <div className="mt-8 text-white/50 text-sm">Loading your mind…</div>
      ) : concepts.length === 0 ? (
        <Surface tier={2} className="mt-8 p-8 text-center">
          <Sparkles size={26} className="text-white/40 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-white/70 font-semibold">Nothing here yet</p>
          <p className="text-white/45 text-sm mt-1 max-w-xs mx-auto">The more you learn with your mentor, the more your mind grows. Go have a conversation!</p>
        </Surface>
      ) : (
        <div className="mt-6 h-[440px] sm:h-[520px] rounded-[var(--radius-lg)] overflow-hidden ring-1 ring-white/10 bg-black/20">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
            nodesConnectable={false}
            edgesReconnectable={false}
            elementsSelectable
            onNodeClick={(_, n) => (!n.data.isHub ? setSelected(n.data) : setSelected(null))}
          >
            <Background color="rgba(255,255,255,0.12)" gap={28} />
            <Controls showInteractive={false} className="!bg-white/10 !border-white/20 [&_button]:!bg-transparent [&_button]:!text-white [&_button]:!border-white/15" />
          </ReactFlow>
        </div>
      )}

      {selected && (
        <Surface tier={3} className="mt-4 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-eyebrow">{selected.subject}</p>
              <h3 className="text-heading text-white mt-0.5">{selected.label}</h3>
            </div>
            <div className="text-2xl font-bold text-white">{Math.round((selected.mastery || 0) * 100)}%</div>
          </div>
          {selected.mistakes?.length > 0 && (
            <div className="mt-3">
              <p className="text-white/45 text-xs mb-1">Things to revisit</p>
              <ul className="text-white/70 text-sm space-y-1 list-disc list-inside">
                {selected.mistakes.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </div>
          )}
        </Surface>
      )}

      <Surface tier={2} className="mt-6 p-5">
        <p className="text-eyebrow text-white/50 mb-3">Learning goals</p>
        <div className="space-y-2 mb-3">
          {goals.length === 0 && <p className="text-white/40 text-sm">No active goals yet.</p>}
          {goals.map((g) => (
            <div key={g.id} className="text-white/80 text-sm px-3 py-2 rounded-lg bg-white/5">{g.text}</div>
          ))}
        </div>
        <form onSubmit={addGoal} className="flex gap-2">
          <input value={goalText} onChange={(e) => setGoalText(e.target.value)} placeholder="e.g. Get comfortable with fractions" className="focus-ring flex-1 px-4 py-2.5 rounded-xl bg-white/90 text-slate-800 text-sm placeholder:text-slate-400" />
          <Button type="submit" variant="primary" size="sm" icon={Plus}>Add</Button>
        </form>
      </Surface>
    </div>
  );
}
