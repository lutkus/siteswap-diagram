import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';


import { AppComponent } from './app.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { AboutComponent } from './about/about.component';
import { ConfigComponent } from './config/config.component';
import { SiteswapDiagramComponent } from './siteswap-diagram/siteswap-diagram.component';
import { LadderDiagramComponent } from './ladder-diagram/ladder-diagram.component';


@NgModule({
  declarations: [
    AppComponent,
    AboutComponent,
    ConfigComponent,
    SiteswapDiagramComponent,
    LadderDiagramComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AccordionModule.forRoot(),
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
