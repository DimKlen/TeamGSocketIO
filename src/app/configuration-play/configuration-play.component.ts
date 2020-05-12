import { Component, OnInit } from '@angular/core';
import { DataServiceService } from '../data-service.service';
import { WebSocketServiceService } from '../web-socket-service.service';

@Component({
  selector: 'app-configuration-play',
  templateUrl: './configuration-play.component.html',
  styleUrls: ['./configuration-play.component.css']
})
export class ConfigurationPlayComponent implements OnInit {

  nombreJoueurs: number;
  nombreCivil: number = 0;
  nombreUc: number = 0;
  nombreWhite: number = 0;
  constructor(private dataService: DataServiceService, private webSocketService: WebSocketServiceService) { }

  ngOnInit(): void {
    //get number of players from service
    this.dataService.userLength.subscribe(result => {
      this.nombreJoueurs = +result;
      //Init roles by number of players
      switch (this.nombreJoueurs) {
        case 3:
          this.initRoles(2, 1, 0);
          break;
        case 4:
          this.initRoles(3, 1, 0)
          break;
        case 5:
          this.initRoles(3, 2, 0)
          break;
        case 6:
          this.initRoles(4, 2, 0)
          break;
        case 7:
          this.initRoles(5, 3, 0)
          break;
        case 8:
          this.initRoles(5, 3, 0)
          break;
        default:
          break;
      }
    });

    this.webSocketService.listen('upUcFromServeur').subscribe((data) => {
      console.log('event : upUcFromServeur');
      this.upUc();
    });

    this.webSocketService.listen('downUcFromServeur').subscribe((data) => {
      console.log('event : downUcFromServeur');
      this.downUc();
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
    if (this.nombreJoueurs >= 5) {
      return true;
    } else {
      return false;
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
    this.nombreWhite = white;
  }

  /**
   * Check if is full count
   */
  isFullCount(): boolean {
    let fullCout = this.nombreUc + this.nombreCivil + this.nombreWhite;
    if (fullCout >= +this.nombreJoueurs) {
      return true;
    } else { return false }
  }

  upUc() {
    this.nombreCivil--;
    this.nombreUc++;
  }

  downUc() {
    this.nombreCivil++;
    this.nombreUc--;
  }

  /**
   * Up count of uc players
   */
  pushButtonUpUc() {
    switch (this.nombreJoueurs) {
      case 5:
      case 6:
        if (this.nombreUc == 1) {
          // this.upUc();
          console.log('more pushed');
          this.webSocketService.emit("upUcFromClient", "");
        }
        break;
      case 7:
      case 8:
        if (this.nombreUc == 1 || this.nombreUc == 2) {
          // this.upUc();
          console.log('more pushed');
          this.webSocketService.emit("upUcFromClient", "");
        }
        break;
    }
  }

  /**
   * Down count of uc players
   */
  pushButtonDownUc() {
    switch (this.nombreJoueurs) {
      case 5:
      case 6:
        if (this.nombreUc == 2) {
          // this.downUc()
          console.log('less pushed');
          this.webSocketService.emit("downUcFromClient", "");
        }
        break;
      case 7:
      case 8:
        if (this.nombreUc == 2 || this.nombreUc == 3) {
          // this.downUc()
          console.log('less pushed');
          this.webSocketService.emit("downUcFromClient", "");
        }
        break;
    }
  }
}
