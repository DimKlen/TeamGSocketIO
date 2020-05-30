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

  notifPlayerTurn: string;

  motSecret: string;

  constructor(private dataService: DataServiceService, private webSocketService: WebSocketServiceService) { }
  ngOnInit(): void {

    // this.motSecret = "Samsung";
    this.dataService.getIdFirstPlayer().subscribe(id => {
      this.dataService.getArrayUser().subscribe(result => {
        //get users list from service (from side bar connected users)
        let users = result as User[];
        users.forEach(user => {
          if (user.id == id) {
            this.notifPlayerTurn = "C'est à " + user.name + " de décrire son mot.";
          }
        });
      });
    });

    this.webSocketService.listen('secretWord').subscribe((secretWord) => {
      console.log('event : secretWord, word : ' + secretWord);
      this.motSecret = secretWord as string;
    });

  }

  isAdmin(): boolean {
    return false;
  }
}
