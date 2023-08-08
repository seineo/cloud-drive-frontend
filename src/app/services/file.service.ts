import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {from, map, mergeMap, Observable} from "rxjs";
import {environment} from "../../environments/environment.development";
import * as CryptoJS from 'crypto-js';
import {DirRequest, FileRequest} from "../models/file.model";

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private readonly host: string = environment.API_URL

  constructor(private http: HttpClient) {

  }


  // dirPath should start without slash
  getFilesMetadata(dirHash: string): Observable<any> {
    let url = this.host + "/api/v1/files/metadata/dir/" + dirHash;
    return this.http.get(url, {withCredentials: true});
  }


  createDir(hash: string, name: string, dirHash: string): Observable<any> {
    let url = this.host + "/api/v1/files/dir";
    let payload: DirRequest = {
      hash: hash,
      name: name,
      dirHash: dirHash
    }
    return this.http.post(url, payload, {withCredentials: true})
  }

  // upload a single file
  uploadFile(dirHash: string, fileName: string, fileHash: string, fileType: string, file: File): Observable<any> {
    let url = this.host + "/api/v1/files/file";
    let formData = new FormData();
    let metadata: FileRequest = {
      fileHash: fileHash,
      fileName: fileName,
      fileType: fileType,
      dirHash: dirHash,
      fileSize: file.size,
    };
    console.log("metadata: ", metadata);
    formData.append("file", file);
    formData.append("metadata", JSON.stringify(metadata));
    return this.http.post(url, formData, {withCredentials: true, reportProgress: true, observe: 'events'});
  }

  downloadFile(fileHash: string, param: string) {
    let url = this.host + "/api/v1/files/file/" + fileHash;
    return this.http.get(url, {withCredentials: true, responseType: "blob", params: {"fileName": param}});
  }

  downloadDir(dirHash: string, param: string) {
    let url = this.host + "/api/v1/files/dir/" + dirHash;
    return this.http.get(url, {withCredentials: true, responseType: "blob", params: {"path": param}});
  }

  deleteFile(dirHash: string, fileHash: string) {
    let url = this.host + "/api/v1/files/file/" + dirHash +"/" + fileHash;
    return this.http.delete(url, {withCredentials: true});
  }

  deleteDir(dirHash: string) {
    let url = this.host + "/api/v1/files/dir/" + dirHash;
    return this.http.delete(url, {withCredentials: true});
  }

  // hash file using MD5 algorithm.
  // here we read file in chunks to avoid memory overflow
  async hashFile(file: File) {
    return new Promise<string>((resolve, reject) => {
      const fileSize = file.size;
      const chunks = Math.ceil(fileSize / environment.FILE_CHUNK_SIZE);
      let currentChunk = 0;
      const fileReader = new FileReader();
      const md5Hash = CryptoJS.algo.MD5.create();
      fileReader.onload = (e: any) => {  // called when it has read a chunk
        md5Hash.update(CryptoJS.lib.WordArray.create(e.target.result));
        currentChunk++;
        if (currentChunk < chunks) {
          loadNext();
        } else {
          const hash = md5Hash.finalize();
          const hashString = hash.toString(CryptoJS.enc.Hex);
          resolve(hashString);
        }
      };
      fileReader.onerror = (e) => {
        reject(e);
      };

      function loadNext() {
        const start = currentChunk * environment.FILE_CHUNK_SIZE;
        const end = Math.min(start + environment.FILE_CHUNK_SIZE, fileSize);
        fileReader.readAsArrayBuffer(file.slice(start, end));
      }

      loadNext();
    });
  }


  fileExists(hash: string): Observable<any> {
    let url = this.host + "/api/v1/files/metadata/file/" + hash;
    return this.http.get(url, {withCredentials: true});
  }

  hashChunk(chunk: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = (e: any) => {
        const hash = CryptoJS.algo.MD5.create();
        const hashString = hash.finalize(CryptoJS.lib.WordArray.create(e.target.result));
        resolve(hashString.toString(CryptoJS.enc.Hex));
      }
      fileReader.onerror = (e) => {
        reject(e);
      };

      fileReader.readAsArrayBuffer(chunk);
    })
  }

  uploadChunk(fileHash: string, chunkHash: string, index: number, totalChunks: number, blob: Blob): Observable<any> {
    return new Observable<any>((observer) => {
      let url = this.host + "/api/v1/files/chunks";
      let metadata = {
        "fileHash": fileHash,
        "chunkHash": chunkHash,
        "index": index,
        "totalChunks": totalChunks,
      };
      let formData = new FormData();
      formData.append("metadata", JSON.stringify(metadata));
      formData.append("chunk", blob);
      this.http.post(url, formData, {withCredentials: true}).subscribe(
        (response) => {
          observer.next(response);
          observer.complete();
        },
        (error) => {
          observer.error(error);
        }
      );
    });
  }

  uploadFileInChunks(file: File, fileHash: string, totalChunks: number, chunkIndexes: number[]): Observable<any> {
    console.log("chunk indexes: ", chunkIndexes);
    return from(chunkIndexes).pipe(
      // 计算每块的哈希值
      mergeMap((index: number) => {
        // 读取指定块的数据
        const start = index * environment.FILE_CHUNK_SIZE;
        const end = Math.min(start + environment.FILE_CHUNK_SIZE, file.size);
        const blob = file.slice(start, end);
        return from(this.hashChunk(blob)).pipe(
          map((hash) => ({index, blob, hash})),
        );
      }, environment.CONCURRENT_LIMIT),
      // 上传文件块
      mergeMap(({index, blob, hash}) => {
        return this.uploadChunk(fileHash, hash, index, totalChunks, blob);
      }, environment.CONCURRENT_LIMIT),
    );
  }


  mergeFileChunks(fileHash: string, fileName: string, fileType: string, dirHash: string, fileSize: number): Observable<any> {
    let url = this.host + "/api/v1/files/chunks/" + fileHash;
    let payload = {
      "fileHash": fileHash,
      "fileName": fileName,
      "fileType": fileType,
      "dirHash": dirHash,
      "fileSize": fileSize
    }
    return this.http.post(url, payload, {withCredentials: true});
  }

  getMissedChunks(fileHash: string): Observable<any> {
    let url = this.host + "/api/v1/files/chunks/" + fileHash;
    return this.http.get(url, {withCredentials: true});
  }

  starDir(dirHash: string): Observable<any> {
    let url = this.host + "/api/v1/files/metadata/dir/" + dirHash + "/star";
    return this.http.put(url, null, {withCredentials: true});
  }

  unstarDir(dirHash: string): Observable<any> {
    let url = this.host + "/api/v1/files/metadata/dir/" + dirHash + "/star";
    return this.http.delete(url, {withCredentials: true});
  }

  starFile(dirHash: string, fileHash: string): Observable<any> {
    let url = this.host + "/api/v1/files/metadata/file/" + dirHash + "/" + fileHash +"/star";
    return this.http.put(url, null, {withCredentials: true});
  }

  unstarFile(dirHash: string, fileHash: string): Observable<any> {
    let url = this.host + "/api/v1/files/metadata/file/" + dirHash + "/" + fileHash +"/star";
    return this.http.delete(url, {withCredentials: true});
  }
}
