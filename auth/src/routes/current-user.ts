import express from "express";
import {currentUser} from "@mtvtickets/common";
//import {requireAuth} from "@mtvtickets/common";
const router = express.Router();
//all logic in middleware currentUser
router.get("/api/users/currentuser",currentUser,(req,res)=>{
  res.send({currentUser: req.currentUser || null});
});

export {router as currentUserRouter};


