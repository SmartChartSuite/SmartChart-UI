import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {SimpleObservation} from "../../../../models/structured-results";

@Component({
  selector: 'app-structured-results-details',
  templateUrl: './structured-results-details.component.html',
  styleUrl: './structured-results-details.component.scss'
})
export class StructuredResultsDetailsComponent implements OnChanges{
  @Input() structuredResults: SimpleObservation[] = [];
  @Input() displayedColumns: string[] = []; // Allows the user to enter the table columns of their choice in the order they need

  columns: string[];
  dataSource = new MatTableDataSource<SimpleObservation>([]);

  ngOnChanges(changes: SimpleChanges): void {
    if(this.structuredResults){
      this.dataSource.data = this.structuredResults;
      if(this.displayedColumns?.length > 0){
        this.columns = this.displayedColumns;
      }
      else if(this.structuredResults?.[0]){
        this.columns = Object?.keys(this.structuredResults?.[0]);
      }
    }
  }
}
