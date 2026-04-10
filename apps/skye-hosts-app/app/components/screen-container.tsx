import { type ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { colors } from "../theme";

interface ScreenContainerProps {
  children: ReactNode;
  style?: ViewStyle;
  /**
   * Optional fixed element rendered above the body (e.g. an Appbar). Stays
   * pinned and is not scrolled by the keyboard-avoiding body.
   */
  header?: ReactNode;
  /**
   * When true, wraps content in a KeyboardAwareScrollView so the focused
   * input is automatically scrolled above the soft keyboard on iOS & Android.
   * Use for any screen containing TextInputs.
   */
  avoidKeyboard?: boolean;
  /**
   * Extra bottom offset (px) to keep above the keyboard when avoidKeyboard
   * is enabled. Useful when there is a sticky button below the inputs.
   */
  keyboardBottomOffset?: number;
}

export function ScreenContainer({
  children,
  style,
  header,
  avoidKeyboard = false,
  keyboardBottomOffset = 0,
}: ScreenContainerProps) {
  const body = avoidKeyboard ? (
    <KeyboardAwareScrollView
      style={styles.flex}
      contentContainerStyle={[styles.scrollContent, style]}
      bottomOffset={keyboardBottomOffset}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </KeyboardAwareScrollView>
  ) : (
    <View style={[styles.flex, style]}>{children}</View>
  );

  return (
    <View style={styles.container}>
      {header}
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
