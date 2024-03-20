import { Buffer } from "buffer";
import { Injectable } from "@angular/core";

/**
 * Set Buffer to the global context to integrate RSocket JS which relies on a global Buffer object
 * from a Node.js environment. This is needed due to a limitation of the RSocket JS library, which expects
 * a global Buffer object to be available.
 */
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
