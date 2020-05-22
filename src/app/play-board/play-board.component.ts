import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfigurationPlayComponent } from '../configuration-play/configuration-play.component';
import { DataServiceService } from '../data-service.service';
import { User } from '../models/User';
import { WebSocketServiceService } from '../web-socket-service.service';
import { MessageId } from '../models/MessageId';

@Component({
  selector: 'app-play-board',
  templateUrl: './play-board.component.html',
  styleUrls: ['./play-board.component.css']
})
export class PlayBoardComponent implements OnInit {

  //users object list
  users: User[] = [];
  //users id
  usersId: number[] = [];

  //get message on input
  message: string;
  //player id actual
  playerTurn: number;
  //TODO TEST
  actualIndex: number;

  constructor(public dialog: MatDialog, private dataService: DataServiceService, private webSocketService: WebSocketServiceService) { }

  ngOnInit(): void {
    const dialogRef = this.dialog.open(ConfigurationPlayComponent, {
      disableClose: true,
      width: '500px',
      height: '400px'
    });

    this.dialog.afterAllClosed.subscribe(() => {
      this.dataService.getArrayUser().subscribe(result => {
        //get users list from service (from side bar connected users)
        this.users = result;
        //TODO TEST
        this.playerTurn = this.defineFirstPlayerId();
        //TODO a remettre quand serveur
        //   this.dataService.getIdFirstPlayer().subscribe(id => {
        //     this.playerTurn = id;
        //     console.log('client id to play : ' + this.playerTurn);
        //   });
      });
    })

    this.webSocketService.listen('serveurMessageNextPlayer').subscribe((data) => {
      console.log('event : serveurMessageNextPlayer : ', data);
      let messageId = data as MessageId;
      console.log('next player id : ', messageId.nextPlayerId);
      console.log('message from previous client : ', messageId.messageFromPreviousClient);
      this.dataService.updateIdFirstPlayer(messageId.nextPlayerId as number);
    })

  }

  submitWord() {
    //TODO send server
    this.webSocketService.emit('clientMessageNextPlayer', this.message);
    //clear input
    this.message = "";
    //TODO TEST
    this.playerTurn = this.nextPlayerToPlay();
  }

  isYourTurn(): boolean {
    if (this.playerTurn == this.dataService.meUser.id) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * define who is the next player to play
   */
  //TODO TEST
  nextPlayerToPlay(): number {
    if (this.playerTurn == this.usersId[this.usersId.length - 1]) {
      this.actualIndex = 0;
      return this.usersId[0];
    } else {
      this.actualIndex++;
      return this.usersId[this.actualIndex];
    }
  }

  /**
   * define first player. called once, when component is called for the first time
   */
  //TODO TEST
  defineFirstPlayerId(): number {
    //regroup all users id in list
    this.users.forEach(user => {
      this.usersId.push(user.id);
    });
    //return index 
    this.actualIndex = Math.floor(Math.random() * this.usersId.length);
    //return value of actualIndex (random)
    return this.usersId[this.actualIndex];
  }

}
