import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfigurationPlayComponent } from '../configuration-play/configuration-play.component';
import { DataServiceService } from '../data-service.service';
import { User } from '../models/User';
import { WebSocketServiceService } from '../web-socket-service.service';
import { MessageId } from '../models/Message';
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
  //list of messages actual
  listMessages: string[] = [];
  //get message on input
  message: string;
  //player id actual
  playerTurn: number;
  //State of inning
  endTurn: boolean = false;

  selectPlayer: number;

  constructor(public dialog: MatDialog, private dataService: DataServiceService, private webSocketService: WebSocketServiceService) { }

  ngOnInit(): void {
    const dialogConfig = this.dialog.open(ConfigurationPlayComponent, {
      disableClose: true,
      width: '500px',
      height: '300px'
    });

    this.dataService.isEndTurn().subscribe(endTurn => {
      this.endTurn = endTurn;
    });


    dialogConfig.afterClosed().subscribe(() => {
      this.dataService.getArrayUser().subscribe(users => {
        this.users = users;
        this.dataService.getIdFirstPlayer().subscribe(id => {
          this.playerTurn = id;
        });
      });
      this.dataService.updateDialogOpen(false);
    })

    //Listen when message comes from server (message from player)
    this.webSocketService.listen('serveurMessage').subscribe((data) => {
      let messageId = data as MessageId;
      console.log('message : ', messageId.messageFromPreviousClient + " from id : " + messageId.actualId);

      //add message to actual user card
      this.users.forEach(user => {
        if (user.id == messageId.actualId) {
          user.messages.push(messageId.messageFromPreviousClient);
          //keep in persistence message of all clients
          this.listMessages.push(messageId.messageFromPreviousClient.toUpperCase());
        }
      })
    })

    this.webSocketService.listen('newInning').subscribe((data) => {
      let users = data as User[];
      console.log('users new inning event : ', users);
      //update users
      this.dataService.updateArrayUser(users);
      this.selectPlayer = null;
      this.listMessages = [];

    })

    this.webSocketService.listen('draw').subscribe((data) => {
      let users = data as User[];
      console.log('users draw event : ', users);
      //update users
      this.dataService.updateArrayUser(users);
      this.selectPlayer = null;
    })

    //Listen when a player end his turn, idnext player in data
    this.webSocketService.listen('serveurIdNextToPlay').subscribe((data) => {
      console.log('next player id : data');
      this.dataService.updateIdFirstPlayer(data as number);
    })

    //Listen when endturn comes
    this.webSocketService.listen('endTurn').subscribe((data) => {
      console.log("end turn : " + data)
      this.dataService.updateEndTurn(data as boolean);
    });

    //Listen when someone vote on an user
    this.webSocketService.listen('userVoted').subscribe((data) => {
      let usersUpdated = data as User[];
      this.dataService.updateArrayUser(usersUpdated);
    });

    this.webSocketService.listen('endVoteStep').subscribe((data) => {
      let recap = data as Recap;
      console.log("user : " + recap.userSacrificied);
      console.log("words : " + recap.words)
      const dialogRecap = this.dialog.open(RecapVoteStepComponent, {
        width: '600px',
        height: '200px',
        data: { recap: recap }
      });

      dialogRecap.afterClosed().subscribe(() => {
        console.log("catch closed");
        this.dataService.updateDialogOpen(false);
      })
    });

    this
  }

  updateUserVote(userVoted) {
    this.users.forEach(user => {
      if (user.id == userVoted.id) {
        user.vote = userVoted.vote;
        console.log("user : " + user.name + " votes : " + user.vote);
      }
    });
  }

  submitVote(event) {
    //get user by click on player
    let user = event as User;
    //If not me and not player already voted, then
    if (user.id != this.dataService.meUser.id && this.selectPlayer != user.id) {
      let vote = new Vote(this.dataService.meUser.id, user);
      this.selectPlayer = user.id;
      this.webSocketService.emit("userJustVoted", vote)
    }
  }

  //Called when send message
  submitWord() {
    if (this.message != '') {
      //If message already exists
      if (this.listMessages.indexOf(this.message.toUpperCase()) == -1) {
        let message = new MessageId();
        message.setMessage(this.message);
        message.setActualId(this.playerTurn);
        //send to server
        this.webSocketService.emit('clientMessage', message);
        //clear input
        this.message = "";
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
}
