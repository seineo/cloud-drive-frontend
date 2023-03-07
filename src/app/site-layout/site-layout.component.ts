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
    for (let i = 0; i < 5; i++) {
      this.testData.push("file" + i.toString() + ".txt");
    }
    this.testData.push("hello-world!-I-am-liyuewei.txt");
    this.testData.push("hello-world!-I-am-liyuewei.txt");
    this.testData.push("hello-world!-I-am-liyuewei.txt");
    this.testData.push("hello-world!-I-am-liyuewei.txt");
    this.testData.push("hello-world!-I-am-liyuewei.txt");
    this.testData.push("hello-world!-I-am-liyuewei.txt");
    this.testData.push("hello-world!-I-am-liyuewei.txt");
    this.testData.push("hello-world!-I-am-liyuewei.txt");
    this.testData.push("hi.txt");

  }

  truncateMiddle(word: string) {
    const tooLongChars = 20; // arbitrary

    if (word.length < tooLongChars) {
      return word;
    }

    const ellipsis = '...';
    const charsOnEitherSide = Math.floor(tooLongChars / 2) - ellipsis.length;

    return word.slice(0, charsOnEitherSide) + ellipsis + word.slice(-charsOnEitherSide);
  }

  onDBClick() {
    this.router.navigate(['/login']);
  }
}
