import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { Subscription } from "rxjs";

import { MatSnackBar } from "@angular/material/snack-bar";

import { AuthService } from "../../../core/auth/auth.service";
import { DefaultResponseType } from "../../../../types/default-response.type";
import { LoginResponseType } from "../../../../types/login-response.type";

@Component( {
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
} )
export class SignupComponent implements OnDestroy {
  authServiceSignupSubscription: Subscription | null = null;

  signupForm = this.fb.group( {
    email: ['', [Validators.email, Validators.required]],
    password: ['', [Validators.required, Validators.pattern( /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/ )]],
    passwordRepeat: ['', [Validators.required, Validators.pattern( /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/ )]],
    agree: [false, [Validators.requiredTrue]]
  } );

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private _snackBar: MatSnackBar,
              private router: Router) {
  }

  ngOnDestroy(): void {
    this.authServiceSignupSubscription?.unsubscribe();
  }

  signup(): void {
    if (this.signupForm.valid && this.signupForm.value.email &&
      this.signupForm.value.password && this.signupForm.value.passwordRepeat && this.signupForm.value.agree) {
      this.authServiceSignupSubscription = this.authService
        .signup( this.signupForm.value.email, this.signupForm.value.password, this.signupForm.value.passwordRepeat )
        .subscribe( {
          next: (data: DefaultResponseType | LoginResponseType) => {
            let error: string | null = null;
            if (( data as DefaultResponseType ).error !== undefined) {
              error = ( data as DefaultResponseType ).message
            }

            const loginResponse = data as LoginResponseType;
            if (!loginResponse.accessToken || !loginResponse.refreshToken || !loginResponse.userId) {
              error = 'Ошибка регистрации';
            }

            if (error) {
              this._snackBar.open( error );
              throw new Error( error );
            }

            this.authService.setTokens( loginResponse.accessToken, loginResponse.refreshToken );
            this.authService.userId = loginResponse.userId;
            this._snackBar.open( 'Регистрация прошла успешно' );
            this.router.navigate( ['/'] );
          },
          error: (errorResponse: HttpErrorResponse) => {
            if (errorResponse.error && errorResponse.error.message) {
              this._snackBar.open( errorResponse.message );
            } else {
              this._snackBar.open( 'Ошибка регистрации' );
            }
          }
        } )
    }
  }

}
