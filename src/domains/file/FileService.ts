import type FileStorage from "../../infrastructures/storage/FileStorage.js";
import FileNotFound from "./errors/FileNotFound.js";

export default class FileService {
    constructor(
        private storage: FileStorage
    ) {}

    public async Save(file: Express.Multer.File, directory: string) {
        return await this.storage.Save(file, directory);
    }

    public async Read(filePath: string): Promise<Buffer>;
    public async Read(filePath: string, silent: false): Promise<Buffer>;
    public async Read(filePath: string, silent: true): Promise<Buffer | null>;

    public async Read(filePath: string, silent: boolean = false): Promise<Buffer | null> {
        if (!(await this.storage.Exists(filePath))) {
            if (!silent) throw new FileNotFound(filePath);
            else return null;
        }
        return this.storage.Read(filePath);
    }
}