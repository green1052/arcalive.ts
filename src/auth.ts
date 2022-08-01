import * as cheerio from "cheerio";
import {Arcalive} from "./arcalive";
import {AnonymousUser} from "./user/anonymousUser";
import axios from "axios";
import {LoginUser} from "./user/loginUser";

export class Auth {
    private readonly _arcalive: Arcalive;

    constructor(arcalive: Arcalive) {
        this._arcalive = arcalive;
    }

    private _clearCookies() {
        (this._arcalive.Client.defaults.headers as any).Cookie = "";
    }

    private _setCookies(cookies: string | string[], beforeClear: boolean = false) {
        if (beforeClear)
            (this._arcalive.Client.defaults.headers as any).Cookie = "";

        if (!cookies) return;

        (this._arcalive.Client.defaults.headers as any).Cookie
            = (this._arcalive.Client.defaults.headers as any).Cookie + (typeof cookies === "string" ? cookies : cookies.join(";"));
    }

    private async _getDefaultCookie() {
        this._clearCookies();
        const response = await this._arcalive.Client.get("/u/login");

        const cookie = response.headers["set-cookie"];

        if (cookie === undefined)
            throw "set-cookie is null";

        this._setCookies(cookie);
    }

    public async GetCsrf(): Promise<string> {
        const response = await this._arcalive.Client.get(this.IsUser() && await this.IsLogin() ? "/settings/profile" : "/u/login");

        const csrf = cheerio.load(response.data)("input[name=_csrf]").val() as string;

        if (!csrf)
            throw "csrf is null";

        return csrf;
    }

    public async Login() {
        if (this._arcalive.UserInfo instanceof AnonymousUser)
            throw "AnonymousUser can't use";

        await this._getDefaultCookie();

        const csrf = await this.GetCsrf();

        const params = new URLSearchParams();
        params.set("_csrf", csrf);
        params.set("goto", "");
        params.set("username", this._arcalive.UserInfo.username);
        params.set("password", this._arcalive.UserInfo.password);

        const response = await this._arcalive.Client.post("/u/login", params);

        this._setCookies(response.headers["set-cookie"]!);
    }

    public async Logout() {
        if (this._arcalive.UserInfo instanceof AnonymousUser)
            throw "AnonymousUser can't use";

        await this._arcalive.Client.get("/u/logout?goto=");
        this._clearCookies();
    }

    public async IsLogin(): Promise<boolean> {
        if (this._arcalive.UserInfo instanceof AnonymousUser)
            throw "AnonymousUser can't use";

        const response = await this._arcalive.Client.get("/");

        return cheerio.load(response.data)(`a[href^="/u/logout"]`).length >= 1;
    }

    public async GetRecaptcha() {
        // TODO 작동 안함

        const render = "6LcDuIwUAAAAAABqGMfC8KCTje-xWbQu9bhvIO3K";
        const co = "aHR0cHM6Ly9hcmNhLmxpdmU6NDQz";
        const v = "4rwLQsl5N_ccppoTAwwwMrEN&size=invisible&cb=jt1pbj111sfl";

        const url = `https://www.google.com/recaptcha/api2/anchor?ar=1&k=${render}&co=${co}&hl=ko&v=${v}`;
        const response = await axios.get(url);

        const token = cheerio.load(response.data)("#recaptcha-token").val() as string;

        // const response2 = await axios.post(`https://www.google.com/recaptcha/api2/reload?k=${render}`, {
        //
        // });

        return token;
    }

    public IsUser(): boolean {
        return this._arcalive.UserInfo instanceof LoginUser;
    }

    public IsAnonymous(): boolean {
        return this._arcalive.UserInfo instanceof AnonymousUser;
    }
}