import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WebSocketServiceService } from '../web-socket-service.service';
import { User } from '../models/User';

@Component({
  selector: 'app-connection-login',
  templateUrl: './connection-login.component.html',
  styleUrls: ['./connection-login.component.css']
})
export class ConnectionLoginComponent implements OnInit {
  constructor(private webSocketService: WebSocketServiceService, private router: Router) { }

  //get input value from html
  nameInput: string

  ngOnInit(): void {
  }

  rejoindre(): void {
    if(this.nameInput) {
      //Emit loged event to notif server with a new user
      this.webSocketService.emit('loged',new User(this.nameInput));
      //TODO if server up then navigate
      this.router.navigateByUrl("/undercover");
    }
  }
}
