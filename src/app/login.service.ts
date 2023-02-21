import { Injectable } from '@angular/core';
import {catchError, Observable, throwError} from "rxjs";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  currentUser!: User;
  constructor(private http: HttpClient) {} // service使用了httpclient，那么就需要在app module导入HTTPClientModule！不然页面会变空白页
  sendAuthEmail(email: string): Observable<any> {
    let url = "http://192.168.3.16:10393/mock/c0ce7806-f5f0-4e32-a0b6-333eabf8fed4/api/email/auth_code";
    let formData = new FormData();
    formData.append("email", email);
    console.log("formdata:", formData.get("email"));
    return this.http.post(url, formData).pipe(
      catchError(this.handleError)
    );
  }

  getAuthCode(email: string): Observable<any> {
    let url = "http://192.168.3.16:10393/mock/c0ce7806-f5f0-4e32-a0b6-333eabf8fed4/api/email/auth_code/result"
    let formData = new FormData();
    formData.append("email", email);
    return this.http.post(url, formData).pipe(
      catchError(this.handleError)
    );
  }

  signUp(name: string, email: string, password: string): Observable<any> {
    let url = "http://192.168.3.16:10393/mock/c0ce7806-f5f0-4e32-a0b6-333eabf8fed4/api/users?apipost_id=2b5cfd"
    let formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    return this.http.post(url, formData).pipe(
      catchError(this.handleError)
    );
  }

  login(id: string): Observable<any> {
    let url = "http://192.168.3.16:10393/mock/c0ce7806-f5f0-4e32-a0b6-333eabf8fed4/users/sessions"
    let formData = new FormData();
    formData.append("user_id", id);

    return this.http.post(url, formData, {observe: 'response'}).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    // Return an observable with a user-facing error message.
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}

class User {
  constructor(id: number, name: string, email: string) {
  }
}
