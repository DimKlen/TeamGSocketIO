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

  //User list used to display users
  users: User[] = [new User("Noir"), new User("Kwenty")/*, new User("Did"), new User("Geo")*/];

  constructor(private webSocketService: WebSocketServiceService, private dataService: DataServiceService) {
  }

  ngOnInit(): void {

    //TODO test
    this.dataService.updateData(this.users.length)
    /**
     * listen on new user connected and push in users list 
     */
    this.webSocketService.listen('newusrs').subscribe((data) => {
      let user = data as User;
      this.users.push(user);
      console.log('event : newusrs for user : ' + user + ' is called');
      this.dataService.updateData(this.users.length)
    })

    /**
     * listen on removed user and remove this user in users list
     */
    this.webSocketService.listen('removeusrs').subscribe((data) => {
      console.log('event : removeusr for user : ' + data + ' is called');
      //Cast data to user object
      let user = data as User;
      //Remove user by id
      this.users.splice(this.users.findIndex(item => item.id == user.id), 1);
      this.dataService.updateData(this.users.length)
    })
  }

}
