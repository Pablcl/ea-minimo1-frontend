import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SearchInputComponent } from '../../shared/search-input/search-input.component';
import { ConsultaService } from '../../../services/consulta.service';
import { OfertaService } from '../../../services/oferta.service';
import { UsuarioService } from '../../../services/usuario.service';
import { Consulta } from '../../../models/consulta.model';
import { Oferta } from '../../../models/oferta.model';
import { Usuario } from '../../../models/usuario.model';

@Component({
  selector: 'app-consultas-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SearchInputComponent],
  templateUrl: './consultas.html',
  styleUrl: './consultas.css'
})
export class ConsultasComponent implements OnInit {
  private consultaService = inject(ConsultaService);
  private ofertaService = inject(OfertaService);
  private usuarioService = inject(UsuarioService);
  private fb = inject(FormBuilder);

  consultas = signal<Consulta[]>([]);
  ofertas = signal<Oferta[]>([]);
  usuarios = signal<Usuario[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  searchQuery = signal<string>('');
  selectedIds = signal<Set<string>>(new Set());

  currentPage = signal<number>(1);
  pageSize = signal<number>(10);

  consultaForm: FormGroup = this.fb.group({
    opportunity: ['', Validators.required],
    askedBy: ['', Validators.required],
    question: ['', [Validators.required, Validators.minLength(3)]]
  });

  respuestaForm: FormGroup = this.fb.group({
    consultaId: ['', Validators.required],
    answeredBy: ['', Validators.required],
    text: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1000)]]
  });

  isAllSelected = computed(() => {
    const visible = this.paginatedConsultas();
    if (visible.length === 0) return false;
    return visible.every(c => this.selectedIds().has(c._id!));
  });

  someSelected = computed(() => this.selectedIds().size > 0);

  filteredConsultas = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const all = this.consultas();

    if (!query) return all;

    return all.filter(c => {
      const question = c.question.toLowerCase();
      const askedBy = String(c.askedBy).toLowerCase();
      const opportunity = String(c.opportunity).toLowerCase();
      return question.includes(query) || askedBy.includes(query) || opportunity.includes(query);
    });
  });

  paginatedConsultas = computed(() => {
    const all = this.filteredConsultas();
    const page = this.currentPage();
    const size = this.pageSize();
    return all.slice((page - 1) * size, page * size);
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredConsultas().length / this.pageSize()))
  );

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const result: number[] = [1];
    if (current > 3) result.push(-1);
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) result.push(i);
    if (current < total - 2) result.push(-1);
    result.push(total);
    return result;
  });

  ngOnInit(): void {
    this.fetchConsultas();
    this.fetchOfertas();
    this.fetchUsuarios();
  }

  fetchConsultas(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.consultaService.getConsultas().subscribe({
      next: (data) => {
        this.consultas.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching consultas:', err);
        this.error.set('Error cargando consultas.');
        this.isLoading.set(false);
      }
    });
  }

  fetchOfertas(): void {
    this.ofertaService.getOfertas().subscribe({
      next: (data) => this.ofertas.set(data),
      error: (err) => console.error('Error fetching ofertas:', err)
    });
  }

  fetchUsuarios(): void {
    this.usuarioService.getUsuarios().subscribe({
      next: (data) => this.usuarios.set(data.filter(u => u.visible !== false)),
      error: (err) => console.error('Error fetching usuarios:', err)
    });
  }

  onSubmitConsulta(): void {
    if (this.consultaForm.invalid) {
      this.consultaForm.markAllAsTouched();
      return;
    }

    const formValue = this.consultaForm.value as {
      opportunity: string;
      askedBy: string;
      question: string;
    };

    const payload: Omit<Consulta, '_id'> = {
      opportunity: formValue.opportunity,
      askedBy: formValue.askedBy,
      question: formValue.question
    };

    this.consultaService.createConsulta(payload).subscribe({
      next: (nueva) => {
        this.consultas.update(actuales => [nueva, ...actuales]);
        this.consultaForm.reset({ opportunity: '', askedBy: '', question: '' });
      },
      error: (err) => {
        console.error('Error creando consulta:', err);
        alert('No se pudo crear la consulta.');
      }
    });
  }

  onSubmitRespuesta(): void {
    if (this.respuestaForm.invalid) {
      this.respuestaForm.markAllAsTouched();
      return;
    }

    const formValue = this.respuestaForm.value as {
      consultaId: string;
      answeredBy: string;
      text: string;
    };

    this.consultaService.addRespuestaConsulta(formValue.consultaId, {
      answeredBy: formValue.answeredBy,
      text: formValue.text
    }).subscribe({
      next: (actualizada) => {
        this.consultas.update(list => list.map(c => c._id === actualizada._id ? actualizada : c));
        this.respuestaForm.patchValue({ text: '' });
      },
      error: (err) => {
        console.error('Error añadiendo respuesta:', err);
        alert('No se pudo añadir la respuesta.');
      }
    });
  }

  confirmarEliminar(id: string): void {
    if (!confirm('¿Estás seguro de que quieres eliminar esta consulta?')) return;

    this.consultaService.deleteConsulta(id).subscribe({
      next: () => {
        this.consultas.update(list => list.filter(c => c._id !== id));
      },
      error: (err) => {
        console.error('Error eliminando consulta:', err);
        alert('No se pudo eliminar la consulta.');
      }
    });
  }

  updateSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  toggleSelection(id: string): void {
    this.selectedIds.update(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  toggleAll(): void {
    const allPageIds = this.paginatedConsultas().map(c => c._id!);
    this.selectedIds.update(prev => {
      if (this.isAllSelected()) {
        const next = new Set(prev);
        allPageIds.forEach(id => next.delete(id));
        return next;
      } else {
        return new Set([...prev, ...allPageIds]);
      }
    });
  }

  clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  prevPage(): void { this.goToPage(this.currentPage() - 1); }
  nextPage(): void { this.goToPage(this.currentPage() + 1); }

  pageStart(): number {
    if (this.filteredConsultas().length === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  }

  pageEnd(): number {
    return Math.min(this.currentPage() * this.pageSize(), this.filteredConsultas().length);
  }
}
