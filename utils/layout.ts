export const GAME_CARD_WIDTH = 150;
export const GAME_CARD_MARGIN = 10;
const MIN_COLUMNS = 2;

// Number of game card columns that fit into the given width (at least two)
export const calcNumColumns = (availableWidth: number): number => {
  const columns = Math.floor(
    availableWidth / (GAME_CARD_WIDTH + GAME_CARD_MARGIN)
  );
  return Math.max(columns, MIN_COLUMNS);
};
