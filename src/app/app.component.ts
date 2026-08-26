import {Component, ChangeDetectionStrategy, inject} from '@angular/core';
import {LoadingService} from "./services/loading/loading.service";
import {LoadingComponent} from './components/loading/loading.component';
import {RouterOutlet} from '@angular/router';
import {HeaderComponent} from "./components/header/header.component";
import {ErrorMessageComponent} from "./components/error-message/error-message.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [LoadingComponent, RouterOutlet, HeaderComponent, ErrorMessageComponent]
})
export class AppComponent {
  protected readonly loadingService = inject(LoadingService);
}
