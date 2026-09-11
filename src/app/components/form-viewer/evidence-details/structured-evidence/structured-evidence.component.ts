import {Component, input} from '@angular/core';
import {DatePipe} from "@angular/common";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatTableModule} from "@angular/material/table";
import {MatTooltipModule} from "@angular/material/tooltip";
import {ParsedCodeGroup} from "../../../../models/parsed-results";

@Component({
  selector: 'app-structured-evidence',
  imports: [
    DatePipe,
    MatExpansionModule,
    MatTableModule,
    MatTooltipModule
  ],
  templateUrl: './structured-evidence.component.html',
  styleUrl: './structured-evidence.component.scss',
})
export class StructuredEvidenceComponent {
  readonly evidence = input.required<ParsedCodeGroup>();
  readonly observationColumns = ['date', 'value'];
  readonly conditionColumns = ['onset', 'abatement'];
  readonly encounterColumns = ['start', 'end', 'type', 'reasonText', 'reasonCode', 'reasonSystem'];
  readonly medicationColumns = ['date', 'dosage'];

  /** Truncates text to maxLength characters, appending an ellipsis when longer. */
  truncate(text: string | undefined, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
  }

  /** Whether the text exceeds maxLength (and was therefore truncated). */
  isLongerThan(text: string | undefined, maxLength: number): boolean {
    return (text?.length ?? 0) > maxLength;
  }
}
