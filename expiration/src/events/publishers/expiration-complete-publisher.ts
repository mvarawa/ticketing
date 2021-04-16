import {Publisher,Subjects,ExpirationCompleteEvent} from "@mtvtickets/common"

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
  readonly subject=Subjects.ExpirationComplete;
  
}