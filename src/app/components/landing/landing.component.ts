import {Component, inject, OnInit} from '@angular/core';
import {StateManagementService} from "../../services/state-management/state-management.service";
import {RouteState} from "../../models/application-state";
import {window} from "rxjs";
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';
import {Carousel} from "primeng/carousel";
import {AppStep, APP_STEPS} from "../../models/app-step";

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
  imports: [MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, Carousel]
})
export class LandingComponent implements OnInit {
  readonly steps: AppStep[] = APP_STEPS;
  protected stateManagementService = inject(StateManagementService);

  protected readonly window = window;

  ngOnInit(): void {
    this.stateManagementService.setCurrentRoute(RouteState.LANDING);
  }

}
