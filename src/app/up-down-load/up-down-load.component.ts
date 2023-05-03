import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-up-down-load',
  templateUrl: './up-down-load.component.html',
  styleUrls: ['./up-down-load.component.css']
})
export class UpDownLoadComponent {
  @Input() modalHidden: boolean | undefined;
  @Output() modalHiddenChange = new EventEmitter<boolean>();

  uploadActive = true;
  downloadActive = false;

  closeModal() {
    this.modalHidden = true;
    this.modalHiddenChange.emit(this.modalHidden)
  }

  // 0代表上传，1代表下载
  activateTab(tabNum: number) {
    if (tabNum == 0) {
      this.uploadActive = true;
      this.downloadActive = false;
    } else if (tabNum == 1) {
      this.uploadActive = false;
      this.downloadActive = true;
    }
  }
}
