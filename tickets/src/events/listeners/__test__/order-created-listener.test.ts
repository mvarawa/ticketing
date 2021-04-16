import {OrderCreatedEvent,OrderStatus} from "@mtvtickets/common"
import {OrderCreatedListener} from "../order-created-listener";
import {natsWrapper} from "../../../nats-wrapper"
import mongoose from "mongoose"
import{Message} from "node-nats-streaming"
import {Ticket} from "../../../models/tickets"

const setup = async()=>{

  //create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);
  
  //create and save a ticket
  const ticket = Ticket.build({
    title: "concert",
    price: 20,
    userId: "test"
  });
  await ticket.save();

  //create a fake data object
const data: OrderCreatedEvent["data"]={
  id: new mongoose.Types.ObjectId().toHexString(),
  version: 0,
  status: OrderStatus.Created,
  userId: "test",
  expiresAt: "test",
  ticket:{
    id: ticket.id,
    price: ticket.price
  } 
}
  //@ts-ignore
  const msg:Message={
      ack: jest.fn()
    }
    return {listener,ticket, data,msg}
  }
  
  it("sets the userid of the ticket", async()=>{
    const {listener,data,msg,ticket}=await setup();
    //call the onMessage func with the data object + message object
      await listener.onMessage(data,msg)
  //write assertions to make sure a ticket was created
    const updatedTicket = await Ticket.findById(ticket.id);
  
    expect(updatedTicket!.orderId).toEqual(data.id);
   
  })


  it("acks the message", async()=>{
    const {listener,data,msg,ticket}=await setup();
    await listener.onMessage(data,msg);
    expect(msg.ack).toHaveBeenCalled();
  
  })

  it("publishes a ticket updated event", async()=>{
    const {listener,data,msg,ticket}=await setup();
    await listener.onMessage(data,msg);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
    //@ts-ignore
    console.log(natsWrapper.client.publish.mock.calls);
    //mot to use ts ignore
    const ticketUpdatedData= JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

    expect(data.id).toEqual(ticketUpdatedData.orderId);
    

  })   