import { ErrorResult, RateResult, WriteResult } from "./@types/result.js";
import { Arcalive } from "./arcalive.js";
import * as cheerio from "cheerio";
import { HTTPError, Response } from "got";

export class ArticleDetail {
    private isLoaded: boolean = false;

    private _title: string = "";
    private _content: string = "";
    private _category: string | null = null;

    private _upRate: number = -1;
    private _upRateIp: number = -1;

    private _downRate: number = -1;
    private _downRateIp: number = -1;

    private _view: number = -1;
    private _date: Date = new Date();

    constructor(
        private readonly arcalive: Arcalive,
        public readonly slug: string,
        public readonly id: string
    ) {}

    public get title(): string {
        if (!this.isLoaded) throw new Error("Article not loaded");
        return this._title;
    }

    public get content(): string {
        if (!this.isLoaded) throw new Error("Article not loaded");
        return this._content;
    }

    public get category(): string | null {
        if (!this.isLoaded) throw new Error("Article not loaded");
        return this._category;
    }

    public get upRate(): number {
        if (!this.isLoaded) throw new Error("Article not loaded");
        return this._upRate;
    }

    public get upRateIp(): number {
        if (!this.isLoaded) throw new Error("Article not loaded");
        return this._upRateIp;
    }

    public get downRate(): number {
        if (!this.isLoaded) throw new Error("Article not loaded");
        return this._downRate;
    }

    public get downRateIp(): number {
        if (!this.isLoaded) throw new Error("Article not loaded");
        return this._downRateIp;
    }

    public get view(): number {
        if (!this.isLoaded) throw new Error("Article not loaded");
        return this._view;
    }

    public get date(): Date {
        if (!this.isLoaded) throw new Error("Article not loaded");
        return this._date;
    }

    public async load() {
        const response = await this.isExist();

        if (!response) throw new Error("Article not found");

        const $ = cheerio.load(response.body);

        const category = $(".article-head .category-badge").text();

        this._category = category || null;
        this._title = $(".article-head .title:not(span)")
            .text()
            .replace(category, "")
            .replace(/(\r\n|\n|\r)/gm, "");

        this._content = $(".article-body").html() as string;

        this._upRate = Number($("#ratingUp").text());
        this._upRateIp = Number($("#ratingUpIp").text());

        this._downRate = Number($("#ratingDown").text());
        this._downRateIp = Number($("#ratingDownIp").text());

        this._view = Number(
            $(`.article-info > .head:contains("조회수") + .body`).text()
        );

        this._date = new Date($(".article-info > .date time").text());
    }

    public get url(): string {
        return `https://arca.live/b/${this.slug}/${this.id}`;
    }

    public async isExist(): Promise<Response<string> | false> {
        try {
            const response = await this.arcalive.client.get(
                `b/${this.slug}/${this.id}`
            );

            return response.ok ? response : false;
        } catch (e) {
            if (e instanceof HTTPError) {
                if (!e.response.ok) return false;
                throw e;
            }

            throw e;
        }
    }

    public async edit(
        title: string,
        content: string,
        category?: string,
        hidePreview?: boolean
    ) {
        const url = `b/${this.slug}/${this.id}/edit`;

        const response = await this.arcalive.client.get(url);
        const $ = cheerio.load(response.body);
        const _csrf = $("input[name=_csrf]").val() as string;
        const token = $("input[name=token]").val() as string;

        await this.arcalive.client.post(url, {
            form: {
                _csrf,
                token,
                contentType: "html",
                agreePreventDelete: "on",
                category: category ?? "",
                hidden_preview: hidePreview ? "on" : "",
                title,
                content
            }
        });
    }

    public async delete() {
        const url = `b/${this.slug}/${this.id}/delete`;

        const response = await this.arcalive.client.get(url);
        const $ = cheerio.load(response.body);
        const _csrf = $("input[name=_csrf]").val() as string;

        await this.arcalive.client.post(url, {
            form: {
                _csrf
            }
        });
    }

    public async rate(type: "up" | "down"): Promise<RateResult | ErrorResult> {
        const response = await this.arcalive.client.get(
            `b/${this.slug}/${this.id}`
        );
        const $ = cheerio.load(response.body);
        const _csrf = $("input[name=_csrf]").val() as string;

        const url = `api/rate/${this.slug}/${this.id}`;

        return this.arcalive.client
            .post(url, {
                form: {
                    _csrf,
                    value: type === "up" ? "1" : "-1",
                    "g-recaptcha-response": ""
                }
            })
            .json<RateResult | ErrorResult>();
    }
}

export class Article {
    constructor(
        private readonly arcalive: Arcalive,
        public readonly slug: string
    ) {}

    public async get(id: string): Promise<ArticleDetail> {
        return new ArticleDetail(this.arcalive, this.slug, id);
    }

    public async write(
        title: string,
        content: string,
        category?: string,
        hidePreview?: boolean
    ): Promise<ArticleDetail> {
        const url = `b/${this.slug}/write`;
        const response = await this.arcalive.client.get(url);
        const $ = cheerio.load(response.body);
        const _csrf = $("input[name=_csrf]").val() as string;
        const token = $("input[name=token]").val() as string;

        const json = await this.arcalive.client
            .post(url, {
                form: {
                    _csrf,
                    token,
                    contentType: "html",
                    agreePreventDelete: "on",
                    category: category ?? "",
                    hidden_preview: hidePreview ? "on" : "",
                    title,
                    content
                }
            })
            .json<WriteResult>();

        if (!json.success) throw "Failed to write article";

        if (json.articleId === undefined) throw "Failed to write article";

        return new ArticleDetail(
            this.arcalive,
            this.slug,
            String(json.articleId)
        );
    }
}
