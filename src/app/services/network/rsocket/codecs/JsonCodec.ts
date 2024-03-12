import { Buffer } from "buffer";
import { Codec } from "rsocket-messaging";

export class JsonCodec<T> implements Codec<T> {
  mimeType: string = "application/json";

  decode(buffer: Buffer): T {
    return JSON.parse(buffer.toString());
  }

  encode(entity: T): Buffer {
    return Buffer.from(JSON.stringify(entity));
  }
}
