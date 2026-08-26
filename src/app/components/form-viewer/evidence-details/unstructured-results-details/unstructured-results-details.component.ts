import {Component, Input, OnChanges, SimpleChanges, ViewEncapsulation, ChangeDetectionStrategy} from '@angular/core';
import {openDocumentViewerModal} from "../../document-viewer-modal/document-viewer-modal.component";
import {MatDialog} from "@angular/material/dialog";
import {NlpAnswer} from "../../../../models/results";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {PatientSummary} from "../../../../models/patient-summary";
import {EvidenceDTO} from "../../../../models/dto/evidence-dto";
import {NlpAnswerDTO} from "../../../../models/dto/nlp-answer-dto";
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-unstructured-results-details',
    templateUrl: './unstructured-results-details.component.html',
    styleUrl: './unstructured-results-details.component.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatCard, MatCardContent, MatIconButton, MatTooltip, MatIcon]
})
export class UnstructuredResultsDetailsComponent implements OnChanges{
  @Input() nlpAnswer: NlpAnswer;
  @Input({ required: true }) patientSummary: PatientSummary;
  safeHtmlFragment: SafeHtml;
  safeHtmlFullText: SafeHtml;
  fullTextVisible: boolean = false;
  nlpAnswerDTO: NlpAnswerDTO;
  constructor(private dialog: MatDialog, private sanitized: DomSanitizer){}

  //TODO: improve handling on the highlighting and splitting function.
  // Presently it splits the query on multiple queries using the * as divider
  private  extractAsteriskContent(text) {
    return text.split('*').filter(item => item.trim() !== '').map(item => item.trim());
  }

  highlightText(text : string, query: string): string{
    if(text && query){
      const queryList = this.extractAsteriskContent(query);
      queryList.forEach(q => {
        text = text.split(q).join(`<span class="highlight">${q}</span>`);
      });
      return text;
    }
    else {
      return text;
    }
  }

  onOpenInModal() {
    openDocumentViewerModal(
      this.dialog,
      {
        title: "Document Content",
        content: this.nlpAnswer.fullText,
        htmlContent: this.safeHtmlFullText,
        size: {
          minWidth: "500px",
          minHeight: "300px"
        }
      })
      .subscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['nlpAnswer'].currentValue) {
      const htmlStringFragment = this.highlightText(this.nlpAnswer.fragment, this.nlpAnswer.term);
      this.safeHtmlFragment = this.sanitized.bypassSecurityTrustHtml(htmlStringFragment);
      this.nlpAnswerDTO = ({
        ...this.nlpAnswer,
        'dateAgeAt': EvidenceDTO.getDateAgeAsStr(this.nlpAnswer.date, this.patientSummary.birthDate),
        'fulltextStr': this.nlpAnswer.fullText,
        'type': this.nlpAnswer.type,
      }) as NlpAnswerDTO

      const fullTextStr = this.nlpAnswer.fullText;
      let htmlStringFullText = '';

      htmlStringFullText = this.highlightText(fullTextStr, this.nlpAnswer.noteText);
      htmlStringFullText = this.highlightText(htmlStringFullText, this.nlpAnswer.textFragment);
      htmlStringFullText = this.highlightText(htmlStringFullText, this.nlpAnswer.sectionText);
      this.safeHtmlFullText = this.sanitized.bypassSecurityTrustHtml(htmlStringFullText);
    }
  }
}
