// @ts-nocheck 
//fake client natswrapper
export const natsWrapper={
  client: {
   // publish:(subject:string,data: string, callback:()=>void)=>{
      publish:jest.fn().mockImplementation(
        (subject:string, data:string, callback:()=> void)=>{
            callback();
      })
     // callback();
    }
};