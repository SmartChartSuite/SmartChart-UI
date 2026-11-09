import {Component, input} from '@angular/core';
import {SimpleAnswer} from '../../../../models/results';

@Component({
  selector: 'app-simple-answers',
  templateUrl: './simple-answers.component.html',
  // Reuse the evidence workspace stylesheet so parent and child lanes share one source of truth.
  styleUrl: '../evidence-details.component.scss'
})
export class SimpleAnswersComponent {
  readonly answers = input.required<SimpleAnswer[]>();
}
