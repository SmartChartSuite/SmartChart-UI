import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {openDocumentViewerModal} from "../../document-viewer-modal/document-viewer-modal.component";
import {MatDialog} from "@angular/material/dialog";
import {NlpAnswer} from "../../../../models/results";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";

@Component({
  selector: 'app-unstructured-results-details',
  templateUrl: './unstructured-results-details.component.html',
  styleUrl: './unstructured-results-details.component.scss'
})
export class UnstructuredResultsDetailsComponent implements OnChanges{
  @Input() nlpAnswer: NlpAnswer;
  safeHtmlFragment: SafeHtml;
  safeHtmlFullText: SafeHtml;
  fullTextVisible: boolean = false;
  constructor(private dialog: MatDialog, private sanitized: DomSanitizer){}

  highlightText(text : string, query: string): string{
    let re = new RegExp(query, 'gi')
    // Angular refused to apply class, so I had to go with style tage here. I wonder why.
    return text.replace(re, '<span style="background-color: #fff59d">' + query + '</span>')
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

      const fullTextStr = atob(this.nlpAnswer.fullText)
      const htmlStringFullText = this.highlightText(fullTextStr, this.nlpAnswer.term);
      this.safeHtmlFullText = this.sanitized.bypassSecurityTrustHtml(htmlStringFullText);
    }
  }
}
