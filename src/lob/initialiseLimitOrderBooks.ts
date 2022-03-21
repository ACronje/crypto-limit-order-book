import OrderBook from "./orderBook";
import supportedCurrencyPairs from "./supportedCurrencyPairs";

export let limitOrderBooks: { [key: string]: OrderBook } = {
};

export const initialiseLimitOrderBooks = () => {
  limitOrderBooks = [...supportedCurrencyPairs].reduce((limitOrderBooksMap, currencyPair) => {
    limitOrderBooksMap[currencyPair] = new OrderBook(currencyPair);
    return limitOrderBooksMap;
  }, {
  });
};

initialiseLimitOrderBooks();
