import { ComponentFixture, TestBed } from "@angular/core/testing";
import { GroupUtilityBarComponent } from "./groupUtilityBar.component";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { GroupSortEnum } from "../../model/enums/groupSort.enum";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { MatSelectHarness } from "@angular/material/select/testing";

describe("GroupUtilityBarComponent", () => {
  let fixture: ComponentFixture<GroupUtilityBarComponent>;
  let component: GroupUtilityBarComponent;
  let page: Page;
  let selectHarness: MatSelectHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, MatFormFieldModule, MatSelectModule],
      declarations: [GroupUtilityBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupUtilityBarComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);

    const loader = TestbedHarnessEnvironment.loader(fixture);
    selectHarness = await loader.getHarness(
      MatSelectHarness.with({
        selector: "[data-test='group-utility-bar-select']",
      }),
    );
  });

  it("creates the component", () => {
    expect(component).toBeTruthy();
  });

  describe("select field", () => {
    it("should render the select label", () => {
      expect(page.selectLabelElement).toBeTruthy();
    });

    it("should render the select element", () => {
      expect(page.selectElement).toBeTruthy();
    });

    it("should have an option selected", async () => {
      const selectedOption = await selectHarness.getValueText();
      expect(selectedOption).toBeTruthy();
    });

    it("should default to one of the select options", async () => {
      const selectedOption = await selectHarness.getValueText();
      if (!selectedOption) {
        fail("No option selected");
      }

      expect(Object.values(GroupSortEnum)).toContain(
        selectedOption as GroupSortEnum,
      );
    });

    it("should update the selected option when clicked", async () => {
      await selectHarness.open();
      const options = await selectHarness.getOptions();

      if (options.length < 2) {
        fail("Not enough options");
      }

      await selectHarness.open();
      let optionText = await options[0].getText();
      await selectHarness.clickOptions({
        text: optionText,
      });
      expect(await selectHarness.isOpen()).toBeFalse();
      expect(await selectHarness.getValueText()).toEqual(optionText);

      await selectHarness.open();
      optionText = await options[1].getText();
      await selectHarness.clickOptions({
        text: optionText,
      });
      expect(await selectHarness.isOpen()).toBeFalse();
      expect(await selectHarness.getValueText()).toEqual(optionText);
    });
  });
});

class Page {
  private readonly _groupUtilityBarComponent: HTMLElement;

  constructor(readonly fixture: ComponentFixture<GroupUtilityBarComponent>) {
    this._groupUtilityBarComponent = fixture.nativeElement;
  }

  get groupUtilityBarComponent(): HTMLElement {
    return this._groupUtilityBarComponent;
  }

  get selectLabelElement(): HTMLElement {
    return this.groupUtilityBarComponent.querySelector<HTMLElement>(
      "[data-test='group-utility-bar-select-label']",
    )!;
  }

  get selectElement(): HTMLElement {
    return this.groupUtilityBarComponent.querySelector<HTMLElement>(
      "[data-test='group-utility-bar-select']",
    )!;
  }
}
