import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {StructuredEvidenceDTO} from "../../../../models/structured-evidence-dto/structured-evidence-dto";
import {EvidenceViewerService} from "../../../../services/evidence-viewer/evidence-viewer.service";
import {Observable} from "rxjs";

@Component({
  selector: 'app-structured-results-details',
  templateUrl: './structured-results-details.component.html',
  styleUrl: './structured-results-details.component.scss'
})
export class StructuredResultsDetailsComponent implements OnChanges, OnInit{
  @Input() structuredEvidenceDto: StructuredEvidenceDTO[] = [];
  @Input() displayedColumns: string[] = []; // Allows the user to enter the table columns of their choice in the order they need

  columns: string[];
  dataSource = new MatTableDataSource<StructuredEvidenceDTO>([]);
  readonly MAX_STR_LENGTH = 12;
  evidenceViewerExpanded$: Observable<boolean>;

  constructor(private evidenceViewerService: EvidenceViewerService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.structuredEvidenceDto){
      this.dataSource.data = this.structuredEvidenceDto;
      if(this.displayedColumns?.length > 0){
        this.columns = this.displayedColumns;
      }
      else if(this.structuredEvidenceDto?.[0]){
        this.columns = Object?.keys(this.structuredEvidenceDto?.[0]);
      }
    }
  }

  ngOnInit(): void {
    this.evidenceViewerExpanded$ = this.evidenceViewerService.viewerExpanded$;
  }
}
