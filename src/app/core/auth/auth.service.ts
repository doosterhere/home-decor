import {Injectable} from '@angular/core';
import {Observable, Subject, throwError} from "rxjs";
import {DefaultResponseType} from "../../../types/default-response.type";
import {LoginResponseType} from "../../../types/login-response.type";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public accessTokenKey: string = 'accessToken';
  public refreshTokenKey: string = 'refreshToken';
  public userIdKey: string = 'userId';
  public isLogged$: Subject<boolean> = new Subject<boolean>();
  private _isLogged: boolean = false;
  private _userId: string | null = null;

  constructor(private httpClient: HttpClient) {
    this.isLogged = !!localStorage.getItem(this.accessTokenKey);
  }

  get isLogged() {
    return this._isLogged;
  }

  set isLogged(value: boolean) {
    this._isLogged = value;
  }

  get userId(): string | null {
    return localStorage.getItem(this.userIdKey);
  }

  set userId(userId: string | null) {
    if (userId) {
      localStorage.setItem(this.userIdKey, userId);
      return;
    }

    if (!userId) {
      localStorage.removeItem(this.userIdKey);
    }
  }

  login(email: string, password: string, rememberMe: boolean): Observable<DefaultResponseType | LoginResponseType> {
    return this.httpClient.post<DefaultResponseType | LoginResponseType>(environment.api + 'login', {
      email,
      password,
      rememberMe
    });
  }

  signup(email: string, password: string, passwordRepeat: string): Observable<DefaultResponseType | LoginResponseType> {
    return this.httpClient.post<DefaultResponseType | LoginResponseType>(environment.api + 'signup', {
      email,
      password,
      passwordRepeat
    });
  }

  logout(): Observable<DefaultResponseType> {
    const tokens = this.getTokens();
    if (tokens && tokens.refreshToken) {
      return this.httpClient.post<DefaultResponseType>(environment.api + 'logout', {
        refreshToken: tokens.refreshToken
      });
    }

    throw throwError(() => 'Can\'t find refresh token');
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    this.isLogged = true;
    this.isLogged$.next(this.isLogged);
  }

  removeTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.isLogged = false;
    this.isLogged$.next(this.isLogged);
  }

  getTokens(): { accessToken: string | null, refreshToken: string | null } {
    return {
      accessToken: localStorage.getItem(this.accessTokenKey),
      refreshToken: localStorage.getItem(this.refreshTokenKey)
    }
  }

  refresh(): Observable<DefaultResponseType | LoginResponseType> {
    const tokens = this.getTokens();

    if (tokens && tokens.refreshToken) {
      return this.httpClient.post<DefaultResponseType | LoginResponseType>(environment.api + 'refresh', {
        refreshToken: tokens.refreshToken
      });
    }

    throw throwError(() => 'Can not use token');
  }
}
