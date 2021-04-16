import express,{Request,Response} from "express";
import {body} from "express-validator";
//import { DatabaseConnectionError } from "../errors/database-connection-error";
//import { RequestValidationError } from "../errors/request-validation-error";
import {User} from "../models/user";

import jwt from "jsonwebtoken";
import{validateRequest,BadRequestError} from "@mtvtickets/common"

const router = express.Router();
// router.post("/api/users/signup",(req,res)=>{
//   res.send("Hi Signup")
// });
router.post(
  "/api/users/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Email must be Valid "),
    body("password")
      .trim()
      .isLength({min:4, max:20})
      //.isAlphanumeric() 
      .withMessage("Password must be between 4 and 20 characters")
  ],
validateRequest,
async(req:Request,res:Response)=>{

  const {email,password} = req.body;
  const existingUser=await User.findOne({email});
  if(existingUser){
    throw new BadRequestError("Emails is in Use");
  }
  const user=User.build({email,password});
  await user.save();

  //generate JWT
 
    const userJwt= jwt.sign({
      id: user.id,
      email: user.email
    },process.env.JWT_KEY!); //"asdf" exclamation defines not to worry about type
  //Store it on session object


    req.session={
      jwt: userJwt
    };

  res.status(201).send(user);

});

export {router as signupRouter};