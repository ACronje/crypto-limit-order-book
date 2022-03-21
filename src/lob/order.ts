import OrderList from "./orderList";

export default class Order {
  timestamp: number;
  quantity: number;
  price: number;
  orderId: number;
  nextOrder: Order;
  prevOrder: Order;
  orderList: OrderList;
  
  constructor(timestamp: number, quantity: number, price: number, orderId: number, orderList: OrderList) {
    this.timestamp = timestamp;
    this.quantity = quantity;
    this.price = price;
    this.orderId = orderId;
    this.nextOrder = null;
    this.prevOrder = null;
    this.orderList = orderList;
  }

  updateQuantity(newQuantity: number, newTimestamp: number) {
    this.orderList.quantity = this.orderList.quantity - (this.quantity - newQuantity);
    this.timestamp = newTimestamp;
    this.quantity = newQuantity;
  }
}