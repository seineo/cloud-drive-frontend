import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {MyFile, TimeShowed} from "../models/file.model";
import {Router} from "@angular/router";
import {FileService} from "../services/file.service";
import {FileTableComponent} from "../file-table/file-table.component";

@Component({
  selector: 'app-star',
  templateUrl: './star.component.html',
  styleUrls: ['./star.component.css']
})
export class StarComponent implements AfterViewInit{
  @ViewChild(FileTableComponent)

  private fileTableComponent!: FileTableComponent;
  TimeShowed = TimeShowed

  constructor(public fileService: FileService, private router: Router) {
  }

  ngAfterViewInit(): void {
    // this.fileTableComponent.refreshFiles();
  }

  digDir(dir: MyFile) {
    this.router.navigate(["/dir", dir.fileHash]);
  }

}
