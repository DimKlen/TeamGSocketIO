import { Component, OnInit } from '@angular/core';
import { DataServiceService } from '../data-service.service';

@Component({
  selector: 'app-configuration-play',
  templateUrl: './configuration-play.component.html',
  styleUrls: ['./configuration-play.component.css']
})
export class ConfigurationPlayComponent implements OnInit {

  nombreJoueurs: string;
  nombreCivil: number = 0;
  nombreUc: number = 0;
  nombreWhite: number = 0;
  constructor(private dataService: DataServiceService) { }

  ngOnInit(): void {
    //get number of players from service
    this.dataService.userLength.subscribe(result => {
      this.nombreJoueurs = result;
      switch (+this.nombreJoueurs) {
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
          this.initRoles(4, 3, 0)
          break;
        case 8:
          this.initRoles(5, 3, 0)
          break;
        default:
          break;
      }
    });
  }

  initRoles(civil: number, uc: number, white: number) {
    this.nombreCivil = civil;
    this.nombreUc = uc;
    this.nombreWhite = white;
  }

  isFullCount(): boolean {
    let fullCout = this.nombreUc + this.nombreCivil + this.nombreWhite;
    if (fullCout >= +this.nombreJoueurs) {
      return true;
    } else { return false }
  }

  ucUp() {
    if (this.nombreUc < 3 && !this.isFullCount()) {
      this.nombreUc++;
    }
  }

  ucDown() {
    if (this.nombreUc >= 2) {
      this.nombreUc--;
    }
  }
}
