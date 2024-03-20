import { Component } from '@angular/core';

@Component({
  selector: 'app-new-chart',
  templateUrl: './new-chart.component.html',
  styleUrl: './new-chart.component.scss'
})
export class NewChartComponent {

  onFormSelected(event: string) {
    console.log(event);
  }

  onStartJob() {
    console.log("onStartJob");
  }
}
