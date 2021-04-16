import express,{Request,Response} from "express";
import {NotFoundError}  from "@mtvtickets/common";
import {Ticket} from "../models/tickets";

const router = express.Router();

router.get("/api/tickets",async(req:Request,res:Response)=>{
  const tickets = await Ticket.find({
    orderId: undefined, //not reserved
  });

  res.send(tickets);
});

export {router as indexTicketRouter};