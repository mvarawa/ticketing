import {OrderCreatedEvent,OrderStatus} from "@mtvtickets/common"
import {OrderCreatedListener} from "../order-created-listener";
import {natsWrapper} from "../../../nats-wrapper"
import mongoose from "mongoose"
import{Message} from "node-nats-streaming"
import {Order} from "../../../models/order"

const setup = async()=>{

  //create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);
 
  //create a fake data object
const data: OrderCreatedEvent["data"]={
  id: new mongoose.Types.ObjectId().toHexString(),
  version: 0,
  status: OrderStatus.Created,
  userId: "test",
  expiresAt: "test",
  ticket:{
    id: "Tickettest",
    price: 10
  } 
}
  //@ts-ignore
  const msg:Message={
      ack: jest.fn()
    }
    return {listener, data,msg}
  }
  
  it("replace the order info", async()=>{
    const {listener,data,msg}=await setup();
    //call the onMessage func with the data object + message object
      await listener.onMessage(data,msg)

    const order = await Order.findById(data.id)
    expect(order!.price).toEqual(data.ticket.price);
   
  })


  it("acks the message", async()=>{
    const {listener,data,msg}=await setup();
    await listener.onMessage(data,msg);
    expect(msg.ack).toHaveBeenCalled();
  
  })
