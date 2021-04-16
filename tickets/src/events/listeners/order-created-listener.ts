import {Message} from "node-nats-streaming";
import {Subjects,Listener,OrderCreatedEvent} from "@mtvtickets/common";
import {Ticket} from "../../models/tickets";
import {queueGroupName} from "./queue-group-name"
import {TicketUpdatedPublisher} from "../publishers/ticket-updated-publishers";


export class OrderCreatedListener extends  Listener<OrderCreatedEvent>{
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data:OrderCreatedEvent["data"],msg:Message){
    //Find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    //if no ticket, throw error
    if(!ticket){
      throw new Error("Ticket not found");
    }
    //mark the ticket as being reserved by setting its orderId property
    ticket.set({orderId: data.id});
    // Save the ticket
    await ticket.save();
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