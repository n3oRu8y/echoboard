class UserSummery {
    public constructor(
        public userId: string,
        public username: string,
        public nickname: string,
    ) {}
    public static FromRow(row: any) {
        return new UserSummery(
            row.userId,
            row.username,
            row.nickname
        );
    }
};

class PostSummery {
    public constructor(
        public title: string,
        public authorId: string,
        public boardId: number
    ) {}

    public static FromRow(row: any) {
        return new PostSummery(
            row.title,
            row.authorId,
            row.boardId
        );
    }
};

export default class Reaction {
    public constructor(
        public id: number | null,

        public userId: string,
        public user: UserSummery | null,

        public postId: number,
        public post: PostSummery | null,

        public type: number,

        public createdAt: Date,
        public updatedAt: Date
    ) {}

    public static FromRow(row: any) {
        return new Reaction(
            row.id,
            row.userId,
            row.user ? UserSummery.FromRow(row.user) : null,
            row.postId,
            row.post ? PostSummery.FromRow(row.post) : null,
            row.type,
            row.createdAt,
            row.updatedAt
        )
    }
};