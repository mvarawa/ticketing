import {Message} from "node-nats-streaming";
import {Subjects,Listener,OrderCancelledEvent, OrderStatus} from "@mtvtickets/common";
import {Order} from "../../models/order";
import {queueGroupName} from "./queue-group-name"



export class OrderCancelledListener extends  Listener<OrderCancelledEvent>{
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data:OrderCancelledEvent["data"],msg:Message){
    //Find the order that the order is reserving

    const order = await Order.findOne({
        _id: data.id,
        version: data.version -1
    });

    if(!order){
      throw new Error("Order not found")
    }

    order.set({status: OrderStatus.Cancelled});
    await order.save();
    //ack the message
     msg.ack();
  }
}