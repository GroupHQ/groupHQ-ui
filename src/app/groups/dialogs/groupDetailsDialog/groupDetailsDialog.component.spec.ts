import { ComponentFixture, TestBed } from "@angular/core/testing";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { GroupDetailsDialogComponent } from "./groupDetailsDialog.component";
import { MemberModel } from "../../../model/member.model";
import { MemberStatusEnum } from "../../../model/enums/memberStatus.enum";
import { GroupStatusEnum } from "../../../model/enums/groupStatus.enum";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatListModule } from "@angular/material/list";
import { GroupManagerService } from "../../services/groupManager.service";
import { GroupModel } from "../../../model/group.model";

describe("GroupDetailsDialogComponent", () => {
  let component: GroupDetailsDialogComponent;
  let fixture: ComponentFixture<GroupDetailsDialogComponent>;
  let dialogRefStub: jasmine.SpyObj<MatDialogRef<GroupDetailsDialogComponent>>;

  const members: MemberModel[] = [
    new MemberModel(
      1,
      "Brooks Foley",
      MemberStatusEnum.ACTIVE,
      new Date().toISOString(),
      null,
    ),
    new MemberModel(
      2,
      "Test User",
      MemberStatusEnum.ACTIVE,
      new Date().toISOString(),
      null,
    ),
    new MemberModel(
      3,
      "Another User",
      MemberStatusEnum.ACTIVE,
      new Date().toISOString(),
      null,
    ),
  ];
  const group: GroupModel = new GroupModel(
    1,
    "Farming For Gold",
    "Let's meet at the Dwarven Mines south entrance.",
    6,
    new Date().toISOString(),
    new Date().toISOString(),
    "Test User",
    "Test User",
    1,
    GroupStatusEnum.ACTIVE,
    members,
  );

  beforeEach(async () => {
    dialogRefStub = jasmine.createSpyObj("MatDialogRef", ["close"]);

    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        MatSnackBarModule,
        MatDialogModule,
        MatListModule,
        GroupDetailsDialogComponent,
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefStub },
        { provide: MAT_DIALOG_DATA, useValue: group },
        GroupManagerService,
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
    expect(dialogRefStub.close.calls.count()).toBe(1);
  });

  it("should display all the group members", () => {
    fixture = TestBed.createComponent(GroupDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.group.members.length).toBe(3);
    expect(component.group.members[0].username).toBe("Brooks Foley");
    expect(component.group.members[1].username).toBe("Test User");
    expect(component.group.members[2].username).toBe("Another User");
  });
});
