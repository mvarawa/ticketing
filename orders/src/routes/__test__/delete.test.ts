import request from "supertest";
import {app} from "../../app";
import {Order,OrderStatus} from "../../models/order"
import {Ticket} from "../../models/ticket"
import mongoose from "mongoose";

import {natsWrapper} from "../../nats-wrapper";


it("marks an order as cancelledr", async()=>{
  //Create a ticket
  //create a ticket with Ticket Model
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "NEW CONCERT",
    price: 20,
  });
  await ticket.save();
  const user = global.signin();
//make a request to build an order with this ticket
  const {body:order} = await request(app)
    .post("/api/orders")
    .set("Cookie",user)
    .send({ticketId: ticket.id})
    .expect(201);

  //make request to cancel the order
 await request(app)
  .delete(`/api/orders/${order.id}`)
  .set("Cookie",user)
  .send()
  .expect(204);
  //expectation to make sure the thing is cancelled
 const updateOrder = await Order.findById(order.id);
 expect(updateOrder!.status).toEqual(OrderStatus.Cancelled)
});

it("publishes a order cancelled event", async()=>{
  //Create a ticket
  //create a ticket with Ticket Model
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "NEW CONCERT",
    price: 20,
  });
  await ticket.save();
  const user = global.signin();
//make a request to build an order with this ticket
  const {body:order} = await request(app)
    .post("/api/orders")
    .set("Cookie",user)
    .send({ticketId: ticket.id})
    .expect(201);

  //make request to cancel the order
 await request(app)
  .delete(`/api/orders/${order.id}`)
  .set("Cookie",user)
  .send()
  .expect(204);
  //expectation to make sure the thing is cancelled
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});