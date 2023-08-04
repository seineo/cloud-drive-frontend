import {Injectable} from '@angular/core';
import {catchError, Observable, throwError} from "rxjs";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {environment} from "../../environments/environment";
import * as uuid from 'uuid';
import {UserLoginRequest, UserSignResponse, UserSignUpRequest} from "../models/user.model";

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(private http: HttpClient) {
  } // service使用了httpclient，那么就需要在app module导入HTTPClientModule！不然页面会变空白页
  sendAuthEmail(email: string): Observable<any> {
    let url = environment.API_URL + "/api/v1/emails";
    let formData = new FormData();
    formData.append("email", email);
    formData.append("type", "authCode");
    return this.http.post(url, formData, {withCredentials: true});
  }

  getAuthCode(emailID: string, email: string): Observable<any> {
    let url = environment.API_URL + "/api/v1/emails/" + emailID;
    let formData = new FormData();
    formData.append("email", email);
    formData.append("type", "authCode");
    return this.http.post(url, formData, {withCredentials: true});
  }

  signUp(name: string, email: string, password: string): Observable<UserSignResponse> {
    let url = environment.API_URL + "/api/v1/users";
    let rootHash = uuid.v4();
    // also store root directory hash in local storage,
    // in case that when front end crash user cannot get files under root directory
    localStorage.setItem("rootHash", rootHash);
    let payload: UserSignUpRequest = {
      name: name,
      email: email,
      password: password,
      rootHash: rootHash
    };
    return this.http.post<UserSignResponse>(url, payload, {withCredentials: true});
  }

  login(email: string, password: string): Observable<UserSignResponse> {
    let url = environment.API_URL + "/api/v1/sessions";
    let payload: UserLoginRequest = {
      email: email,
      password: password
    };
    return this.http.post<UserSignResponse>(url, payload, {withCredentials: true});
  }

  logout(): Observable<any> {
    let url = environment.API_URL + "/api/v1/sessions/current_session";
    return this.http.delete(url, {withCredentials: true});
  }
}
