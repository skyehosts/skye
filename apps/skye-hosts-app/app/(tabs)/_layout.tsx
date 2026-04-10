import { CommonActions } from "@react-navigation/native";
import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import { BottomNavigation, Icon } from "react-native-paper";
import { useUnreadMessages } from "../contexts/unread-messages-context";
import { colors, commonStyles, fontWeight } from "../theme";

export default function TabsLayout() {
  const { hasUnread } = useUnreadMessages();

  return (
    <Tabs
      tabBar={({ navigation, state, descriptors, insets }) => (
        <BottomNavigation.Bar
          navigationState={state}
          safeAreaInsets={insets}
          activeColor={colors.primary}
          inactiveColor={colors.iconInactive}
          activeIndicatorStyle={{ backgroundColor: colors.primaryLight }}
          style={{ backgroundColor: colors.background }}
          onTabPress={({ route, preventDefault }) => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (event.defaultPrevented) {
              preventDefault();
            } else {
              navigation.dispatch({
                ...CommonActions.navigate(route.name, route.params),
                target: state.key,
              });
            }
          }}
          renderIcon={({ route, focused, color }) =>
            descriptors[route.key].options.tabBarIcon?.({
              focused,
              color,
              size: 28,
            }) ?? null
          }
          renderLabel={({ route, focused, color }) => (
            <Text
              style={{
                fontSize: 12,
                color,
                fontWeight: focused ? fontWeight.semibold : fontWeight.normal,
                textAlign: "center",
              }}
            >
              {(descriptors[route.key].options.tabBarLabel as string) ??
                descriptors[route.key].options.title ??
                route.name}
            </Text>
          )}
          getLabelText={({ route }) =>
            (descriptors[route.key].options.tabBarLabel as string) ??
            descriptors[route.key].options.title ??
            route.name
          }
        />
      )}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarLabel: "Calendar",
          tabBarIcon: ({ color, size }) => (
            <Icon source="calendar-month" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="listings"
        options={{
          title: "Listings",
          tabBarLabel: "Listings",
          tabBarIcon: ({ color, size }) => (
            <Icon source="home-group" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarLabel: "Messages",
          tabBarIcon: ({ color, size }) => (
            <View>
              <Icon source="message-outline" size={size} color={color} />
              {hasUnread && <View style={commonStyles.indicatorDot} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="share"
        options={{
          title: "Share",
          tabBarLabel: "Share",
          tabBarIcon: ({ color, size }) => (
            <Icon source="share-variant" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarLabel: "More",
          tabBarIcon: ({ color, size }) => (
            <Icon source="menu" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
