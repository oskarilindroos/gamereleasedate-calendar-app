// This file provides services for navigation drawer actions
// so that they can be used anywhere without passing the navigation as props
// (the header is rendered outside of the navigator).
import {
  createNavigationContainerRef,
  DrawerActions,
} from "@react-navigation/native";
import { DrawerParamList } from "../types/navigation";

export const navigationRef = createNavigationContainerRef<DrawerParamList>();

export function toggleDrawer() {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(DrawerActions.toggleDrawer());
  }
}

export function searchGames(searchPhrase: string) {
  if (navigationRef.isReady()) {
    navigationRef.navigate("Home", {
      searchPhrase: searchPhrase.trim() || undefined,
    });
  }
}
