import {Publisher,Subjects,OrderCreatedEvent} from "@mtvtickets/common"

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent>{
  readonly subject=Subjects.OrderCreated;
  
}