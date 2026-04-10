import { Button, type ButtonProps } from "react-native-paper";
import { colors } from "../theme";

type DangerButtonProps = Omit<
  ButtonProps,
  "mode" | "buttonColor" | "textColor"
> & {
  /** primary = sole destructive CTA (contained). secondary = inline destructive action (text mode). */
  variant: "primary" | "secondary";
};

export function DangerButton({ variant, ...rest }: DangerButtonProps) {
  if (variant === "primary") {
    return (
      <Button
        mode="contained"
        buttonColor={colors.danger}
        textColor={colors.background}
        {...rest}
      />
    );
  }
  return <Button mode="text" textColor={colors.danger} {...rest} />;
}
