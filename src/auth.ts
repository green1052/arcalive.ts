import Anonymous from "./user/anonymous.js";
import LoginUser from "./user/loginUser.js";
import * as cheerio from "cheerio";
import type { Arcalive } from "./arcalive.js";

export class Auth {
    constructor(private arcalive: Arcalive) {}

    public async isLogin(): Promise<boolean> {
        if (this.arcalive.user instanceof Anonymous) {
            throw "Anonymous user cannot check login status";
        }

        const response = await this.arcalive.client.get("");
        return cheerio.load(response.body)(`a[href^="/u/logout"]`).length !== 0;
    }

    public async login() {
        const response = await this.arcalive.client.get("u/login");
        const $ = cheerio.load(response.body);

        const _csrf = $("input[name=_csrf]").val() as string;

        await this.arcalive.client.post("u/login", {
            followRedirect: false,
            form: {
                _csrf,
                goto: "/",
                username: this.arcalive.user.username,
                password: this.arcalive.user.password
            }
        });
    }

    public async logout() {
        if (this.arcalive.user instanceof Anonymous)
            throw "Anonymous user cannot logout";

        await this.arcalive.client.get("u/logout");
    }
}
