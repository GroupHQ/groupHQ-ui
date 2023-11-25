import { ComponentFixture, TestBed } from "@angular/core/testing";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { EMPTY, of } from "rxjs";
import { GroupDetailsDialogComponent } from "./groupDetailsDialog.component";
import { HttpService } from "../../../services/network/http.service";
import { IdentificationService } from "../../../services/user/identification.service";
import { MemberModel } from "../../../model/member.model";
import { MemberStatusEnum } from "../../../model/enums/memberStatus.enum";
import { GroupStatusEnum } from "../../../model/enums/groupStatus.enum";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatListModule } from "@angular/material/list";

describe("GroupDetailsDialogComponent", () => {
  let component: GroupDetailsDialogComponent;
  let fixture: ComponentFixture<GroupDetailsDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<GroupDetailsDialogComponent>>;
  let httpServiceSpy: jasmine.SpyObj<HttpService>;
  let idServiceSpy: jasmine.SpyObj<IdentificationService>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj("MatDialogRef", ["close"]);
    httpServiceSpy = jasmine.createSpyObj("HttpService", ["getGroupMembers"]);
    httpServiceSpy.getGroupMembers.and.returnValue(EMPTY);
    idServiceSpy = jasmine.createSpyObj("IdentificationService", ["uuid"]);

    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        MatSnackBarModule,
        MatDialogModule,
        MatListModule,
        GroupDetailsDialogComponent,
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: HttpService, useValue: httpServiceSpy },
        { provide: IdentificationService, useValue: idServiceSpy },
      ],
    }).compileComponents();
  });

  it("creates the component", () => {
    fixture = TestBed.createComponent(GroupDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it("should display the group details", () => {
    fixture = TestBed.createComponent(GroupDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.group = {
      id: 1,
      title: "Farming For Gold",
      description: "Let's meet at the Dwarven Mines south entrance.",
      status: GroupStatusEnum.ACTIVE,
      lastActive: new Date().toISOString(),
      lastModifiedBy: "System",
      lastModifiedDate: new Date().toISOString(),
      createdDate: new Date().toISOString(),
      createdBy: "System",
      currentGroupSize: 3,
      maxGroupSize: 6,
      version: 1,
    };
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(
      compiled.querySelector('[data-test="group-title"]').textContent,
    ).toContain("Farming For Gold");
    expect(
      compiled.querySelector('[data-test="group-description"]').textContent,
    ).toContain("Let's meet at the Dwarven Mines south entrance.");
    expect(
      compiled.querySelector('[data-test="group-members-count"]').textContent,
    ).toContain("3 / 6");
  });

  it("should allow the user to close the group details dialog", () => {
    fixture = TestBed.createComponent(GroupDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.onNoClick();
    expect(dialogRefSpy.close.calls.count()).toBe(1);
  });

  it("should display all the group members", () => {
    const members: MemberModel[] = [
      {
        id: 1,
        username: "Brooks Foley",
        memberStatus: MemberStatusEnum.ACTIVE,
        joinedDate: new Date().toISOString(),
      },
      {
        id: 2,
        username: "Test User",
        memberStatus: MemberStatusEnum.ACTIVE,
        joinedDate: new Date().toISOString(),
      },
      {
        id: 3,
        username: "Another User",
        memberStatus: MemberStatusEnum.ACTIVE,
        joinedDate: new Date().toISOString(),
      },
    ];

    httpServiceSpy.getGroupMembers.and.returnValue(of(members));
    fixture = TestBed.createComponent(GroupDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.members.length).toBe(3);
    expect(component.members[0].username).toBe("Brooks Foley");
    expect(component.members[1].username).toBe("Test User");
    expect(component.members[2].username).toBe("Another User");
  });
});
