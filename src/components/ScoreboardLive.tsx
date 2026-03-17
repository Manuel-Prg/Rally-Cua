// src/components/ScoreboardLive.tsx
// React island — carga datos iniciales como prop, luego escucha Realtime
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { getSortedTeams, totalScore, getCurrentPhase } from "../lib/mockData";
import type { Team } from "../lib/mockData";

interface Props {
  initialTeams: Team[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

async function fetchTeams(): Promise<Team[]> {
  const { data, error } = await supabase
    .from("teams")
    .select("id, name, color, members, scores(phase_id, status, points)")
    .order("id");

  if (error || !data) {
    console.error("fetchTeams error:", error);
    return [];
  }

  return data.map((row: any) => ({
    id: row.id,
    name: row.name,
    color: row.color,
    members: Array.isArray(row.members) ? row.members : [],
    phases: [1, 2, 3, 4, 5].map((phaseId) => {
      const s = (row.scores ?? []).find((sc: any) => sc.phase_id === phaseId);
      return {
        phaseId,
        status: s?.status ?? "pending",
        points: s?.points ?? 0,
      };
    }),
  }));
}

const PHASES = [
  { id: 1, name: "Fase 1" },
  { id: 2, name: "Fase 2" },
  { id: 3, name: "Fase 3" },
  { id: 4, name: "Fase 4" },
  { id: 5, name: "Fase 5" },
];

// ── Sub-components ──────────────────────────────────────────────────────────

function PhasePills({ teams }: { teams: Team[] }) {
  const statuses = PHASES.map((phase) => {
    const allDone = teams.every(
      (t) => t.phases[phase.id - 1]?.status === "done",
    );
    const anyDoing = teams.some(
      (t) => t.phases[phase.id - 1]?.status === "doing",
    );
    if (allDone) return "completed";
    if (anyDoing) return "active";
    return "pending";
  });

  return (
    <div className="phase-pills">
      {PHASES.map((phase, i) => {
        const s = statuses[i];
        const icon = s === "completed" ? "✓" : s === "active" ? "⚡" : "○";
        return (
          <span key={phase.id} className={`phase-pill ${s}`}>
            {icon} {phase.name}
          </span>
        );
      })}
    </div>
  );
}

function TeamCard({ team, rank }: { team: Team; rank: number }) {
  const score = totalScore(team);
  const cp = getCurrentPhase(team);
  const isFirst = rank === 1;

  return (
    <article
      className={`team-card${isFirst ? " team-card--first" : ""}`}
      style={{ "--team-color": team.color } as React.CSSProperties}
      aria-label={`${team.name}, posición ${rank}, ${score} puntos`}
    >
      <div className="rank-wrapper">
        <div className="rank">{isFirst ? "🏆" : rank}</div>
      </div>

      <div className="card-content">
        <div className="info">
          <div className="team-name">{team.name}</div>
          <div className="members-list">
             {team.members.map((member, i) => (
               <span key={i} className="member-name">
                 {member}{i < team.members.length - 1 && <span className="separator">·</span>}
               </span>
             ))}
          </div>
        </div>

        <div className="stats-row">
          <div className="phase-block">
            <span className={`phase-tag ${cp.phaseClass}`}>{cp.label}</span>
            <div className="phase-dots">
              {team.phases.map((p) => (
                <span
                  key={p.phaseId}
                  className={`dot${p.status === "done" ? " done" : p.status === "doing" ? " active" : ""}`}
                />
              ))}
            </div>
          </div>

          <div className="score-block">
            <span className="score-value">{score}</span>
            <span className="score-label">pts</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function ProgressBars({ teams }: { teams: Team[] }) {
  const sorted = getSortedTeams(teams);
  const maxPts = Math.max(...teams.map((t) => totalScore(t)), 1);

  return (
    <section className="progress-section">
      <h2 className="section-label">
        Progreso general
        <span className="section-line" />
      </h2>
      <div className="bars">
        {sorted.map((team) => {
          const score = totalScore(team);
          const pct = Math.round((score / maxPts) * 100);
          return (
            <div key={team.id} className="bar-row">
              <span className="bar-name" style={{ color: team.color }}>
                {team.name}
              </span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={
                    {
                      width: `${pct}%`,
                      "--fill-a": `${team.color}88`,
                      "--fill-b": team.color,
                    } as React.CSSProperties
                  }
                />
              </div>
              <span className="bar-pct">{pct}%</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Main island ─────────────────────────────────────────────────────────────

export default function ScoreboardLive({ initialTeams }: Props) {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [updating, setUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(
    new Date().toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  );

  const refresh = useCallback(async () => {
    setUpdating(true);
    const fresh = await fetchTeams();
    if (fresh.length > 0) {
      setTeams(fresh);
      setLastUpdate(
        new Date().toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    }
    setUpdating(false);
  }, []);

  useEffect(() => {
    // Subscribe to any change in scores table
    const channel = supabase
      .channel("scores-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "scores" },
        () => {
          refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const sorted = getSortedTeams(teams);

  return (
    <div className="scoreboard">
      {/* Hero */}
      <header className="hero">
        <p className="hero-eyebrow">
          Temporada 2025 · {teams.length} Equipos · 5 Fases
        </p>
        <h1 className="hero-title">
          RALLY <em>DE</em>
          <br />
          COMPETENCIA
        </h1>
        <div className="hero-divider" />
        <p className="hero-update">
          {updating ? (
            <span className="updating-badge">⟳ Actualizando…</span>
          ) : (
            <>
              Última actualización: <time>{lastUpdate}</time>
              <span className="live-pill">● EN VIVO</span>
            </>
          )}
        </p>
      </header>

      {/* Phase pills */}
      {teams.length > 0 && <PhasePills teams={teams} />}

      {/* Ranking */}
      {teams.length === 0 ? (
        <p className="empty-msg">No hay equipos registrados aún.</p>
      ) : (
        <section aria-label="Clasificación de equipos">
          <ol className="ranking-list">
            {sorted.map((team, i) => (
              <li key={team.id} style={{ animationDelay: `${i * 0.05}s` }}>
                <TeamCard team={team} rank={i + 1} />
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Progress bars */}
      {teams.length > 0 && <ProgressBars teams={teams} />}

      <style>{`
        /* ── Scoreboard ── */
        .scoreboard { max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem 4rem; }

        /* ── Hero ── */
        .hero { text-align: center; margin-bottom: 2.5rem; }
        .hero-eyebrow {
          font-family: var(--font-archer);
          font-size: 0.75rem; font-weight: 600;
          letter-spacing: 0.3em; text-transform: uppercase;
          color: var(--dirt); margin-bottom: 0.6rem;
        }
        .hero-title {
          font-family: var(--font-archer);
          font-size: clamp(2.5rem, 8vw, 6rem);
          letter-spacing: 0.04em; line-height: 0.95;
          color: var(--sand);
          text-shadow: 2px 2px 0 var(--dirt-dark), 4px 4px 0 rgba(0,0,0,0.2);
        }
        .hero-title em { font-style: normal; color: var(--rust); }
        .hero-divider {
          width: 80px; height: 2px;
          background: linear-gradient(90deg, transparent, var(--dirt), transparent);
          margin: 1.2rem auto 0.8rem;
        }
        .hero-update {
          font-family: var(--font-archer);
          font-size: 0.7rem; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(196,163,90,0.45);
          display: flex; align-items: center; justify-content: center; gap: 0.6rem;
        }
        .live-pill {
          color: #5cdb5c; font-size: 0.65rem;
          animation: blink 1.6s ease-in-out infinite;
        }
        .updating-badge { color: var(--dirt); animation: blink 0.8s ease-in-out infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        /* ── Phase pills ── */
        .phase-pills {
          display: flex; justify-content: center;
          gap: 0.4rem; flex-wrap: wrap; margin-bottom: 2.5rem;
        }
        .phase-pill {
          font-family: var(--font-archer);
          font-size: 0.65rem; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 0.25rem 0.75rem; border-radius: 2px; border: 1px solid;
        }
        .phase-pill.completed { background: rgba(74,92,58,0.3); border-color: var(--moss-light); color: var(--moss-light); }
        .phase-pill.active    { background: rgba(196,163,90,0.18); border-color: var(--dirt); color: var(--dirt); animation: glow 2s ease-in-out infinite; }
        .phase-pill.pending   { background: transparent; border-color: rgba(196,163,90,0.2); color: rgba(196,163,90,0.3); }
        @keyframes glow { 0%,100%{box-shadow:0 0 0 rgba(196,163,90,0)} 50%{box-shadow:0 0 14px rgba(196,163,90,0.4)} }

        /* ── Ranking ── */
        .ranking-list { list-style:none; display:flex; flex-direction:column; gap:0.75rem; }
        .ranking-list li { animation: slide-in 0.45s ease both; }

        /* ── Team card ── */
        .team-card {
          display: flex;
          align-items: stretch;
          background: rgba(40, 30, 20, 0.4);
          border: 1px solid rgba(196, 163, 90, 0.1);
          border-left: 5px solid var(--team-color);
          backdrop-filter: blur(12px);
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease, background 0.3s ease;
          border-radius: 4px;
        }
        .team-card:hover {
          transform: translateY(-2px);
          background: rgba(60, 45, 35, 0.5);
          border-color: rgba(196, 163, 90, 0.25);
        }

        .team-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%);
          pointer-events: none;
        }

        .team-card--first {
          background: rgba(139, 105, 20, 0.12);
          border-color: rgba(196, 163, 90, 0.3);
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }

        .rank-wrapper {
          width: 60px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.2);
          border-right: 1px solid rgba(196,163,90,0.05);
        }

        .rank {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2rem;
          color: rgba(196, 163, 90, 0.4);
          line-height: 1;
        }
        .team-card--first .rank {
          font-size: 1.8rem;
          color: var(--dirt);
          filter: drop-shadow(0 0 8px rgba(196,163,90,0.3));
        }

        .card-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 0.85rem 1.25rem;
          gap: 0.6rem;
        }

        .info {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .team-name {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.4rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          color: var(--ash);
          line-height: 1.1;
        }

        .members-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0 0.35rem;
          font-size: 0.75rem;
          color: var(--fog);
          opacity: 0.65;
        }
        .member-name { white-space: nowrap; }
        .separator { margin-left: 0.35rem; opacity: 0.3; }

        .stats-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
          gap: 0.8rem;
        }

        .phase-block {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .phase-tag {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.15rem 0.5rem;
          border-radius: 2px;
          border: 1px solid;
          white-space: nowrap;
        }
        .phase-tag.doing   { background:rgba(196,163,90,0.15); color:var(--dirt); border-color:var(--dirt); }
        .phase-tag.done    { background:rgba(74,92,58,0.25);   color:var(--moss-light); border-color:var(--moss-light); }
        .phase-tag.waiting { background:rgba(255,255,255,0.04); color:var(--fog); border-color:rgba(255,255,255,0.1); }

        .phase-dots { display:flex; gap:4px; }
        .dot {
          width: 7px;
          height: 7px;
          border-radius: 1px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.3s ease;
        }
        .dot.done   { background:var(--moss); border-color:var(--moss-light); box-shadow: 0 0 4px var(--moss); }
        .dot.active { background:var(--dirt); border-color:var(--dirt); box-shadow:0 0 10px var(--dirt); animation:dot-pulse 1.5s infinite; }

        .score-block {
          display: flex;
          align-items: baseline;
          gap: 0.2rem;
        }
        .score-value {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.4rem;
          color: var(--sand);
          line-height: 0.8;
        }
        .team-card--first .score-value {
          font-size: 2.8rem;
          color: var(--dirt);
          text-shadow: 0 0 12px rgba(196,163,90,0.2);
        }
        .score-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(196,163,90,0.5);
        }

        @keyframes slide-in { from{opacity:0;transform:translateX(-18px)} to{opacity:1;transform:translateX(0)} }
        @keyframes dot-pulse { 0%,100%{opacity:1; transform: scale(1);} 50%{opacity:0.6; transform: scale(1.1);} }

        /* ── Progress bars ── */
        .progress-section { margin-top:3rem; }
        .section-label { font-family:'Barlow Condensed',sans-serif; font-size: 0.7rem; font-weight:700; letter-spacing:0.25em; text-transform:uppercase; color:var(--dirt); display:flex; align-items:center; gap:0.6rem; margin-bottom:1rem; }
        .section-line { flex:1; height:1px; background:linear-gradient(90deg,rgba(196,163,90,0.3),transparent); }
        .bars { display:flex; flex-direction:column; gap:0.6rem; }
        .bar-row { display:grid; grid-template-columns:120px 1fr 45px; align-items:center; gap:0.8rem; }
        .bar-name { font-family:'Barlow Condensed',sans-serif; font-size:0.8rem; font-weight:700; letter-spacing:0.02em; text-transform:uppercase; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; opacity: 0.7; }
        .bar-track { height:10px; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.05); border-radius:2px; overflow:hidden; }
        .bar-fill { height:100%; background:linear-gradient(90deg,var(--fill-a),var(--fill-b)); position:relative; transition:width 1s cubic-bezier(0.4,0,0.2,1); }
        .bar-pct { font-family:'Barlow Condensed',sans-serif; font-size:0.75rem; font-weight:700; color:var(--fog); opacity:0.5; text-align:right; }

        /* ── Responsive ── */
        @media(max-width:700px){
          .scoreboard { padding: 1.25rem 0.75rem; }
          .hero-eyebrow { font-size: 0.65rem; letter-spacing: 0.2em; }
          .hero-title { font-size: clamp(2.2rem, 12vw, 4rem); text-shadow: 1.5px 1.5px 0 var(--dirt-dark), 3px 3px 0 rgba(0,0,0,0.2); }
          .hero-update { font-size: 0.6rem; }

          .rank-wrapper { width: 45px; }
          .rank { font-size: 1.6rem; }
          .team-card--first .rank { font-size: 1.4rem; }

          .card-content { padding: 0.75rem 0.85rem; }
          .team-name { font-size: 1.2rem; }
          .members-list { font-size: 0.7rem; }
          .score-value { font-size: 1.8rem; }
          .team-card--first .score-value { font-size: 2rem; }
        }

        @media(max-width:480px){
          .hero-title { font-size: 2.4rem; }
          .team-card { flex-direction: column; border-left: none; border-top: 4px solid var(--team-color); }
          .rank-wrapper {
            width: 100%;
            height: 36px;
            border-right: none;
            border-bottom: 1px solid rgba(196,163,90,0.05);
            justify-content: flex-start;
            padding-left: 0.85rem;
          }
          .rank { font-size: 1.35rem; }
          .team-card--first .rank { font-size: 1.25rem; }

          .stats-row { flex-wrap: wrap; justify-content: space-between; gap: 0.5rem; }
          .score-block { margin-left: auto; }

          .bar-row { grid-template-columns: 80px 1fr 38px; gap: 0.4rem; }
          .bar-name { font-size: 0.7rem; }
        }
      `}</style>
    </div>
  );
}
