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
    });
  }

  ucUp() {
    if (this.nombreUc < 10) {
      this.nombreUc++;
    }
  }

  ucDown() {
    if (this.nombreUc > 0) {
      this.nombreUc--;
    }
  }


  whiteUp() {
    if (this.nombreWhite < 10) {
      this.nombreWhite++;
    }
  }

  whiteDown() {
    if (this.nombreWhite > 0) {
      this.nombreWhite--;
    }


  }
}
