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

  endTurnSource: BehaviorSubject<boolean> = new BehaviorSubject(null);
  endTurn = this.endTurnSource.asObservable();

  dialogOpenSource: BehaviorSubject<boolean> = new BehaviorSubject(null);
  dialogOpen = this.dialogOpenSource.asObservable();

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

  updateDialogOpen(dialogOpen: boolean) {
    this.dialogOpenSource.next(dialogOpen);
  }

  isDialogOpen(): Observable<boolean> {
    return this.dialogOpen;
  }

  updateEndTurn(endTurn: boolean) {
    this.endTurnSource.next(endTurn);
  }

  isEndTurn(): Observable<boolean> {
    return this.endTurn;
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
