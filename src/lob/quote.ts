export interface Quote {
    timestamp?: number;
    quantity: number;
    price: number;
    orderId?: number;
    side: string;
    postOnly?: boolean;
}