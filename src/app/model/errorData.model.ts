import { EventDataModel } from "./events/eventDataModel";

export class ErrorDataModel implements EventDataModel {
  constructor(public error: string) {}
}
