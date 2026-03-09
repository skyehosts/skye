import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { Button } from "react-native-paper";
import { WizardAppBar } from "./wizard-app-bar";
import { ScreenContainer } from "../components/screen-container";
import { commonStyles } from "../theme";

export default function PricingScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <WizardAppBar title="Finish up and publish" />

      <View style={commonStyles.content}>
        <Text style={commonStyles.heading}>Pricing</Text>
        <Text style={commonStyles.sectionSubtext}>TODO</Text>
      </View>

      <View style={commonStyles.footer}>
        <Button mode="text" onPress={() => router.back()}>
          Back
        </Button>
        <Button
          mode="contained"
          onPress={() => router.push("/create-new-listing/safety-details")}
        >
          Next
        </Button>
      </View>
    </ScreenContainer>
  );
}
