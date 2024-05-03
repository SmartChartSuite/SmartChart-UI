import {Directive, Input, TemplateRef, ViewContainerRef} from '@angular/core';

@Directive({
  selector: '[appHasEvidence]',
  standalone: true
})
export class HasEvidenceDirective {
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {
  }

  @Input() set appHasEvidence(extensionList: any) {
    if (extensionList?.some(ext =>
      (ext.url === "http://gtri.gatech.edu/fakeFormIg/cqlTask") ||
      (ext.url === "http://gtri.gatech.edu/fakeFormIg/nlpqlTask"))) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
