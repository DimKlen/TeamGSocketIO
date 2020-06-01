export class Vote {
    userIdJustVoted: number;
    userIdToVote: number;

    constructor(me: number, him: number) {
        this.userIdJustVoted = me;
        this.userIdToVote = him;
    }

    setUserIdJustVoted(id: number) {
        this.userIdJustVoted = id;
    }
    setUserIdToVote(id: number) {
        this.userIdToVote = id;
    }
}