import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Router} from "@angular/router";
import {LoginService} from "../services/login.service";
import {error} from "@angular/compiler-cli/src/transformers/util";
import {UploadingFile} from "../services/file.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Input() uploadingFiles!: Map<string, UploadingFile>;
  @Input() uploadingNum!: number;
  up_down_load_hidden = true;
  constructor(private router: Router, private loginService: LoginService) {
  }

  redirect(page: string) {
    this.router.navigate(["/" + page]);
  }

  logout() {
    this.loginService.logout().subscribe(
      () => {
        this.redirect("login");
      },
      error => {
        console.error(error);
      }
    );
  }


}
