export default class Board {
    constructor(
        public readonly id: number | null,
        public url: string,
        public name: string,
        public description: string | null,
        public readonly createdBy: string,
        public canRead: boolean,
        public canWrite: boolean,
        public isPrivate: boolean,
        public createdAt: Date,
        public updatedAt: Date,
        public deletedAt: Date | null
    ) {}

    public static Create(url: string, name: string, createdBy: string, createdAt: Date) {
        return new Board(
            null,
            url,
            name,
            null,
            createdBy,
            true,
            true,
            false,
            createdAt,
            createdAt,
            null
        );
    }

    public static FromRow(row: any) {
        return new Board(
            row.id,
            row.url,
            row.name,
            row.description,
            row.createdBy,
            row.canRead,
            row.canWrite,
            row.isPrivate,
            row.createdAt,
            row.updatedAt,
            row.deletedAt
        );
    }
}