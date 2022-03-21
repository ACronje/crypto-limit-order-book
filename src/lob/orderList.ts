import Order from "./order";

export default class OrderList {
  price: number;
  headOrder: Order;
  tailOrder: Order;
  length: number;
  quantity: number;
  last: Order;

  constructor(price: number) {
    this.price = price;
    this.headOrder = null;
    this.tailOrder = null;
    this.length = 0;
    this.quantity = 0;
    this.last = null;
  }
        
  getHeadOrder() {
    return this.headOrder;
  }
    
  appendOrder(order: Order) {
    if (this.length === 0) {
      order.nextOrder = null;
      order.prevOrder = null;
      this.headOrder = order;
      this.tailOrder = order;
    } else {
      order.prevOrder = this.tailOrder;
      order.nextOrder = null;
      this.tailOrder.nextOrder = order;
      this.tailOrder = order;
    }
    this.length = this.length + 1;
    this.quantity = this.quantity + order.quantity;
  }
        
  removeOrder(order: Order) {
    this.quantity = this.quantity - order.quantity;
    this.length = this.length - 1;
    if (this.length === 0) return;

    const nextOrder = order.nextOrder;
    const prevOrder = order.prevOrder;
    if (nextOrder !== null && prevOrder !== null) {
      nextOrder.prevOrder = prevOrder;
      prevOrder.nextOrder = nextOrder;
    } else if (nextOrder !== null) {
      nextOrder.prevOrder = null;
      this.headOrder = nextOrder;
    } else if (prevOrder !== null) {
      prevOrder.nextOrder = null;
      this.tailOrder = prevOrder;
    }
  }

  *[Symbol.iterator]() {
    this.last = this.headOrder;
    yield this;
    while (this.last !== null) {
      const value = this.last;
      this.last = this.last.nextOrder;
      yield value;
    }
  }
}
