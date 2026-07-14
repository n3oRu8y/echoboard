import FileError from "./FileError.js"

export default class FileNotFound extends FileError {
    constructor(filePath: string) {
        super(`File not found: ${filePath}`);
    }
}