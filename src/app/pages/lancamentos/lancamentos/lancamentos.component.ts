import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Turma, Disciplina, LancamentosDTO, AlunoDTO, AvaliacaoDTO, NotaUpsertDTO } from '../../../core/models/types';


// Tipagem dos controles do formulário
type LinhaForm = FormGroup<{
  alunoId: FormControl<number>;
  notas: FormArray<FormControl<number | null>>;
}>;


@Component({
  selector: 'app-lancamentos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './lancamentos.component.html',
  styleUrls: ['./lancamentos.component.scss']
})

export class LancamentosComponent implements OnInit {
  turmas: Turma[] = [];
  disciplinas: Disciplina[] = [];


  turmaSel = signal<number | null>(1); // default 1 (seed)
  disciplinaSel = signal<number | null>(1); // default 1 (seed)


  alunos: AlunoDTO[] = [];
  avaliacoes: AvaliacaoDTO[] = [];


  form!: FormGroup<{ linhas: FormArray<LinhaForm> }>;
  salvando = signal(false);
  msg = signal<string | null>(null);


  constructor(private api: ApiService, private fb: FormBuilder) { }


  ngOnInit(): void {
    this.form = this.fb.group({ linhas: this.fb.array<LinhaForm>([]) });
    this.carregarCombos();
  }

  get linhas(): FormArray<LinhaForm> { return this.form.get('linhas') as FormArray<LinhaForm>; }
  notas(linha: LinhaForm): FormArray<FormControl<number | null>> { return linha.get('notas') as FormArray<FormControl<number | null>>; }


  private carregarCombos() {
    this.api.turmas().subscribe(r => this.turmas = r);
    this.api.disciplinas().subscribe(r => this.disciplinas = r);
    this.buscarLancamentos();
  }


  trocarContexto() { this.buscarLancamentos(); }


  private buscarLancamentos() {
    const t = this.turmaSel();
    const d = this.disciplinaSel();
    if (!t || !d) return;


    this.api.lancamentos(t, d).subscribe((dto: LancamentosDTO) => {
      this.alunos = dto.alunos;
      this.avaliacoes = dto.avaliacoes;
      this.montarForm(dto);
    });
  }

  private montarForm(dto: LancamentosDTO) {
    this.linhas.clear();
    for (const aluno of dto.alunos) {
      const controlesNotas = this.fb.array<FormControl<number | null>>(
        this.avaliacoes.map(av => {
          const existente = dto.notas.find(n => n.alunoId === aluno.id && n.avaliacaoId === av.id);
          return this.fb.control<number | null>(existente?.valor ?? null, [Validators.min(0), Validators.max(10)]);
        })
      );


      const linha: LinhaForm = this.fb.group({
        alunoId: this.fb.control<number>(aluno.id, { nonNullable: true }),
        notas: controlesNotas
      });


      this.linhas.push(linha);
    }
  }

  // média ponderada client-side
  mediaAluno(indexAluno: number): number | null {
    const linha = this.linhas.at(indexAluno) as LinhaForm;
    const valores = this.notas(linha).controls.map(c => c.value);
    let soma = 0; let peso = 0; let temAlguma = false;
    valores.forEach((v, i) => {
      if (v !== null && v !== undefined) {
        temAlguma = true;
        const p = this.avaliacoes[i].peso;
        soma += Number(v) * p;
        peso += p;
      }
    });
    if (!temAlguma || peso === 0) return null;
    return Math.round((soma / peso) * 100) / 100; // 2 casas
  }

  salvar() {
    const t = this.turmaSel();
    const d = this.disciplinaSel();
    if (!t || !d) return;


    const lote: NotaUpsertDTO[] = [];
    this.linhas.controls.forEach((linha, iAluno) => {
      const alunoId = linha.get('alunoId')!.value as number;
      const notasCtrls = this.notas(linha).controls;
      notasCtrls.forEach((ctrl, iAvaliacao) => {
        const valor = ctrl.value;
        if (valor !== null && valor !== undefined ) {
          lote.push({ alunoId, avaliacaoId: this.avaliacoes[iAvaliacao].id, valor: Number(valor) });
        }
      });
    });


    if (lote.length === 0) { this.msg.set('Nenhuma nota para salvar.'); return; }


    this.salvando.set(true);
    this.api.salvarLoteNotas(lote).subscribe({
      next: _ => { this.msg.set('Notas salvas com sucesso!'); this.salvando.set(false); this.buscarLancamentos(); },
      error: err => { this.msg.set('Erro ao salvar notas.'); console.error(err); this.salvando.set(false); }
    });
  }
}