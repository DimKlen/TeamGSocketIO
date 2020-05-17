import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from './models/User';

@Injectable({
  providedIn: 'root'
})
export class DataServiceService {
  userDataSource: BehaviorSubject<User[]> = new BehaviorSubject([]);
  userData = this.userDataSource.asObservable();

  usersLength: number = 0;

  constructor() { }

  addUser(user: User) {
    const currentValue = this.userDataSource.value;
    const updatedValue = [...currentValue, user];
    this.userDataSource.next(updatedValue);
    this.usersLength++;
  }

  getArrayUser(): Observable<User[]> {
    return this.userData;
  }

  updateArrayUser(users: User[]) {
    this.userDataSource.next(Object.assign([], users));
    this.usersLength--;
  }
}
