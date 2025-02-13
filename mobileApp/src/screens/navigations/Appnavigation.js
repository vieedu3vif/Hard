import React, { useState, useEffect } from "react";
import { View, Text, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ListPatient from "../home/ListPatient";
import InforPatient from "../home/InforPatient";
import HearRate from "../home/HeartRate";
import Temperature from "../home/Temperature";
import Spo2 from "../home/Spo2";
import Login from "../welcome/Login";
import Signup from "../welcome/Signup";
import messaging from '@react-native-firebase/messaging';

const Stack = createNativeStackNavigator();

export default function Appnavigation() {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
   
    const requestPermission = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Notification permission granted!');
      } else {
        console.log('Notification permission denied!');
      }
    };

    requestPermission();

    messaging()
      .subscribeToTopic('alerts')
      .then(() => {
        console.log('Subscribed to alerts topic!');
      })
      .catch(error => {
        console.error('Error subscribing to topic:', error);
      });

    const unsubscribeNotificationOpened = messaging().onNotificationOpenedApp(remoteMessage => {
      if (remoteMessage?.notification) {
        console.log('Notification opened from background:', remoteMessage.notification);
        setNotification(remoteMessage.notification);
        Alert.alert('App opened by notification', remoteMessage.notification.body);
      }
    });

    messaging().getInitialNotification().then(remoteMessage => {
        if (remoteMessage?.notification) {
          console.log('Notification opened from quit state:', remoteMessage.notification);
          setNotification(remoteMessage.notification);
          Alert.alert('App opened by notification', remoteMessage.notification.body);
        }
      });

   
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background:', remoteMessage);
    });
    return () => {
      unsubscribeNotificationOpened();
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="ListPatient" component={ListPatient} options={{ title: 'Danh sách bệnh nhân' }} />
        <Stack.Screen name="InforPatient" component={InforPatient} options={{ title: 'Thông tin bệnh nhân' }} />
        <Stack.Screen name="HeartRate" component={HearRate} options={{ title: 'Nhịp tim' }} />
        <Stack.Screen name="Temperature" component={Temperature} options={{ title: 'Nhiệt độ' }} />
        <Stack.Screen name="SpO2" component={Spo2} options={{ title: 'SpO2' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
