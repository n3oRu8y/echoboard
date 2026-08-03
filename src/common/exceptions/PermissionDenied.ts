export default class PermissionDenied extends Error {
    public constructor(message: string) {
        super(message);
    }  
};