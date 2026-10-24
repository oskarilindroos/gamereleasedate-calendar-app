import { Text } from "react-native";
import { render, screen, userEvent, waitFor } from "@testing-library/react-native";
import SlideUpModal from "./SlideUpModal";

const renderModal = (props: Partial<Parameters<typeof SlideUpModal>[0]> = {}) =>
  render(
    <SlideUpModal visible onClose={jest.fn()} {...props}>
      <Text>Modal content</Text>
    </SlideUpModal>
  );

describe("SlideUpModal", () => {
  it("renders its content while visible", async () => {
    await renderModal();
    expect(screen.getByText("Modal content")).toBeOnTheScreen();
  });

  it("doesn't render anything when not visible", async () => {
    await renderModal({ visible: false });
    expect(screen.queryByText("Modal content")).not.toBeOnTheScreen();
  });

  it("closes when the backdrop is pressed", async () => {
    const onClose = jest.fn();
    await renderModal({ onClose });

    await userEvent.press(screen.getByTestId("modal-backdrop"));

    expect(onClose).toHaveBeenCalled();
  });

  it("unmounts the content and calls onHidden after hiding", async () => {
    const onHidden = jest.fn();
    await renderModal({ onHidden });

    await screen.rerender(
      <SlideUpModal visible={false} onClose={jest.fn()} onHidden={onHidden}>
        <Text>Modal content</Text>
      </SlideUpModal>
    );

    await waitFor(() => expect(onHidden).toHaveBeenCalledTimes(1));
    expect(screen.queryByText("Modal content")).not.toBeOnTheScreen();
  });
});
