import {Message} from "node-nats-streaming";
import {Subjects,Listener,ExpirationCompleteEvent,OrderStatus} from "@mtvtickets/common";
import {queueGroupName} from "./queue-group-name"
import {Order} from "../../models/order"
import {OrderCancelledPublisher} from "../publishers/order-cancelled-publisher";


export class ExpirationCompleteListener extends  Listener<ExpirationCompleteEvent>{
  readonly subject = Subjects.ExpirationComplete;
  queueGroupName = queueGroupName;

  async onMessage(data:ExpirationCompleteEvent["data"],msg:Message){
    const order = await Order.findById(data.orderId).populate("ticket");
    if(!order){
      throw new Error("Order not found")
    }
    //do not cancel if order is completed
    if(order.status===OrderStatus.Complete){
      return msg.ack();
    }
    //cancel if order is not completed within 1 or 15 min 
    order.set({
      status: OrderStatus.Cancelled,
    })
    await order.save();
    new OrderCancelledPublisher(this.client).publish({
        id: order.id,
        version: order.version,
        ticket:{
          id: order.ticket.id,
        }
    });
    msg.ack();
  };
}
