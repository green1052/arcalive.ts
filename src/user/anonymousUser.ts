export class AnonymousUser {
    public nickname: string;
    public password: string;

    constructor(nickname: string, password: string) {
        this.nickname = nickname;
        this.password = password;
    }
}