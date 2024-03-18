import { DateAgoPipe } from "./date-ago.pipe";

describe("DateAgoPipe", () => {
  let pipe: DateAgoPipe;

  beforeEach(() => {
    pipe = new DateAgoPipe();
  });

  it("should return singular hour description when time since is one hour", () => {
    const date = new Date();
    date.setHours(date.getHours() - 1);
    const timeSince = pipe.transform(date.toISOString());
    expect(timeSince).toBe("1 hour ago");
  });

  it("should return plural hour description when time since is multiple hours", () => {
    const date = new Date();
    date.setHours(date.getHours() - 2);
    const timeSince = pipe.transform(date.toISOString());
    expect(timeSince).toBe("2 hours ago");
  });

  it("should return singular minute description when time since is one minute", () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - 1);
    const timeSince = pipe.transform(date.toISOString());
    expect(timeSince).toBe("1 minute ago");
  });

  it("should return plural minute description when time since is multiple minutes", () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - 2);
    const timeSince = pipe.transform(date.toISOString());
    expect(timeSince).toBe("2 minutes ago");
  });

  it("should return generic plural second description when time since is in seconds", () => {
    const date = new Date();
    date.setSeconds(date.getSeconds() - 2);
    const timeSince = pipe.transform(date.toISOString());
    expect(timeSince).toBe("a few seconds ago");
  });

  it("should throw an error when time since is negative", () => {
    const date = new Date();
    date.setSeconds(date.getSeconds() + 1);
    expect(() => pipe.transform(date.toISOString())).toThrowError();
  });
});
