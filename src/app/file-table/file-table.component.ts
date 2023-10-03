import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MyFile, TimeShowed} from "../models/file.model";
import {FileService} from "../services/file.service";
import {ActivatedRoute, Router} from "@angular/router";
import {saveAs} from "file-saver";
import {environment} from "../../environments/environment.development";

@Component({
  selector: 'app-file-table',
  templateUrl: './file-table.component.html',
  styleUrls: ['./file-table.component.css']
})
export class FileTableComponent implements OnInit {
  TimeShowed = TimeShowed;
  previewFilePath = "";
  previewModelOpen = false;
  previewFileName = "";
  @Input() timeShowed: TimeShowed = TimeShowed.CREATED;
  @Output() dirEvent = new EventEmitter<MyFile>();
  files: MyFile[] = [];

  constructor(public fileService: FileService, private router: Router,  private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    console.log("in file table, url:", this.router.url);
    if (this.router.url === "/mydrive" || this.router.url.startsWith("/dir")) { // 首页
      this.route.paramMap.subscribe(params => {
        let paramDir = params.get("dirHash");
        console.log("in file table, paramDir:", paramDir);
        if (paramDir) {  // 如果不是根目录
          this.fileService.getFilesMetadata(paramDir).subscribe(
            data => {
              this.files = data;
            }
          );
        } else {
          let hashKey = localStorage.getItem("rootHash") !== null;
          let rootHash = "";
          if (hashKey) {
            rootHash = localStorage.getItem("rootHash") as string;
            this.fileService.getFilesMetadata(rootHash).subscribe(
              data => {
                this.files = data;
              }
            );
          } else {
            this.router.navigate(['/login']);
          }
        }
      });
    } else if (this.router.url === "/starred") {  // 星标页
      this.fileService.getStarredFiles().subscribe(
        data => {
          this.files = data;
        }
      );
    }
  }

  refreshFiles(dirHash: string) {
    console.log("called refresh");
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

  previewFile(file: MyFile) {
    this.previewModelOpen = true;
    this.previewFileName = file.name
    this.previewFilePath = `${environment.API_URL}/api/v1/files/file/${file.fileHash}?fileName=${file.name}&action=preview`;
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
      () => {
        this.refresh();
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
          () => {
            this.refresh();
          },
          error => {
            console.error(error);
          }
        );
      } else {
        this.fileService.starFile(file.directoryHash, file.fileHash).subscribe(
          () => {
            this.refresh();
          },
          error => {
            console.error(error);
          }
        );
      }
    } else {
      if (file.type === "dir") {
        this.fileService.unstarDir(file.fileHash).subscribe(
          () => {
            this.refresh();
          },
          error => {
            console.error(error);
          }
        );
      } else {
        this.fileService.unstarFile(file.directoryHash, file.fileHash).subscribe(
          () => {
            this.refresh();
          },
          error => {
            console.error(error);
          }
        );
      }
    }
  }
}
