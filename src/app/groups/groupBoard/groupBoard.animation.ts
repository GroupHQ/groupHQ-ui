import { animateChild, query, transition, trigger } from "@angular/animations";

export const GroupBoardAnimation = [
  trigger("groupChildAnimationEnabler", [
    transition(":enter, :leave", [query("@*", animateChild())]),
  ]),
];
