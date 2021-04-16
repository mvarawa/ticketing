import request from "supertest";
import {app} from "../../app";
import mongoose from "mongoose";
import {Order,OrderStatus} from "../../models/order"
import {Ticket} from "../../models/ticket"


import {natsWrapper} from "../../nats-wrapper";


it("returns an error if the ticket does not exist", async()=>{
  const ticketId = mongoose.Types.ObjectId().toHexString();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ticketId})
    .expect(404);

});

it("returns an error if the ticket is already reserved", async()=>{
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "NEW CONCERT",
    price: 400,
  });

  await ticket.save();
  const order = Order.build({
      ticket,
      userId: "605be067ef944d0018102f3e",
      status: OrderStatus.Created,
      expiresAt: new Date(),
  })
  await order.save();
  await request(app)
    .post("/api/orders")
    .set("Cookie",global.signin())
    .send({ticketId: ticket.id})
    .expect(400);
});

it("reserves a ticket", async()=>{
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "NEW CONCERT",
    price: 400,
  });
  await ticket.save();

 await request(app)
    .post("/api/orders")
    .set("Cookie",global.signin())
    .send({ticketId: ticket.id})
    .expect(201);

});



it("publishes an order created event", async()=>{
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "NEW CONCERT",
    price: 400,
  });
  await ticket.save();

 await request(app)
    .post("/api/orders")
    .set("Cookie",global.signin())
    .send({ticketId: ticket.id})
    .expect(201);

expect(natsWrapper.client.publish).toHaveBeenCalled();
});
