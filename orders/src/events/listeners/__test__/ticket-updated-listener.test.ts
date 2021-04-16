import {TicketUpdatedEvent} from "@mtvtickets/common"
import {TicketUpdatedListener} from "../ticket-updated-listener";
import {natsWrapper} from "../../../nats-wrapper"
import mongoose from "mongoose"
import{Message} from "node-nats-streaming"
import {Ticket} from "../../../models/ticket"
const setup = async()=>{

//create an instance of the listener
const listener = new TicketUpdatedListener(natsWrapper.client);
//create and save a ticket
const ticket = Ticket.build({
  id: new mongoose.Types.ObjectId().toHexString(),
  title: "concert",
  price: 20
})
await ticket.save();
//create a fake data object
const data: TicketUpdatedEvent["data"]={
  id: ticket.id,
  version:ticket.version + 1,
  title: "new concert",
  price: 99,
  userId: new mongoose.Types.ObjectId().toHexString(),
}
//create a fake message object
//@ts-ignore
const msg:Message={
    ack: jest.fn()
  }
  return {listener,data,msg,ticket}
}

it("finds, updates and saves a ticket ", async()=>{
  const {listener,data,msg,ticket}=await setup();
  //call the onMessage func with the data object + message object
    await listener.onMessage(data,msg)
//write assertions to make sure a ticket was created
  const updatedTicket = await Ticket.findById(data.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it("acks the message", async()=>{
  const {listener,data,msg}=await setup();
  //call the onMessage func with the data object + message object
    await listener.onMessage(data,msg)

//write assertions to make sure ack func is called
  expect(msg.ack).toHaveBeenCalled();

});

it("does not call ack if the event has a skipped version number", async()=>{
  const {listener,data,msg,ticket}=await setup();
  data.version=10;
  try{
  await listener.onMessage(data,msg);
  }catch (err){

  }
  expect(msg.ack).not.toHaveBeenCalled();

})