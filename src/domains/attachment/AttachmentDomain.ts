const FILE_URL_BASE = "/api/attachments/";

export default class Attachment {
    constructor(
        public readonly id: string | null,
        public authorId: string,
        public readonly postId: number | null,
        public readonly isImage: boolean,
        public readonly fileName: string,
        public readonly fileUrl: string,
        public readonly fileType: string,
        public readonly size: number,
        public readonly createdAt: Date,
        public deletedAt: Date | null,
    ) {}

    public static Create(authorId: string, fileUrl: string, fileName: string, isImage: boolean, fileType: string, size: number, createdAt: Date) {
        return new Attachment(null, authorId, null, isImage, fileName, fileUrl, fileType, size, createdAt, null);
    }

    public static FromRow(row: any) {
        return new Attachment(
            row.id,
            row.authorId,
            row.postId,
            row.isImage,
            row.fileName,
            row.fileUrl,
            row.fileType,
            row.size,
            row.createdAt,
            row.deletedAt
        );
    }
}