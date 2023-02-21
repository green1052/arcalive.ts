import { Auth } from "./auth.js";
import { Channel } from "./channel.js";
import Anonymous from "./user/anonymous.js";
import LoginUser from "./user/loginUser.js";
import got from "got";
import { CookieJar } from "tough-cookie";

export class Arcalive {
    public readonly cookieJar = new CookieJar();

    public readonly client = got.extend({
        prefixUrl: "https://arca.live",
        cookieJar: this.cookieJar,
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/110.0"
        }
    });

    public readonly auth: Auth;

    constructor(public user: Anonymous | LoginUser) {
        this.auth = new Auth(this);
    }

    public channel(slug: string): Channel {
        return new Channel(this, slug);
    }
}
