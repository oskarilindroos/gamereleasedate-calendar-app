import { screen, userEvent } from "@testing-library/react-native";
import GameCard from "./GameCard";
import { makeGame } from "../test/fixtures";
import { renderWithTheme } from "../test/renderWithTheme";

describe("GameCard", () => {
  it("shows the game name and release date", async () => {
    await renderWithTheme(<GameCard game={makeGame()} onPress={jest.fn()} />);

    expect(screen.getByText("Stellar Frontier")).toBeOnTheScreen();
    expect(screen.getByText("Nov 7, 2026")).toBeOnTheScreen();
  });

  it("calls onPress with the game when the cover is pressed", async () => {
    const onPress = jest.fn();
    const game = makeGame();
    await renderWithTheme(<GameCard game={game} onPress={onPress} />);

    await userEvent.press(
      screen.getByRole("button", { name: "Stellar Frontier details" })
    );

    expect(onPress).toHaveBeenCalledWith(game);
  });
});
