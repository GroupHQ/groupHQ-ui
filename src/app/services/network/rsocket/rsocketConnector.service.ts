import { Injectable } from "@angular/core";
import { catchError, defer, from, tap } from "rxjs";
import { RSocketConnector } from "rsocket-core";
import { WebsocketClientTransport } from "rsocket-websocket-client";
import { ConfigService } from "../../../config/config.service";
import { RsocketMetadataService } from "./rsocketMetadata.service";

@Injectable({
  providedIn: "root",
})
export class RsocketConnectorService {
  private readonly HOST: string = "localhost";
  private readonly PORT: number = 9000;
  private readonly ENDPOINT: string = "rsocket";
  private readonly PROTOCOL: string = "ws";
  private readonly KEEP_ALIVE: number = 5;
  private readonly LIFETIME: number = 30;

  constructor(
    private readonly rsocketMetadataService: RsocketMetadataService,
    configService: ConfigService,
  ) {
    if (configService) {
      this.HOST = configService.rsocketHost ?? this.HOST;
      this.PORT = configService.rsocketPort ?? this.PORT;
      this.ENDPOINT = configService.rsocketEndpoint ?? this.ENDPOINT;
      this.PROTOCOL = configService.rsocketProtocol ?? this.PROTOCOL;
      this.KEEP_ALIVE = configService.rsocketKeepAlive ?? this.KEEP_ALIVE;
      this.LIFETIME = configService.rsocketLifetime ?? this.LIFETIME;
    }
  }

  /**
   * Connects to the RSocket server. Should be used with RetryService.
   * This will only fail if the initial connection fails.
   * This will NOT fail if an RSocket connection is established and then lost.
   * @private
   */
  public connectToServer(username: string, password = "empty") {
    const rSocketConnector = this.createConnector(username, password);

    return defer(() =>
      from(rSocketConnector.connect()).pipe(
        tap((rsocket) => {
          console.log(
            "Connected to server in RSocketConnectorService",
            rsocket,
          );
        }),
        catchError((error) => {
          console.log(
            "Error connecting to server in RSocketConnector Service:",
            error,
          );
          throw new Error("Failed to connect to server");
        }),
      ),
    );
  }

  private getKeepAliveTimeMilliseconds() {
    return this.KEEP_ALIVE * 1000;
  }

  private getLifetimeTimeMilliseconds() {
    return this.LIFETIME * 1000;
  }

  private createConnector(username = "user", password = "empty") {
    return new RSocketConnector({
      setup: {
        dataMimeType: "application/json",
        metadataMimeType: "message/x.rsocket.composite-metadata.v0",
        payload: {
          data: null,
          metadata: this.rsocketMetadataService.authMetadata(
            username,
            password,
          ),
        },
        keepAlive: this.getKeepAliveTimeMilliseconds(), // interval (ms) to send keep-alive frames
        lifetime: this.getLifetimeTimeMilliseconds(), // time (ms) since last keep-alive acknowledgement that the connection will be considered dead
      },
      transport: new WebsocketClientTransport({
        url: `${this.PROTOCOL}://${this.HOST}:${this.PORT}/${this.ENDPOINT}`,
        wsCreator: (url: string) => {
          return new WebSocket(url) as WebSocket;
        },
        debug: true,
      }),
    });
  }
}
