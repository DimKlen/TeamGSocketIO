import { Component, OnInit } from '@angular/core';
import { User } from '../models/User';
import { WebSocketServiceService } from '../web-socket-service.service';
import { DataServiceService } from '../data-service.service';

@Component({
  selector: 'app-side-bar-user-connected',
  templateUrl: './side-bar-user-connected.component.html',
  styleUrls: ['./side-bar-user-connected.component.css']
})
export class SideBarUserConnectedComponent implements OnInit {

  users: User[] = [];
  meUser: User;

  constructor(private webSocketService: WebSocketServiceService, private dataService: DataServiceService) {
  }

  ngOnInit(): void {
    this.dataService.getArrayUser().subscribe(result => {
      this.users = result;
    });

    //TODO TEST
    /*let noir = new User("Noir");
    noir.setId(1);
    let kwenty = new User("Kwenty");
    kwenty.setId(2);
    let did = new User("Did");
    did.setId(3);
    let geo = new User("Geo");
    geo.setId(4);
    let samir = new User("Samir");
    samir.setId(6);
    let miky = new User("Miky");
    miky.setId(8);
    let vincent = new User("Vincent");
    vincent.pushMessage('jeux');
    vincent.pushMessage('en famille');
    vincent.pushMessage('drôle');
    vincent.setId(11);
    this.dataService.addUser(noir);
    this.dataService.addUser(kwenty);
    this.dataService.addUser(did);
    this.dataService.addUser(geo);
    this.dataService.addUser(samir);
    this.dataService.addUser(miky);
    this.dataService.addUser(vincent); this.dataService.setMeUser(samir);
    this.meUser = samir;*/
    //TODO TEST


    /**
     * listen on new user connected and push in users list 
     */
    this.webSocketService.listen('newusrs').subscribe((data) => {
      let user = data as User;
      console.log('event : newusrs for user : ', user);
      this.dataService.addUser(user);
    })

    this.webSocketService.listen('yourUser').subscribe((data) => {
      let user = data as User;
      console.log('event : yourUser for user : ', user);
      this.meUser = user;
      this.dataService.setMeUser(user);
    })

    this.webSocketService.listen('updateScores').subscribe((data) => {
      let usersUpdated = data as User[];
      this.dataService.updateArrayUser(usersUpdated);
    })


    /**
     * listen on removed user and remove this user in users list
     */
    this.webSocketService.listen('removeusrs').subscribe((data) => {
      console.log('event : removeusr for user : ', data);
      //Cast data to user object
      let user = data as User;
      //Remove user by id
      this.dataService.getArrayUser().subscribe(result => {
        if (this.dataService.usersLength == result.length) {
          result.splice(result.findIndex(item => item.id == user.id), 1);
          this.dataService.usersLength--;
        }
      });
    });
  }
}
