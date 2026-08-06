export default class TurnstileFailed extends Error {
    public constructor(message: string) {
        super(message);
    }
}