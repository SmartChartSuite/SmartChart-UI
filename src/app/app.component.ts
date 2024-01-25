import {Component, OnChanges, OnInit} from '@angular/core';
import {AuthService} from "@auth0/auth0-angular";
import {ConfigService} from "./services/config/config.service";
import {skipWhile} from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = '';
  authorized: boolean = false;

  constructor(public auth: AuthService, config: ConfigService) {
    this.title = config.config.title;
  }

  ngOnInit(): void {
  }


}
