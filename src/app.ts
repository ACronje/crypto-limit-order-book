import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import supportedCurrencyPairs from "./lob/supportedCurrencyPairs";
import { validate } from "jsonschema";
import limitOrderSchema from "./limitOrderSchema.json";
import { Quote } from "./lob/quote";
import { randomUUID } from "crypto";
import { limitOrderBooks } from "./lob/initialiseLimitOrderBooks";

const app = express();
app.use(bodyParser.json());

app.get("/:currencyPair/orderbook", (request: Request, response: Response) => {
  const currencyPair = request.params.currencyPair.toUpperCase();
  if (!supportedCurrencyPairs.has(currencyPair)) {
    response.status(400).json(["currencyPair not supported"]);
    return;
  }

  const limitOrderBook = limitOrderBooks[currencyPair];
  const topAsksList = limitOrderBook.getTopNAsks(3);
  const asks = topAsksList.map(ask => {
    return {
      side: "sell",
      quantity: ask.quantity,
      price: ask.price,
      currencyPair: currencyPair,
      orderCount: ask.length
    };
  });

  const topBidsList = limitOrderBook.getTopNBids(3);
  const bids = topBidsList.map(bid => {
    return {
      side: "buy",
      quantity: bid.quantity,
      price: bid.price,
      currencyPair: currencyPair,
      orderCount: bid.length
    };
  });

  response.status(200).json({
    LastChange: limitOrderBook.lastChange,
    Asks: asks,
    Bids: bids
  });
});

app.get("/:currencyPair/tradehistory", (request: Request, response: Response) => {
  const currencyPair = request.params.currencyPair.toUpperCase();
  if (!supportedCurrencyPairs.has(currencyPair)) {
    response.status(400).json(["currencyPair not supported"]);
    return;
  }

  const limitOrderBook = limitOrderBooks[currencyPair];

  const transactions = limitOrderBook.tradeHistory.map(transaction => {
    return {
      price: transaction.price,
      quantity: transaction.quantity,
      currencyPair: transaction.currencyPair,
      tradedAt: transaction.tradedAt,
      takerSide: transaction.takerSide,
      id: transaction.id
    };
  });

  response.status(200).json(transactions);
});

app.post("/:currencyPair/orders/limit", (request: Request, response: Response) => {
  const result = validate(request.body, limitOrderSchema);
  if (!result.valid) {
    response.status(400).json(result.errors.map(error => error.stack));
    return;
  }
  const currencyPair = request.params.currencyPair.toUpperCase();
  if (!supportedCurrencyPairs.has(currencyPair)) {
    response.status(400).json(["currencyPair not supported"]);
    return;
  }

  const quote: Quote = {
    ...request.body,
    orderId: randomUUID() 
  };
  const limitOrderBook = limitOrderBooks[currencyPair];
  const { trades, orderInBook } = limitOrderBook.processLimitOrder(quote);
  let orderId = null;
  if (orderInBook) {
    orderId = orderInBook.orderId;
  }

  response.status(200).json({
    orderId: orderId,
    transactionIds: trades.map(tx => tx.id)
  });
});

export default app;
