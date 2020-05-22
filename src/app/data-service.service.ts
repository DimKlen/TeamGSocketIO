import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from './models/User';

@Injectable({
  providedIn: 'root'
})
export class DataServiceService {
  userDataSource: BehaviorSubject<User[]> = new BehaviorSubject([]);
  userData = this.userDataSource.asObservable();

  idFirstPlayerSource: BehaviorSubject<number> = new BehaviorSubject(null);
  idFirstPlayer = this.idFirstPlayerSource.asObservable();

  usersLength: number = 0;

  meUser: User;

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

  updateIdFirstPlayer(id: number) {
    this.idFirstPlayerSource.next(id);
  }

  getIdFirstPlayer(): Observable<number> {
    return this.idFirstPlayer;
  }

  updateArrayUser(users: User[]) {
    this.userDataSource.next(Object.assign([], users));
    this.usersLength--;
  }

  setMeUser(user: User) {
    this.meUser = user;
  }
}
