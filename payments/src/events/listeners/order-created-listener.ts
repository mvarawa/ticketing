import {Message} from "node-nats-streaming";
import {Subjects,Listener,OrderCreatedEvent} from "@mtvtickets/common";
import {Order} from "../../models/order";
import {queueGroupName} from "./queue-group-name"
//import {TicketUpdatedPublisher} from "../publishers/ticket-updated-publishers";


export class OrderCreatedListener extends  Listener<OrderCreatedEvent>{
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data:OrderCreatedEvent["data"],msg:Message){

    const order = Order.build({
      id: data.id,
      price: data.ticket.price,
      status: data.status,
      userId: data.userId,
      version: data.version
    })

    await order.save();
    
    //ack the message
     msg.ack();
  }
}