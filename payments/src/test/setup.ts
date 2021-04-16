import {MongoMemoryServer} from "mongodb-memory-server";
import mongoose from "mongoose";
import {app} from "../app";
import { beforeAll, beforeEach, afterAll } from '@jest/globals'
import request from "supertest";
import  jwt from "jsonwebtoken";

declare global{
  namespace NodeJS{
    interface Global{
      signin(id?:string):string[];
    }
  }
}
jest.mock("../nats-wrapper");
process.env.STRIPE_KEY= "sk_test_51Ie8k1FSBVGYdrRrQcnuiOYqS0ZhPkDZQVF8jXtoEJj1qHXjlkZAPsgGGb7SC552X2HIYNFO5c1Wl2YPYDm0ZYOH00mCXrsxV9";
let mongo: any;
beforeAll(async ()=>{
  process.env.JWT_KEY="asdf";
  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri,{
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

beforeEach(async () =>{
  jest.clearAllMocks();
  const collections =await mongoose.connection.db.collections();

  for(let collection of collections){
    await collection.deleteMany({});
  }
});

afterAll(async() =>{
  await mongo.stop();
  await mongoose.connection.close();
})

global.signin= (id?: string) =>{

  //build a JWT payload {id,email}

  const payload={

    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com"
  }
  //create the JWT
  const token=jwt.sign(payload,process.env.JWT_KEY!)

  // build session object.{jwt:my_jwt}
  const session= {jwt:token}
  //turn that session into json
  const sessionJSON= JSON.stringify(session);
  //take json and encode it as base64
  const base64= Buffer.from(sessionJSON).toString("base64");
  //return a string thats the cookie with the encoded data
  return [`express:sess=${base64}`];
}