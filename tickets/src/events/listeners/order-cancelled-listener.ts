import {Message} from "node-nats-streaming";
import {Subjects,Listener,OrderCancelledEvent} from "@mtvtickets/common";
import {Ticket} from "../../models/tickets";
import {queueGroupName} from "./queue-group-name"
import {TicketUpdatedPublisher} from "../publishers/ticket-updated-publishers";


export class OrderCancelledListener extends  Listener<OrderCancelledEvent>{
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data:OrderCancelledEvent["data"],msg:Message){
    //Find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    //if no ticket, throw error
    if(!ticket){
      throw new Error("Ticket not found");
    }
    //mark the ticket as order cancelled by setting as null or undefined
    ticket.set({orderId: undefined});
    // update the ticket
    await ticket.save();
    //publish event that ticket has been updated
    await new TicketUpdatedPublisher(this.client).publish({
      id:ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      orderId: ticket.orderId,
      version: ticket.version,
    });
    //ack the message
     msg.ack();
  }
}