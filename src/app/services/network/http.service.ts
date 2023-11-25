import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { GroupModel } from "../../model/group.model";
import { MemberModel } from "../../model/member.model";
import { ConfigService } from "../../config/config.service";

@Injectable({
  providedIn: "root",
})
export class HttpService {
  private readonly apiHost: string = "localhost";
  private readonly apiPort: number = 9000;
  private readonly apiEndpoint: string = "";
  private readonly protocol: string = "http";
  private headers: HttpHeaders = new HttpHeaders();
  private readonly fullApiUrl: string;

  constructor(
    private http: HttpClient,
    private configService?: ConfigService,
  ) {
    if (this.configService) {
      this.apiHost = this.configService.apiHost ?? this.apiHost;
      this.apiPort = this.configService.apiPort ?? this.apiPort;
      this.apiEndpoint = this.configService.apiEndpoint ?? this.apiEndpoint;
      this.protocol = this.configService.apiProtocol ?? this.protocol;
    }
    const serverUrl = `${this.protocol}://${this.apiHost}:${this.apiPort}`;
    this.fullApiUrl = `${serverUrl}${this.apiEndpoint}`;
  }

  getGroups(username: string): Observable<GroupModel[]> {
    const headers =
      this.buildNewHeaders().withAuthorizationHeader(username).headers;
    return this.http.get<GroupModel[]>(this.getFullUrl("/groups"), {
      headers,
    });
  }

  getGroupMembers(
    username: string,
    groupId: number,
  ): Observable<MemberModel[]> {
    const headers =
      this.buildNewHeaders().withAuthorizationHeader(username).headers;
    return this.http.get<MemberModel[]>(
      this.getFullUrl(`/groups/${groupId}/members`),
      { headers },
    );
  }

  public getFullUrl(endpoint: string): string {
    return `${this.fullApiUrl}${endpoint}`;
  }

  private withAuthorizationHeader(username: string) {
    this.headers = this.headers.append(
      "Authorization",
      "Basic " + btoa(`${username}:empty`),
    );
    return this;
  }

  private buildNewHeaders() {
    this.headers = new HttpHeaders();
    return this;
  }
}
