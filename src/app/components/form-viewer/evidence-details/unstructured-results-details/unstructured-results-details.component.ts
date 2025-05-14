import {Component, Input, OnChanges, SimpleChanges, ViewEncapsulation} from '@angular/core';
import {openDocumentViewerModal} from "../../document-viewer-modal/document-viewer-modal.component";
import {MatDialog} from "@angular/material/dialog";
import {NlpAnswer} from "../../../../models/results";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {PatientSummary} from "../../../../models/patient-summary";
import {EvidenceDTO} from "../../../../models/dto/evidence-dto";
import {NlpAnswerDTO} from "../../../../models/dto/nlp-answer-dto";

@Component({
    selector: 'app-unstructured-results-details',
    templateUrl: './unstructured-results-details.component.html',
    styleUrl: './unstructured-results-details.component.scss',
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class UnstructuredResultsDetailsComponent implements OnChanges{
  @Input() nlpAnswer: NlpAnswer;
  @Input({ required: true }) patientSummary: PatientSummary;
  safeHtmlFragment: SafeHtml;
  safeHtmlFullText: SafeHtml;
  fullTextVisible: boolean = false;
  nlpAnswerDTO: NlpAnswerDTO;
  constructor(private dialog: MatDialog, private sanitized: DomSanitizer){}

  highlightText(text : string, query: string): string{
    // Angular refused to apply class, so I had to go with style tage here. I wonder why.
    if(text && query){
      query = query.replace(/\*/g, '');
      let re = new RegExp(query, 'gi')
      return text.replace(re, `<span class="highlight">${query}</span>`)
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

      htmlStringFullText = this.highlightText(fullTextStr, this.nlpAnswer.textFragment);
      htmlStringFullText = this.highlightText(htmlStringFullText, this.nlpAnswer.sectionText);
      this.safeHtmlFullText = this.sanitized.bypassSecurityTrustHtml(htmlStringFullText);
    }
  }
}
