import "multer";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { StoredFile } from "./FileStorage.js";
import FileStorage from "./FileStorage.js";
import FileNotFound from "../../domains/file/errors/FileNotFound.js";

export class LocalFileStorage extends FileStorage {
    public async Save(file: Express.Multer.File, directory: string): Promise<StoredFile> {

        const storedName =
            `${crypto.randomUUID()}${path.extname(file.originalname)}`;

        const uploadDirectory = path.join(process.cwd(), "uploads", directory);

        await fs.mkdir(uploadDirectory, {
            recursive: true
        });

        const filePath = path.join(uploadDirectory, storedName);

        await fs.writeFile(filePath, file.buffer);

        return new StoredFile(
            file.originalname,
            storedName,
            filePath.replace(/\\/g, "/"),
            file.mimetype,
            file.size
        );
    }

    public async Delete(filePath: string): Promise<void> {
        try {
            await fs.unlink(filePath);
        } catch (error: any) {
            if (error.code !== "ENOENT") {
                throw error;
            }
        }
    }

    public async Exists(filePath: string): Promise<boolean> {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    public async Move(from: string, to: string): Promise<void> {
        await fs.mkdir(path.dirname(to), {
            recursive: true
        });

        await fs.rename(from, to);
    }

    public async Read(filePath: string): Promise<Buffer> {
        return await fs.readFile(filePath);
    }
}