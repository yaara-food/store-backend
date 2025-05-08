export function title_to_handle(title: string): string {
    const handle = title.trim().replace(/\s+/g, "-"); // Replace spaces with dash
    return handle;
}

export enum OrderStatus {
    NEW = "new",
    READY = "ready",
    DONE = "done",
    CANCELED = "canceled",
}

export const email_data = {
    subjectPrefix: "אישור הזמנה - מס'",
    greeting: "שלום",
    confirmation: "ההזמנה שלך נקלטה.",
    orderNumberLabel: "מספר הזמנה:",
    totalLabel: `סה"כ לתשלום: ₪`,
};