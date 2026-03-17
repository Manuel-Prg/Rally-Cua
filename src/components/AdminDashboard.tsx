import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../db/supabase.js';
import { PHASES, totalScore } from '../lib/mockData';

interface Score {
  phase_id: number;
  status: string;
  points: number;
}

interface Team {
  id: number;
  name: string;
  color: string;
  members: string[];
  phases: { phaseId: number; status: string; points: number; }[];
}

interface Registration {
  id: number;
  team_name: string;
  representative: string;
  created_at: string;
}

interface Props {
  initialTeams: Team[];
  initialRegistrations: Registration[];
  maxTeams: number;
}

export default function AdminDashboard({ initialTeams, initialRegistrations, maxTeams }: Props) {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [registrations, setRegistrations] = useState<Registration[]>(initialRegistrations);
  const [activePhaseFilter, setActivePhaseFilter] = useState<number | 'all'>('all');
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: 'success' | 'error' }[]>([]);
  const [loadingRegId, setLoadingRegId] = useState<number | null>(null);
  const [savingTeamId, setSavingTeamId] = useState<number | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const currentTeamCount = teams.length;

  const handleApprove = async (regId: number, teamName: string) => {
    if (currentTeamCount >= maxTeams) return;
    setLoadingRegId(regId);
    try {
      const res = await fetch("/api/approve-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registration_id: regId }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error ?? "Error al aprobar", "error");
      } else {
        const newTeam: Team = {
          id: data.team.id,
          name: data.team.name,
          color: data.team.color,
          members: data.team.members ?? [],
          phases: [1, 2, 3, 4, 5].map(id => ({
            phaseId: id,
            status: "pending",
            points: 0,
          })),
        };
        setTeams(prev => [...prev, newTeam]);
        setRegistrations(prev => prev.filter(r => r.id !== regId));
        showToast(`Equipo "${teamName}" aprobado`);
      }
    } catch (e) {
      showToast("Error de red", "error");
    } finally {
      setLoadingRegId(null);
    }
  };

  const handleUpdateLocalScore = (teamId: number, phaseId: number, field: 'status' | 'points', value: any) => {
    setTeams(prev => prev.map(t => {
      if (t.id === teamId) {
        const newPhases = t.phases.map(p => {
          if (p.phaseId === phaseId) {
            return { ...p, [field]: value };
          }
          return p;
        });
        return { ...t, phases: newPhases };
      }
      return t;
    }));
  };

  const handleSaveScore = async (teamId: number) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    const pi = getDisplayPhaseIdx(team);
    const phase = team.phases[pi];

    setSavingTeamId(teamId);
    try {
      const res = await fetch("/api/update-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_id: teamId,
          id_fase: phase.phaseId,
          estatus: phase.status,
          puntos: Number(phase.points) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Error al guardar", "error");
      } else {
        showToast(`${team.name} — Guardado`);
      }
    } catch {
      showToast("Error de red", "error");
    } finally {
      setSavingTeamId(null);
    }
  };

  const handleExport = async () => {
    // @ts-expect-error - Importing from CDN is valid in this environment
    const XLSX: any = await import("https://cdn.sheetjs.com/xlsx-0.20.2/package/xlsx.mjs");
    const wb = XLSX.utils.book_new();

    const sorted = [...teams].sort((a, b) => {
      const totalA = a.phases.reduce((s, p) => s + p.points, 0);
      const totalB = b.phases.reduce((s, p) => s + p.points, 0);
      return totalB - totalA;
    });

    const rows1: (string | number)[][] = [["Pos", "Equipo", "Miembros", ...PHASES.map(p => p.name), "Total"]];
    sorted.forEach((t, i) => {
      const total = t.phases.reduce((s, p) => s + p.points, 0);
      rows1.push([
        i + 1,
        t.name,
        t.members.join(", "),
        ...t.phases.map(p => p.points),
        total,
      ]);
    });

    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows1), "Clasificación");

    const rows2: (string | number)[][] = [["Equipo", "Fase", "Estado", "Puntos"]];
    teams.forEach(t =>
      t.phases.forEach((p, idx) =>
        rows2.push([t.name, PHASES[idx].name, p.status, p.points])
      )
    );
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows2), "Detalle Fases");

    XLSX.writeFile(wb, `rally-${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast("Excel exportado");
  };

  function getDisplayPhaseIdx(team: Team) {
    if (activePhaseFilter !== 'all') return activePhaseFilter - 1;
    const doingIdx = team.phases.findIndex(p => p.status === 'doing');
    if (doingIdx >= 0) return doingIdx;
    const lastDoneIdx = [...team.phases].reverse().findIndex(p => p.status === 'done');
    return lastDoneIdx >= 0 ? 4 - lastDoneIdx : 0;
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="title-area">
          <p className="eyebrow">Panel de control</p>
          <h1 className="title">Actualizar Marcador</h1>
        </div>
        <div className="actions">
          <div className={`cupo-badge ${currentTeamCount >= maxTeams ? 'cupo-full' : ''}`}>
            <span>{currentTeamCount} / {maxTeams} EQUIPOS</span>
          </div>
          <button className="btn-export" onClick={handleExport}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Exportar Excel
          </button>
        </div>
      </header>

      {/* Inscripciones Pendientes */}
      <section className="pending-section">
        <h2 className="section-title">Inscripciones Pendientes</h2>
        <div className="pending-grid">
          {registrations.length === 0 ? (
            <p className="empty-state">No hay inscripciones por revisar.</p>
          ) : (
            registrations.map(reg => (
              <div key={reg.id} className="pending-card">
                <div className="info">
                  <span className="team-name">{reg.team_name}</span>
                  <span className="rep-name">Rep: {reg.representative}</span>
                </div>
                <button 
                  className="btn-approve" 
                  onClick={() => handleApprove(reg.id, reg.team_name)}
                  disabled={loadingRegId === reg.id || currentTeamCount >= maxTeams}
                >
                  {loadingRegId === reg.id ? "..." : (currentTeamCount >= maxTeams ? "Lleno" : "Aprobar →")}
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Filtros */}
      <div className="filter-area">
        <span className="label">FILTRAR FASE</span>
        <div className="filter-pills">
          <button 
            className={`pill ${activePhaseFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActivePhaseFilter('all')}
          >
            Todas
          </button>
          {PHASES.map(p => (
            <button 
              key={p.id}
              className={`pill ${activePhaseFilter === p.id ? 'active' : ''}`}
              onClick={() => setActivePhaseFilter(p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Ranking / Editor */}
      <div className="entries-list">
        {teams.length === 0 ? (
          <p className="empty-state">No hay equipos registrados.</p>
        ) : (
          teams.map(team => {
            const pi = getDisplayPhaseIdx(team);
            const phase = team.phases[pi];
            const total = team.phases.reduce((s, p) => s + p.points, 0);

            return (
              <div key={team.id} className="team-entry-card">
                <div className="card-header">
                  <div className="team-info">
                    <span className="color-dot" style={{ background: team.color }} />
                    <span className="name">{team.name}</span>
                  </div>
                  <div className="total-badge">
                    <span className="val">{total}</span>
                    <span className="lbl">PUNTOS</span>
                  </div>
                </div>

                <div className="card-body">
                  <div className="field">
                    <label>FASE ACTIVA</label>
                    <span className="phase-name">{PHASES[pi].name}</span>
                  </div>
                  
                  <div className="field">
                    <label>ESTADO</label>
                    <div className="status-pills">
                      {['pending', 'doing', 'done'].map((s) => (
                        <button
                          key={s}
                          className={`status-btn ${phase.status === s ? 'active' : ''} ${s}`}
                          onClick={() => handleUpdateLocalScore(team.id, phase.phaseId, 'status', s)}
                        >
                          {s === 'pending' ? 'Pendiente' : s === 'doing' ? 'En curso' : 'Completado'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="field">
                    <label>PUNTOS</label>
                    <input 
                      type="number" 
                      value={phase.points}
                      onChange={(e) => handleUpdateLocalScore(team.id, phase.phaseId, 'points', Number(e.target.value))}
                    />
                  </div>
                </div>

                <button 
                  className={`btn-save ${savingTeamId === team.id ? 'saving' : ''}`}
                  onClick={() => handleSaveScore(team.id)}
                  disabled={savingTeamId === team.id}
                >
                  {savingTeamId === team.id ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Toasts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.type === 'success' ? '✓' : '⚠'} {t.msg}
          </div>
        ))}
      </div>

      <style>{`
        .admin-dashboard { color: var(--ash); }
        
        .admin-header {
          display: flex; justify-content: space-between; align-items: flex-end;
          margin-bottom: 2.5rem; border-bottom: 1px solid rgba(0,229,255,0.1);
          padding-bottom: 1.5rem; gap: 1.5rem; flex-wrap: wrap;
        }
        .admin-header .eyebrow { 
          font-size: 0.7rem; font-weight: 700; letter-spacing: 0.25em; 
          text-transform: uppercase; color: var(--dirt); margin-bottom: 0.5rem;
        }
        .admin-header .title { font-size: 2.5rem; letter-spacing: 0.05em; color: var(--sand); }
        .admin-header .actions { display: flex; gap: 0.8rem; align-items: center; }

        .cupo-badge {
          background: rgba(0,0,0,0.3); border: 1px solid rgba(0,229,255,0.15);
          padding: 0.5rem 1rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700;
          color: var(--dirt);
        }
        .cupo-full { border-color: var(--rust); color: var(--rust); background: rgba(255,107,107,0.05); }

        .btn-export {
          background: transparent; border: 1px solid var(--moss-light); color: var(--moss-light);
          padding: 0.5rem 1rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700;
          display: flex; align-items: center; gap: 0.5rem; cursor: pointer; transition: 0.2s;
        }
        .btn-export:hover { background: rgba(0,163,204,0.1); }

        .section-title {
          font-size: 0.65rem; font-weight: 700; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--dirt); margin-bottom: 1.5rem;
          border-left: 3px solid var(--dirt); padding-left: 1rem;
        }

        .pending-section { background: rgba(14,46,70,0.4); padding: 1.5rem; border-radius: 8px; margin-bottom: 3rem; border: 1px solid rgba(0,229,255,0.05); }
        .pending-grid { display: flex; flex-direction: column; gap: 0.8rem; }
        .pending-card {
          display: flex; justify-content: space-between; align-items: center;
          padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .pending-card .team-name { font-size: 1.1rem; font-weight: 700; color: var(--ash); text-transform: uppercase; }
        .pending-card .rep-name { font-size: 0.8rem; color: var(--fog); opacity: 0.6; margin-left: 1rem; }
        .btn-approve {
          background: var(--dirt); color: var(--ink); border: none; padding: 0.5rem 1rem;
          border-radius: 4px; font-weight: 700; font-size: 0.75rem; cursor: pointer;
        }
        .btn-approve:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Filter Area */
        .filter-area { margin-bottom: 2rem; }
        .filter-area .label { font-size: 0.7rem; font-weight: 700; color: var(--dirt); opacity: 0.6; display: block; margin-bottom: 1rem; }
        .filter-pills { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .filter-pills .pill {
          background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);
          color: var(--fog); padding: 0.5rem 1.2rem; border-radius: 99px;
          font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: 0.2s;
        }
        .filter-pills .pill.active { background: var(--dirt); color: var(--ink); border-color: var(--dirt); }

        /* Entries / Editor */
        .entries-list { display: flex; flex-direction: column; gap: 1.5rem; }
        .team-entry-card {
          background: rgba(14,46,70,0.6); border: 1px solid rgba(0,229,255,0.1);
          border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          transition: transform 0.2s;
        }
        .team-entry-card:hover { transform: translateY(-2px); border-color: var(--dirt); }

        .card-header {
          padding: 1.25rem 1.5rem; background: rgba(0,0,0,0.3);
          display: flex; justify-content: space-between; align-items: center;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .card-header .team-info { display: flex; align-items: center; gap: 1rem; }
        .card-header .color-dot { width: 12px; height: 12px; border-radius: 3px; }
        .card-header .name { font-size: 1.2rem; font-weight: 700; color: var(--sand); text-transform: uppercase; }
        
        .total-badge { text-align: right; }
        .total-badge .val { display: block; font-family: 'Bebas Neue', sans-serif; font-size: 2.2rem; line-height: 1; color: var(--dirt); }
        .total-badge .lbl { font-size: 0.6rem; font-weight: 700; opacity: 0.5; }

        .card-body { padding: 1.5rem; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem; }
        @media (max-width: 600px) { .card-body { grid-template-columns: 1fr; gap: 1rem; } }

        .field label { display: block; font-size: 0.65rem; font-weight: 700; color: var(--dirt); opacity: 0.6; margin-bottom: 0.6rem; }
        .phase-name { font-size: 1rem; font-weight: 700; color: var(--ash); }
        
        .status-pills { display: flex; gap: 4px; background: rgba(0,0,0,0.3); padding: 4px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); }
        .status-btn {
          flex: 1; border: none; background: transparent; color: var(--fog);
          padding: 0.6rem 0.4rem; font-size: 0.7rem; font-weight: 700; border-radius: 6px;
          cursor: pointer; transition: 0.2s; text-transform: uppercase;
        }
        .status-btn.active.pending { background: rgba(196,163,90,0.15); color: var(--dirt); }
        .status-btn.active.doing { background: rgba(0,163,204,0.15); color: var(--moss-light); }
        .status-btn.active.done { background: rgba(74,92,58,0.3); color: var(--moss); }

        input {
          width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px; padding: 0.75rem; color: var(--sand); font-size: 1rem;
          font-family: inherit; transition: 0.2s;
        }
        input:focus { border-color: var(--dirt); outline: none; background: rgba(0,0,0,0.6); }
        input[type="number"] { font-family: 'Bebas Neue', sans-serif; font-size: 1.5rem; padding: 0.5rem 0.75rem; }

        .btn-save {
          width: 100%; padding: 1.25rem; border: none; background: var(--moss);
          color: var(--ink); font-weight: 700; letter-spacing: 0.1em;
          cursor: pointer; transition: 0.2s; font-size: 0.9rem;
        }
        .btn-save:hover { background: var(--moss-light); }
        .btn-save:disabled { opacity: 0.7; cursor: wait; }

        /* Toasts */
        .toast-container { position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%); z-index: 1000; display: flex; flex-direction: column; gap: 0.5rem; }
        .toast {
          background: var(--earth); border: 1px solid var(--dirt);
          padding: 1rem 2rem; border-radius: 50px; font-weight: 700; font-size: 0.9rem;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5); animation: toastIn 0.3s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .toast.error { border-color: var(--rust); color: var(--rust); }
        @keyframes toastIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .empty-state { padding: 3rem; text-align: center; opacity: 0.4; font-style: italic; }
      `}</style>
    </div>
  );
}
