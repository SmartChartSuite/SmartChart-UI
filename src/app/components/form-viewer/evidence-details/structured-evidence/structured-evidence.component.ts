import {Component, computed, input, Input, signal} from '@angular/core';
import {DatePipe, formatDate} from "@angular/common";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatTableModule} from "@angular/material/table";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {ParsedCodeGroup} from "../../../../models/parsed-results";
import {PatientSummary} from "../../../../models/patient-summary";

@Component({
  selector: 'app-structured-evidence',
  imports: [
    DatePipe,
    MatExpansionModule,
    MatTableModule,
    MatTooltipModule,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger
  ],
  templateUrl: './structured-evidence.component.html',
  styleUrl: './structured-evidence.component.scss',
})
export class StructuredEvidenceComponent {
  readonly evidence = input.required<ParsedCodeGroup>();
  @Input() patientSummary?: PatientSummary;
  readonly pageSize = 5;
  readonly currentPage = signal(0);
  readonly observationColumns = ['date', 'value'];
  readonly conditionColumns = ['onset', 'abatement'];
  readonly encounterColumns = ['start', 'end', 'type', 'reasonText', 'reasonCode', 'reasonSystem'];
  readonly medicationColumns = ['date', 'dosage'];

  readonly totalPages = computed(() => Math.ceil(this.evidence().resources.length / this.pageSize));
  readonly pagedResources = computed(() => {
    const start = this.currentPage() * this.pageSize;
    return this.evidence().resources.slice(start, start + this.pageSize);
  });

  previousPage(): void {
    this.currentPage.update(page => Math.max(0, page - 1));
  }

  nextPage(): void {
    this.currentPage.update(page => Math.min(this.totalPages() - 1, page + 1));
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
  }

  visiblePages(): number[] {
    const totalPages = this.totalPages();
    const currentPage = this.currentPage();
    const pages = new Set<number>([0, totalPages - 1, currentPage]);

    for (let page = Math.max(0, currentPage - 1); page <= Math.min(totalPages - 1, currentPage + 1); page++) {
      pages.add(page);
    }

    return Array.from(pages).sort((a, b) => a - b);
  }

  hasPageGap(previousPage: number, page: number): boolean {
    return page - previousPage > 1;
  }

  hiddenPages(): number[] {
    const visible = new Set(this.visiblePages());
    return Array.from({length: this.totalPages()}, (_, page) => page)
      .filter(page => !visible.has(page));
  }

  pageSummary(): string {
    const total = this.evidence().resources.length;
    const start = this.currentPage() * this.pageSize + 1;
    const end = Math.min(start + this.pageSize - 1, total);
    return `Showing ${start}-${end} of ${total} results`;
  }

  /** Truncates text to maxLength characters, appending an ellipsis when longer. */
  truncate(text: string | undefined, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
  }

  /** Whether the text exceeds maxLength (and was therefore truncated). */
  isLongerThan(text: string | undefined, maxLength: number): boolean {
    return (text?.length ?? 0) > maxLength;
  }

  ageAt(dateValue: string | undefined): string | undefined {
    const birthDate = this.patientSummary?.birthDate;
    if (!birthDate || !dateValue) return undefined;

    const normalizedBirthDate = new Date(birthDate);
    const eventDate = new Date(dateValue);
    if (Number.isNaN(normalizedBirthDate.getTime()) || Number.isNaN(eventDate.getTime())) {
      return undefined;
    }

    if (eventDate < normalizedBirthDate) return undefined;

    let months = (eventDate.getUTCFullYear() - normalizedBirthDate.getUTCFullYear()) * 12
      + eventDate.getUTCMonth() - normalizedBirthDate.getUTCMonth();
    if (eventDate.getUTCDate() < normalizedBirthDate.getUTCDate()) {
      months--;
    }

    return months <= 36
      ? `${months} month${months === 1 ? '' : 's'}`
      : `${Math.floor(months / 12)} year${Math.floor(months / 12) === 1 ? '' : 's'}`;
  }

  temporalStart(): string {
    const resource = this.evidence().resources[0];
    return resource?.resourceType === 'Encounter'
      ? this.formatDate(resource.details.start, 'Unknown')
      : '';
  }

  temporalEnd(): string {
    const resource = this.evidence().resources[0];
    if (resource?.resourceType !== 'Encounter') return '';
    return resource.details.end
      ? this.formatDate(resource.details.end)
      : 'Ongoing';
  }

  private formatDate(value: string | undefined, fallback = 'Unknown'): string {
    return value ? formatDate(value, 'dd MMM yyyy', 'en-US') : fallback;
  }
}
