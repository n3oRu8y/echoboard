export class StoredFile {
    constructor(
        public originalName: string,
        public storedName: string,
        public path: string,
        public mimeType: string,
        public size: number
    ) {}
}

export default class FileStorage {
    public async Save(file: Express.Multer.File, directory: string): Promise<StoredFile> { throw new Error(); }
    public async Delete(filePath: string): Promise<void> {}
    public async Exists(filePath: string): Promise<boolean> { throw new Error(); }
    public async Move(from: string, to: string): Promise<void> {}
    public async Read(filePath: string): Promise<Buffer> { throw new Error(); }
}