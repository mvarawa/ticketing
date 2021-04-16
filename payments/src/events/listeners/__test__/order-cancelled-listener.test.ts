import {OrderCancelledEvent,OrderStatus} from "@mtvtickets/common"
import {OrderCancelledListener} from "../order-cancelled-listener";
import {natsWrapper} from "../../../nats-wrapper"
import mongoose from "mongoose"
import{Message} from "node-nats-streaming"
import {Order} from "../../../models/order"

const setup = async()=>{

  //create an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client);
  const orderId =  mongoose.Types.ObjectId().toHexString();
  //create and save a order
  const order = Order.build({
   id: orderId,
   status: OrderStatus.Created,
    price: 20,
    userId: "test",
    version:0
  });
  await order.save();

  //create a fake data object
const data: OrderCancelledEvent["data"]={
  id: orderId,
  version: 1,
  ticket:{
    id: "test"
  } 
}
  //@ts-ignore
  const msg:Message={
      ack: jest.fn()
    }
    return {listener,order, data,msg,orderId}
  }
  
  it("Updates the cancelled order", async()=>{
    const {listener,data,msg,order}=await setup();
    //call the onMessage func with the data object + message object
    await listener.onMessage(data,msg)
  //write assertions to make sure a order was created
    const updatedorder = await Order.findById(order.id);

    expect(updatedorder!.status).toEqual(OrderStatus.Cancelled)    //expect(updatedorder!.orderId).toEqual(data.id);
   
  });


  it("acks the message", async()=>{
    const {listener,data,msg,order}=await setup();
    await listener.onMessage(data,msg);
    expect(msg.ack).toHaveBeenCalled();
  
  })

  