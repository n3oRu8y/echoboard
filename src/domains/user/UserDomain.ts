import ValidationException from "../../common/exceptions/ValidationException.js";

class PostSummery {
    constructor(
        public id: number,
        public title: string,
        public isAnonymous: boolean,
        public createdAt: Date
    ) {}

    public static FromRow(row: any) {
        return new PostSummery(
            row.id,
            row.title,
            row.isAnonymous,
            row.createdAt
        );
    }
}

class CommentSummery {
    constructor(
        public id: number,
        public content: string,
        public cretedAt: Date
    ) {}

    public static FromRow(row: any) {
        row.id,
        row.content,
        row.createdAt
    }
}

export default class User {
    constructor(
        public id: string | null,
        public readonly username: string,
        public password: string,
        public email: string,
        
        public nickname: string | null,

        public role: string,

        private _bannedUntil: Date | null,
        private _banReason: string | null,

        private _twoFactorEnabled: boolean,
        private _twoFactorSecret: string | null,

        public lastLoginAt: Date | null,
        public readonly createdAt: Date,
        public updatedAt: Date | null,
        public deletedAt: Date | null,

        public posts: Array<PostSummery>,
        public comments: Array<CommentSummery>
    ) {}

    static Create(username: string, password: string, email: string) {
        return new User(
            null,
            username,
            password,
            email,
            null,
            "USER",
            null,
            null,
            false,
            null,
            null,
            new Date(),
            null,
            null,
            [],
            []
        );
    }

    static FromRow(row: any): User {
        return new User(
            row.id,
            row.username,
            row.password,
            row.email,
            row.nickname ? row.nickname : row.username,
            row.role,
            row.bannedUntil,
            row.banReason,
            row.twoFactorEnabled,
            row.twoFactorSecret,
            row.lastLoginAt,
            row.createdAt,
            row.updatedAt,
            row.deletedAt,
            row.posts ? row.posts.map((post: any) => PostSummery.FromRow(post)) : [],
            row.comments ? row.comments.map((comment: any) => CommentSummery.FromRow(comment)) : []
        )
    }

    get bannedUntil() {
        return this._bannedUntil;
    }

    get banReason() {
        return this._banReason;
    }

    get twoFactorEnabled() {
        return this._twoFactorEnabled;
    }

    get twoFactorSecret() {
        return this._twoFactorSecret;
    }

    set twoFactorEnabled(value: boolean) {
        if (!this.twoFactorSecret) {
            throw new Error("TOTP is not configured");
        }
        this._twoFactorEnabled = value;
    }

    set twoFactorSecret(value: string | null) {
        if (this.twoFactorEnabled && !value) {
            throw new Error("TOTP is configured");
        }
        this._twoFactorSecret = value;
    }

    Ban(until: Date, reason: string | null = null) {
        this._bannedUntil = until;
        this._banReason = reason;
    }

    IsBanned(now: Date = new Date()): boolean {
        return !!this._bannedUntil && now < this._bannedUntil;
    }

    public SetNickname(nickname: string) {
        const nicknameRegex = /^[가-힣a-zA-Z0-9]{2,12}$/;
        if (!nicknameRegex.test(nickname))
            throw new ValidationException("Validation failed");
        this.nickname = nickname;
    }
}