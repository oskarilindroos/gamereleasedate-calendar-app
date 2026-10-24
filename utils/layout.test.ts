import { calcNumColumns } from "./layout";

describe("calcNumColumns", () => {
  it.each([
    [300, 2], // small phone: never fewer than two columns
    [351, 2], // iPhone 17 (390pt * 90%)
    [480, 3],
    [738, 4], // iPad (820pt * 90%)
    [1180, 7],
  ])("fits %ipt into %i columns", (width, columns) => {
    expect(calcNumColumns(width)).toBe(columns);
  });
});
