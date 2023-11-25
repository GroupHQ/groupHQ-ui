import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GroupInputNameDialogComponent } from "./groupInputNameDialog.component";
import { MatFormFieldModule } from "@angular/material/form-field";

describe("GroupInputNameDialogComponent", () => {
  let component: GroupInputNameDialogComponent;
  let fixture: ComponentFixture<GroupInputNameDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<GroupInputNameDialogComponent>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj("MatDialogRef", ["close"]);

    await TestBed.configureTestingModule({
      imports: [MatFormFieldModule],
      declarations: [GroupInputNameDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupInputNameDialogComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should let the user submit their name", () => {
    component.nameField.setValue("Test User");
    component.joinGroup();
    expect(dialogRefSpy.close.calls.count()).toBe(1);
  });

  it("should not let the user submit their name until errors are cleared", () => {
    component.nameField.setValue("");
    component.joinGroup();
    expect(dialogRefSpy.close.calls.count()).toBe(0);
    expect(component.nameField.hasError("required")).toBeTrue();

    component.nameField.setValue("Test User");
    component.joinGroup();
    expect(dialogRefSpy.close.calls.count()).toBe(1);
  });
});
