import { TestBed } from "@angular/core/testing";
import { HttpService } from "./http.service";
import { ConfigService } from "../../config/config.service";
import { GroupModel } from "../../model/group.model";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { GroupStatusEnum } from "../../model/enums/groupStatus.enum";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";

describe("HttpService", () => {
  let service: HttpService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        HttpService,
        { provide: ConfigService, useValue: {} },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
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
        status: GroupStatusEnum.ACTIVE,
        maxGroupSize: 10,
        lastModifiedDate: Date.now().toString(),
        lastModifiedBy: "Test User 1",
        createdDate: Date.now().toString(),
        createdBy: "Test User 1",
        version: 1,
        members: [],
      },
      {
        id: 2,
        title: "Group 2",
        description: "Group 2 description",
        status: GroupStatusEnum.ACTIVE,
        maxGroupSize: 10,
        lastModifiedDate: Date.now().toString(),
        lastModifiedBy: "Test User 2",
        createdDate: Date.now().toString(),
        createdBy: "Test User 2",
        version: 1,
        members: [],
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

  afterEach(() => {
    httpTestingController.verify();
  });
});
