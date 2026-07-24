import {Component, inject, input, ChangeDetectionStrategy} from '@angular/core';
import {OAuthService} from "angular-oauth2-oidc";
import {MatCardModule} from "@angular/material/card";
import {MatIconModule} from "@angular/material/icon";
import {MatButton} from "@angular/material/button";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {MatDivider} from "@angular/material/list";

@Component({
  selector: 'sc-standalone-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatCardModule,
    MatIconModule,
    MatButton,
    MatMenuTrigger,
    MatMenu,
    MatDivider,
    MatMenuItem,
  ]
})
export class LoginComponent {

  isLocatedInMainMenu = input<boolean>(false);
  public oauthService: OAuthService = inject(OAuthService);

  // Method for profile picture with fallback - called by Angular change detection
  protected profilePictureUrl(): string {
    const claims = this.oauthService.getIdentityClaims();
    return claims?.['picture'] || '/assets/img/portrait_placeholder.png';
  }

  // Handle image loading errors by falling back to placeholder
  protected onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/img/portrait_placeholder.png';
  }
}
