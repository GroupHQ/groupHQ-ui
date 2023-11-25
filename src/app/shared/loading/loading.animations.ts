import {
  animate,
  keyframes,
  style,
  transition,
  trigger,
} from "@angular/animations";

export const AppLoadingAnimation = [
  trigger("loadingAnimation", [
    transition(
      ":enter",
      [
        animate(
          "{{animationTimeSeconds}}s ease-in-out",
          keyframes([
            style({ transform: "translate(-50%, -50%) scale(0)" }),
            style({ transform: "translate(-50%, -50%) scale(1.25)" }),
            style({ transform: "translate(-50%, -50%) scale(1)" }),
          ]),
        ),
      ],
      { params: { animationTimeSeconds: 1 } },
    ),
    transition(
      ":leave",
      [
        animate(
          "{{animationTimeSeconds}}s ease-in-out",
          keyframes([
            style({ transform: "translate(-50%, -50%) scale(1)" }),
            style({ transform: "translate(-50%, -50%) scale(1.25)" }),
            style({ transform: "translate(-50%, -50%) scale(0)" }),
          ]),
        ),
      ],
      { params: { animationTimeSeconds: 1 } },
    ),
  ]),
];
