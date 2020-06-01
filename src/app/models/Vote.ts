export class Vote {
    oldSelectPlayerId: number
    playerIdWhoSelected: number;
    actualSelectPlayerId: number;

    constructor(old: number, me: number, him: number) {
        this.oldSelectPlayerId = old
        this.playerIdWhoSelected = me;
        this.actualSelectPlayerId = him;
    }

    setPlayerIdWhoSelected(id: number) {
        this.playerIdWhoSelected = id;
    }
    setActualSelectPlayerId(id: number) {
        this.actualSelectPlayerId = id;
    }

    setOldSelectPlayerId(id: number) {
        this.oldSelectPlayerId = id;
    }
}