import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfigurationPlayComponent } from '../configuration-play/configuration-play.component';
import { DataServiceService } from '../data-service.service';
import { User } from '../models/User';
import { WebSocketServiceService } from '../web-socket-service.service';
import { MessageId } from '../models/MessageId';
import { Vote } from '../models/Vote';
import { RecapVoteStepComponent } from '../recap-vote-step/recap-vote-step.component';
import { Recap } from '../models/recap';

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

  listMessages: string[] = [];

  //get message on input
  message: string;
  //player id actual
  playerTurn: number;

  endTurn: boolean = false;
  //TODO TEST
  //actualIndex: number;

  selectPlayer: number;

  constructor(public dialog: MatDialog, private dataService: DataServiceService, private webSocketService: WebSocketServiceService) { }

  ngOnInit(): void {
    this.dialog.open(ConfigurationPlayComponent, {
      disableClose: true,
      width: '400px',
      height: '300px'
    });
    //TODO TEST
    //this.dataService.updateEndTurn(true);
    this.dataService.isEndTurn().subscribe(endTurn => {
      this.endTurn = endTurn;
    });


    this.dialog.afterAllClosed.subscribe(() => {
      this.dataService.getArrayUser().subscribe(result => {
        //TODO TEST
        //this.endTurn = true;
        //get users list from service (from side bar connected users)
        this.users = result;
        //TODO TEST
        //this.playerTurn = this.defineFirstPlayerId();
        //this.dataService.updateIdFirstPlayer(this.playerTurn);
        //
        //TODO a remettre quand serveur
        this.dataService.getIdFirstPlayer().subscribe(id => {
          this.playerTurn = id;
          console.log('client id to play : ' + this.playerTurn);
        });
      });
    })

    this.webSocketService.listen('serveurMessageNextPlayer').subscribe((data) => {
      console.log('event : serveurMessageNextPlayer : ', data);
      let messageId = data as MessageId;
      console.log('next player id : ', messageId.nextPlayerId);
      console.log('message from previous client : ', messageId.messageFromPreviousClient);
      //add message to actual user card
      this.users.forEach(user => {
        if (user.id == messageId.actualId) {
          user.messages.push(messageId.messageFromPreviousClient);
          //keep in persistence message of all clients
          this.listMessages.push(messageId.messageFromPreviousClient.toUpperCase());
          console.log('On user : ' + user + ' message : ' + messageId.messageFromPreviousClient);
        }
      })
      this.dataService.updateIdFirstPlayer(messageId.nextPlayerId as number);
    })

    this.webSocketService.listen('endTurn').subscribe((data) => {
      this.dataService.updateEndTurn(true);
      this.dataService.isEndTurn().subscribe(endTurn => {
        this.endTurn = endTurn;
        console.log("end turn");
      })
    });

    this.webSocketService.listen('userVoted').subscribe((data) => {
      let voted = data as Vote;
      console.log("who : " + voted.playerIdWhoSelected + " to : " + voted.actualSelectPlayerId);
      this.searchPlayerByIdAndremoveAVote(voted.oldSelectPlayerId);
      this.searchPlayerByIdAndAddVote(voted.actualSelectPlayerId);
    });

    this.webSocketService.listen('endVoteStep').subscribe((data) => {
      let recap = data as Recap;
      console.log("user : " + recap.userEliminated);
      console.log("words : " + recap.words)
      this.dialog.open(RecapVoteStepComponent, {
        width: '600px',
        height: '200px',
        data: { recap: recap }
      });
    });
  }

  submitVote(event) {
    let user = event as User;
    if (user.id != this.dataService.meUser.id && this.selectPlayer != user.id) {
      let vote = new Vote(this.selectPlayer, this.dataService.meUser.id, user.id);
      //TODO TEST
      //this.searchPlayerByIdAndremoveAVote(this.selectPlayer);
      this.selectPlayer = user.id;
      //TODO TEST
      //this.searchPlayerByIdAndAddVote(this.selectPlayer);
      this.webSocketService.emit("userJustVoted", vote)
      console.log("voted on : " + this.selectPlayer)
    }
  }

  searchPlayerByIdAndAddVote(id: number) {
    this.users.forEach(user => {
      if (user.id == id) {
        user.votes++;
        console.log("user : " + user.name + " votes : " + user.votes);
      }
    });
  }

  searchPlayerByIdAndremoveAVote(id: number) {
    this.users.forEach(user => {
      if (user.id == id) {
        if (user.votes != 0) {
          user.votes--;
        };
      }
    });
  }

  submitWord() {
    if (this.message != '') {
      if (this.listMessages.indexOf(this.message.toUpperCase()) == -1) {
        let message = new MessageId();
        message.setMessage(this.message);
        message.setActualId(this.playerTurn);
        //send to server
        this.webSocketService.emit('clientMessageNextPlayer', message);
        //clear input
        this.message = "";
        //TODO TEST
        /*this.playerTurn = this.nextPlayerToPlay();
        this.dataService.updateIdFirstPlayer(this.playerTurn);*/
        //
      }
    }
  }

  isYourTurn(): boolean {
    if (null != this.dataService.meUser) {
      if (this.playerTurn == this.dataService.meUser.id) {
        return true;
      } else {
        return false;
      }
    }
  }

  /**
   * define who is the next player to play
   */
  //TODO TEST
  /*nextPlayerToPlay(): number {
    if (this.playerTurn == this.usersId[this.usersId.length - 1]) {
      this.actualIndex = 0;
      return this.usersId[0];
    } else {
      this.actualIndex++;
      return this.usersId[this.actualIndex];
    }
  }*/

  /**
   * define first player. called once, when component is called for the first time
   */
  //TODO TEST
  /*defineFirstPlayerId(): number {
    //regroup all users id in list
    this.users.forEach(user => {
      this.usersId.push(user.id);
    });
    //return index 
    this.actualIndex = Math.floor(Math.random() * this.usersId.length);
    //return value of actualIndex (random)
    return this.usersId[this.actualIndex];
  }*/

}
