import {
  ChangeDetectorRef,
  Inject,
  Injectable,
  InjectionToken,
  QueryList,
} from "@angular/core";
import {
  animate,
  AnimationBuilder,
  AnimationPlayer,
  style,
} from "@angular/animations";

export const ID_ATTRIBUTE_TOKEN = new InjectionToken<string>("id-attribute");

/* eslint @typescript-eslint/no-explicit-any: "off" */
@Injectable()
export class FlipService {
  private firstPositions = new Map<string, DOMRect>();
  private finalPositions = new Map<string, DOMRect>();
  private animatingElementsMap = new Map<string, AnimationPlayer>();
  private components: QueryList<any> | null = null;
  private dataRemovalAttribute = "data-removal-imminent";

  constructor(
    private animationBuilder: AnimationBuilder,
    @Inject(ID_ATTRIBUTE_TOKEN) private idAttribute: string,
  ) {}

  public setComponents(components: QueryList<any>) {
    this.components = components;
  }

  public animate(
    change: () => any,
    changeDetectorRef?: ChangeDetectorRef,
    removeId?: string,
  ) {
    console.debug("Components", this.components);
    if (this.components === null) {
      throw new Error("Components not set");
    }

    if (removeId) {
      const player = this.createRemovalAnimation(
        this.components,
        removeId,
        change,
      );
      if (!player) {
        return;
      }
      change = () => player.play();
    }

    this.setFirstPositions(this.components);

    change();
    if (changeDetectorRef) {
      changeDetectorRef.detectChanges();
    }

    this.setFinalPositions(this.components);

    this.components.toArray().forEach((el) => {
      const id = el.getRootElement().getAttribute(this.idAttribute);
      const first = this.firstPositions.get(id);
      const last = this.finalPositions.get(id);

      let animation;

      if (!last) {
        return; // animation handled by remove method
      } else if (!first) {
        animation = this.animationBuilder.build([
          style({ opacity: 0, transform: "translateY(-100px)" }),
          animate("1s ease", style({ opacity: 1, transform: "none" })),
        ]);
      } else {
        animation = this.createReorderAnimation(id, el, first, last);
      }

      const player = animation.create(el.getRootElement());
      this.animatingElementsMap.set(id, player);
      player.onDone(() => this.animatingElementsMap.delete(id));
      player.play();
    });
  }

  private createRemovalAnimation(
    components: QueryList<any>,
    id: string,
    removalCallback: () => void,
  ): AnimationPlayer | null {
    const element = components.toArray().find((item) => {
      return item.getRootElement().getAttribute("data-group-id") === id;
    });

    if (!element) {
      return null;
    }

    let animation;
    const elementRoot = element.getRootElement();
    const elementRect = elementRoot.getBoundingClientRect();
    const parentRect = elementRoot.offsetParent?.getBoundingClientRect();

    if (!parentRect) {
      console.warn(
        "Parent rect returned null. Possible cause: element or ancestor is hidden, element has position fixed, element is body or html. Returning empty animation.",
      );

      return this.animationBuilder.build([]).create(elementRoot);
    }

    const animationPlayer = this.animatingElementsMap.get(id.toString());
    if (animationPlayer) {
      const currentTransform = window.getComputedStyle(elementRoot).transform;
      animationPlayer.destroy();

      const top = elementRect.top - parentRect.top;
      const left = elementRect.left - parentRect.left;
      elementRoot.style.position = "absolute";
      elementRoot.style.top = `${top}px`;
      elementRoot.style.left = `${left}px`;

      animation = this.animationBuilder.build([
        style({
          transform: `${currentTransform} translateY(0)`,
        }),
        animate(
          "1s ease",
          style({
            transform: `${currentTransform} translateX(200px)`,
            opacity: "0",
            scale: "0",
          }),
        ),
      ]);
    } else {
      animation = this.animationBuilder.build([
        style({
          position: "absolute",
          left: `${elementRect.left - parentRect.left}px`,
          top: `${elementRect.top - parentRect.top}px`,
        }),
        animate(
          "1s ease",
          style({
            transform: "translateX(200px)",
            scale: "0",
            opacity: "0",
          }),
        ),
      ]);
    }

    const player = animation.create(elementRoot);
    this.animatingElementsMap.set(id, player);
    element.getRootElement().setAttribute(this.dataRemovalAttribute, "true");

    player.onDone(() => {
      this.animatingElementsMap.delete(id.toString());
      removalCallback();
    });

    return player;
  }

  private createReorderAnimation(
    id: string,
    element: any,
    first: DOMRect,
    last: DOMRect,
  ) {
    let animation;

    const animationPlayer = this.animatingElementsMap.get(id);

    if (animationPlayer) {
      const elementStyles = window.getComputedStyle(element.getRootElement());
      const transform = elementStyles.transform;
      animationPlayer.destroy();

      animation = this.animationBuilder.build([
        style({ transform: transform }),
        animate(
          "1s ease",
          style({
            transform: "none",
          }),
        ),
      ]);
    } else {
      const invertX = first.left - last.left;
      const invertY = first.top - last.top;
      animation = this.animationBuilder.build([
        style({
          transform: `translateX(${invertX}px) translateY(${invertY}px)`,
        }),
        animate("1s ease", style({ transform: "none" })),
      ]);
    }

    return animation;
  }

  private setFirstPositions(components: QueryList<any>) {
    this.setPositions(components, this.firstPositions);
  }

  private setFinalPositions(components: QueryList<any>) {
    this.setPositions(components, this.finalPositions);
  }

  private setPositions(components: QueryList<any>, map: Map<string, DOMRect>) {
    map.clear();
    const elements = components.toArray();
    elements.forEach((el) => {
      if (el.getRootElement().getAttribute(this.dataRemovalAttribute)) {
        return;
      }

      const id = el.getRootElement().getAttribute(this.idAttribute);
      const domRect = el.getRootElement().getBoundingClientRect();
      map.set(id, domRect);
    });
  }
}
