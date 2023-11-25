import { TestBed } from "@angular/core/testing";
import { HttpService } from "./http.service";
import { ConfigService } from "../../config/config.service";
import { MemberModel } from "../../model/member.model";
import { GroupModel } from "../../model/group.model";
import { MemberStatusEnum } from "../../model/enums/memberStatus.enum";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";

describe("HttpService", () => {
  let service: HttpService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpService, { provide: ConfigService, useValue: {} }],
    });

    service = TestBed.inject(HttpService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it("should return expected groups (HttpClient called once)", () => {
    const expectedGroups: GroupModel[] = [
      {
        id: 1,
        title: "Group 1",
        description: "Group 1 description",
        status: "ACTIVE",
        currentGroupSize: 5,
        maxGroupSize: 10,
        lastActive: Date.now().toString(),
        lastModifiedDate: Date.now().toString(),
        lastModifiedBy: "Test User 1",
        createdDate: Date.now().toString(),
        createdBy: "Test User 1",
        version: 1,
      },
      {
        id: 2,
        title: "Group 2",
        description: "Group 2 description",
        status: "ACTIVE",
        currentGroupSize: 9,
        maxGroupSize: 10,
        lastActive: Date.now().toString(),
        lastModifiedDate: Date.now().toString(),
        lastModifiedBy: "Test User 2",
        createdDate: Date.now().toString(),
        createdBy: "Test User 2",
        version: 1,
      },
    ];

    service.getGroups("username").subscribe({
      next: (groups) => expect(groups).toEqual(expectedGroups),
      error: (err) => fail(`Should not return an error ${err}}`),
    });

    const request = httpTestingController.expectOne(
      service.getFullUrl("/groups"),
    );

    expect(request.request.method).toEqual("GET");

    request.flush(expectedGroups);
  });

  it("should return expected members (HttpClient called once)", () => {
    const expectedMembers: MemberModel[] = [
      {
        id: 1,
        username: "Test User 1",
        memberStatus: MemberStatusEnum.ACTIVE,
        joinedDate: Date.now().toString(),
        exitedDate: undefined,
      },
      {
        id: 2,
        username: "Test User 2",
        memberStatus: MemberStatusEnum.ACTIVE,
        joinedDate: Date.now().toString(),
        exitedDate: undefined,
      },
    ];

    service.getGroupMembers("username", 1).subscribe({
      next: (members) => expect(members).toEqual(expectedMembers),
      error: (err) => fail(`Should not return an error ${err}}`),
    });

    const request = httpTestingController.expectOne(
      service.getFullUrl("/groups/1/members"),
    );

    expect(request.request.method).toEqual("GET");

    request.flush(expectedMembers);
  });

  afterEach(() => {
    httpTestingController.verify();
  });
});
