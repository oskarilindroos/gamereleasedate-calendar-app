import "react-native-gesture-handler/jestSetup";

// The real drawer is driven by Reanimated + Gesture Handler animations, which don't run
// in Jest. Render a non-animated drawer instead: content is shown while open.
jest.mock("react-native-drawer-layout", () => {
  const { createContext } = require("react");
  const { View } = require("react-native");
  return {
    DrawerProgressContext: createContext(undefined),
    DrawerGestureContext: createContext(undefined),
    useDrawerProgress: () => ({ value: 0 }),
    Drawer: function Drawer({ open, renderDrawerContent, children }: any) {
      return (
        <View style={{ flex: 1 }}>
          {open && <View testID="drawer">{renderDrawerContent()}</View>}
          {children}
        </View>
      );
    },
  };
});

// Icon fonts can't be loaded in Jest; render icons as plain text with their name
jest.mock("@expo/vector-icons", () => {
  const { Text } = require("react-native");
  const Icon = ({ name }: { name: string }) => <Text>{name}</Text>;
  return { Ionicons: Icon, FontAwesome: Icon };
});
jest.mock("@expo/vector-icons/Ionicons", () => {
  const { Text } = require("react-native");
  const Icon = ({ name }: { name: string }) => <Text>{name}</Text>;
  return Icon;
});

jest.mock("react-native-safe-area-context", () =>
  require("react-native-safe-area-context/jest/mock").default
);

// Native calendar module; individual tests configure the mocked functions
jest.mock("expo-calendar", () => ({
  requestCalendarPermissions: jest.fn(),
  getCalendarPermissions: jest.fn(),
  ExpoCalendarEvent: { get: jest.fn() },
  getCalendars: jest.fn(),
  createCalendar: jest.fn(),
  getDefaultCalendarSync: jest.fn(),
  getSourcesSync: jest.fn(),
  EntityTypes: { EVENT: "event", REMINDER: "reminder" },
  SourceType: { LOCAL: "local" },
  CalendarAccessLevel: { OWNER: "owner" },
}));

// Reanimated/Worklets need their native runtime, which doesn't exist in Jest. The
// libraries built on them are replaced with plain stand-ins below; these cover the
// few APIs the app itself uses.
jest.mock("react-native-reanimated", () => ({
  useSharedValue: (value: unknown) => ({ value }),
}));
jest.mock("react-native-worklets", () => ({
  scheduleOnRN: (fn: (...args: unknown[]) => void, ...args: unknown[]) => fn(...args),
}));

// Renders every slide; swiping isn't simulated
jest.mock("react-native-reanimated-carousel", () => {
  const { View } = require("react-native");
  return {
    Carousel: ({ data, renderItem, testID }: any) => (
      <View testID={testID}>
        {data.map((item: unknown, index: number) => (
          <View key={index}>{renderItem({ item, index })}</View>
        ))}
      </View>
    ),
    Pagination: () => null,
  };
});

// Renders every image; zooming and swiping aren't simulated
jest.mock("react-native-zoom-toolkit", () => {
  const { View } = require("react-native");
  return {
    fitContainer: (aspectRatio: number, { width }: { width: number }) => ({
      width,
      height: width / aspectRatio,
    }),
    Gallery: ({ data, renderItem }: any) => (
      <View testID="gallery">
        {data.map((item: unknown, index: number) => (
          <View key={index}>{renderItem(item, index)}</View>
        ))}
      </View>
    ),
  };
});

// Toasts are asserted through the mocked functions
jest.mock("sonner-native", () => ({
  toast: Object.assign(jest.fn(), { success: jest.fn(), error: jest.fn() }),
  Toaster: () => null,
}));
