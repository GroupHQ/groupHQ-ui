import { Buffer } from "buffer";
import { Injectable } from "@angular/core";

// Set Buffer to the global context to integrate RSocket JS which relies on a global Buffer object from a Node.js environment
@Injectable({
  providedIn: "root",
})
export class BufferPolyfill {
  constructor() {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    if (!(window as any).Buffer) {
      (window as any).Buffer = Buffer;
    }
  }
}
