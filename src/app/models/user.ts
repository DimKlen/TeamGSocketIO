export class User {
    id: number;
    name: string;
    avatar: string;
    score: number = 0;

    constructor(name: string) {
        this.name = name;
        this.avatar = 'https://api.adorable.io/avatars/'+this.randomAvatar();
        //TODO ID
    }

    private randomAvatar(): number {
        return Math.floor(Math.random() * 1000) + 1 
      }
}