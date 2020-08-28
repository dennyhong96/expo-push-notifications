import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Button, Alert } from "react-native";
import * as Notifications from "expo-notifications";
import * as Permissions from "expo-permissions";
import axios from "axios";

// Configure Notification
Notifications.setNotificationHandler({
  // Must return Promise, tells app what should happen
  // when notification received when app is till runnings
  handleNotification: async () => {
    return {
      shouldShowAlert: true, // Should show alert even when app is in foreground
    };
  },
});

export default function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    (async () => {
      const { status: oldStatus } = await Permissions.getAsync(
        Permissions.USER_FACING_NOTIFICATIONS
      );

      if (oldStatus !== "granted") {
        const { status: newStatus } = await Permissions.askAsync(
          Permissions.USER_FACING_NOTIFICATIONS
        );

        if (newStatus !== "granted") {
          return Alert.alert(
            "Permission denied",
            "We cannot send you permissions",
            [{ text: "Okay", style: "default" }]
          );
        }
      }
      console.log("Getting token");
      const res = await Notifications.getExpoPushTokenAsync();
      console.log(res.data);
      setToken(res.data);
      // Associate device token with user on server / DB
      // So it is possible to send push notification to particular user later
    })();
  }, []);

  useEffect(() => {
    const backgroundSub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        // console.log(response);
        // React to background notification clicked here
      }
    );
    const foregroundSub = Notifications.addNotificationReceivedListener(
      (notification) => {
        // console.log(notification);
        // React to foreground notification here
      }
    );
    return () => {
      // Clean up
      backgroundSub.remove();
      foregroundSub.remove();
    };
  }, []);

  const handleNotification = () => {
    // Notifications.scheduleNotificationAsync({
    //   // -> Local Notification
    //   // Only runs when app in background
    //   content: {
    //     title: "My first local notification",
    //     body: "This is my first local notification!",
    //   },
    //   trigger: {
    //     // When should it be sent
    //     seconds: 10,
    //   },
    // });

    const config = {
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip,deflate",
        "Content-Type": "application/json",
      },
    };

    // Url to expo's notification server
    axios.post(
      "http://exp.host/--/api/v2/push/send",
      {
        to: token,
        title: "Sent via within the app",
        body: "This is send with in the app",
      },
      config
    );
  };

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <Button title="Trigger Notification" onPress={handleNotification} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
