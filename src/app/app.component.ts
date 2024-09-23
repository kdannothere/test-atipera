import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  first,
  map,
  Observable,
  of,
} from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import {
  DialogData,
  EditDialogComponent,
} from './edit-dialog/edit-dialog.component';
import { rxState } from '@rx-angular/state';
import { RxFor } from '@rx-angular/template/for';
import { columns } from './columns';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
  { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
  { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
  { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
  { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RxFor,
    RouterOutlet,
    CommonModule,
    MatTableModule,
    MatInput,
    ReactiveFormsModule,
    MatFormFieldModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'test-atipera';
  filterForm;
  columns = columns;

  loadDataSource(): Observable<PeriodicElement[]> {
    return of(ELEMENT_DATA).pipe(first());
  }

  private filterSubject = new BehaviorSubject<string>('');
  filter$ = this.filterSubject.asObservable().pipe(distinctUntilChanged());

  private state = rxState<{
    data: PeriodicElement[];
    filterValue: string;
  }>(({ set, connect }) => {
    set({
      data: [],
      filterValue: '',
    });
    connect('data', this.loadDataSource());
  });

  data$ = this.state.select('data');
  filterValue = this.state.signal('filterValue');
  data = this.state.signal('data');

  displayedColumns!: string[];

  private defineDisplayedColumns() {
    this.displayedColumns = [
      columns.position,
      columns.name,
      columns.weight,
      columns.symbol,
    ];
  }

  columnWidth!: string;

  readonly value = signal<string | number>('');
  readonly dialog = inject(MatDialog);
  isDialogOpen = false;

  applyFilter(filterValue: string) {
    this.filterSubject.next(filterValue);
  }

  filteredData$ = combineLatest([this.data$, this.filter$]).pipe(
    map(([data, filter]) =>
      data.filter(
        (element) =>
          element.name.toLowerCase().includes(filter.toLowerCase()) ||
          element.symbol.toLowerCase().includes(filter.toLowerCase()) ||
          element.weight.toString().includes(filter) ||
          element.position.toString().includes(filter)
      )
    )
  );

  constructor(private formBuilder: FormBuilder) {
    this.filterForm = this.getFilterForm();
  }

  ngOnInit() {
    this.defineDisplayedColumns();
    this.calculateColumnWidth();
    this.filterForm.valueChanges
      .pipe(debounceTime(2000), distinctUntilChanged())
      .subscribe((value) => {
        if (value.filterValue || value.filterValue === '')
          this.state.set(
            'filterValue',
            (state) => (state.filterValue = value.filterValue as string)
          );
        this.applyFilter(this.filterValue());
      });
  }

  openEditDialog(column: string, element: PeriodicElement): void {
    if (this.isDialogOpen) return;
    this.isDialogOpen = true;
    const data: DialogData = { element: element, column: column };
    const currentElement = element;
    const dialogRef = this.dialog.open(EditDialogComponent, {
      data: data,
    });
    dialogRef
      .afterClosed()
      .pipe(first())
      .subscribe((newValue) => {
        // using underfined because the value can be empty
        if (newValue !== undefined) {
          this.updateValueByColumn(currentElement, column, newValue);
        }
        this.isDialogOpen = false;
      });
  }

  private updateElement(
    position: number,
    newName: string,
    newWeight: number,
    newSymbol: string
  ) {
    this.state.set('data', (data) =>
      data.data.map((element) =>
        element.position === position
          ? { ...element, name: newName, weight: newWeight, symbol: newSymbol }
          : element
      )
    );
  }

  private updateValueByColumn(
    element: PeriodicElement,
    column: string,
    value: number | string
  ) {
    if (column === columns.name)
      this.updateElement(
        element.position,
        value as string,
        element.weight,
        element.symbol
      );
    if (column === columns.position)
      this.updateElement(
        value as number,
        element.name,
        element.weight,
        element.symbol
      );
    if (column === columns.symbol)
      this.updateElement(
        element.position,
        element.name,
        element.weight,
        value as string
      );
    if (column === columns.weight)
      this.updateElement(
        element.position,
        element.name,
        value as number,
        element.symbol
      );
  }

  private getFilterForm() {
    return this.formBuilder.group({
      filterValue: new FormControl(''),
    });
  }

  private calculateColumnWidth() {
    this.columnWidth = 100 / this.displayedColumns.length + '%';
  }
}
