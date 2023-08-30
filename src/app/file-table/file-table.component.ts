import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MyFile} from "../models/file.model";
import {LoginService} from "../services/login.service";
import {FileService} from "../services/file.service";
import {ActivatedRoute, Router} from "@angular/router";
import {saveAs} from "file-saver";

@Component({
  selector: 'app-file-table',
  templateUrl: './file-table.component.html',
  styleUrls: ['./file-table.component.css']
})
export class FileTableComponent implements OnInit {
  files: MyFile[] = [];
  @Output() dirEvent = new EventEmitter<MyFile>();

  constructor(public fileService: FileService, private router: Router) {
  }

  ngOnInit() {
  }

  refreshFiles(dirHash: string) {
    this.fileService.getFilesMetadata(dirHash).subscribe(
      data => {
        this.files = data;
      },
      error => {
        console.log(error);
      });
  }

  emitDirHash(dir: MyFile) {
    this.dirEvent.emit(dir);
  }

  onDoubleClick(file: MyFile) {
    if (file.type == "dir") {
      this.emitDirHash(file);
    } else {
      // TODO 支持预览
      console.log("预览暂时不支持")
    }
  }

  downloadFile(file: MyFile) {
    let param = file.name;
    let observableBlob = this.fileService.downloadFile(file.fileHash, param);
    if (file.type === "dir") {
      param = `${file.directoryHash}/${file.name}`;
      observableBlob = this.fileService.downloadDir(file.fileHash, param);
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
    let observable = this.fileService.deleteDir(file.fileHash);
    if (file.type !== "dir") {
      observable = this.fileService.deleteFile(file.directoryHash, file.fileHash);
    }
    observable.subscribe(
      (resp) => {
        this.refreshFiles(file.directoryHash);
      },
      error => {
        console.error(error);
      }
    );
  }

  starFile(file: MyFile) {
    if (!file.isStarred) {
      if (file.type === "dir") {
        this.fileService.starDir(file.fileHash).subscribe(
          data => {
            this.refreshFiles(file.directoryHash);
          },
          error => {
            console.error(error);
          }
        );
      } else {
        this.fileService.starFile(file.directoryHash, file.fileHash).subscribe(
          data => {
            this.refreshFiles(file.directoryHash);
          },
          error => {
            console.error(error);
          }
        );
      }
    } else {
      if (file.type === "dir") {
        this.fileService.unstarDir(file.fileHash).subscribe(
          data => {
            this.refreshFiles(file.directoryHash);
          },
          error => {
            console.error(error);
          }
        );
      } else {
        this.fileService.unstarFile(file.directoryHash, file.fileHash).subscribe(
          data => {
            this.refreshFiles(file.directoryHash);
          },
          error => {
            console.error(error);
          }
        );
      }
    }
  }
}
