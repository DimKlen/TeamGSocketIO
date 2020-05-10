import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from './models/User';

@Injectable({
  providedIn: 'root'
})
export class DataServiceService {

  users: User[] = [];
  private userLengthSource = new BehaviorSubject<string>('X');
  userLength = this.userLengthSource.asObservable();

  constructor() { }

  updateData(size) {
    this.userLengthSource.next(size);
  }

  pushUser(user: User) {
    this.users.push(user);
  }

  removeUser(user: User) {
    if(this.users) {
      this.users.splice(this.users.findIndex(item => item.id ==user.id),1);
    }
  }

  getUsersSize(): number {
    return this.users.length;
  }
}
