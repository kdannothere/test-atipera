import { Component, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PeriodicElement } from '../app.component';
import { columns } from '../columns';

export interface DialogData {
  element: PeriodicElement;
  column: string;
}

@Component({
  selector: 'app-edit-dialog',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
  ],
  templateUrl: './edit-dialog.component.html',
  styleUrl: './edit-dialog.component.scss',
})
export class EditDialogComponent {
  readonly dialogRef = inject(MatDialogRef<EditDialogComponent>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  readonly value = model(this.getValueByColumn(this.data.column));

  private getValueByColumn(column: string): string | number | undefined {
    if (column === columns.name) return this.data.element.name;
    if (column === columns.position) return this.data.element.position;
    if (column === columns.symbol) return this.data.element.symbol;
    if (column === columns.weight) return this.data.element.weight;
    return undefined;
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }
}
