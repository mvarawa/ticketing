import {Ticket} from "../tickets"

it("implement optimistic concurrency control",async(done)=>{
  //create an instance of a ticket

  const ticket =Ticket.build({
    title: "concert",
    price: 5,
    userId: "123"
  })

  //save the ticket to the database
  await ticket.save();
  //fetch the ticket twice. both instances will have version 0
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  //make two separate changes to the tickets we fetched
  firstInstance!.set({price:10})
  secondInstance!.set({price:15})
  //save the first fetched ticket to version 1
  await firstInstance!.save(); 
  //save the second fectched ticket and expect an error
  try{
  await secondInstance!.save(); // version 0 now not available
  }catch{
    return done();
  }
    throw new Error("should not reach this point")
})

it("increments the version number on multiple saves",async()=>{
  const ticket =Ticket.build({
    title: "concert",
    price: 5,
    userId: "123"
  })
  await ticket.save();
  expect(ticket.version).toEqual(0)
  await ticket.save();
  expect(ticket.version).toEqual(1)
  await ticket.save();
  expect(ticket.version).toEqual(2)
})