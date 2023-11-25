import {
  animate,
  keyframes,
  style,
  transition,
  trigger,
} from "@angular/animations";

export const GroupBoardAnimation = [
  trigger("groupBoardAnimation", [
    transition(":enter", [
      animate(
        "1.0s ease-out",
        keyframes([
          style({ transform: "scale(0)" }),
          style({ transform: "scale(1)" }),
        ]),
      ),
    ]),
    transition(":leave", [
      animate(
        "1.0s ease-in",
        keyframes([
          style({ transform: "scale(1)" }),
          style({ transform: "scale(0)" }),
        ]),
      ),
    ]),
  ]),
  trigger("groupBoardNoGroupsMessage", [
    transition(":enter", [
      style({ transform: "translate(-50%, -50%) scale(0)" }),
      animate(
        "1.0s ease-out",
        style({ transform: "translate(-50%, -50%) scale(1)" }),
      ),
    ]),
    transition(":leave", [
      style({ transform: "translate(-50%, -50%) scale(1)" }),
      animate(
        "1.0s ease-out",
        style({ transform: "translate(-50%, -50%) scale(0)" }),
      ),
    ]),
  ]),
];
