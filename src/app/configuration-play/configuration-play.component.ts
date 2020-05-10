import { Component, OnInit } from '@angular/core';
import { DataServiceService } from '../data-service.service';

@Component({
  selector: 'app-configuration-play',
  templateUrl: './configuration-play.component.html',
  styleUrls: ['./configuration-play.component.css']
})
export class ConfigurationPlayComponent implements OnInit {

  nombreJoueurs: string;
  constructor(private dataService: DataServiceService) { }

  ngOnInit(): void {
    this.dataService.userLength.subscribe(result => {
      this.nombreJoueurs = result;
    });
  }

}
