import { Alert, Platform, ToastAndroid } from "react-native";

// Shows a short, non-blocking message. Android has native toasts; iOS has no
// equivalent, so a simple alert is used there.
export const notify = (message: string) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert(message);
  }
};
