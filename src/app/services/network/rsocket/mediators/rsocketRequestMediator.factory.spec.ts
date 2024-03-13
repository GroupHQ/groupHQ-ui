import { ConfigService } from "../../../../config/config.service";
import { RsocketRequestMediatorFactory } from "./rsocketRequestMediator.factory";
import { RsocketService } from "../rsocket.service";
import { RsocketRequestFactory } from "../rsocketRequest.factory";
import { RetryService } from "../../../retry/retry.service";
import { UserService } from "../../../user/user.service";
import { RsocketRequestResponseMediator } from "./rsocketRequestResponse.mediator";
import { RsocketRequestStreamMediator } from "./rsocketRequestStream.mediator";
import { TestBed } from "@angular/core/testing";

describe("RsocketRequestMediatorFactory", () => {
  let factory: RsocketRequestMediatorFactory;
  let rsocketService: RsocketService; // Assume these are mock instances
  let rsocketRequestFactory: RsocketRequestFactory;
  let retryService: RetryService;
  let userService: UserService;
  let configService: ConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: {},
        },
      ],
    });

    factory = TestBed.inject(RsocketRequestMediatorFactory);
    rsocketService = TestBed.inject(RsocketService);
    rsocketRequestFactory = TestBed.inject(RsocketRequestFactory);
    retryService = TestBed.inject(RetryService);
    userService = TestBed.inject(UserService);
    configService = TestBed.inject(ConfigService);

    factory = new RsocketRequestMediatorFactory(
      rsocketService,
      rsocketRequestFactory,
      retryService,
      userService,
      configService,
    );
  });

  it("should create a RequestResponseMediator correctly", () => {
    const mediator = factory.createRequestResponseMediator<string, string>(
      "testRoute",
      "testData",
    );
    expect(mediator).toBeInstanceOf(RsocketRequestResponseMediator);
  });

  it("should create a StreamMediator correctly", () => {
    const mediator = factory.createStreamMediator<string, string>(
      "testRoute",
      "testData",
    );
    expect(mediator).toBeInstanceOf(RsocketRequestStreamMediator);
  });
});
