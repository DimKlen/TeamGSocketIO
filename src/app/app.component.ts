import { Component, OnInit } from '@angular/core';
import { WebSocketServiceService } from './web-socket-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private webSocketService: WebSocketServiceService) {

  }

  ngOnInit() {
  }
}
