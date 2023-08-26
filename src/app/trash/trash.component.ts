import {Component, OnInit} from '@angular/core';
import {MyFile} from "../models/file.model";
import {FileService} from "../services/file.service";
import {error} from "@angular/compiler-cli/src/transformers/util";

@Component({
  selector: 'app-trash',
  templateUrl: './trash.component.html',
  styleUrls: ['./trash.component.css']
})
export class TrashComponent implements OnInit {
  files: MyFile[] = [];

  constructor(public fileService: FileService) {
  }

  ngOnInit() {
    this.refreshTrash();
  }

  refreshTrash() {
    this.fileService.getTrashFiles().subscribe(
      data => {
        this.files = data;
      }
    );
  }

  clearTrash() {
    this.fileService.clearTrash().subscribe(
      data => {
        this.refreshTrash();
      },
      error => {
        console.error(error);
      }
    );
  }

  restoreFile(file: MyFile) {
    if (file.type === "dir") {
      this.fileService.restoreTrashDir(file.fileHash).subscribe(
        data => {
          this.refreshTrash();
        },
        error => {
          console.error(error);
        }
      );
    } else {
      this.fileService.restoreTrashFile(file.directoryHash, file.fileHash).subscribe(
        data => {
          this.refreshTrash();
        },
        error => {
          console.error(error);
        }
      );
    }
  }

  deleteTrashFile(file: MyFile) {
    if (file.type === "dir") {
      this.fileService.deleteTrashDir(file.fileHash).subscribe(
        data => {
          this.refreshTrash();
        },
        error => {
          console.error(error);
        }
      );
    } else {
      this.fileService.deleteTrashFile(file.directoryHash, file.fileHash).subscribe(
        data => {
          this.refreshTrash();
        },
        error => {
          console.error(error);
        }
      )
    }
  }
}
