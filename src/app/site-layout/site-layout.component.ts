import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {FileService} from "../services/file.service";
import {v4 as uuid} from 'uuid';
import {NgForm} from "@angular/forms";
import {environment} from "../../environments/environment.development";
import {ActivatedRoute, Router} from "@angular/router";
import {LoginService} from "../services/login.service";
import {saveAs} from 'file-saver';
import {from, mergeMap} from "rxjs";
import {HttpEventType} from "@angular/common/http";
import {DirInPath, MyFile, UploadingFile, UploadingStatus} from "../models/file.model";
import {error} from "@angular/compiler-cli/src/transformers/util";
import {FileTableComponent} from "../file-table/file-table.component";

// import * as fs from 'fs'

@Component({
  selector: 'app-site-layout',
  templateUrl: './site-layout.component.html',
  styleUrls: ['./site-layout.component.css']
})
export class SiteLayoutComponent implements OnInit, AfterViewInit {
  @ViewChild(FileTableComponent)

  private fileTableComponent!: FileTableComponent;
  files: MyFile[] = [];
  // dirNameArray = ["我的云盘"];
  // dirHashArray: string[] = [];  // 与curDir一一对应
  dirPathArray: DirInPath[] = [];
  dirModalOpen = false;
  uploadModalOpen = false;
  StatusEnum = UploadingStatus
  newDirName = "";
  fileUploadingStatus: Map<string, UploadingFile> = new Map<string, UploadingFile>();  // map filename to uploading status
  uploadingNum = 0;

  constructor(private loginService: LoginService, public fileService: FileService,
              private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    // TODO 读取url参数，根据dirHash刷新，注意区分根目录 根目录显示为mydrive
    console.log("name array in ngOnInit: ", this.dirPathArray);
  }

  ngAfterViewInit() {
    this.route.paramMap.subscribe(params => {
      let paramDir = params.get("dirHash");
      if (paramDir) {
        // this.fileTableComponent.refreshFiles(paramDir);
        console.log("param dir:", paramDir);
        if (this.dirPathArray.length == 0 || paramDir !== this.getCurDirHash()) {
          // TODO trace directory names and hashes in the path
          this.fileService.getTraceDirs(paramDir).subscribe(
            (dirs: DirInPath[]) => {
              this.dirPathArray = dirs;
            },
            error => {
              console.error(error);
            }
          );
        }
        this.fileTableComponent.refreshFiles(paramDir);
      } else {
        let hashKey = localStorage.getItem("rootHash") !== null;
        let rootHash = "";
        if (hashKey) {
          console.log("get local stored root hash");
          rootHash = localStorage.getItem("rootHash") as string;
          this.dirPathArray.push({
            name: "我的云盘",
            hash: rootHash,
          });
          this.fileTableComponent.refreshFiles(rootHash);
        } else {  // maybe user clear the local storage
          this.router.navigate(['/login']);
        }
      }
    });
  }

  isHomePage(): boolean {
    return this.router.url === "/mydrive" || this.router.url.startsWith("/dir");
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
    this.dirPathArray.splice(index + 1);
    this.router.navigate(["/dir", this.dirPathArray[index].hash]);
    // 跳转
  }

  getCurDirPath() {
    let dirPath = this.dirPathArray[0].name;
    for (let i = 1; i < this.dirPathArray.length; i++) {
      dirPath = dirPath + "/" + this.dirPathArray[i].name;
    }
    return dirPath;
  }

  getCurDirHash() {
    return this.dirPathArray[this.dirPathArray.length - 1].hash;
  }

  // 更新当前文件夹的文件列表

  // 如果是文件夹，进入该文件夹；如果是文件，预览
  digDir(dir: MyFile) {
    // 更新当前文件夹信息
    this.router.navigate(["/dir", dir.fileHash]);
    this.dirPathArray.push({
      name: dir.name,
      hash: dir.fileHash,
    });
  }

  createDir(form: NgForm) {
    let hash: string = uuid();
    console.log("form:", form.value.name)
    this.fileService.createDir(hash, form.value.name as string, this.getCurDirHash()).subscribe(
      data => {
        console.log("create dir:", data.dir);
        // refresh current directory
        this.fileTableComponent.refreshFiles(this.getCurDirHash());
      },
      error => {
        console.error(error);
      }
    );
    this.dirModalOpen = false;
    form.reset();
  }

  openUploadModal() {
    this.uploadModalOpen = true;
  }

  noData(): boolean {
    // console.log("upload modal, uploading files: ", this.UploadingFiles);
    return this.fileUploadingStatus.size === 0;
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
            this.fileService.uploadFile(dirHash, fileName, fileHash, this.fileService.getFileType(file), file).subscribe(
              data => {
                console.log("create entry for existed file:", data.file);
                this.fileTableComponent.refreshFiles(this.getCurDirHash());
              }
            )
            this.uploadCompleted(file);
            resolve(file.name);
          } else { // 上传
            if (file.size < environment.FILE_SIZE_THRESHOLD) { // 文件大小小于阈值，直接上传
              this.fileService.uploadFile(dirHash, fileName, fileHash, this.fileService.getFileType(file), file).subscribe(
                resp => {
                  if (resp.type === HttpEventType.Response) {
                    console.log('Upload completed');
                    this.fileTableComponent.refreshFiles(this.getCurDirHash());
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
                        this.fileService.mergeFileChunks(fileHash, file.name, this.fileService.getFileType(file), this.getCurDirHash(), file.size).subscribe(
                          data => {
                            console.log("merged file chunks: ", data);
                            this.fileTableComponent.refreshFiles(this.getCurDirHash());
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

  cancelModal(modalForm: NgForm) {
    this.dirModalOpen = false;
    modalForm.resetForm();  // 重置表单，因此再次打开表单不会因为空输入而报错
    this.newDirName = "";
  }

}
