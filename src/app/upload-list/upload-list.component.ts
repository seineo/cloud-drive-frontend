import {Component, EventEmitter, Input, Output} from '@angular/core';
import {UploadingFile, UploadingStatus} from "../file.model";

@Component({
  selector: 'app-upload-list',
  templateUrl: './upload-list.component.html',
  styleUrls: ['./upload-list.component.css']
})
export class UploadListComponent {
  @Input() UploadingFiles!: Map<string, UploadingFile>;
  @Input() modalHidden: boolean | undefined;
  @Output() modalHiddenChange = new EventEmitter<boolean>();
  StatusEnum = UploadingStatus

  closeModal() {
    this.modalHidden = true;
    this.modalHiddenChange.emit(this.modalHidden)
  }

  noData(): boolean {
    // console.log("upload modal, uploading files: ", this.UploadingFiles);
    return this.UploadingFiles.size === 0;
  }


  cancelUpload() {
    console.log("取消上传！");
  }
}
