import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {from, map, mergeMap, Observable} from "rxjs";
import {environment} from "../../environments/environment.development";
import * as CryptoJS from 'crypto-js';
import {resolve} from "@angular/compiler-cli";
import {error} from "@angular/compiler-cli/src/transformers/util";


@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private http: HttpClient) {
  }

  // dirPath should start without slash
  getFilesMetadata(fileHash: string): Observable<any> {
    let url = environment.API_URL + "/api/v1/files/metadata/" + fileHash;
    return this.http.get(url, {withCredentials: true});
  }

  // create file or directory
  uploadFile(dirPath: string, fileName: string, fileHash: string, fileType: string, file?: File): Observable<any> {
    let url = environment.API_URL + "/api/v1/files/data";
    let formData = new FormData();
    let metadata = {
      "fileHash": fileHash,
      "fileName": fileName,
      "fileType": fileType,
      "dirPath": dirPath,
      "fileSize": 0
    };
    if (file) {
      formData.append("file", file);
      metadata["fileSize"] = file.size;
    }
    formData.append("metadata", JSON.stringify(metadata))
    return this.http.post(url, formData, {withCredentials: true});
  }

  downloadFile(dirPath: string, fileName: string): Observable<any> {
    let url = environment.API_URL + "/api/v1/files/data/" + dirPath;
    let queryParams = new HttpParams();
    queryParams = queryParams.append("fileName", fileName);
    return this.http.get(url, {params: queryParams, withCredentials: true});
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
    let url = environment.API_URL + "/api/v1/files/hash/" + hash;
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
      let url = environment.API_URL + "/api/v1/files/chunks";
      let fileReader = new FileReader();
      fileReader.readAsArrayBuffer(blob);
      let base64 = "";
      fileReader.onload = () => {
        // convert blob object to base64-encoded string
        const buffer = fileReader.result as ArrayBuffer;
        base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        let payload = {
          "fileHash": fileHash,
          "chunkHash": chunkHash,
          "index": index,
          "totalChunks": totalChunks,
          "blob": base64,
        };
        console.log("payload:", payload);
        this.http.post(url, payload, {withCredentials: true}).subscribe(
          (response) => {
            observer.next(response);
            observer.complete();
          },
          (error) => {
            observer.error(error);
          }
        );
      }
    });
  }

  uploadFileInChunks(file: File, fileHash: string): Observable<any> {
    const totalChunks = Math.ceil(file.size / environment.FILE_CHUNK_SIZE);
    const chunkIndexes = Array.from({length: totalChunks}, (_, i) => i);
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
        return this.uploadChunk(fileHash, hash, index + 1, totalChunks, blob);
      }, environment.CONCURRENT_LIMIT),
    );
  }

  mergeFileChunks(fileHash: string, fileName: string, fileType: string, dirPath: string, fileSize: number): Observable<any> {
    let url = environment.API_URL + "/api/v1/files/chunks/" + fileHash;
    let payload = {
      "fileHash": fileHash,
      "fileName": fileName,
      "fileType": fileType,
      "dirPath": dirPath,
      "fileSize": fileSize
    }
    return this.http.post(url, payload, {withCredentials: true});
  }
}