import {Arcalive} from "./arcalive";

export class User {
    private readonly _arcalive: Arcalive;

    constructor(arcalive: Arcalive) {
        this._arcalive = arcalive;
    }

    /**
     * 유저 정보를 가져옵니다.
     * @param nickname
     * @param publicId 반고닉 아이디
     * @constructor
     */
    public async getInfo(nickname: string, publicId?: string) {
        const response = await this._arcalive.MobileClient.get(`/app/users/recent?nickname=${encodeURIComponent(nickname)}${publicId ? `&publicId=${publicId}` : ""}`);
        return response.data;
    }
}