import {Component, input} from '@angular/core';
import {DatePipe} from "@angular/common";
import {ParsedCodeGroup} from "../../../../models/parsed-results";

@Component({
  selector: 'app-structured-evidence',
  imports: [
    DatePipe
  ],
  templateUrl: './structured-evidence.component.html',
  styleUrl: './structured-evidence.component.scss',
})
export class StructuredEvidenceComponent {
  readonly evidence = input.required<ParsedCodeGroup>();
}
