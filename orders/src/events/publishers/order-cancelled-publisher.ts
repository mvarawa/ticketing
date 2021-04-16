import {Publisher,Subjects,OrderCancelledEvent} from "@mtvtickets/common"

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{
  readonly subject=Subjects.OrderCancelled;
  
}