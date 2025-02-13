import { Notifications } from 'react-native-notifications';

const sendLocalNotification = () => {
  Notifications.postLocalNotification({
    title: "HealthST",
    body: "CÓ bệnh nhân bất thường, xem ngay!",
    silent: false, // false để hiển thị âm thanh thông báo
    category: "SOME_CATEGORY",
  });
};

export default sendLocalNotification;
