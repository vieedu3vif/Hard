import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';

const App = () => {
  const [notification, setNotification] = useState(null);

  // Yêu cầu quyền thông báo cho Android
  useEffect(() => {
    const requestPermission = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Notification permission granted!');
      } else {
        console.log('Notification permission denied!');
      }
    };

    requestPermission();

    // Đăng ký vào topic "alerts"
    messaging()
      .subscribeToTopic('alerts')
      .then(() => {
        console.log('Subscribed to alerts topic!');
      })
      .catch(error => {
        console.log('Error subscribing to topic:', error);
      });

    // Lắng nghe thông báo khi ứng dụng đang mở (foreground)
    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      console.log('Foreground message received:', remoteMessage);
      setNotification(remoteMessage.notification);
      Alert.alert('New Notification', remoteMessage.notification.body);
    });

    // Lắng nghe thông báo khi ứng dụng đang ở background
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification caused app to open from background state:', remoteMessage);
      setNotification(remoteMessage.notification);
      Alert.alert('App opened by notification', remoteMessage.notification.body);
    });

    // Kiểm tra khi ứng dụng được mở từ thông báo khi ứng dụng đã bị tắt
    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        console.log('App opened from a quit state by notification:', remoteMessage);
        setNotification(remoteMessage.notification);
        Alert.alert('App opened by notification', remoteMessage.notification.body);
      }
    });

    return () => unsubscribeOnMessage(); // Dọn dẹp khi component unmount
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {notification ? (
        <Text>{`Notification received: ${notification.title}`}</Text>
      ) : (
        <Text>No notifications received yet</Text>
      )}
    </View>
  );
};

export default App;
