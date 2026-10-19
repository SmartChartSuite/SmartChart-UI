import {Component, ChangeDetectionStrategy} from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-loading',
    templateUrl: './loading.component.html',
    styleUrl: './loading.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatProgressSpinner]
})
export class LoadingComponent {

}
