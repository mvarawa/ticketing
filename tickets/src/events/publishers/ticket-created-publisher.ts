import {Publisher,Subjects,TicketCreatedEvent} from "@mtvtickets/common"

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent>{
  readonly subject=Subjects.TicketCreated;
  
}