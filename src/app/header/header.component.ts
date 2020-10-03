import { Component, OnInit } from '@angular/core';
import { DataServiceService } from '../data-service.service';
import { User } from '../models/User';
import { WebSocketServiceService } from '../web-socket-service.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  notif: string;

  motSecret: string;

  endTurn: boolean;

  dialogOpen: boolean = false;

  users: User[];

  constructor(private dataService: DataServiceService, private webSocketService: WebSocketServiceService) { }
  ngOnInit(): void {

    this.dataService.isEndTurn().subscribe(endTurn => {
      this.endTurn = endTurn;
      console.log(" endTurn if : " + this.endTurn)
      if (endTurn) {
        this.notif = "Cliquer sur un joueur pour voter contre lui.";
        console.log(this.notif);
      } else {
        this.dataService.getIdFirstPlayer().subscribe(id => {
          this.dataService.getArrayUser().subscribe(result => {
            //get users list from service (from side bar connected users)
            this.users = result as User[];
            this.users.forEach(user => {
              if (user.id == id) {
                this.notif = "C'est à " + user.name + " de décrire son mot.";
              }
            });
          });
        });
      }
    })

    this.webSocketService.listen('secretWord').subscribe((secretWord) => {
      console.log('event : secretWord, word : ' + secretWord);
      this.motSecret = secretWord as string;
    });

    this.dataService.isDialogOpen().subscribe(open => {
      console.log("header chgmnt => " + open)
      this.dialogOpen = open;
    })
  }

  newWords() {
    console.log("new words query");
    this.webSocketService.emit("newWords", "");
  }

  isAdmin(): boolean {
    let me = this.dataService.meUser
    if (this.users != null) {
      if (this.users[0].id == me.id) {
        return true;
      } else {
        return false;
      }
    }
    else {
      return false;
    }
  }
}
