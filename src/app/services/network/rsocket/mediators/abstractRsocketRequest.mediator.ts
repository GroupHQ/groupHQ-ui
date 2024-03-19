import {
  BehaviorSubject,
  defer,
  Observable,
  Subject,
  Subscription,
} from "rxjs";
import { Retryable } from "../../../retry/retryable";
import { StateEnum } from "../../../state/StateEnum";
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
  private _requestState$: BehaviorSubject<StateEnum> =
    new BehaviorSubject<StateEnum>(StateEnum.DORMANT);

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
      return this._events$;
    });
  }

  public nextEvent(event: RData): void {
    this._events$.next(event);
  }

  /**
   * Resets event and request status streams.
   * Any current subscriber will complete.
   */
  public completeEvents(): void {
    this._events$.complete();
    this._events$ = new Subject<RData>();

    this._requestState$.complete();
    this._requestState$ = new BehaviorSubject<StateEnum>(StateEnum.DORMANT);
  }

  public getState$(start?: boolean): Observable<StateEnum> {
    return defer(() => {
      if (start) this.start();
      return this._requestState$;
    });
  }

  public get currentState(): StateEnum {
    return this._requestState$.getValue();
  }

  public nextRequestState(stateEnum: StateEnum): void {
    this._requestState$.next(stateEnum);
  }

  public retryNow() {
    this.onRequest();
  }

  public get nextRetryTime$(): Observable<number> | undefined {
    const rsocketRetryTime$ = this.rsocketService.nextRetryTime$;

    if (rsocketRetryTime$) {
      return rsocketRetryTime$;
    }

    const nextMediatorRetryTime$ = this.retryService.getNextRetryTime$(
      this.requestObservableKey,
    );

    if (nextMediatorRetryTime$) {
      return nextMediatorRetryTime$;
    }
    console.warn("No retry time found");
    return;
  }
}
