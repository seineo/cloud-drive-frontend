import { Component } from '@angular/core';
import {loginForm} from "../user";
import {LoginService} from "../login.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {
  login = new loginForm("","", false)
  errorHidden = true
  signupHidden = true

  constructor(private loginService: LoginService) {
    console.log(loginService.currentUser)
  }

  onLogin() {
    console.log(this.login)
  }

}
