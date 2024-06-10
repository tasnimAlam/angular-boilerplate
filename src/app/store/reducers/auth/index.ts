import { createReducer, on } from '@ngrx/store';
import * as AuthActions from '../../actions/auth';

export const initialState = {
  name: '',
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.login, (state, { username }) => ({ ...state, name: username })),
);
