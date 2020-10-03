import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from '../models/User';
import { DataServiceService } from '../data-service.service';

@Component({
  selector: 'app-recap-vote-step',
  templateUrl: './recap-vote-step.component.html',
  styleUrls: ['./recap-vote-step.component.css']
})
export class RecapVoteStepComponent implements OnInit {

  userSacrificied: User
  civilWord: string;

  escrocWord: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dataService: DataServiceService) {
    console.log("recap : " + data.recap)
    this.userSacrificied = data.recap.userSacrificied;
    this.civilWord = data.recap.words[0];
    this.escrocWord = data.recap.words[1];
  }

  ngOnInit(): void {
    console.log("opnened");
    this.dataService.updateDialogOpen(true);
  }
}
