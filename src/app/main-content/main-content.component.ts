import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfigurationPlayComponent } from '../configuration-play/configuration-play.component';

@Component({
  selector: 'app-main-content',
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.css']
})
export class MainContentComponent implements OnInit {

  constructor(public dialog: MatDialog) {
    const dialogRef = this.dialog.open(ConfigurationPlayComponent, {
      disableClose: true,
      width: '600px',
      height: '650px'
    });
  }

  ngOnInit(): void {
  }



}
