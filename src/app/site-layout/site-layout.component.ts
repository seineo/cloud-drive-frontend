import {Component, OnInit} from '@angular/core';
import {FileService} from "../services/file.service";
import {v4 as uuid} from 'uuid';
import {NgForm} from "@angular/forms";
import {environment} from "../../environments/environment.development";
import {Router} from "@angular/router";
import {LoginService} from "../services/login.service";
import {saveAs} from 'file-saver';
import {from, mergeMap} from "rxjs";
import {HttpEventType} from "@angular/common/http";
import {MyFile, UploadingFile, UploadingStatus} from "../models/file.model";
import {error} from "@angular/compiler-cli/src/transformers/util";

// import * as fs from 'fs'

@Component({
  selector: 'app-site-layout',
  templateUrl: './site-layout.component.html',
  styleUrls: ['./site-layout.component.css']
})
export class SiteLayoutComponent implements OnInit {
  files: MyFile[] = [];
  curDir = ["我的云盘"];
  curDirHash: string[] = [];  // 与curDir一一对应
  dirModalOpen = false;
  deletionModalOpen = false;
  fileToDelete!: MyFile;
  newDirName = "";
  fileUploadingStatus: Map<string, UploadingFile> = new Map<string, UploadingFile>();  // map filename to uploading status
  uploadingNum = 0;

  constructor(private loginService: LoginService, private fileService: FileService, private router: Router) {
    // this.fileUploadingStatus.set("test-file1", {
    //   Name: "test-file1",
    //   Status: "Waiting",
    //   Progress: 40
    // } as UploadingFile);
    // this.fileUploadingStatus.set("test-file2test-file", {
    //   Name: "test-file2",
    //   Status: "Completed",
    //   Progress: 80
    // } as UploadingFile);
  }

  ngOnInit(): void {
    // happens when front end restarts or crashes, so read from local storage
    let hashKey = localStorage.getItem("rootHash") !== null;
    if (hashKey) {
      console.log("get local stored root hash");
      let rootHash = localStorage.getItem("rootHash") as string;
      console.log("root hash: ", rootHash);
      this.curDirHash.push(rootHash);
      this.updateCurDir();
      console.log("files: ", this.files);
    } else {  // maybe user clear the local storage
      this.router.navigate(['/login']);
    }
  }

  getFileType(file: File): string {
    if (file.type !== "") {
      return file.type
    }
    return file.name.split(".").pop() as string;
  }

  getFileIconType(file: MyFile): string {
    if (file.type === "application/pdf" || file.type == "dir") {
      return file.type
    } else if (file.type.startsWith("image")) {
      return "image"
    } else if (file.type.startsWith("video")) {
      return "video";
    } else if (file.type === "application/zip" || file.type === "application/gzip"
      || file.type === "application/x-rar-compressed" || file.type === "application/x-7z-compressed"
      || file.type === "application/x-tar") {
      return "zip"
    } else {
      return "file";
    }

  }

  /**
   * Format bytes as human-readable text.
   *
   * @param bytes Number of bytes.
   * @param si True to use metric (SI) units, aka powers of 1000. False to use
   *           binary (IEC), aka powers of 1024.
   * @param dp Number of decimal places to display.
   *
   * @return Formatted string.
   */
  humanFileSize(bytes: number, si=false, dp=1) {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }

    const units = si
      ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10**dp;

    do {
      bytes /= thresh;
      ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


    return bytes.toFixed(dp) + ' ' + units[u];
  }

  truncateMiddle(word: string) {
    const tooLongChars = 20;

    if (word.length < tooLongChars) {
      return word;
    }

    const ellipsis = '...';
    const charsOnEitherSide = Math.floor(tooLongChars / 2) - ellipsis.length;

    return word.slice(0, charsOnEitherSide) + ellipsis + word.slice(-charsOnEitherSide);
  }


  navigatePath(index: number) {
    // 删除目标目录后的路径
    this.curDir.splice(index + 1);
    this.curDirHash.splice(index + 1);
    console.log("after navigate, curDir:", this.curDir);
    console.log("after navigate, curDirHash:", this.curDirHash);
    // 跳转
    this.updateCurDir();
  }

  getCurDirPath() {
    let dirPath = this.curDir[0];
    for (let i = 1; i < this.curDir.length; i++) {
      dirPath = dirPath + "/" + this.curDir[i];
    }
    return dirPath;
  }

  getCurDirHash() {
    return this.curDirHash[this.curDirHash.length - 1];
  }

  // 更新当前文件夹的文件列表
  updateCurDir() {
    console.log("cur dir hash:", this.getCurDirHash());
    this.fileService.getFilesMetadata(this.getCurDirHash()).subscribe(
      data => {
        this.files = data;
      },
      error => {
        console.log("failed to find locally stored or correct root hash on server");
        localStorage.removeItem("rootHash");
        this.router.navigate(['/login']);
      });
  }

  // 如果是文件夹，进入该文件夹；如果是文件，预览
  digDir(dir: MyFile) {
    // 更新当前文件夹信息
    this.curDir.push(dir.name);
    this.curDirHash.push(dir.hash);
    // 跳转，更新当前文件夹下文件
    this.updateCurDir();
  }

  createDir(form: NgForm) {
    let hash: string = uuid();
    console.log("form:", form.value.name)
    this.fileService.createDir(hash, form.value.name as string, this.getCurDirHash()).subscribe(
      data => {
        console.log("create dir:", data.dir);
        // refresh current directory
        this.updateCurDir();
      },
      error => {
        console.error(error);
      }
    );
    this.dirModalOpen = false;
    form.reset();
  }

  async onFileSelected(event: Event) {
    console.log("selected event:", event);
    const files = (event.target as HTMLInputElement).files;
    // 清除上传信息
    this.fileUploadingStatus.clear();
    // 异步并发上传文件
    if (files) {
      from(files).pipe(
        mergeMap((file: File) => {
          return this.uploadFile(file);
        }, environment.CONCURRENT_LIMIT)
      ).subscribe(
        () => {
          console.log("文件上传完毕");
        },
        error => {
          console.error("文件上传出错： ", error);
        }
      );
    }
  }

  uploadCompleted(file: File) {
    this.uploadingNum -= 1;
    this.fileUploadingStatus.set(file.name, {
      name: file.name,
      status: UploadingStatus.COMPLETED,
      progress: 100
    } as UploadingFile);
  }

  uploadProgressing(file: File, percent: number) {
    this.fileUploadingStatus.set(file.name, {
      name: file.name,
      status: UploadingStatus.UPLOADING,
      progress: percent
    } as UploadingFile);
  }

  async uploadFile(file: File): Promise<any> {
    // TODO 文件大小大于上限则不允许上传
    // 初始化文件上传的状态
    this.uploadingNum += 1;
    this.fileUploadingStatus.set(file.name, {
      name: file.name,
      status: UploadingStatus.WAITING,
      progress: 0
    } as UploadingFile);
    let fileHash = await this.fileService.hashFile(file);

    return new Promise<string>((resolve, reject) => {
      // 使用hash查看是否有相同的文件，有则"秒传"
      // 没有相同文件则上传该文件
      this.fileService.fileExists(fileHash).subscribe(data => {
          let dirHash = this.getCurDirHash();
          let fileName = file.name;
          if (data.exist) { // 秒传
            console.log("秒传");
            // 秒传的效果：直接progress 100%
            this.fileService.uploadFile(dirHash, fileName, fileHash, this.getFileType(file), file).subscribe(
              data => {
                console.log("create entry for existed file:", data.file);
                this.updateCurDir();
              }
            )
            this.uploadCompleted(file);
            resolve(file.name);
          } else { // 上传
            if (file.size < environment.FILE_SIZE_THRESHOLD) { // 文件大小小于阈值，直接上传
              this.fileService.uploadFile(dirHash, fileName, fileHash, this.getFileType(file), file).subscribe(
                resp => {
                  if (resp.type === HttpEventType.Response) {
                    console.log('Upload completed');
                    this.updateCurDir();
                    this.uploadCompleted(file);
                    resolve(fileName);
                  }
                  if (resp.type === HttpEventType.UploadProgress) {
                    const percentDone = Math.round(100 * resp.loaded / resp.total);
                    console.log('Progress ' + percentDone + '%');
                    this.uploadProgressing(file, percentDone);
                  }
                },
                error => {
                  reject(error);
                }
              );
            } else {  // 文件大于阈值，分块上传
              console.log("分块上传！");
              const totalChunks = Math.ceil(file.size / environment.FILE_CHUNK_SIZE);
              // 分片上传前先获取未上传的分块列表
              this.fileService.getMissedChunks(fileHash).subscribe(
                data => {
                  let chunkCount = 0;
                  let chunkIndexes = Array.from({length: totalChunks}, (_, i) => i);
                  if (data.exists) { // 只上传缺失的文件块
                    // 接上 上次的上传进度条
                    console.log("missed chunks: ", data.missedChunks);
                    chunkCount = totalChunks - data.missedChunks.length;
                    chunkIndexes = data.missedChunks;
                    let percentDone = Math.round(100 * chunkCount / totalChunks)
                    this.uploadProgressing(file, percentDone);
                  }
                  this.fileService.uploadFileInChunks(file, fileHash, totalChunks, chunkIndexes).subscribe({
                      // 当前块处理成功
                      next: (result) => {
                        console.log("uploaded a chunk: ", result);
                        chunkCount += 1;
                        const percentDone = Math.round(100 * chunkCount / totalChunks);
                        console.log('Chunk Progress ' + percentDone + '%');
                        this.uploadProgressing(file, percentDone);
                      },
                      // 错误处理
                      error: (error) => {
                        reject(error);
                      },
                      // 所有文件块上传完成，请求后端合并
                      complete: () => {
                        this.fileService.mergeFileChunks(fileHash, file.name, this.getFileType(file), this.getCurDirHash(), file.size).subscribe(
                          data => {
                            console.log("merged file chunks: ", data);
                            this.updateCurDir();
                            this.uploadCompleted(file);
                            resolve(file.name);
                            // window.location.reload();
                          },
                          error => {
                            reject(error);
                          }
                        );
                      }
                    }
                  );
                },
                error => {
                  console.error(error);
                }
              )

            }
          }
        },
        error => {
          reject(error);
        }
      );
    });

  }

  downloadFile(file: MyFile) {
    let param = file.name;
    let observableBlob = this.fileService.downloadFile(file.hash, param);
    if (file.type === "dir") {
      param = this.getCurDirPath() + file.name;
      observableBlob = this.fileService.downloadDir(file.hash, param);
    }
    observableBlob.subscribe(
      (resp) => {
        if (file.type === "dir") {
          saveAs(resp, file.name + ".zip");
        } else {
          saveAs(resp, file.name);
        }
      },
      error => {
        console.error(error);
      }
    );
  }

  deleteFile(file: MyFile) {
    let observable= this.fileService.deleteDir(file.hash);
    if (file.type !== "dir") {
      observable = this.fileService.deleteFile(this.getCurDirHash(), file.hash);
    }
    observable.subscribe(
      (resp) => {
        console.log("successfully deleted");
        this.deletionModalOpen = false;
        this.updateCurDir();
      },
      error => {
        console.error(error);
      }
    );
  }

  onDoubleClick(file: MyFile) {
    if (file.type == "dir") {
      this.digDir(file);
    } else {
      // TODO 支持预览
      console.log("预览暂时不支持")
    }
  }

  cancelModal(modalForm: NgForm) {
    this.dirModalOpen = false;
    modalForm.resetForm();  // 重置表单，因此再次打开表单不会因为空输入而报错
    this.newDirName = "";
  }
}
