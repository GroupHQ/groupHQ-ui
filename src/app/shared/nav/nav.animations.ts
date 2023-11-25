import {
  trigger,
  state,
  style,
  transition,
  animate,
} from "@angular/animations";

export const ExtensionAnimation = trigger("extensionAnimation", [
  state(
    "void",
    style({
      height: "0",
    }),
  ),
  state(
    "visible",
    style({
      height: "*",
    }),
  ),
  transition("void <=> *", [animate("350ms ease-out")]),
]);
