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
     * 게시글을 가져옵니다
     * @param slug
     * @param articleId
     * @constructor
     */
    public async GetArticle(slug: string, articleId: string) {
        const response = await this._arcalive.MobileClient.get(`/app/view/article/${slug}/${articleId}`);
        return response.data;
    }

    /**
     * 댓글을 가져옵니다.
     * @param slug
     * @param articleId
     * @param page
     * @constructor
     */
    public async GetComment(slug: string, articleId: string, page: number = 0) {
        // const response = await this._arcalive.Client.get(`/b/${slug}/${index}?cp=${page}`);
        // const $ = cheerio.load(response.data);
        //
        // return response.data;
    }

    /**
     * 게시글을 추천, 비추천합니다.
     * @param slug
     * @param articleId
     * @param value -1 = 비추천, 1 = 추천
     * @constructor
     */
    public async Rate(slug: string, articleId: string, value: -1 | 1): Promise<Rate | RateError> {
        const params = new URLSearchParams();
        params.set("_csrf", await this._arcalive.Auth.GetCsrf());
        params.set("value", String(value));
        params.set("g-recaptcha-response", this._arcalive.Auth.IsUser() ? "" : await this._arcalive.Auth.GetRecaptcha());

        try {
            return await this._arcalive.Client.post(`/api/rate/${slug}/${articleId}`, params);
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
            const anonymousUser = this._arcalive.UserInfo as AnonymousUser;

            params.set("nickname", anonymousUser.nickname);
            params.set("password", anonymousUser.password);
            params.set("g-recaptcha-response", await this._arcalive.Auth.GetRecaptcha());
        }

        await this._arcalive.Client.post(`/b/${slug}/write`, params);
    }

    /**
     * 게시글을 수정합니다.
     * @param slug
     * @param category
     * @param title
     * @param content
     * @param hiddenPreview 채널 목록에서 이미지 미리보기가 표시되지 않습니다.
     * @constructor
     */
    public async Edit(slug: string, category: string, title: string, content: string, hiddenPreview: boolean = false) {
        const response = await this._arcalive.Client.get(`/b/${slug}/edit`);

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
            const anonymousUser = this._arcalive.UserInfo as AnonymousUser;

            params.set("nickname", anonymousUser.nickname);
            params.set("password", anonymousUser.password);
            params.set("g-recaptcha-response", await this._arcalive.Auth.GetRecaptcha());
        }

        await this._arcalive.Client.post(`/b/${slug}/edit`, params);
    }


    /**
     * 게시글을 삭제합니다.
     * @param slug
     * @param articleId
     * @constructor
     */
    public async Delete(slug: string, articleId: string) {
        const response = await this._arcalive.Client.get(`/b/${slug}/${articleId}/delete`);

        const $ = cheerio.load(response.data);
        const csrf = $("input[name=_csrf]").val() as string;

        const params = new URLSearchParams();
        params.set("_csrf", csrf);

        if (this._arcalive.Auth.IsAnonymous()) {
            const anonymousUser = this._arcalive.UserInfo as AnonymousUser;
            params.set("password", anonymousUser.password);
        }

        await this._arcalive.Client.post(`/b/${slug}/${articleId}/deletet`, params);
    }

    /**
     * 게시물을 스크랩하거나 삭제합니다.
     * @param slug
     * @param articleId
     * @constructor
     */
    public async Scrap(slug: string, articleId: string) {
        const response = await this._arcalive.Client.get(`/api/scrap?slug=${slug}&articleId=${articleId}`);
        return response.data;
    }

    /**
     * 댓글을 작성합니다.
     * @param slug
     * @param articleId
     * @param content
     * @param contentType
     * @constructor
     */
    public async WriteComment(slug: string, articleId: string, content: string, contentType = "text") {
        const response = await this._arcalive.Client.get(`/b/${slug}/${articleId}`);

        const $ = cheerio.load(response.data);
        const csrf = $("input[name=_csrf]").val() as string;

        const params = new URLSearchParams();
        params.set("_csrf", csrf);
        params.set("contentType", contentType);
        params.set("content", content);

        if (this._arcalive.Auth.IsAnonymous()) {
            const anonymousUser = this._arcalive.UserInfo as AnonymousUser;

            params.set("nickname", anonymousUser.nickname);
            params.set("password", anonymousUser.password);
            params.set("g-recaptcha-response", await this._arcalive.Auth.GetRecaptcha());
        }

        await this._arcalive.Client.post(`/b/${slug}/${articleId}/comment`, params);
    }

    /**
     * 댓글을 수정합니다.
     * @param slug
     * @param articleId
     * @param commentId
     * @param content
     * @param contentType
     * @constructor
     */
    public async ReplaceComment(slug: string, articleId: string, commentId: string, content: string, contentType = "text") {
        const response = await this._arcalive.Client.get(`/b/${slug}/${articleId}`);

        const $ = cheerio.load(response.data);
        const csrf = $("input[name=_csrf]").val() as string;

        const params = new URLSearchParams();
        params.set("_csrf", csrf);
        params.set("contentType", contentType);
        params.set("content", content);

        if (this._arcalive.Auth.IsAnonymous()) {
            const anonymousUser = this._arcalive.UserInfo as AnonymousUser;

            params.set("nickname", anonymousUser.nickname);
            params.set("password", anonymousUser.password);
            params.set("g-recaptcha-response", await this._arcalive.Auth.GetRecaptcha());
        }

        await this._arcalive.Client.post(`/b/${slug}/${articleId}/${commentId}/edit`, params);
    }

    /**
     * 댓글을 삭제합니다.
     * @param slug
     * @param articleId
     * @param commentId
     * @param content
     * @param contentType
     * @constructor
     */
    public async DeleteComment(slug: string, articleId: string, commentId: string, content: string, contentType = "text") {
        const response = await this._arcalive.Client.get(`/b/${slug}/${articleId}`);

        const $ = cheerio.load(response.data);
        const csrf = $("input[name=_csrf]").val() as string;

        const params = new URLSearchParams();
        params.set("_csrf", csrf);
        params.set("contentType", contentType);
        params.set("content", content);

        if (this._arcalive.Auth.IsAnonymous()) {
            const anonymousUser = this._arcalive.UserInfo as AnonymousUser;
            params.set("password", anonymousUser.password);
        }

        await this._arcalive.Client.post(`/b/${slug}/${articleId}/${commentId}/delete`, params);
    }

    /**
     * 댓글에 답변합니다.
     * @param slug
     * @param articleId
     * @param parentId
     * @param content
     * @param contentType
     * @constructor
     */
    public async ReplyComment(slug: string, articleId: string, parentId: string, content: string, contentType = "text") {
        const response = await this._arcalive.Client.get(`/b/${slug}/${articleId}`);

        const $ = cheerio.load(response.data);
        const csrf = $("input[name=_csrf]").val() as string;

        const params = new URLSearchParams();
        params.set("_csrf", csrf);
        params.set("contentType", contentType);
        params.set("parentId", parentId);
        params.set("content", content);

        if (this._arcalive.Auth.IsAnonymous()) {
            const anonymousUser = this._arcalive.UserInfo as AnonymousUser;

            params.set("nickname", anonymousUser.nickname);
            params.set("password", anonymousUser.password);
            params.set("g-recaptcha-response", await this._arcalive.Auth.GetRecaptcha());
        }

        await this._arcalive.Client.post(`/b/${slug}/${articleId}/comment`, params);
    }
}