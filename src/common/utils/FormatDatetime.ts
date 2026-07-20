import dayjs from "dayjs";

export default function FormatDatetime(date: Date): string {
    const now = new Date();

    if (date.getFullYear() == now.getFullYear()) {
        if (date.getDay() == now.getDay()) {
            const time = now.valueOf() - date.valueOf();
            if (now.valueOf() - date.valueOf() <= 1 * 60 * 60 * 1000) {
                return `${(time / (1000 * 60)) | 0}분 전`;
            } else {
                return `${(time / (1000 * 60 * 60)) | 0}시간 전`;
            }
        }

        return dayjs(date).format("MM-DD");
    }

    return dayjs(date).format("YYYY-MM-DD")
}