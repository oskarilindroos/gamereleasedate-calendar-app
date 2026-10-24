import { fireEvent, screen, userEvent } from "@testing-library/react-native";
import ScreenshotCarousel from "./ScreenshotCarousel";
import { renderWithTheme } from "../test/renderWithTheme";

const urls = ["https://img/1.jpg", "https://img/2.jpg"];

const renderCarousel = async () => {
  await renderWithTheme(<ScreenshotCarousel urls={urls} />);
  // Images are only rendered once the container width is known
  await fireEvent(screen.getByTestId("screenshot-carousel"), "layout", {
    nativeEvent: { layout: { width: 300, height: 400 } },
  });
};

describe("ScreenshotCarousel", () => {
  it("renders every screenshot", async () => {
    await renderCarousel();

    expect(screen.getByRole("imagebutton", { name: "Screenshot 1 of 2" })).toBeOnTheScreen();
    expect(screen.getByRole("imagebutton", { name: "Screenshot 2 of 2" })).toBeOnTheScreen();
  });

  it("opens a full screen preview that can be closed", async () => {
    await renderCarousel();

    await userEvent.press(screen.getByRole("imagebutton", { name: "Screenshot 2 of 2" }));
    const close = screen.getByRole("button", { name: "Close preview" });
    expect(close).toBeOnTheScreen();

    await userEvent.press(close);
    expect(screen.queryByRole("button", { name: "Close preview" })).not.toBeOnTheScreen();
  });
});
