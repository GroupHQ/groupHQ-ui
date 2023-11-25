import { animate, style, transition, trigger } from "@angular/animations";

export const SyncBannerAnimation = [
  trigger("syncBanner", [
    transition(":enter", [
      style({ height: "0" }),

      animate("1s ease-out", style({ height: "*" })),
    ]),
    transition(":leave", [
      style({
        backgroundImage: "linear-gradient(to right, green 50%, #d32f2f 50%)",
        backgroundSize: "200% 100%",
        backgroundPosition: "right bottom",
        transition: "background-position 1s ease",
      }),
      animate(
        "2s linear",
        style({
          backgroundPosition: "left bottom",
        }),
      ),
      animate(
        "5s",
        style({
          backgroundPosition: "left bottom", // keep element for a few seconds
        }),
      ),
      animate(
        "1s ease-out",
        style({
          height: "0",
        }),
      ),
    ]),
  ]),
];
