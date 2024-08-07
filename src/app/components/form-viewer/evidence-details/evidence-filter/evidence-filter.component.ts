import { Component } from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-evidence-filter',
  templateUrl: './evidence-filter.component.html',
  styleUrl: './evidence-filter.component.scss'
})
export class EvidenceFilterComponent {

  form: FormGroup = new FormGroup({
    options: new FormControl('custom')
  })

}
