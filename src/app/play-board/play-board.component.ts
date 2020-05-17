import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfigurationPlayComponent } from '../configuration-play/configuration-play.component';
import { DataServiceService } from '../data-service.service';
import { User } from '../models/User';

@Component({
  selector: 'app-play-board',
  templateUrl: './play-board.component.html',
  styleUrls: ['./play-board.component.css']
})
export class PlayBoardComponent implements OnInit {

  users: User[] = [];

  constructor(public dialog: MatDialog, private dataService: DataServiceService) { }

  ngOnInit(): void {
    const dialogRef = this.dialog.open(ConfigurationPlayComponent, {
      disableClose: true,
      width: '600px',
      height: '650px'
    });

    this.dialog.afterAllClosed.subscribe(() => {
      this.dataService.getArrayUser().subscribe(result => {
        this.users = result;
        console.log(this.users);
      });

    })
  }

  submitWord() {
    console.log('enter');
  }

}
