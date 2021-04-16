import {Publisher,Subjects,TicketUpdatedEvent} from "@mtvtickets/common"

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
  readonly subject=Subjects.TicketUpdated;
  
}