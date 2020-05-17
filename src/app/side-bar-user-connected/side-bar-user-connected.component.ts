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

  constructor(private webSocketService: WebSocketServiceService, private dataService: DataServiceService) {
  }

  ngOnInit(): void {
    this.dataService.getArrayUser().subscribe(result => {
      this.users = result;
    });

    //TODO test
    this.dataService.addUser(new User("Noir"));
    this.dataService.addUser(new User("Kwenty"));
    this.dataService.addUser(new User("Did"));
    this.dataService.addUser(new User("Geo"));
    this.dataService.addUser(new User("Samir"));
    this.dataService.addUser(new User("Miky"));
    this.dataService.addUser(new User("Vincent"));

    /**
     * listen on new user connected and push in users list 
     */
    this.webSocketService.listen('newusrs').subscribe((data) => {
      let user = data as User;
      console.log('event : newusrs for user : ', user);
      this.dataService.addUser(user);
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
    })
  }
}
