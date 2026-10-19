import {inject} from "@angular/core";
import {CanDeactivateFn} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {map, Observable} from "rxjs";
import {openConfirmationDialog} from "../components/confirmation-dialog/confirmation-dialog.component";

/**
 * Components guarded by {@link unsavedChangesGuard} must implement this interface.
 * The guard inspects the component's dirty state and, when needed, prompts the
 * user before allowing navigation away.
 */
export interface HasUnsavedChanges {
  hasUnsavedChanges: () => boolean;
}

/**
 * Route guard that blocks navigation when the component has unsaved work.
 * If there are unsaved changes, the user is asked to confirm leaving without
 * saving. Components that don't implement {@link HasUnsavedChanges} are always
 * allowed to deactivate.
 */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component): Observable<boolean> | boolean => {
  if (!component?.hasUnsavedChanges || !component.hasUnsavedChanges()) {
    return true;
  }

  const dialog = inject(MatDialog);

  return openConfirmationDialog(dialog, {
    title: "Unsaved Changes",
    content: "You have unsaved changes on this form. If you leave now, your changes will be lost. Do you want to leave without saving?",
    primaryActionBtnTitle: "Stay on Page",
    secondaryActionBtnTitle: "Leave Without Saving",
    width: "40em",
    isPrimaryButtonLeft: false,
    isSecondaryActionDanger: true
  }).pipe(
    // 'secondaryAction' = "Leave Without Saving"; a dismissed dialog stays.
    map(action => action === 'secondaryAction')
  );
};
