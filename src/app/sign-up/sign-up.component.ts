import {Component, ElementRef, EventEmitter, Input, Output, ViewChild,} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {ClrLoadingState, ClrStepButton} from "@clr/angular";
import {LoginService} from "../services/login.service";
import {Router} from "@angular/router";
import {UserSignResponse} from "../models/user.model";

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})

export class SignUpComponent {
  @Input() modalHidden: boolean | undefined;
  @Output() modalHiddenChange = new EventEmitter<boolean>();
  codeErrorHidden = true;
  form: FormGroup;
  emailID = "";
  @ViewChild("emailNext", {static: false, read: ClrStepButton}) emailNextButton!: ClrStepButton;
  @ViewChild("codeNext", {static: false, read: ClrStepButton}) codeNextButton!: ClrStepButton;
  @ViewChild("passwordNext", {static: false, read: ClrStepButton}) passwordNextButton!: ClrStepButton;

  closeModal() {
    this.modalHidden = true;
    this.modalHiddenChange.emit(this.modalHidden)
  }

  constructor(private formBuilder: FormBuilder, private loginService: LoginService, private router: Router) {
    this.form = this.formBuilder.group({
      info: this.formBuilder.group({
        name: new FormControl("", [Validators.required, Validators.maxLength(20)]),
        email: new FormControl("", [Validators.required, Validators.email])
      }),
      auth: this.formBuilder.group({
        code: new FormControl("", Validators.required)
      }),
      password: this.formBuilder.group({
        password: new FormControl("",
          [Validators.required, Validators.maxLength(20),
            Validators.pattern("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&.]).{8,}")]),
        confirm: ["", Validators.required],
      }),
    });

    this.form.get("password")?.addValidators(matchValidator(
      this.form.get("password.password") as AbstractControl,
      this.form.get("password.confirm") as AbstractControl));
  }

  sendAuthCode() {
    let email = this.form.get("info.email")?.value;
    console.log("authCode target email:", email)
    this.loginService.sendAuthEmail(email).subscribe(
      data => {
        console.log("sendCode response:", data)
        this.emailID = data.emailID
      },
      error => console.error(error)
    );
  }

  emailClickNext() {
    if (this.form.get("info")?.valid) {  // means input passes all validation
      this.sendAuthCode()
    }
    this.emailNextButton.navigateToNextPanel();
  }

  checkCode() {
    let inputCode = this.form.get("auth.code")?.value;
    let email = this.form.get("info.email")?.value;

    this.loginService.getAuthCode(this.emailID, email).subscribe(
      data => {
        console.log("input: %s code: %s", inputCode, data.code)
        if (data.code === inputCode) {
          console.log("auth pass");
          this.codeErrorHidden = true;
          this.codeNextButton.navigateToNextPanel();
        } else {
          console.log("auth fail");
          this.codeErrorHidden = false;
        }
      },
      error => console.error(error)
    )
  }

  redirectHome() {
    this.router.navigate(['/mydrive']);
  }

  submit() {
    let name = this.form.get("info.name")?.value;
    let email = this.form.get("info.email")?.value;
    let password = this.form.get("password.password")?.value;
    this.loginService.signUp(name, email, password).subscribe(
      data => {
        console.log("user registered:", data.email);
        this.loginService.login(email, password).subscribe(
          data => {
            console.log("user logged in:", data.email);
            this.redirectHome();
          },
          error => console.log(error)
        );
      },
      error => console.error(error)
    );
  }
}

function matchValidator(
  controlOne: AbstractControl,
  controlTwo: AbstractControl
): ValidatorFn {
  return () => {
    let stringOne = controlOne.value;
    let stringTwo = controlTwo.value;
    // console.log("password: ", stringOne);
    // console.log("confirm: ", stringTwo);
    if (stringOne !== stringTwo)
      return {match_error: 'Value does not match'};
    return null;
  };
}
