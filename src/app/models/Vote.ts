import { User } from './User';

export class Vote {
    idVoter: number;
    userVoted: User
    // oldSelectPlayerId: number
    // playerIdWhoSelected: number;
    // actualSelectPlayerId: number;

    constructor(idVoter: number, userVoted: User) {
        this.idVoter = idVoter;
        this.userVoted = userVoted;
        // this.oldSelectPlayerId = old
        // this.playerIdWhoSelected = me;
        // this.actualSelectPlayerId = him;
    }

    // setPlayerIdWhoSelected(id: number) {
    //     this.playerIdWhoSelected = id;
    // }
    // setActualSelectPlayerId(id: number) {
    //     this.actualSelectPlayerId = id;
    // }

    // setOldSelectPlayerId(id: number) {
    //     this.oldSelectPlayerId = id;
    // }
}