import {Injectable} from '@angular/core';
import {catchError, Observable, throwError} from "rxjs";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {environment} from "../../environments/environment";
import * as uuid from 'uuid';
import {UserCodeRequest, UserLoginRequest, UserSignResponse, UserSignUpRequest} from "../models/user.model";

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(private http: HttpClient) {
  } // service使用了httpclient，那么就需要在app module导入HTTPClientModule！不然页面会变空白页
  sendAuthEmail(email: string): Observable<string> {
    let url = `${environment.API_URL}/api/v1/accounts/codes`;
    let payload: UserCodeRequest = {
      email: email
    }
    return this.http.post<string>(url, payload, {withCredentials: true});
  }

  getAuthCode(email: string): Observable<string> {
    let url = `${environment.API_URL}/api/v1/accounts/codes/${email}`;
    return this.http.get<string>(url, {withCredentials: true});
  }

  signUp(name: string, email: string, password: string): Observable<UserSignResponse> {
    let url = environment.API_URL + "/api/v1/accounts";
    let payload: UserSignUpRequest = {
      email: email,
      nickname: name,
      password: password,
    };
    return this.http.post<UserSignResponse>(url, payload, {withCredentials: true});
  }

  login(email: string, password: string): Observable<UserSignResponse> {
    let url = environment.API_URL + "/api/v1/accounts/sessions";
    let payload: UserLoginRequest = {
      email: email,
      password: password
    };
    return this.http.post<UserSignResponse>(url, payload, {withCredentials: true});
  }

  logout(): Observable<any> {
    let url = environment.API_URL + "/api/v1/accounts/sessions/me";
    return this.http.delete(url, {withCredentials: true});
  }
}
