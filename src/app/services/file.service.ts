import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment.development";

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private http: HttpClient) { }

  // dirPath should start without slash
  getFilesMetadata(dirPath: string): Observable<any> {
    let url = environment.API_URL + "/api/v1/files/metadata/" + dirPath;
    return this.http.get(url, {withCredentials: true});
  }

  // create file or directory
  uploadFile(dirPath: string, fileName: string, hash: string, fileType: string, file?: File): Observable<any> {
    let url = environment.API_URL + "/api/v1/files/data/" + dirPath;
    let formData = new FormData();
    formData.append("fileName", fileName);
    formData.append("hash", hash);
    formData.append("fileType", fileType);
    if (file) {
      formData.append("file", file);
    }
    return this.http.post(url, formData, {withCredentials: true});
  }

  downloadFile(dirPath: string, fileName: string): Observable<any> {
    let url = environment.API_URL + "/api/v1/files/data/" + dirPath;
    let queryParams = new HttpParams();
    queryParams = queryParams.append("fileName",fileName);
    return this.http.get(url, {params: queryParams, withCredentials: true});
  }
}
