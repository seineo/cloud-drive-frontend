import { Component } from '@angular/core';
import {LoginService} from "../services/login.service";
import {Router} from "@angular/router";
import {error} from "@angular/compiler-cli/src/transformers/util";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {
  errorHidden = true;
  signupHidden = true;

  email = "";
  password = "";
  rememberMe = false;

  constructor(private loginService: LoginService, private router: Router) {
  }

  redirectHome() {
    this.router.navigate(['/home']);
  }
  onLogin() {
    this.loginService.login(this.email, this.password).subscribe(
      data => {
        console.log("user logged in:", data.user);
        // set rootHash in local storage
        if (localStorage.getItem("rootHash") === null) {
          localStorage.setItem("rootHash", data.user.rootHash);
        }
        this.redirectHome()
      },
      error => {
        this.errorHidden = false;

      }
    )
  }


}
