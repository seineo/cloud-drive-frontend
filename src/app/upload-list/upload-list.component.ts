import {Component, EventEmitter, Input, Output} from '@angular/core';
import {UploadingFile} from "../services/file.service";

@Component({
  selector: 'app-upload-list',
  templateUrl: './upload-list.component.html',
  styleUrls: ['./upload-list.component.css']
})
export class UploadListComponent {
  @Input() UploadingFiles!: Map<string, UploadingFile>;
  @Input() modalHidden: boolean | undefined;
  @Output() modalHiddenChange = new EventEmitter<boolean>();

  closeModal() {
    this.modalHidden = true;
    this.modalHiddenChange.emit(this.modalHidden)
  }

  noData(): boolean {
    // console.log("upload modal, uploading files: ", this.UploadingFiles);
    return this.UploadingFiles.size === 0;
  }


  cancelUpload() {

  }
}
