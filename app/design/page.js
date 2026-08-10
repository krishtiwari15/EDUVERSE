"use client";

const C = {
  primary: "#6366F1", secondary: "#8B5CF6", success: "#22C55E",
  warning: "#F59E0B", error: "#EF4444", bg: "#F8FAFC", surface: "#FFFFFF",
  text: "#0F172A", textSec: "#64748B", muted: "#94A3B8", border: "#E2E8F0",
};

function Swatch({ name, hex }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ width: 72, height: 72, borderRadius: 12, background: hex, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.05)" }} />
      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginTop: 6 }}>{name}</div>
      <div style={{ fontSize: 12, color: C.muted }}>{hex}</div>
    </div>
  );
}

function Card({ children }) {
  return <div style={{ background: C.surface, borderRadius: 16, padding: 20, border: `1px solid ${C.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>{children}</div>;
}

export default function DesignPreview() {
  const font = { fontFamily: "Inter, system-ui, -apple-system, sans-serif" };
  return (
    <div style={{ ...font, background: C.bg, minHeight: "100vh", color: C.text }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`}</style>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
        <h1 style={{ fontSize: 40, fontWeight: 700, margin: 0 }}>Design System Preview</h1>
        <p style={{ color: C.textSec, fontSize: 16 }}>A live look at your DESIGN.md — colors, type, and components.</p>

        {/* COLORS */}
        <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 40 }}>Colors</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginTop: 16 }}>
          <Swatch name="Primary" hex={C.primary} />
          <Swatch name="Secondary" hex={C.secondary} />
          <Swatch name="Success" hex={C.success} />
          <Swatch name="Warning" hex={C.warning} />
          <Swatch name="Error" hex={C.error} />
          <Swatch name="Surface" hex={C.surface} />
        </div>

        {/* TYPOGRAPHY */}
        <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 44 }}>Typography (Inter)</h2>
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 40, fontWeight: 700 }}>H1 — Learn anything</div>
          <div style={{ fontSize: 28, fontWeight: 600, marginTop: 8 }}>H2 — Section heading</div>
          <div style={{ fontSize: 20, fontWeight: 600, marginTop: 8 }}>H3 — Subsection</div>
          <p style={{ fontSize: 16, color: C.text, marginTop: 8 }}>Body — Comfortable, readable text for explanations and content.</p>
          <p style={{ fontSize: 13, color: C.muted }}>Muted small text — hints and captions.</p>
        </div>

        {/* BUTTONS */}
        <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 44 }}>Buttons</h2>
        <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
          <button style={{ ...font, background: C.primary, color: "#fff", border: "none", borderRadius: 12, padding: "12px 20px", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>Start Learning</button>
          <button style={{ ...font, background: "#fff", color: C.primary, border: `1px solid ${C.primary}`, borderRadius: 12, padding: "12px 20px", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>View Progress</button>
          <button style={{ ...font, background: "transparent", color: C.textSec, border: "none", padding: "12px 8px", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>Skip for now</button>
        </div>

        {/* CARDS */}
        <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 44 }}>Cards</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
          <Card>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.secondary, textTransform: "uppercase", letterSpacing: 0.5 }}>AI Recommendation</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 6 }}>Try a Python mini-project</div>
            <p style={{ fontSize: 14, color: C.textSec, marginTop: 4 }}>You've been consistent this week — ready to apply what you learned?</p>
            <button style={{ ...font, background: C.primary, color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontWeight: 600, fontSize: 14, marginTop: 10, cursor: "pointer" }}>Start</button>
          </Card>
          <Card>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.success, textTransform: "uppercase", letterSpacing: 0.5 }}>Progress</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 6 }}>Mathematics</div>
            <div style={{ height: 8, borderRadius: 6, background: C.border, marginTop: 12 }}>
              <div style={{ height: 8, width: "70%", borderRadius: 6, background: C.success }} />
            </div>
            <p style={{ fontSize: 13, color: C.muted, marginTop: 8 }}>70% complete · 5 day streak 🔥</p>
          </Card>
        </div>

        {/* AI TUTOR MOCK */}
        <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 44 }}>AI Tutor</h2>
        <Card>
          <div style={{ fontWeight: 600 }}>👋 Hi! What are we learning today?</div>
          <div style={{ background: C.bg, borderRadius: 12, padding: "12px 14px", marginTop: 12, color: C.textSec }}>Explain photosynthesis simply</div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <span style={{ fontSize: 13, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 999, padding: "6px 12px", color: C.textSec }}>Explain simply</span>
            <span style={{ fontSize: 13, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 999, padding: "6px 12px", color: C.textSec }}>Give example</span>
          </div>
        </Card>

        <p style={{ color: C.muted, fontSize: 13, marginTop: 40 }}>This is a preview of the DESIGN.md rules — not your live app.</p>
      </div>
    </div>
  );
}