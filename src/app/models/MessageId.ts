export class MessageId {
    nextPlayerId: number;
    messageFromPreviousClient: string;
    actualId: number;

    constructor() {
    }

    setMessage(message: string) {
        this.messageFromPreviousClient = message;
    }
    setActualId(actualId: number) {
        this.actualId = actualId;
    }
}