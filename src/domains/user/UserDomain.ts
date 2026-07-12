export default class User {
    constructor(
        public id: string | null,
        public readonly username: string,
        private _password: string,
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
            null
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
            row._twoFactorEnabled,
            row._twoFactorSecret,
            row.lastLoginAt,
            row.createdAt,
            row.updatedAt,
            row.deletedAt
        )
    }

    get password() {
        return this._password;
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

    Ban(until: Date, reason: string | null = null) {
        this._bannedUntil = until;
        this._banReason = reason;
    }

    IsBanned(now: Date = new Date()): boolean {
        return !!this._bannedUntil && now < this._bannedUntil;
    }
}