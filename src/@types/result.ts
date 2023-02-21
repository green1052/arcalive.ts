export interface ErrorResult {
    result: boolean;
    message: string;
}

export interface WriteResult {
    success: boolean;
    slug: string;
    articleId: number;
    path: string;
}

export interface RateResult {
    id: number;
    ratingUp: number;
    ratingDown: number;
    ratingUpIp: number;
    ratingDownIp: number;
}
