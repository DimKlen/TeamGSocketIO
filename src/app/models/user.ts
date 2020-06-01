export class User {
    id: number;
    name: string;
    avatar: string;
    score: number = 0;
    messages: string[] = [];
    votes: number = 0;

    constructor(name: string) {
        this.name = name;
        this.avatar = 'https://api.adorable.io/avatars/' + this.randomAvatar();
    }


    private randomAvatar(): number {
        return Math.floor(Math.random() * 1000) + 1
    }

    //TODO test
    setId(id: number) {
        this.id = id;
    }

    pushMessage(message: string) {
        this.messages.push(message);
    }

    cleanMessages() {
        this.messages = [];
    }
}