import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {SimpleObservation} from "../../../../models/structured-results";

@Component({
  selector: 'app-structured-results-details',
  templateUrl: './structured-results-details.component.html',
  styleUrl: './structured-results-details.component.scss'
})
export class StructuredResultsDetailsComponent implements OnChanges{
  @Input() structuredResults: SimpleObservation[];
  displayedColumns: string[] =  ['date', 'code', 'system', 'conceptName', 'value' ];
  dataSource = new MatTableDataSource<SimpleObservation>([]);

  ngOnChanges(changes: SimpleChanges): void {
    if(this.structuredResults){
      this.dataSource.data = this.structuredResults;
    }
  }
}
