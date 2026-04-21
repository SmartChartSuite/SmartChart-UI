import {
  Component,
  computed,
  EventEmitter,
  input,
  Output,
  ViewChild
} from '@angular/core';
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatNoDataRow } from "@angular/material/table";
import {ActiveFormSummary} from "../../../../models/active-form-summary";
import {MatPaginator} from "@angular/material/paginator";
import { NgClass, TitleCasePipe, DatePipe } from '@angular/common';

@Component({
    selector: 'app-active-forms-grid',
    templateUrl: './active-forms-grid.component.html',
    styleUrl: './active-forms-grid.component.scss',
    imports: [NgClass, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatNoDataRow, MatPaginator, TitleCasePipe, DatePipe]
})
export class ActiveFormsGridComponent {
  activeForms = input.required<ActiveFormSummary[]>();
  isLoading = input<boolean>(false);
  collapsedState = input.required<boolean>();

  @Output() onActiveFormSelected = new EventEmitter<ActiveFormSummary>;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  displayedColumns: string[] = ["name", "gender", "dob", "formName", "started", "status"];

  // Computed signal that reactively creates a MatTableDataSource
  dataSource = computed(() => {
    const source = new MatTableDataSource<ActiveFormSummary>(this.activeForms());
    if (this.paginator) {
      source.paginator = this.paginator;
    }
    return source;
  });

  formStatusDictionary = {
    "inProgress": "In Progress",
    "complete": "Complete"
  }

  onSelectForm(activeFormSummary: ActiveFormSummary) {
    this.onActiveFormSelected.emit(activeFormSummary);
  }
}
