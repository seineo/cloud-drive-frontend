import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ClarityModule } from "@clr/angular";
import '@cds/core/icon/register.js';
import {
  ClarityIcons,
  cogIcon,
  cloudIcon,
  clockIcon,
  pictureIcon,
  fileIcon,
  plusCircleIcon,
  shareIcon,
  starIcon,
  trashIcon,
  uploadCloudIcon,
  downloadCloudIcon,
  windowCloseIcon,
  successStandardIcon,
  folderIcon,
  fileZipIcon,
  videoCameraIcon,
  imageIcon,
  eyeIcon,
  historyIcon,
  eraserIcon, hardDiskIcon
} from '@cds/core/icon';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SiteLayoutComponent } from './site-layout/site-layout.component';
import { HeaderComponent } from './header/header.component';
import { LoginComponent } from './login/login.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { SignUpComponent } from './sign-up/sign-up.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import {AuthInterceptorService} from "./services/auth-interceptor.service";
import { UploadListComponent } from './upload-list/upload-list.component';
import {pdfFileIcon} from "@cds/core/icon/shapes/pdf-file";
import {TrashComponent} from "./trash/trash.component";

ClarityIcons.addIcons(cogIcon, cloudIcon, clockIcon, pictureIcon, fileIcon, plusCircleIcon,
  shareIcon, starIcon, trashIcon, uploadCloudIcon, downloadCloudIcon, windowCloseIcon,
  successStandardIcon, folderIcon, fileIcon, fileZipIcon, pdfFileIcon, videoCameraIcon, imageIcon,
  eyeIcon, historyIcon, eraserIcon, hardDiskIcon);
@NgModule({
  declarations: [
    AppComponent,
    SiteLayoutComponent,
    HeaderComponent,
    LoginComponent,
    SignUpComponent,
    PageNotFoundComponent,
    UploadListComponent,
    TrashComponent
  ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        ClarityModule,
        AppRoutingModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
    ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
