import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";

import { MatSnackBar } from "@angular/material/snack-bar";

import { AuthService } from "../../../core/auth/auth.service";
import { DefaultResponseType } from "../../../../types/default-response.type";
import { LoginResponseType } from "../../../../types/login-response.type";

@Component( {
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
} )
export class LoginComponent implements OnDestroy {
  authServiceLoginSubscription: Subscription | null = null;
  loginForm = this.fb.group( {
    email: ['', [Validators.email, Validators.required]],
    password: ['', [Validators.required]],
    rememberMe: [false]
  } );

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private _snackBar: MatSnackBar,
              private router: Router) {
  }

  ngOnDestroy(): void {
    this.authServiceLoginSubscription?.unsubscribe();
  }

  login(): void {
    if (this.loginForm.valid && this.loginForm.value.email && this.loginForm.value.password) {
      this.authServiceLoginSubscription = this.authService
        .login( this.loginForm.value.email, this.loginForm.value.password, !!this.loginForm.value.rememberMe )
        .subscribe( {
          next: (data: DefaultResponseType | LoginResponseType) => {
            let error: string | null = null;
            if (( data as DefaultResponseType ).error !== undefined) {
              error = ( data as DefaultResponseType ).message;
            }

            const loginResponse = data as LoginResponseType;
            if (!loginResponse.accessToken || !loginResponse.refreshToken || !loginResponse.userId) {
              error = 'Ошибка авторизации';
            }

            if (error) {
              this._snackBar.open( error );
              throw new Error( error );
            }

            this.authService.setTokens( loginResponse.accessToken, loginResponse.refreshToken );
            this.authService.userId = loginResponse.userId;
            this._snackBar.open( 'Авторизация прошла успешно' );
            this.router.navigate( ['/'] );
          },
          error: (errorResponse: HttpErrorResponse) => {
            if (errorResponse.error && errorResponse.error.message) {
              this._snackBar.open( errorResponse.error.message );
            } else {
              this._snackBar.open( 'Ошибка авторизации' );
            }
          }
        } );
    }
  }
}
