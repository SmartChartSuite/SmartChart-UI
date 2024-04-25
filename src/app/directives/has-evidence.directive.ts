import {Directive, ElementRef, Input, OnInit} from '@angular/core';

@Directive({
  selector: '[appHasEvidence]',
  standalone: true
})
export class HasEvidenceDirective implements OnInit{
  @Input() extensionList: any; //TODO replace type any with a specific type
  constructor(private el: ElementRef) { }

  ngOnInit(): void {
    if (this.extensionList?.some( ext =>
      (ext.url === "http://gtri.gatech.edu/fakeFormIg/cqlTask") //TODO we need to extract the url strings to constants to constants.
        ||
      (ext.url === "http://gtri.gatech.edu/fakeFormIg/nlpqlTask"))) {
      this.el.nativeElement.style.display = 'block';
    }
    else {
      this.el.nativeElement.style.display = 'none';
    }
  }

}
