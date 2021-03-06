import mongoose from "mongoose";
import {updateIfCurrentPlugin} from "mongoose-update-if-current"
//An interface that describes the properties that are  
//requied to create a new ticket

interface TicketAttrs{
  title:string;
  price: number;
  userId:string;
}

//An interface that describes the properties
//that a ticket Document has
interface TicketDoc extends mongoose.Document{
  title:string;
  price: number;
  userId:string;
  version: number;
  orderId?: string; //optional
}

//An interface that describes the properties
//that a ticket model has

interface TicketModel extends mongoose.Model<TicketDoc>{
  build(attrs:TicketAttrs):TicketDoc;
}

const ticketSchema=new mongoose.Schema({
  title:{type:String,required:true},
  price:{type:Number,required:true},
  userId:{type:String,required:true},
  orderId:{type:String},
},{toJSON:{   //This modifies response json e.g remove password
  transform(doc,ret){
    ret.id=ret._id;
    delete ret._id
  }

}

});
//__v to version
ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build=(attrs:TicketAttrs)=>{
  return new Ticket(attrs);
}
const Ticket=mongoose.model<TicketDoc,TicketModel>("Ticket",ticketSchema);



export {Ticket};