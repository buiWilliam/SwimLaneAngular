import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SwimLaneComponent } from './swim-lane/swim-lane.component';
import { InspectorComponent } from './inspector/inspector.component';
import { MenuComponent } from './menu/menu.component';
import { FooterComponent } from './footer/footer.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { GojsAngularModule } from 'gojs-angular';
import { PaletteComponent } from './palette/palette.component';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatButtonModule} from '@angular/material/button';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatSelectModule} from '@angular/material/select';
import {MatRadioModule} from '@angular/material/radio';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';


@NgModule({
  declarations: [
    AppComponent,
    SwimLaneComponent,
    InspectorComponent,
    MenuComponent,
    FooterComponent,
    LandingPageComponent,
    PaletteComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    GojsAngularModule,
    FormsModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatSnackBarModule,
    MatGridListModule,
    MatButtonToggleModule,
    MatSelectModule,
    MatRadioModule,
    MatSlideToggleModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
