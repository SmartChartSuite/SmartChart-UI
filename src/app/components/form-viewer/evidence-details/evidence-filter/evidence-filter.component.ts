import {Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { MatFormField, MatLabel, MatHint, MatSuffix } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatDateRangeInput, MatStartDate, MatEndDate, MatDatepickerToggle, MatDateRangePicker } from '@angular/material/datepicker';

@Component({
    selector: 'app-evidence-filter',
    templateUrl: './evidence-filter.component.html',
    styleUrl: './evidence-filter.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule, ReactiveFormsModule, MatRadioGroup, MatRadioButton, MatFormField, MatLabel, MatSelect, MatOption, MatDateRangeInput, MatStartDate, MatEndDate, MatHint, MatDatepickerToggle, MatSuffix, MatDateRangePicker]
})
export class EvidenceFilterComponent implements OnInit {
  @Output() onDateDateRangeSelected = new EventEmitter();
  @Input() packageRunDate: string;

  range = new FormGroup({
    start: new FormControl(null),
    end: new FormControl(null),
  });

  dayRangeList = [30, 60, 90, 365];

  form: FormGroup = new FormGroup({
    options: new FormControl('all'),
    dayRange: new FormControl(this.dayRangeList[0]),
  });

  constructor() {
    this.form.addControl('range', this.range);
  }

  ngOnInit(): void {
    this.form.valueChanges.subscribe(value => {
      if (value.range.start || value.range.end) {
        this.form.controls['options'].patchValue('custom', {emitEvent: false});
      }
      if (value.options == 'all') {
        if (this.range.dirty) {
          this.range.reset(null, {emitEvent: false});
        }
        this.onDateDateRangeSelected.emit({'startDate': null, 'endDate': null});
      } else if (value.options == 'preset') {
        if (this.range.dirty) {
          this.range.reset(null, {emitEvent: false});
        }
        const daysRange = this.form.controls['dayRange'].value;
        const startDate = this.getYearMonthDayStr(new Date(new Date().setDate(new Date(this.packageRunDate).getDate() - daysRange)));
        const endDate = this.getYearMonthDayStr(new Date(this.packageRunDate));
        this.onDateDateRangeSelected.emit({'startDate': startDate, 'endDate': endDate});
      } else if (value.options == 'custom' && value.range.start && value.range.end) {
        this.onDateDateRangeSelected.emit(
          {'startDate': this.getYearMonthDayStr(value.range.start), 'endDate': this.getYearMonthDayStr(value.range.end)}
        );
      }
    })
  }

  /**
   * Extract only YYYY-MM-DD string from the Date object
   * @param date
   * @private
   */
  private getYearMonthDayStr(date: Date): string{
    return  date.toISOString().split('T')[0];
  }

}
