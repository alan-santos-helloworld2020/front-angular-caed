import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Turma, Disciplina, AlunoDTO, AvaliacaoDTO, LancamentosDTO, NotaUpsertDTO, NotaDTO, MediaAlunoDTO } from '../models/types';


@Injectable({ providedIn: 'root' })
export class ApiService {
    constructor(private http: HttpClient) { }


    turmas(): Observable<Turma[]> {
        return this.http.get<Turma[]>('/turmas');
    }

    disciplinas(): Observable<Disciplina[]> {
        return this.http.get<Disciplina[]>('/disciplinas');
    }

    alunosByTurma(turmaId: number): Observable<AlunoDTO[]> {
        return this.http.get<AlunoDTO[]>(`/turmas/${turmaId}/alunos`);
    }

    avaliacoesByDisciplina(disciplinaId: number): Observable<AvaliacaoDTO[]> {
        return this.http.get<AvaliacaoDTO[]>(`/disciplinas/${disciplinaId}/avaliacoes`);
    }

    lancamentos(turmaId: number, disciplinaId: number): Observable<LancamentosDTO> {
        return this.http.get<LancamentosDTO>(`/lancamentos?turmaId=${turmaId}&disciplinaId=${disciplinaId}`);
    }

    salvarLoteNotas(lote: NotaUpsertDTO[]): Observable<NotaDTO[]> {
        return this.http.post<NotaDTO[]>(`/notas/lote`, lote);
    }

    medias(turmaId: number, disciplinaId: number): Observable<MediaAlunoDTO[]> {
        return this.http.get<MediaAlunoDTO[]>(`/notas/medias?turmaId=${turmaId}&disciplinaId=${disciplinaId}`);
    }
}