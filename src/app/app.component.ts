import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  debounceTime,
  first,
  map,
  of,
  Subject,
  Subscription,
  takeUntil,
} from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import {
  DialogData,
  EditDialogComponent,
} from './edit-dialog/edit-dialog.component';

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
export class AppComponent implements OnInit, OnDestroy {
  constructor(private formBuilder: FormBuilder) {
    this.filterForm = this.getFilterForm();

    // filter elements after 2 seconds
    // since the last input change
    this.inputSubscription = this.filterForm.valueChanges
      .pipe(
        debounceTime(2000), // 2 seconds
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (_) => {
          try {
            this.filter();
          } catch (error) {
            console.error('Error in filter function:', error);
            this.inputSubscription.unsubscribe();
          }
        },
        error: (error) => {
          console.error('Error in input subscription:', error);
          this.inputSubscription.unsubscribe();
          alert('Error occured, please reload this page.');
        },
      });
  }

  ngOnInit() {
    this.defineDisplayedColumns();
    this.calculateColumnWidth();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  title = 'test-atipera';
  filterForm;

  private destroy$ = new Subject<void>();
  private inputSubscription!: Subscription;

  columns = {
    position: 'position',
    name: 'name',
    weight: 'weight',
    symbol: 'symbol',
  };

  displayedColumns!: string[];

  private defineDisplayedColumns() {
    this.displayedColumns = [
      this.columns.position,
      this.columns.name,
      this.columns.weight,
      this.columns.symbol,
    ];
  }

  columnWidth!: string;

  private calculateColumnWidth() {
    this.columnWidth = 100 / this.displayedColumns.length + '%';
  }

  dataSource: PeriodicElement[] = ELEMENT_DATA;
  dataFiltered = of(this.dataSource).pipe(first());

  readonly value = signal<string | number>('');
  readonly dialog = inject(MatDialog);
  isDialogOpen = false;

  private getFilterForm() {
    return this.formBuilder.group({
      filterValue: new FormControl(''),
    });
  }

  openEditDialog(column: string, element: PeriodicElement): void {
    if (this.isDialogOpen) return;
    this.isDialogOpen = true;
    const value = this.getElementPropertyByColumnName(element, column);
    if (value === undefined) return;
    const data: DialogData = { column: column, value: value };
    const dialogRef = this.dialog.open(EditDialogComponent, {
      data: data,
    });
    dialogRef
      .afterClosed()
      .pipe(first())
      .subscribe((newValue) => {
        // using underfined because the value can be empty
        if (newValue !== undefined) {
          this.setElementPropertyByColumnName(element, column, newValue);
        }
        this.isDialogOpen = false;
      });
  }

  private filter() {
    const text =
      this.filterForm.controls.filterValue.value?.toLowerCase() || '';
    this.dataFiltered = of(this.dataSource).pipe(
      map((data) =>
        data.filter(
          (element: PeriodicElement) =>
            element.name.toLowerCase().includes(text) ||
            element.position.toString().toLowerCase().includes(text) ||
            element.symbol.toLowerCase().includes(text) ||
            element.weight.toString().toLowerCase().includes(text)
        )
      ),
      first()
    );
  }

  private getElementPropertyByColumnName(
    element: PeriodicElement,
    columnName: string
  ): string | number | undefined {
    const key = Object.keys(this.columns).find(
      (key) => this.columns[key as keyof typeof this.columns] === columnName
    );
    if (!key) alert('Error, column "${columnName}" does not exist. ');
    return key ? element[key as keyof PeriodicElement] : undefined;
  }

  private setElementPropertyByColumnName(
    element: PeriodicElement,
    columnName: string,
    newValue: string | number
  ): void {
    const key = Object.keys(this.columns).find(
      (key) => this.columns[key as keyof typeof this.columns] === columnName
    );
    if (key) {
      // if value should be a number
      const oldValue: string | number = element[key as keyof PeriodicElement];
      if (typeof oldValue === 'number') {
        // show message that the value is not a number
        if (isNaN(Number(newValue))) {
          alert('Error, this field should contain a number, not a text. ');
          return;
        }
        // value is a number
        (element[key as keyof PeriodicElement] as number) = Number(newValue);
        return;
      }

      // if value should be a string
      if (typeof oldValue === 'string' && typeof newValue === 'string') {
        (element[key as keyof PeriodicElement] as string) = newValue;
        return;
      }
      console.error(
        'Error in setElementPropertyByColumnName function: wrong input data type.'
      );
      alert('Wrong input, please try again.');
      return;
    }
    // column not found
    alert('Error, column "${columnName}" does not exist. ');
  }
}
