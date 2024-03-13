import { AsynchronousRequestMediator } from "./asynchronousRequest.mediator";
import { TestBed } from "@angular/core/testing";
import { ConnectorStatesEnum } from "../network/rsocket/ConnectorStatesEnum";
import { BehaviorSubject } from "rxjs";
import { RsocketService } from "../network/rsocket/rsocket.service";
import { TestScheduler } from "rxjs/internal/testing/TestScheduler";
import { RetryOptions } from "../retry/retry.options";
import { ConfigService } from "../../config/config.service";
import { NotificationService } from "./notification.service";
import { RsocketRequestFactory } from "../network/rsocket/rsocketRequest.factory";
import { PrivateEventModel } from "../../model/privateEvent.model";
import { v4 as uuidv4 } from "uuid";
import { EventStatusEnum } from "../../model/enums/eventStatus.enum";
import { EventTypeEnum } from "../../model/enums/eventType.enum";
import { AggregateTypeEnum } from "../../model/enums/aggregateType.enum";
import { MemberModel } from "../../model/member.model";
import { MemberStatusEnum } from "../../model/enums/memberStatus.enum";
import { GroupJoinRequestEvent } from "../../model/requestevent/GroupJoinRequestEvent";
import { RequestStateEnum } from "../state/RequestStateEnum";
import { UserService } from "../user/user.service";

/**
 * This test is an integration test between AsynchronousRequestMediator and its dependencies.
 * The only mocked dependency is RsocketRequestFactory, which returns observables that are backed
 * by actual network connections.
 */
describe("AsynchronousRequestMediator", () => {
  let service: AsynchronousRequestMediator;

  let connectionState$: BehaviorSubject<ConnectorStatesEnum>;
  let rsocketService: RsocketService;
  let rsocketRequestFactoryMock: jasmine.SpyObj<RsocketRequestFactory>;

  let userService: UserService;
  let notificationService: NotificationService;

  let testScheduler: TestScheduler;
  let responseEvent: PrivateEventModel;
  let requestEvent: GroupJoinRequestEvent;

  beforeEach(() => {
    rsocketRequestFactoryMock = jasmine.createSpyObj<RsocketRequestFactory>(
      "RsocketRequestFactory",
      ["createRequestResponse", "createRequestStream"],
    );

    connectionState$ = new BehaviorSubject<ConnectorStatesEnum>(
      ConnectorStatesEnum.CONNECTED,
    );

    const requestEventId: string = uuidv4();

    requestEvent = new GroupJoinRequestEvent(
      requestEventId,
      1,
      uuidv4(),
      Date.now().toString(),
      "Mojo",
    );

    const memberModel: MemberModel = new MemberModel(
      1,
      "Mojo",
      1,
      MemberStatusEnum.ACTIVE,
      Date.now().toString(),
      null,
    );

    responseEvent = new PrivateEventModel(
      requestEventId,
      1,
      uuidv4(),
      AggregateTypeEnum.GROUP,
      EventTypeEnum.MEMBER_JOINED,
      memberModel,
      EventStatusEnum.SUCCESSFUL,
      Date.now().toString(),
    );

    const retryOptions: RetryOptions = {
      MAX_ATTEMPTS: 1,
      MIN_RETRY_INTERVAL: 5,
      MAX_RETRY_INTERVAL: 5,
    };

    TestBed.configureTestingModule({
      providers: [
        AsynchronousRequestMediator,
        {
          provide: ConfigService,
          useValue: {
            get retryDefaultStrategy(): RetryOptions {
              return retryOptions;
            },
          },
        },
        {
          provide: RsocketRequestFactory,
          useValue: rsocketRequestFactoryMock,
        },
      ],
    });

    userService = TestBed.inject(UserService);

    rsocketService = TestBed.inject(RsocketService);
    spyOnProperty(rsocketService, "connectionState$", "get").and.returnValue(
      connectionState$.asObservable(),
    );

    service = TestBed.inject(AsynchronousRequestMediator);

    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    notificationService = TestBed.inject(NotificationService);
    spyOn(notificationService, "showMessage");
  });

  describe("submitRequestEvent", () => {
    describe("when the request is successful", () => {
      it("should process the response event when a response is received", () => {
        testScheduler.run((helpers) => {
          const { cold, expectObservable, flush } = helpers;

          const requestRoute = "request.route";
          const eventResponseRoute = "response.route";

          const eventResponses$ = cold("----a", { a: responseEvent });
          const request$ = cold("--a|", { a: true });

          rsocketRequestFactoryMock.createRequestStream.and.callFake(
            () => eventResponses$ as any,
          );

          rsocketRequestFactoryMock.createRequestResponse.and.callFake(
            () => request$ as any,
          );

          const response$ = service.submitRequestEvent(
            requestEvent,
            requestRoute,
            eventResponseRoute,
          );

          expectObservable(response$).toBe("a-b-(c|)", {
            a: RequestStateEnum.REQUESTING,
            b: RequestStateEnum.REQUEST_ACCEPTED,
            c: RequestStateEnum.EVENT_PROCESSED,
          });

          flush();

          expect(userService.currentGroupId).toBe(1);
          expect(userService.currentMemberId).toBe(1);
          expect(notificationService.showMessage).toHaveBeenCalledWith(
            "Successfully joined group as Mojo!",
          );
        });
      });

      it("should handle the response event timeout error when no response event is received", () => {
        testScheduler.run((helpers) => {
          const { cold, expectObservable } = helpers;

          const requestRoute = "request.route";
          const eventResponseRoute = "response.route";

          const eventResponses$ = cold("-");
          const request$ = cold("--a|", { a: true });

          rsocketRequestFactoryMock.createRequestStream.and.callFake(
            () => eventResponses$ as any,
          );

          rsocketRequestFactoryMock.createRequestResponse.and.callFake(
            () => request$ as any,
          );

          const response$ = service.submitRequestEvent(
            requestEvent,
            requestRoute,
            eventResponseRoute,
          );

          expectObservable(response$).toBe("a-b- 6996ms (c|)", {
            a: RequestStateEnum.REQUESTING,
            b: RequestStateEnum.REQUEST_ACCEPTED,
            c: RequestStateEnum.EVENT_PROCESSING_TIMEOUT,
          });
        });
      });
    });

    describe("when the request is unsuccessful", () => {
      it("should handle request rejected errors", () => {
        testScheduler.run((helpers) => {
          const { cold, expectObservable, flush } = helpers;

          const requestRoute = "request.route";
          const eventResponseRoute = "response.route";

          const eventResponses$ = cold("-");
          const request$ = cold("--#");

          rsocketRequestFactoryMock.createRequestStream.and.callFake(
            () => eventResponses$ as any,
          );

          rsocketRequestFactoryMock.createRequestResponse.and.callFake(
            () => request$ as any,
          );

          const response$ = service.submitRequestEvent(
            requestEvent,
            requestRoute,
            eventResponseRoute,
          );

          expectObservable(response$).toBe("a-(b|)", {
            a: RequestStateEnum.REQUESTING,
            b: RequestStateEnum.REQUEST_REJECTED,
          });

          flush();

          expect(notificationService.showMessage).toHaveBeenCalledWith(
            `Error submitting request: ${RequestStateEnum.REQUEST_REJECTED}`,
          );
        });
      });

      it("should handle request timeout errors", () => {
        testScheduler.run((helpers) => {
          const { cold, expectObservable, flush } = helpers;

          const requestRoute = "request.route";
          const eventResponseRoute = "response.route";

          const eventResponses$ = cold("-");
          const request$ = cold("-");

          rsocketRequestFactoryMock.createRequestStream.and.callFake(
            () => eventResponses$ as any,
          );

          rsocketRequestFactoryMock.createRequestResponse.and.callFake(
            () => request$ as any,
          );

          const response$ = service.submitRequestEvent(
            requestEvent,
            requestRoute,
            eventResponseRoute,
          );

          expectObservable(response$).toBe("a- 4998ms (b|)", {
            a: RequestStateEnum.REQUESTING,
            b: RequestStateEnum.REQUEST_TIMEOUT,
          });

          flush();

          expect(notificationService.showMessage).toHaveBeenCalledWith(
            "Server is not responding. Try again?",
          );
        });
      });
    });

    describe("when a response is received before the request has completed", () => {
      it("should handle the response event and complete", () => {
        testScheduler.run((helpers) => {
          const { cold, expectObservable, flush } = helpers;

          const requestRoute = "request.route";
          const eventResponseRoute = "response.route";

          const eventResponses$ = cold("----a", { a: responseEvent });
          const request$ = cold("-", { a: true });

          rsocketRequestFactoryMock.createRequestStream.and.callFake(
            () => eventResponses$ as any,
          );

          rsocketRequestFactoryMock.createRequestResponse.and.callFake(
            () => request$ as any,
          );

          const response$ = service.submitRequestEvent(
            requestEvent,
            requestRoute,
            eventResponseRoute,
          );

          expectObservable(response$).toBe("a---(b|)", {
            a: RequestStateEnum.REQUESTING,
            b: RequestStateEnum.EVENT_PROCESSED,
          });

          flush();

          expect(userService.currentGroupId).toBe(1);
          expect(userService.currentMemberId).toBe(1);
          expect(notificationService.showMessage).toHaveBeenCalledWith(
            "Successfully joined group as Mojo!",
          );
        });
      });
    });
  });
});
