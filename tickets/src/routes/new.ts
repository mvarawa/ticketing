// @ts-nocheck 
import {body} from "express-validator";
import express,{Request,Response} from "express";
//import jwt from "jsonwebtoken";
import {requireAuth,validateRequest}  from "@mtvtickets/common";
import {Ticket} from "../models/tickets";
import {TicketCreatedPublisher} from "../events/publishers/ticket-created-publisher"
import {natsWrapper} from "../nats-wrapper"
const router = express.Router();

router.post("/api/tickets",requireAuth,[
  body("title")
    .not()
    .isEmpty()
    .withMessage("Title is required"),
  body("price")
    .isFloat({gt:0})//greater than zero
    .withMessage("price must be greater than 0")
],validateRequest,
async (req:Request,res:Response)=>{
  //res.sendStatus(200);
  const {title,price}=req.body;
  const ticket =Ticket.build({
    title,
    price,
    userId: req.currentUser!.id
  });
  await ticket.save();
  new TicketCreatedPublisher(natsWrapper.client).publish({
    id:ticket.id,
    title: ticket.title,
    price: ticket.price,
    userId: ticket.userId,
    version: ticket.version
  });

  res.status(201).send(ticket);
});

export {router as createTicketRouter}
