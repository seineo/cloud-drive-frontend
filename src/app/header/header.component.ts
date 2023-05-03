import { Component } from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  up_down_load_hidden = true;
  constructor(private router: Router) {
  }

  redirect(page: string) {
    this.router.navigate(["/" + page]);
  }
}
