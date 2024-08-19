import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {ActiveFormSummary} from "../../../../models/active-form-summary";

@Component({
  selector: 'app-active-forms-grid',
  templateUrl: './active-forms-grid.component.html',
  styleUrl: './active-forms-grid.component.scss'
})
export class ActiveFormsGridComponent implements OnChanges{
  @Input() activeForms: ActiveFormSummary[];
  @Input() isLoading: boolean = false;

  @Output() onActiveFormSelected = new EventEmitter<ActiveFormSummary>;

  displayedColumns: string[] = ["name", "gender", "dob", "formName", "started"];
  dataSource: MatTableDataSource<ActiveFormSummary> = new MatTableDataSource<ActiveFormSummary>([]);

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['activeForms']?.currentValue){
      this.dataSource.data = this.activeForms;
    }
  }

  onSelectForm(activeFormSummary: ActiveFormSummary) {
    this.onActiveFormSelected.emit(activeFormSummary);
  }
}
