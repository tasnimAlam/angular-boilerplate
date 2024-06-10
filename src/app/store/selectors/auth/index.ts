import { createSelector } from '@ngrx/store';
import { AppState, NameState } from '../../app.state';

export const selectName = (state: AppState) => state.name;

export const selectFirstName = createSelector(
  selectName,
  (state: NameState) => state.firstName,
);
