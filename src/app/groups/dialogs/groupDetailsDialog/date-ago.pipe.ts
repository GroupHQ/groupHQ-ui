import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "dateAgo",
  standalone: true,
  pure: false,
})
export class DateAgoPipe implements PipeTransform {
  transform(date: string): string {
    return this.timeSince(date);
  }

  private timeSince(date: string): string {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 1000,
    );

    if (seconds < 0) {
      throw new Error("Date must be in the past");
    }

    let interval: number;

    interval = seconds / 3600;
    if (interval >= 1) {
      const floored = Math.floor(interval);
      return floored === 1 ? "1 hour ago" : floored + " hours ago";
    }
    interval = seconds / 60;
    if (interval >= 1) {
      const floored = Math.floor(interval);
      return floored === 1 ? "1 minute ago" : floored + " minutes ago";
    }

    return "a few seconds ago";
  }
}
