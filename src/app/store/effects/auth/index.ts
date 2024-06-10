import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY } from 'rxjs';
import { map, exhaustMap, catchError } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

@Injectable()
export class AuthEffects {
  loadMovies$ = createEffect(() =>
    this.actions$.pipe(
      ofType('[Login Page]  Login'),
      exhaustMap(() =>
        this.authService.getAll().pipe(
          map((auth) => ({
            type: '[Login API] Loaded Success',
            payload: auth,
          })),
          catchError(() => EMPTY),
        ),
      ),
    ),
  );

  constructor(
    private actions$: Actions,
    private authService: AuthService,
  ) {}
}
