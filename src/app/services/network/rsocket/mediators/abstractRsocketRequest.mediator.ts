import { BehaviorSubject, Observable, Subject, Subscription } from "rxjs";
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
import { RsocketMetadataService } from "../rsocketMetadata.service";
import { ConnectorStatesEnum } from "../ConnectorStatesEnum";
import { Codec } from "rsocket-messaging";
import { JsonCodec } from "../codecs/JsonCodec";
import { RequestState } from "../../../state/request/request.state";

export abstract class AbstractRsocketRequestMediator<TData, RData>
  implements
    Retryable,
    RequestServiceStateInterface<RData>,
    RequestServiceComponentInterface<RData>
{
  public accessor state: RequestState<RData>;
  private _events$: Subject<RData> = new Subject<RData>();
  private _requestState$: BehaviorSubject<RequestStateEnum> =
    new BehaviorSubject<RequestStateEnum>(RequestStateEnum.INITIALIZING);

  protected readonly inputCodec: Codec<TData> = new JsonCodec();
  protected readonly outputCodec: Codec<RData> = new JsonCodec();

  protected requestObservableSubscription: Subscription | null = null;
  protected readonly requestObservableKey: string = uuidv4();

  public constructor(
    public readonly rsocketService: RsocketService,
    protected readonly rsocketMetadataService: RsocketMetadataService,
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

  public start(): boolean {
    if (this.state instanceof DormantState) {
      this.onRequest();
      return true;
    }

    return false;
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

  public get events$(): Observable<RData> {
    return this._events$.asObservable();
  }

  public nextEvent(event: RData): void {
    this._events$.next(event);
  }

  public get state$(): Observable<RequestStateEnum> {
    return this._requestState$.asObservable();
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
