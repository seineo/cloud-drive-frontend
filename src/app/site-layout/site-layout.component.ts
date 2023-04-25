import {Component, OnInit} from '@angular/core';
import {FileService} from "../services/file.service";
import * as uuid from 'uuid';
import {Form, NgForm} from "@angular/forms";

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
  files: File[] = [];
  curDir = ["我的云盘"];
  modelOpen = false;
  newDirName = "";

  constructor(private fileService: FileService) {
  }

  ngOnInit(): void {
    this.fileService.getFilesMetadata(this.curDir[0]).subscribe(data => {
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


  uploadFile() {

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
        console.error(error)
      }
    );
    this.modelOpen = false;
    form.reset();
  }
}
