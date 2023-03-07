import { Component } from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-site-layout',
  templateUrl: './site-layout.component.html',
  styleUrls: ['./site-layout.component.css']
})
export class SiteLayoutComponent {
  testData:string[] = [];

  constructor(private router: Router) {
    for (let i = 0; i < 10; i++) {
      this.testData.push("file" + i.toString() + ".txt");
    }
  }

  onDBClick() {
    this.router.navigate(['/login']);
  }
}
