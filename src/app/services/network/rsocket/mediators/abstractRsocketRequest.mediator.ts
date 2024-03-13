import {
  BehaviorSubject,
  defer,
  Observable,
  share,
  Subject,
  Subscription,
} from "rxjs";
import { Retryable } from "../../../retry/retryable";
import { RequestStateEnum } from "../../../state/RequestStateEnum";
import { RetryService } from "../../../retry/retry.service";
import { v4 as uuidv4 } from "uuid";
import { ConfigService } from "../../../../config/config.service";
import { RequestServiceStateInterface } from "./interfaces/requestServiceState.interface";
import { RequestServiceComponentInterface } from "./interfaces/requestServiceComponent.interface";
import { DormantState } from "../../../state/request/dormant.state";
import { UserService } from "../../../user/user.service";
import { RsocketService } from "../rsocket.service";
import { ConnectorStatesEnum } from "../ConnectorStatesEnum";
import { RequestState } from "../../../state/request/request.state";
import { RsocketRequestFactory } from "../rsocketRequest.factory";

export abstract class AbstractRsocketRequestMediator<TData, RData>
  implements
    Retryable,
    RequestServiceStateInterface<RData>,
    RequestServiceComponentInterface<RData>
{
  public accessor state: RequestState<RData>;
  private _events$: Subject<RData> = new Subject<RData>();
  private _eventsShareable$ = this._events$.asObservable().pipe(share()); // TODO: Add tests verifying that the events are shared
  private _requestState$: BehaviorSubject<RequestStateEnum> =
    new BehaviorSubject<RequestStateEnum>(RequestStateEnum.INITIALIZING);
  private _requestStateShareable$ = this._requestState$
    .asObservable()
    .pipe(share()); // TODO: Add tests verifying that the state is shared

  protected requestObservableSubscription: Subscription | null = null;
  protected readonly requestObservableKey: string = uuidv4();

  public constructor(
    public readonly rsocketService: RsocketService,
    protected readonly rsocketRequestFactory: RsocketRequestFactory,
    protected readonly retryService: RetryService,
    protected readonly userService: UserService,
    protected readonly configService: ConfigService,
    protected readonly route: string,
    protected readonly data: TData | null,
  ) {
    this.state = new DormantState(this);
  }

  public get connectorState(): Observable<ConnectorStatesEnum> {
    return this.rsocketService.connectionState$;
  }

  private start() {
    if (this.state instanceof DormantState) {
      this.onRequest();
    }
  }

  public onRequest(): Observable<RData> {
    return this.state.onRequest();
  }

  public cleanUp(): void {
    if (
      this.requestObservableSubscription &&
      !this.requestObservableSubscription.closed
    ) {
      this.requestObservableSubscription.unsubscribe();
    }
  }

  public abstract sendRequest(): void;

  public getEvents$(start?: boolean): Observable<RData> {
    return defer(() => {
      if (start) this.start();
      return this._eventsShareable$;
    });
  }

  public nextEvent(event: RData): void {
    this._events$.next(event);
  }

  public getState$(start?: boolean): Observable<RequestStateEnum> {
    return defer(() => {
      if (start) this.start();
      return this._requestStateShareable$;
    });
  }

  public get currentState(): RequestStateEnum {
    return this._requestState$.getValue();
  }

  public nextRequestState(stateEnum: RequestStateEnum): void {
    this._requestState$.next(stateEnum);
  }

  public retryNow() {
    this.onRequest();
  }

  public get nextRetryTime$(): Observable<number> {
    const nextRetryTime$ = this.retryService.getNextRetryTime$(
      this.requestObservableKey,
    );

    if (!nextRetryTime$) {
      console.warn("No retry time found");
      return new BehaviorSubject<number>(0);
    }

    return nextRetryTime$;
  }
}
