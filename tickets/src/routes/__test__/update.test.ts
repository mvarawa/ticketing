import request from "supertest";
import {app} from "../../app";
import {it,expect} from '@jest/globals'
import mongoose from "mongoose";
import {natsWrapper} from "../../nats-wrapper";
import {Ticket} from "../../models/tickets";
  it("returns a 404 if the provided id does not exits ",async()=>{
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
     .put(`/api/tickets/${id}`)
     .set("Cookie",global.signin())
      .send({
        title: "asdf",
        price: 20
      })
      .expect(404);

  });

  it("returns a 401 if the user is not authenticated",async()=>{
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
     .put(`/api/tickets/${id}`)
      .send({
        title: "asdf",
        price: 20
      })
      .expect(401);
  });

  it("returns a 401 if the user does not own the ticket ",async()=>{
    const title = "concert";
    const price = 20;
   
     const response = await request(app)
     .post("/api/tickets")
     .set("Cookie",global.signin())
     .send({
       title,
       price
     })
     await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set("Cookie",global.signin())
      .send({
        title: "New Title",
        price
      })
      .expect(401);
  });

  it("returns a 400 if the user provides an invalid title or price",async()=>{
    //const title = "concert";
    const cookie = global.signin(); // to make sure you are same user
     const response = await request(app)
     .post("/api/tickets")
     .set("Cookie",cookie)
     .send({
       title: "New Title",
       price: 20,
     });
     await request(app)
     .put(`/api/tickets/${response.body.id}`)
     .set("Cookie",cookie)
     .send({
       title: "",
       price: 20,
     })
     .expect(400);

     await request(app)
     .put(`/api/tickets/${response.body.id}`)
     .set("Cookie",cookie)
     .send({
       title: "sasas",
       price: -10,
     })
     .expect(400);
  });

  it("updates the ticket provided valid inputs",async()=>{
    const cookie = global.signin(); // to make sure you are same user
    const response = await request(app)
    .post("/api/tickets")
    .set("Cookie",cookie)
    .send({
      title: "New Title",
      price: 20,
    });
    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie",cookie)
    .send({
      title: "Good Title",
      price: 200,
    })
    .expect(200);

    const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    expect(ticketResponse.body.title).toEqual("Good Title");
    expect(ticketResponse.body.price).toEqual(200);
  });
 
  it("Publishes an event", async() => {
    const cookie = global.signin(); // to make sure you are same user
    const response = await request(app)
    .post("/api/tickets")
    .set("Cookie",cookie)
    .send({
      title: "New Title",
      price: 20,
    });
    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie",cookie)
    .send({
      title: "Good Title",
      price: 200,
    })
    .expect(200);
 expect(natsWrapper.client.publish).toHaveBeenCalled();
  })

  it("rejects updates if the ticket is reserved", async() => {
    const cookie = global.signin(); // to make sure you are same user
    //create a ticket
    const response = await request(app)
    .post("/api/tickets")
    .set("Cookie",cookie)
    .send({
      title: "New Title",
      price: 20,
    });
    //update above ticket as reserved
    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({orderId:mongoose.Types.ObjectId().toHexString()})
    await ticket!.save();

    //modify reserved ticket and it should not allow. And return Bad request
    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie",cookie)
    .send({
      title: "Good Title",
      price: 200,
    })
    .expect(400);
  })