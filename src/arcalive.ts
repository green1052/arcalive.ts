import axios from "axios";
import {LoginUser} from "./user/loginUser";
import {AnonymousUser} from "./user/anonymousUser";
import {Auth} from "./auth";
import {Article} from "./article";
import {Channel} from "./channel";
import {User} from "./user";

export class Arcalive {
    public readonly Client = axios.create({
        baseURL: "https://arca.live",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:102.0) Gecko/20100101 Firefox/102.0",
            origin: "https://arca.live"
        }
    });

    public readonly MobileClient = axios.create({
        baseURL: "https://arca.live/api",
        headers: {
            "User-Agent": "live.arca.android/0.8.337"
        }
    });

    public readonly UserInfo: LoginUser | AnonymousUser;

    public readonly Article: Article;
    public readonly Auth: Auth;
    public readonly Channel: Channel;
    public readonly User: User;

    constructor(userInfo: LoginUser | AnonymousUser) {
        this.UserInfo = userInfo;

        this.Article = new Article(this);
        this.Auth = new Auth(this);
        this.Channel = new Channel(this);
        this.User = new User(this);
    }
}
