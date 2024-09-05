import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {ActiveFormSummary} from "../../../../models/active-form-summary";
import {MatPaginator} from "@angular/material/paginator";

@Component({
  selector: 'app-active-forms-grid',
  templateUrl: './active-forms-grid.component.html',
  styleUrl: './active-forms-grid.component.scss'
})
export class ActiveFormsGridComponent implements OnChanges, AfterViewInit{
  @Input() activeForms: ActiveFormSummary[];
  @Input() isLoading: boolean = false;

  @Output() onActiveFormSelected = new EventEmitter<ActiveFormSummary>;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  displayedColumns: string[] = ["name", "gender", "dob", "formName", "started", "status"];
  dataSource: MatTableDataSource<ActiveFormSummary> = new MatTableDataSource<ActiveFormSummary>([]);

  formStatusDictionary = {
    "inProgress": "In Progress",
    "complete": "Complete"
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['activeForms']?.currentValue){
      this.dataSource.data = this.activeForms;
    }
  }

  onSelectForm(activeFormSummary: ActiveFormSummary) {
    this.onActiveFormSelected.emit(activeFormSummary);
  }
}
