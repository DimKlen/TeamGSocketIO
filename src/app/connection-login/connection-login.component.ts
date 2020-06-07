import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WebSocketServiceService } from '../web-socket-service.service';
import { User } from '../models/User';
import { MatDialog } from '@angular/material/dialog';
import { RecapVoteStepComponent } from '../recap-vote-step/recap-vote-step.component';
import { Recap } from '../models/recap';

@Component({
  selector: 'app-connection-login',
  templateUrl: './connection-login.component.html',
  styleUrls: ['./connection-login.component.css']
})
export class ConnectionLoginComponent implements OnInit {
  constructor(public dialog: MatDialog, private webSocketService: WebSocketServiceService, private router: Router) { }

  //get input value from html
  nameInput: string

  ngOnInit(): void {
  }

  rejoindre(): void {
    if (this.nameInput) {
      //Emit loged event to notif server with a new user
      this.webSocketService.emit('loged', new User(this.nameInput));
      //TOOD server
      //this.router.navigateByUrl("/undercover");
      //TODO TEST
      let recap = new Recap;
      recap.words[0] = "Ketchup";
      recap.words[1] = "Barbecue";

      let user = new User("Vincent");
      user.role = "ESCROC";
      user.secretWord = "Barbecue"
      recap.userEliminated = user;
      this.dialog.open(RecapVoteStepComponent, {
        width: '600px',
        height: '200px',
        data: { recap: recap }
      });
    }
  }
}
