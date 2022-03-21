import createRBTree, { Tree as RBTree } from "functional-red-black-tree";
import Order from "./order";
import OrderList from "./orderList";
import { Quote } from "./quote";


interface PriceMap {
    [key: string]: OrderList;
}

interface OrderMap {
    [key: string]: Order;
}

export default class OrderTree {
  priceTree: RBTree<number, OrderList>;
  priceMap: PriceMap;
  orderMap: OrderMap;
  quantity: number;
  nOrders: number;
  lobDepth: number;

  constructor() {
    this.priceTree = createRBTree();  // this RB tree comes from a functional lib, so not very performant. But the idea is there...
    this.priceMap = {
    };
    this.orderMap = {
    };
    this.quantity = 0;
    this.nOrders = 0;
    this.lobDepth = 0;
  }
        
  get length() {
    return this.nOrders;
  }
    
  getPrice(price: number) {
    return this.priceMap[price];
  }
    
  getOrder(orderId: string) {
    return this.orderMap[orderId];
  }
    
  createPrice(price: number) {
    this.lobDepth = this.lobDepth + 1;
    const newList = new OrderList(price);
    this.priceTree = this.priceTree.insert(price, newList);
    this.priceMap[price] = newList;
  }
        
  removePrice(price: number) {
    this.lobDepth = this.lobDepth - 1;
    this.priceTree = this.priceTree.remove(price);
    delete this.priceMap[price];
  }
        
  priceExists(price: number) {
    return price in this.priceMap;
  }
    
  orderExists(orderId: number) {
    return orderId in this.orderMap;
  }
    
  insertOrder(quote: Quote) {
    this.nOrders = this.nOrders + 1;
    if (!(quote.price in this.priceMap)) {
      this.createPrice(quote.price);
    }
    const order = new Order(quote.timestamp, quote.quantity, quote.price, quote.orderId, this.priceMap[quote.price]);
    this.priceMap[order.price].appendOrder(order);
    this.orderMap[order.orderId] = order;
    this.quantity = this.quantity + order.quantity;
  }
        
  removeOrderById(orderId: number) {
    this.nOrders = this.nOrders - 1;
    const order = this.orderMap[orderId];
    this.quantity = this.quantity - order.quantity;
    order.orderList.removeOrder(order);
    if (order.orderList.length === 0) {
      this.removePrice(order.price);
    }
    delete this.orderMap[orderId];
  }

  maxNOrderLists(n: number) {
    const orderLists: OrderList[] = [];
    if (this.lobDepth > 0) {
      const it = this.priceTree.end;
      while (it.node && orderLists.length < n) {
        orderLists.push(it.node.value);
        it.prev();
      }
    }
    return orderLists;
  }

  minNOrderLists(n: number) {
    const orderLists: OrderList[] = [];
    if (this.lobDepth > 0) {
      const iterator = this.priceTree.begin;
      while (iterator.node && orderLists.length < n) {
        orderLists.push(iterator.node.value);
        iterator.next();
      }
    }
    return orderLists;
  }
        
  maxPrice() {
    if (this.lobDepth === 0) return null;
    return this.priceTree.end.node.key;
  }
    
  minPrice() {
    if (this.lobDepth === 0) return null;
    return this.priceTree.begin.node.key;
  }
    
  maxPriceList() {
    if (this.lobDepth === 0) return null;
    return this.getPrice(this.maxPrice());
  }
    
  minPriceList() {
    if (this.lobDepth === 0) return null;
    return this.getPrice(this.minPrice());
  }
}