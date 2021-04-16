import mongoose from "mongoose";
import {Password} from "../services/password"
//An interface that describes the properties that are  
//requied to create a new user

interface UserAttrs{
  email:string;
  password:string;
}
//An interface that describes the properties
//that a user model has

interface UserModel extends mongoose.Model<UserDoc>{
  build(attrs:UserAttrs):UserDoc;
}
//An interface that describes the properties
//that a User Document has
interface UserDoc extends mongoose.Document{
  email: string;
  password:string;
}

const userSchema=new mongoose.Schema({
  email:{type:String,required:true},
  password:{type:String,required:true}
},{toJSON:{   //This modifies response json e.g remove password
  transform(dic,ret){
    ret.id=ret._id;
    delete ret._id
    delete ret.password; 
    delete ret.__v;
  }
}

});

//mongodb middleware
userSchema.pre("save",async function(done){
  if(this.isModified("password")){
    const hashed=await Password.toHash(this.get("password"));
    this.set("password",hashed);
  }
  done();
});

userSchema.statics.build=(attrs:UserAttrs)=>{
  return new User(attrs);
}
const User=mongoose.model<UserDoc,UserModel>("User",userSchema);



export {User};