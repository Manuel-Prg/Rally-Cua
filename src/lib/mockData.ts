// src/lib/mockData.ts
// ─────────────────────────────────────────────
// Datos de prueba — reemplazar por llamadas a Supabase

export interface Phase {
  phaseId: number;
  status: 'pending' | 'doing' | 'done';
  points: number;
}

export interface Team {
  id: number;
  name: string;
  color: string;
  members: string[];
  phases: Phase[];
}

export const PHASES = [
  { id: 1, name: 'Fase 1: Inicio' },
  { id: 2, name: 'Fase 2: Exploración' },
  { id: 3, name: 'Fase 3: Desafío' },
  { id: 4, name: 'Fase 4: Cumbre' },
  { id: 5, name: 'Fase 5: Final' },
];

export const mockTeams: Team[] = [
  {
    id: 1,
    name: 'Los Relámpagos',
    color: '#E8531A',
    members: ['Ana Torres', 'Carlos Vega', 'Luis Mora', 'María López', 'Pedro Ruiz'],
    phases: [
      { phaseId: 1, status: 'done',    points: 95 },
      { phaseId: 2, status: 'done',    points: 88 },
      { phaseId: 3, status: 'doing',   points: 72 },
      { phaseId: 4, status: 'pending', points: 0  },
      { phaseId: 5, status: 'pending', points: 0  },
    ],
  },
  {
    id: 2,
    name: 'Águilas Negras',
    color: '#2E7D9C',
    members: ['Roberto Díaz', 'Sandra Pérez', 'Tomás Cruz', 'Elena Ríos', 'Javier Solís'],
    phases: [
      { phaseId: 1, status: 'done',    points: 100 },
      { phaseId: 2, status: 'done',    points: 85  },
      { phaseId: 3, status: 'done',    points: 90  },
      { phaseId: 4, status: 'doing',   points: 60  },
      { phaseId: 5, status: 'pending', points: 0   },
    ],
  },
  {
    id: 3,
    name: 'Tierra Firme',
    color: '#6B9E2A',
    members: ['Daniela Fuentes', 'Miguel Ortega', 'Laura Soto', 'Fernando Paz', 'Gloria Ramos'],
    phases: [
      { phaseId: 1, status: 'done',    points: 80 },
      { phaseId: 2, status: 'doing',   points: 50 },
      { phaseId: 3, status: 'pending', points: 0  },
      { phaseId: 4, status: 'pending', points: 0  },
      { phaseId: 5, status: 'pending', points: 0  },
    ],
  },
  {
    id: 4,
    name: 'Viento Norte',
    color: '#9B4DBF',
    members: ['Héctor Lara', 'Patricia Méndez', 'Oscar Ibarra', 'Nadia Flores', 'Andrés Gil'],
    phases: [
      { phaseId: 1, status: 'done',    points: 90 },
      { phaseId: 2, status: 'done',    points: 78 },
      { phaseId: 3, status: 'doing',   points: 45 },
      { phaseId: 4, status: 'pending', points: 0  },
      { phaseId: 5, status: 'pending', points: 0  },
    ],
  },
  {
    id: 5,
    name: 'Sol Naciente',
    color: '#D4A017',
    members: ['Carmen Vargas', 'Ignacio Rojas', 'Valeria Pino', 'Rodrigo Arce', 'Sofía Mena'],
    phases: [
      { phaseId: 1, status: 'done',  points: 75 },
      { phaseId: 2, status: 'done',  points: 92 },
      { phaseId: 3, status: 'done',  points: 88 },
      { phaseId: 4, status: 'done',  points: 70 },
      { phaseId: 5, status: 'doing', points: 30 },
    ],
  },
];

// ─── Helpers ───────────────────────────────────
export function totalScore(team: Team): number {
  return team.phases.reduce((sum, p) => sum + p.points, 0);
}

export function getSortedTeams(teams: Team[]): Team[] {
  return [...teams].sort((a, b) => totalScore(b) - totalScore(a));
}

export function getCurrentPhase(team: Team) {
  const doing = team.phases.find(p => p.status === 'doing');
  if (doing) return { ...doing, label: 'En curso', phaseClass: 'doing' };
  const lastDone = [...team.phases].reverse().find(p => p.status === 'done');
  if (lastDone) return { ...lastDone, label: 'Completado', phaseClass: 'done' };
  return { phaseId: 1, status: 'pending' as const, points: 0, label: 'Sin iniciar', phaseClass: 'waiting' };
}
