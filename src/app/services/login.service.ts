import {Injectable} from '@angular/core';
import {catchError, Observable, throwError} from "rxjs";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {environment} from "../../environments/environment";
import * as uuid from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  rootHash = "";
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

  signUp(name: string, email: string, password: string): Observable<any> {
    let url = environment.API_URL + "/api/v1/users";
    this.rootHash = uuid.v4();
    // also store root directory hash in local storage,
    // in case that when front end crash user cannot get files under root directory
    localStorage.setItem("rootHash", this.rootHash);
    let payload = {
      "name": name,
      "email": email,
      "password": password,
      "rootHash": this.rootHash
    };
    return this.http.post(url, payload, {withCredentials: true});
  }

  login(email: string, password: string): Observable<any> {
    let url = environment.API_URL + "/api/v1/sessions";
    let payload = {
      "email": email,
      "password": password,
    };
    return this.http.post(url, payload, {withCredentials: true});
  }

}
