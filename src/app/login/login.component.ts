import { Component } from '@angular/core';
import {LoginService} from "../services/login.service";
import {Router} from "@angular/router";

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

  redirectHome(rootHash: string) {
    this.router.navigate(['/home'], {state: {data: rootHash}});
  }
  onLogin() {
    this.loginService.login(this.email, this.password).subscribe(
      data => {
        console.log("user logged in:", data.user)
        this.redirectHome(data.user.rootHash)
      }
    )
  }


}
