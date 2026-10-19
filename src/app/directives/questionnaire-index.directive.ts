import {Directive, ElementRef, Input, OnInit, Renderer2} from '@angular/core';

@Directive({
  standalone: true,
  selector: '[appGetIndex]'
})
export class QuestionnaireIndexDirective implements OnInit{
  @Input() i: number;
  @Input() childItems: any;
  @Input() itemElements: any[];

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    const childItem = this.getIndex(this.i, this.childItems, this.itemElements);
    if (childItem) {
      this.renderer.setProperty(this.el.nativeElement, 'textContent', childItem); // Example: Set text content
    }
  }
  private getIndex(i: number, childItem: any, itemElement: any[]): string {
    if(i == 0 && childItem.type!= 'display'){
      return `${1}.`;
    }
    else if(!itemElement.some(el => el.type == 'display')){
      return `${i + 1}.`;
    }
    else if(itemElement[i].type=='display'){
      return '';
    }
    else {
      const displayTypeCount = i - itemElement.slice(0,i).filter(el => el.type == 'display').length;
      return `${displayTypeCount+1}.`;
    }
  }
}
