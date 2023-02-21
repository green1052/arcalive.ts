import { Arcalive } from "./arcalive.js";
import { Article } from "./article.js";

export class Channel {
    public readonly article: Article;

    constructor(
        private readonly arcalive: Arcalive,
        public readonly slug: string
    ) {
        this.article = new Article(arcalive, slug);
    }
}
