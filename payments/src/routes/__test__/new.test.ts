import request from "supertest";
import {app} from "../../app";
import mongoose from "mongoose";
import {Order,OrderStatus} from "../../models/order"
//import {natsWrapper} from "../../nats-wrapper";
import {stripe} from "../../stripe"
import {Payment} from "../../models/payment";
import { strict } from "assert";

//if using stripe mock stripeold.ts
//jest.mock("../../stripe")

it("returns an 404 when purchasing an order that does not exist", async()=>{
  const orderId = mongoose.Types.ObjectId().toHexString();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "test",
      orderId: orderId
    })
    .expect(404);

});


it("returns an 401 when purchasing an order that doesn't belong to the user", async()=>{
  
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created
  })
  await order.save();
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "test",
      orderId: order.id
    })
    .expect(401);

});


it("returns an 400 when purchasing an cancelled order", async()=>{
  
  const userId= mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 20,
    status: OrderStatus.Cancelled
  })
  await order.save();
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({
      token: "test",
      orderId: order.id
    })
    .expect(400);


});

it("returns an 201 wth valid inputs", async()=>{
  
  const userId= mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random()*100000)
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price,
    status: OrderStatus.Created
  })
  await order.save();
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({
      token: "tok_visa",
      orderId: order.id
    })
    .expect(201);
    const stripeCharges = await stripe.charges.list({limit:50});
    const stripeCharge = stripeCharges.data.find(charge=>{
      return charge.amount === price *100 //in cents
    })
    //real version of stripe
    expect(stripeCharge).toBeDefined();
    expect(stripeCharge!.currency).toEqual("usd");
    const payment = await Payment.findOne({
      orderId: order.id,
      stripeId: stripeCharge!.id
    })
    expect(payment).not.toBeNull();

    //if using stripe mock stripeold.ts
    // const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
    // expect(chargeOptions.source).toEqual("tok_visa")
    // expect(chargeOptions.amount).toEqual(20*100)
    // expect(chargeOptions.currency).toEqual("usd")
});