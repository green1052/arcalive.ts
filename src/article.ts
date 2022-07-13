import {Arcalive} from "./arcalive";
import * as cheerio from "cheerio";
import {AxiosError} from "axios";
import {AnonymousUser} from "./user/anonymousUser";

interface Rate {
    id: string;
    ratingDown: number;
    ratingDownIp: number;
    ratingUp: number;
    ratingUpIp: number;
}

interface RateError {
    message: string;
    result: false;
}

export class Article {
    private readonly _arcalive: Arcalive;

    constructor(arcalive: Arcalive) {
        this._arcalive = arcalive;
    }

    /**
     * 게시글을 추천, 비추천합니다.
     * @param slug
     * @param index
     * @param value -1 = 비추천, 1 = 추천
     * @constructor
     */
    public async Rate(slug: string, index: string, value: -1 | 1): Promise<Rate | RateError> {
        const params = new URLSearchParams();
        params.set("_csrf", await this._arcalive.Auth.GetCsrf());
        params.set("value", String(value));
        params.set("g-recaptcha-response", this._arcalive.Auth.IsUser() ? "" : await this._arcalive.Auth.GetRecaptcha());

        try {
            return await this._arcalive.Client.post(`/api/rate/${slug}/${index}`, params);
        } catch (e) {
            if (e instanceof AxiosError)
                return e.response?.data;

            throw e;
        }
    }

    /**
     * 게시글을 작성합니다.
     * @param slug
     * @param category
     * @param title
     * @param content
     * @param hiddenPreview 채널 목록에서 이미지 미리보기가 표시되지 않습니다.
     * @constructor
     */
    public async Write(slug: string, category: string, title: string, content: string, hiddenPreview: boolean = false) {
        const response = await this._arcalive.Client.get(`/b/${slug}/write`);

        const $ = cheerio.load(response.data);
        const csrf = $("input[name=_csrf]").val() as string;
        const token = $("input[name=token]").val() as string;

        const params = new URLSearchParams();
        params.set("_csrf", csrf);
        params.set("token", token);
        params.set("contentType", "html");
        params.set("category", encodeURIComponent(category));
        params.set("title", title);
        params.set("content", content);
        params.set("hidden_preview", String(hiddenPreview));

        if (this._arcalive.Auth.IsAnonymous()) {
            const anonymousUser = this._arcalive.User as AnonymousUser;

            params.set("nickname", anonymousUser.nickname);
            params.set("password", anonymousUser.password);
            params.set("g-recaptcha-response", await this._arcalive.Auth.GetRecaptcha());
        }

        await this._arcalive.Client.post(`/b/${slug}/write`, params);
    }
}