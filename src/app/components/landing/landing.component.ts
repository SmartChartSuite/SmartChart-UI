import {Component, ChangeDetectionStrategy} from '@angular/core';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';
import {AppStep, APP_STEPS} from "../../models/app-step";
import {LoginComponent} from "../login/login.component";

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, LoginComponent]
})
export class LandingComponent {
  readonly steps: AppStep[] = APP_STEPS;
}
