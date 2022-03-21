import { randomUUID } from "crypto";
import Order from "./order";
import OrderList from "./orderList";
import OrderTree from "./orderTree";
import { Quote } from "./quote";
import { Trade } from "./trade";


export default class OrderBook {
  currencyPair: string;
  bids: OrderTree;
  asks: OrderTree;
  tradeHistory: Trade[];
  lastChange: null | number;

  constructor(currencyPair: string) {
    this.currencyPair = currencyPair;
    this.bids = new OrderTree();
    this.asks = new OrderTree();
    this.tradeHistory = [];
    this.lastChange = null;
  }

  processOrderList(side: "buy" | "sell", orderlist: OrderList, quantityStillToTrade: number) {
    const trades: Trade[] = [];
    let quantityToTrade = quantityStillToTrade;

    while (orderlist.length > 0 && quantityToTrade > 0) {
      const headOrder = orderlist.getHeadOrder();
      const tradedPrice = headOrder.price;
      let tradedQuantity = 0;
      if (quantityToTrade < headOrder.quantity) {
        tradedQuantity = quantityToTrade;
        const newBookQty = headOrder.quantity - quantityToTrade;
        headOrder.updateQuantity(newBookQty, headOrder.timestamp);
        quantityToTrade = 0;
      } else if (quantityToTrade === headOrder.quantity) {
        tradedQuantity = quantityToTrade;
        if (side === "buy") {
          this.bids.removeOrderById(headOrder.orderId);
        } else {
          this.asks.removeOrderById(headOrder.orderId);
        }
        quantityToTrade = 0;
      } else {
        tradedQuantity = headOrder.quantity;
        if (side === "buy") {
          this.bids.removeOrderById(headOrder.orderId);
        } else {
          this.asks.removeOrderById(headOrder.orderId);
        }
        quantityToTrade = quantityToTrade - tradedQuantity;
      }

      // if trade occurred, add trade to trades for currenct process, as well as to tradeHistory of orderbook
      if (tradedQuantity !== 0) {
        const transactionRecord: Trade = {
          "id": randomUUID(),
          "tradedAt": Date.now(),
          "price": tradedPrice,
          "quantity": tradedQuantity,
          "currencyPair": this.currencyPair,
          "takerSide": side
        };
        this.tradeHistory.push(transactionRecord);
        trades.push(transactionRecord);
      }
    }

    return {
      quantityToTrade,
      trades
    };
  }

  processLimitOrder(quote: Quote): { trades: Trade[], orderInBook: Order | null } {
    let orderInBook = null;
    let trades: Trade[] = [];
    let newOrderAdded = false;
    let quantityToTrade = quote.quantity;
    const side = quote.side;
    const price = quote.price;

    if (side === "buy") {
      // if postOnly specified, then don't allow trades if not market maker
      if (!quote.postOnly || (quote.postOnly && !this.bids.priceExists(quote.price))){

        while (this.asks.length > 0 && price >= this.asks.minPrice() && quantityToTrade > 0) {
          const bestPriceAsks = this.asks.minPriceList();
          if (bestPriceAsks !== null) {
            let newTrades: Trade[];
            ({ quantityToTrade, trades: newTrades } = this.processOrderList("sell", bestPriceAsks, quantityToTrade));
            trades = [
              ...trades,
              ...newTrades
            ];
          }
        }

        // if quantity remains, add to order book
        if (quantityToTrade > 0) {
          quote.quantity = quantityToTrade;
          this.bids.insertOrder(quote);
          newOrderAdded = true;
          orderInBook = quote;
        }
      }
    } else if (side === "sell") {
      // if postOnly specified, then don't allow trades if not market maker
      if (!quote.postOnly || (quote.postOnly && !this.asks.priceExists(quote.price))) {

        while (this.bids.length > 0 && price <= this.bids.maxPrice() && quantityToTrade > 0) {
          const bestPriceBids = this.bids.maxPriceList();
          if (bestPriceBids !== null) {
            let newTrades: Trade[];
            ({ quantityToTrade, trades: newTrades } = this.processOrderList("buy", bestPriceBids, quantityToTrade));
            trades = [
              ...trades,
              ...newTrades
            ];
          }
        }

        // if quantity remains, add to order book
        if (quantityToTrade > 0) {
          quote.quantity = quantityToTrade;
          this.asks.insertOrder(quote);
          newOrderAdded = true;
          orderInBook = quote;
        }
      }
    }

    // if trade occurred or a new order was added to order book, update lastChange
    if (trades.length > 0 || newOrderAdded) {
      this.lastChange = Date.now();
    }

    return {
      trades,
      orderInBook
    };
  }

  getTopNBids(n: number) {
    return this.bids.maxNOrderLists(n);
  }

  getTopNAsks(n: number) {
    return this.asks.minNOrderLists(n);
  }
}