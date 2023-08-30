import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {SiteLayoutComponent} from "./site-layout/site-layout.component";
import {LoginComponent} from "./login/login.component";
import {PageNotFoundComponent} from "./page-not-found/page-not-found.component";
import {UploadListComponent} from "./upload-list/upload-list.component";
import {ClrIconModule} from "@clr/angular";
import {TrashComponent} from "./trash/trash.component";

// 路由匹配有顺序，因此应该具体的在前面
const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    redirectTo: '/mydrive',
    pathMatch: 'full'
  },
  {
    path: 'mydrive',
    component: SiteLayoutComponent
  },
  {
    path: "dir/:dirHash",
    component: SiteLayoutComponent
  },
  {
    path: '',
    component: SiteLayoutComponent,
      children: [
        {
          path: 'trash',
          component: TrashComponent,
        },
      ]
  },

  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  declarations: [
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
