export interface Trade {
    id: string;
    tradedAt: number;
    price: number;
    quantity: number;
    currencyPair: string;
    takerSide: "buy" | "sell";
}
