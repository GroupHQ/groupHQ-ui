import { EventDataModel } from "./eventDataModel";

export class ErrorDataModel implements EventDataModel {
  constructor(public error: string) {}
}
