import { Injectable } from '@angular/core';
import {catchError, Observable, throwError} from "rxjs";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(private http: HttpClient) {} // service使用了httpclient，那么就需要在app module导入HTTPClientModule！不然页面会变空白页
  sendAuthEmail(email: string): Observable<any> {
    let url = environment.API_URL + "/api/v1/emails";
    let formData = new FormData();
    formData.append("email", email);
    formData.append("type", "authCode");
    return this.http.post(url, formData);
  }

  getAuthCode(emailID: string, email: string): Observable<any> {
    let url = environment.API_URL + "/api/v1/emails/" + emailID;
    let formData = new FormData();
    formData.append("email", email);
    formData.append("type", "authCode");
    return this.http.post(url, formData);
  }

  signUp(name: string, email: string, password: string): Observable<any> {
    let url = environment.API_URL + "/api/v1/users"
    let formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    return this.http.post(url, formData);
  }

  login(email: string, password: string): Observable<any> {
    let url = environment.API_URL + "/api/v1/sessions"
    let formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    return this.http.post(url, formData);
  }


}
