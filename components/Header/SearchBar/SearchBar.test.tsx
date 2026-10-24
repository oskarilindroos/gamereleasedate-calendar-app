import { fireEvent, screen, userEvent } from "@testing-library/react-native";
import SearchBar from "./SearchBar";
import * as NavigationService from "../../../services/NavigationService";
import { renderWithTheme } from "../../../test/renderWithTheme";

jest.mock("../../../services/NavigationService");
const mockedSearch = jest.mocked(NavigationService.searchGames);

beforeEach(() => jest.clearAllMocks());

describe("SearchBar", () => {
  it("searches when the keyboard search button is pressed", async () => {
    await renderWithTheme(<SearchBar />);
    const input = screen.getByPlaceholderText("Search games...");

    await userEvent.type(input, "zelda");
    await fireEvent(input, "submitEditing");

    expect(mockedSearch).toHaveBeenCalledWith("zelda");
  });

  it("searches when the search icon is pressed", async () => {
    await renderWithTheme(<SearchBar />);

    await userEvent.type(screen.getByPlaceholderText("Search games..."), "zelda");
    await userEvent.press(screen.getByRole("button", { name: "Search" }));

    expect(mockedSearch).toHaveBeenCalledWith("zelda");
  });

  it("ignores the search icon when the input is empty", async () => {
    await renderWithTheme(<SearchBar />);

    await userEvent.press(screen.getByRole("button", { name: "Search" }));

    expect(mockedSearch).not.toHaveBeenCalled();
  });

  it("clears the search phrase", async () => {
    await renderWithTheme(<SearchBar />);
    const input = screen.getByPlaceholderText("Search games...");

    await userEvent.type(input, "zelda");
    await userEvent.press(screen.getByRole("button", { name: "Clear search" }));

    expect(input).toHaveDisplayValue("");
  });
});
