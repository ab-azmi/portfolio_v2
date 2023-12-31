export interface Article {
    id?: number,
    title?: string,
    content?: string,
    image?: string,
    slug?: string,
    created_at?: string,
    tags?: {
        value: string[],
    }
}