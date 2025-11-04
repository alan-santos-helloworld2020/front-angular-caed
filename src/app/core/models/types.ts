export interface Turma { id: number; nome: string; }
export interface Disciplina { id: number; nome: string; }
export interface AlunoDTO { id: number; nome: string; turmaId: number; }
export interface AvaliacaoDTO { id: number; titulo: string; peso: number; disciplinaId: number; }
export interface NotaDTO { id: number; alunoId: number; avaliacaoId: number; valor: number; }
export interface NotaUpsertDTO { alunoId: number; avaliacaoId: number; valor: number; }
export interface LancamentosDTO { alunos: AlunoDTO[]; avaliacoes: AvaliacaoDTO[]; notas: NotaDTO[]; }
export interface MediaAlunoDTO { alunoId: number; media: number | null; }