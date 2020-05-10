import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { SideBarUserConnectedComponent } from './side-bar-user-connected/side-bar-user-connected.component';
import { AngularMaterialModule } from './angular-material.module';
import { ConnectionLoginComponent } from './connection-login/connection-login.component';
import { FlexLayoutModule } from "@angular/flex-layout";
/* FormsModule */
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
/* Routing */
import { AppRoutingModule } from './app-routing.module';
import { MainContentComponent } from './main-content/main-content.component';
import { HeaderComponent } from './header/header.component';
import { PlayBoardComponent } from './play-board/play-board.component';
import { FooterComponent } from './footer/footer.component';
import { WebSocketServiceService } from '../app/web-socket-service.service';
import { ConfigurationPlayComponent } from './configuration-play/configuration-play.component';
import { DataServiceService } from '../app/data-service.service';

@NgModule({
  declarations: [
    AppComponent,
    SideBarUserConnectedComponent,
    ConnectionLoginComponent,
    MainContentComponent,
    HeaderComponent,
    PlayBoardComponent,
    FooterComponent,
    ConfigurationPlayComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    FlexLayoutModule,
  ],
  providers: [WebSocketServiceService,DataServiceService],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
