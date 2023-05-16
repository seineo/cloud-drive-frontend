import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-up-down-load',
  templateUrl: './up-down-load.component.html',
  styleUrls: ['./up-down-load.component.css']
})
export class UpDownLoadComponent {
  @Input() modalHidden: boolean | undefined;
  @Output() modalHiddenChange = new EventEmitter<boolean>();

  closeModal() {
    this.modalHidden = true;
    this.modalHiddenChange.emit(this.modalHidden)
  }

}
