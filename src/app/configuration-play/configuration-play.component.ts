import { Component, OnInit } from '@angular/core';
import { DataServiceService } from '../data-service.service';
import { WebSocketServiceService } from '../web-socket-service.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-configuration-play',
  templateUrl: './configuration-play.component.html',
  styleUrls: ['./configuration-play.component.css']
})
export class ConfigurationPlayComponent implements OnInit {

  nombreJoueurs: number;
  nombreCivil: number = 0;
  nombreUc: number = 0;
  tours: number = 1;
  constructor(private dataService: DataServiceService, private webSocketService: WebSocketServiceService
    , private dialogRef: MatDialogRef<ConfigurationPlayComponent>) { }

  ngOnInit(): void {
    this.dataService.updateDialogOpen(true);
    //get number of players from service
    this.dataService.getArrayUser().subscribe(result => {
      this.nombreJoueurs = result.length;
      //Init roles by number of players
      switch (this.nombreJoueurs) {
        case 3:
          this.initRoles(2, 1, 0);
          break;
        case 4:
          this.initRoles(3, 1, 0)
          break;
        case 5:
          this.initRoles(4, 1, 0)
          break;
        case 6:
          this.initRoles(5, 1, 0)
          break;
        case 7:
          this.initRoles(6, 1, 0)
          break;
        case 8:
          this.initRoles(7, 1, 0)
          break;
        default:
          break;
      }
    });

    this.webSocketService.listen('playReadyFromServeur').subscribe((id) => {
      console.log('event : playReadyFromServeur, first id to play : ' + id);
      this.dataService.updateIdFirstPlayer(id as number);
      this.dialogRef.close();
    });
  }

  /**
   * Check if game is playsable -> means 3 players minimum. 
   * Return false if less than 3 players
   * True if number of players is equal to 3 or more
   */
  isPlayable(): boolean {
    if (this.nombreJoueurs < 3) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * Check if button more and less are modifiable
   * Buttons are modifiable if number of players is 5 or greater
   */
  isModifiable(): boolean {
    if (this.nombreJoueurs >= 3) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Start the game
   */
  play() {
    if (this.isFullCount()) {
      this.webSocketService.emit("playReadyFromClient", this.tours);
    }
  }

  /**
   * Initialise roles
   * 
   * @param civil number of civil
   * @param uc number of uc
   * @param white number of white
   */
  initRoles(civil: number, uc: number, white: number) {
    this.nombreCivil = civil;
    this.nombreUc = uc;
  }

  /**
   * Check if is full count
   */
  isFullCount(): boolean {
    let fullCount = this.nombreUc + this.nombreCivil;
    if (fullCount == this.nombreJoueurs) {
      return true;
    } else { return false }
  }

  pushButtonUpInning() {
    if (this.tours < 5) {
      this.tours++;
    }
  }

  pushButtonDownInning() {
    if (this.tours > 1) {
      this.tours--;
    }
  }
}
