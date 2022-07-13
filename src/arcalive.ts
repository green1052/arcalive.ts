import axios from "axios";
import {User} from "./user/user";
import {AnonymousUser} from "./user/anonymousUser";
import {Auth} from "./auth";
import {Article} from "./article";
import {Channel} from "./channel";

export class Arcalive {
    public readonly Client = axios.create({
        baseURL: "https://arca.live",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:102.0) Gecko/20100101 Firefox/102.0",
            origin: "https://arca.live"
        }
    });

    public readonly User: User | AnonymousUser;

    public readonly Article: Article;
    public readonly Auth: Auth;
    public readonly Channel: Channel;

    constructor(user: User | AnonymousUser) {
        this.User = user;

        this.Article = new Article(this);
        this.Auth = new Auth(this);
        this.Channel = new Channel(this);
    }
}
