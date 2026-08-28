import {AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from "@angular/material/table";
import {StructuredEvidenceDTO} from "../../../../models/dto/structured-evidence-dto/structured-evidence-dto";
import {EvidenceViewerService} from "../../../../services/evidence-viewer/evidence-viewer.service";
import {Observable} from "rxjs";
import {MatPaginator} from "@angular/material/paginator";
import { MatSort } from '@angular/material/sort';
import { NgFor, AsyncPipe } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { CamelCaseToTitleCasePipe } from '../../../../pipe/camel-case-to-title-case.pipe';
import { ConcatDataToStrPipe } from '../../../../pipe/concat-data-to-str.pipe';
import { dateFormat } from '../../../../pipe/date-format.pipe';

@Component({
    selector: 'app-structured-results-details',
    templateUrl: './structured-results-details.component.html',
    styleUrl: './structured-results-details.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatTable, MatSort, NgFor, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatTooltip, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatPaginator, AsyncPipe, CamelCaseToTitleCasePipe, ConcatDataToStrPipe]
})
export class StructuredResultsDetailsComponent implements OnChanges, AfterViewInit{
  @Input() structuredEvidenceDto: StructuredEvidenceDTO[] = [];
  @Input() displayedColumns: string[] = []; // Allows the user to enter the table columns of their choice in the order they need
  @ViewChild(MatPaginator) paginator: MatPaginator;

  columns: string[] = [];
  dataSource = new MatTableDataSource<StructuredEvidenceDTO>([]);
  readonly MAX_STR_LENGTH = 17;
  evidenceViewerExpanded$: Observable<boolean>;

  // Expose dateFormat function for template use
  protected readonly dateFormat = dateFormat;

  constructor(private evidenceViewerService: EvidenceViewerService) {
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['structuredEvidenceDto'].currentValue){
      this.dataSource.data = this.structuredEvidenceDto;
      this.dataSource.paginator = this.paginator;
      if(this.displayedColumns?.length > 0){
        this.columns = this.displayedColumns;
      }
      else if(this.structuredEvidenceDto?.[0]){
        this.columns = Object?.keys(this.structuredEvidenceDto?.[0])
      }
      this.columns = this.columns.filter(column=> column != 'sortFilterDate');
    }
  }
}
