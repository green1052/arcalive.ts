import {Arcalive} from "./arcalive";
import * as cheerio from "cheerio";

interface ChannelInfo {
    category: string[];
    name: string;
    description: string;
    slug: string,
    subscribes: number
}

interface NoticeInfo {
    type: "global" | "channel"
}

export class Channel {
    private readonly _arcalive: Arcalive;

    constructor(arcalive: Arcalive) {
        this._arcalive = arcalive;
    }

    /**
     * 채널 정보를 가져옵니다.
     * @param slug
     */
    public async getInfo(slug: string): Promise<ChannelInfo> {
        const response = await this._arcalive.Client.get(`/b/${slug}`);
        const $ = cheerio.load(response.data);

        const $desc = $(`div[class="desc"]`);

        return {
            category: Array.from($(".board-category a").map((i, el) => $(el).text().trim())),
            name: $("a[data-channel-name]").text(),
            description: $desc.eq(1).text().trim(),
            slug: slug,
            subscribes: Number(/^구독자 (\d*)명$/i.exec($desc.eq(0).text().trim())?.[1] ?? NaN)
        };
    }

    public async getNotices(slug: string) {

    }
}

// TODO 모바일 API 일부 사용하기..