import { RsocketRequestFactory } from "./rsocketRequest.factory";
import { TestBed } from "@angular/core/testing";
import { ConfigService } from "../../../config/config.service";
import { RsocketMetadataService } from "./rsocketMetadata.service";
import { of } from "rxjs";
import { RsocketService } from "./rsocket.service";

describe("RsocketRequestFactory", () => {
  let factory: RsocketRequestFactory;
  let rsocketService: RsocketService;
  let rsocketMetadataService: RsocketMetadataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: ConfigService, useValue: {} }],
    });

    factory = TestBed.inject(RsocketRequestFactory);
    rsocketMetadataService = TestBed.inject(RsocketMetadataService);
    rsocketService = TestBed.inject(RsocketService);

    spyOnProperty(rsocketService, "rsocketRequester", "get").and.returnValue(
      {} as any,
    );

    const observable = of("test");

    spyOn(rsocketMetadataService, "authMetadataWithRoute").and.returnValue({
      request: () => observable,
    } as any);
  });

  describe("createRequestResponse", () => {
    it("should return a new observable for every re-subscription", () => {
      const observableFactory = factory.createRequestResponse(
        {} as any,
        "test",
        null,
      );

      observableFactory.subscribe();
      observableFactory.subscribe();

      expect(
        rsocketMetadataService.authMetadataWithRoute,
      ).toHaveBeenCalledTimes(2);
    });
  });

  describe("createRequestStream", () => {
    it("should return a new observable for every re-subscription", () => {
      const observableFactory = factory.createRequestStream(
        {} as any,
        "test",
        null,
      );

      observableFactory.subscribe();
      observableFactory.subscribe();

      expect(
        rsocketMetadataService.authMetadataWithRoute,
      ).toHaveBeenCalledTimes(2);
    });
  });
});
