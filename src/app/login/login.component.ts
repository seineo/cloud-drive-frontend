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
    this.router.navigate(['/']);
  }
  onLogin() {
    this.loginService.login(this.email, this.password).subscribe(
      data => {
        console.log("user logged in:", data.email);
      },
      error => {
        this.errorHidden = false;
      }
    )
  }


}
