import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import SignUpScreen from "./sign-up";
import * as authService from "../services/auth.service";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../services/auth.service", () => ({
  phoneLookup: jest.fn(),
  requestOtp: jest.fn(),
}));

jest.mock("../components/screen-container", () => ({
  ScreenContainer: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("../components/app-snackbar", () => ({
  AppSnackbar: () => null,
}));

const mockPush = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
});

describe("SignUpScreen", () => {
  describe("phone step", () => {
    it("disables Continue button when phone number is too short", () => {
      const { getByText } = render(<SignUpScreen />);
      const continueButton = getByText("Continue");
      expect(continueButton).toBeDisabled();
    });

    it("enables Continue button when phone number has 10+ digits", () => {
      const { getByText, getByPlaceholderText } = render(<SignUpScreen />);
      fireEvent.changeText(
        getByPlaceholderText("+44 7700 900000"),
        "07700900000",
      );
      expect(getByText("Continue")).not.toBeDisabled();
    });
  });

  describe("name step — new user", () => {
    async function renderAtNameStep() {
      (authService.phoneLookup as jest.Mock).mockResolvedValue({
        exists: false,
      });

      const result = render(<SignUpScreen />);
      fireEvent.changeText(
        result.getByPlaceholderText("+44 7700 900000"),
        "07700900000",
      );
      fireEvent.press(result.getByText("Continue"));

      await waitFor(() => result.getByText("Send verification code"));
      return result;
    }

    it("disables submit button when name field is empty", async () => {
      const { getByText } = await renderAtNameStep();
      expect(getByText("Send verification code")).toBeDisabled();
    });

    it("disables submit button when name field contains only whitespace", async () => {
      const { getByText, getByPlaceholderText } = await renderAtNameStep();
      fireEvent.changeText(getByPlaceholderText("e.g. John Smith"), "   ");
      expect(getByText("Send verification code")).toBeDisabled();
    });

    it("enables submit button when name has a value", async () => {
      const { getByText, getByPlaceholderText } = await renderAtNameStep();
      fireEvent.changeText(getByPlaceholderText("e.g. John Smith"), "John");
      expect(getByText("Send verification code")).not.toBeDisabled();
    });

    it("navigates to verify-code with name and phone when submitted", async () => {
      (authService.requestOtp as jest.Mock).mockResolvedValue({});
      const { getByText, getByPlaceholderText } = await renderAtNameStep();
      fireEvent.changeText(getByPlaceholderText("e.g. John Smith"), "John");
      fireEvent.press(getByText("Send verification code"));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith({
          pathname: "/(auth)/verify-code",
          params: { phoneNumber: "07700900000", name: "John" },
        });
      });
    });
  });
});
