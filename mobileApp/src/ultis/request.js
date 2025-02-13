import { PermissionsAndroid, Platform } from 'react-native';

const requestNotificationPermission = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: "Quyền thông báo",
          message: "Ứng dụng cần quyền để gửi thông báo",
          buttonNeutral: "Hỏi lại sau",
          buttonNegative: "Từ chối",
          buttonPositive: "Đồng ý",
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //      console.log("Quyền thông báo đã được cấp");
        return true;
      } else {
  //      console.log("Quyền thông báo chưa được cấp");
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  } else {
    return true; // Không yêu cầu quyền với các phiên bản Android cũ hơn
  }
};

export default requestNotificationPermission;
