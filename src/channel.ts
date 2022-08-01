import {Arcalive} from "./arcalive";

export class Channel {
    private readonly _arcalive: Arcalive;

    constructor(arcalive: Arcalive) {
        this._arcalive = arcalive;
    }

    /**
     * 채널 정보를 가져옵니다.
     * @param slug
     * @constructor
     */
    public async GetInfo(slug: string) {
        const response = await this._arcalive.MobileClient.get(`/app/info/channel/${slug}`);
        return response.data;
    }

    /**
     * 채널 공지를 가져옵니다.
     * @param slug
     * @constructor
     */
    public async GetNotices(slug: string) {
        const response = await this._arcalive.MobileClient.get(`/app/list/channel/${slug}/notice`);
        return response.data.articles.filter((data: { nickname: string; }) => !data.nickname.startsWith("*"));
    }

    /**
     * 주요 채널을 가져옵니다.
     * @constructor
     */
    public async GetMainChannels() {
        const response = await this._arcalive.MobileClient.get("/app/list/channels/main");
        return response.data;
    }

    /**
     * 모든 채널을 가져옵니다.
     * @constructor
     */
    public async GetChannels() {
        const response = await this._arcalive.MobileClient.get("/app/list/channels");
        return response.data;
    }
}