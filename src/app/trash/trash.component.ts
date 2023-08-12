import {Component, OnInit} from '@angular/core';
import {MyFile} from "../models/file.model";
import {FileService} from "../services/file.service";

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
    this.fileService.getTrashFiles().subscribe(
      data => {
        this.files = data;
      }
    )
  }
}
