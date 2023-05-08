import {Component, OnInit} from '@angular/core';
import {FileService} from "../services/file.service";
import * as uuid from 'uuid';
import {Form, NgForm} from "@angular/forms";
import {SHA1} from 'crypto-js'
import {error} from "@angular/compiler-cli/src/transformers/util";
import {environment} from "../../environments/environment.development";
import {Router} from "@angular/router";

// import * as fs from 'fs'

interface File {
  Hash: string,
  Name: string
  UserID: number
  FileType: string // dir, pdf, img, video...
  Size: number
  DirPath: string // virtual directory path shown for users
  Location: string // real file storage path
  CreateTime: string
}

@Component({
  selector: 'app-site-layout',
  templateUrl: './site-layout.component.html',
  styleUrls: ['./site-layout.component.css']
})
export class SiteLayoutComponent implements OnInit {
  state: any;
  files: File[] = [];
  curDir = ["我的云盘"];
  modelOpen = false;
  newDirName = "";
  showUploadToast = true;
  uploadProgress = 0.5
  uploadStatus = "running";

  constructor(private fileService: FileService, private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    this.state = navigation?.extras.state as {
      data : string
    }
  }

  ngOnInit(): void {
    // console.log("file hash: ", this.state.data);
    this.fileService.getFilesMetadata(this.state.data).subscribe(data => {
      this.files = data.files;
    });
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
    let dirPath = this.curDir[0];
    for (let i = 1; i <= index; i++) {
      dirPath = dirPath + "/" + this.curDir[i];
    }
    console.log("target dirPath:", dirPath)
    this.fileService.getFilesMetadata(dirPath).subscribe(data => {
      this.files = data.files;
    });
    // 删除目标目录后的路径
    this.curDir.splice(index + 1);
    console.log("after navigate, curDir:", this.curDir);
  }

  getCurDir() {
    let dirPath = this.curDir[0];
    for (let i = 1; i < this.curDir.length; i++) {
      dirPath = dirPath + "/" + this.curDir[i];
    }
    return dirPath;
  }

  // 如果是文件夹，进入该文件夹；如果是文件，预览
  digFile(file: File) {
    if (file.FileType == "dir") {
      this.curDir.push(file.Name);
      let dirPath = this.getCurDir();
      console.log("target dirPath:", dirPath)
      this.fileService.getFilesMetadata(dirPath).subscribe(data => {
        this.files = data.files;
      });
    } else {
      console.log("预览功能暂不支持");
      // TODO 增加预览功能
    }
  }

  createDir(form: NgForm) {
    let curDir = this.getCurDir();
    this.fileService.uploadFile(curDir, this.newDirName, uuid.v4(), "dir").subscribe(
      data => {
        console.log("create dir:", data.file);
        // refresh current directory
        this.fileService.getFilesMetadata(curDir).subscribe(data => {
          this.files = data.files;
        });
      },
      error => {
        console.error(error);
      }
    );
    this.modelOpen = false;
    form.reset();
  }

  async onFileSelected(event: Event) {
    console.log("selected event:", event);
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      let file = files[0];   // 先假定只有一个文件
      let fileHash = await this.fileService.hashFile(file);
      console.log("file hash: ", fileHash);
      // 使用hash查看是否有相同的文件，有则"秒传"
      // 没有相同文件则上传该文件
      this.fileService.fileExists(fileHash).subscribe(data => {
          if (data.exist) { // 秒传
            console.log("秒传");
            // TODO 秒传的前端显示效果
          } else { // 上传
            if (file.size < environment.FILE_SIZE_THRESHOLD) { // 文件大小小于阈值，直接上传
              let curDir = this.getCurDir();
              let fileName = file.name;
              this.fileService.uploadFile(curDir, fileName, fileHash, file.type, file).subscribe(
                data => {
                  console.log("upload file:", fileName);
                  console.log("response after uploading:", data.file);
                },
                error => {
                  console.error(error);
                }
              )
            } else {  // 文件大于阈值，分块上传
              this.fileService.uploadFileInChunks(file, fileHash).subscribe({
                  // 当前块处理成功
                  next: (result) => {
                    console.log("uploaded a chunk: ", result);
                  },
                  // 错误处理
                  error: (error) => {
                    console.error(error);
                  },
                  // 所有文件块上传完成，请求后端合并
                  complete: () => {
                    this.fileService.mergeFileChunks(fileHash, file.name, file.type, this.getCurDir(), file.size).subscribe(
                      data => {
                        console.log("merged file chunks: ", data);
                      },
                      error => {
                        console.error(error);
                      }
                    )
                  }
                }
              )
            }
          }
        },
        error => {
          console.error(error);
        }
      )
    }
  }
}
