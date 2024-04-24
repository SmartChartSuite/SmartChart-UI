import {Directive, ElementRef, Input, OnInit} from '@angular/core';

@Directive({
  selector: '[appHasEvidence]',
  standalone: true
})
export class HasEvidenceDirective implements OnInit{
  @Input() extensionList: any;
  constructor(private el: ElementRef) { }

  ngOnInit(): void {
    if (this.extensionList?.some( ext =>
      (ext.url === "http://gtri.gatech.edu/fakeFormIg/cqlTask")
        ||
      (ext.url === "http://gtri.gatech.edu/fakeFormIg/nlpqlTask"))) {
      this.el.nativeElement.style.display = 'block';
    }
    else {
      this.el.nativeElement.style.display = 'none';
    }
  }

}
