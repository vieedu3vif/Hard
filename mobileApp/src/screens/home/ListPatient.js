import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, SafeAreaView, ScrollView, StyleSheet, Dimensions, TextInput, Image } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import fetchLatestTelemetryDataDevice from "../../assets/API/APIGetAttrs";
import auth from "@react-native-firebase/auth";
const hei = Dimensions.get("window").height;
const wid = Dimensions.get("window").width;

const ListPatient = () => {
  const [patients, setPatients] = useState([]);
  const [numberSick, setNumberSick] = useState(0);
  const navigation = useNavigation();

  // Xác định tình trạng bệnh nhân
  const getPatientStatus = (data) => {
    if (!data) return "Dữ liệu không hợp lệ";

    const temperature = data.temperature?.at(-1)?.value ?? 0;
    const heart_rate = data.heart_rate?.at(-1)?.value ?? 0;
    const spo2 = data.spo2?.at(-1)?.value ?? 0;

    return temperature > 38 || heart_rate > 130 || spo2 < 95 || heart_rate < 60
      ? "Ốm"
      : "Bình thường";
  };

  useEffect(() => {
    const fetchPatientsData = async () => {
      const deviceIds = [
        "c7826090-9c28-11ef-b5a8-ed1aed9a651f",
        "f009edb0-9cde-11ef-b5a8-ed1aed9a651f",
      ];
      const fetchedData = await Promise.all(
        deviceIds.map((deviceId) => fetchLatestTelemetryDataDevice(deviceId))
      );

      const updatedPatients = fetchedData.map((data, index) => ({
        id: deviceIds[index],
        name: data?.name?.[0]?.value || `Bệnh nhân ${index + 1}`, // Lấy giá trị đầu tiên
        sex: data?.sex?.[0]?.value || "Không rõ", // Lấy giá trị đầu tiên
        status: getPatientStatus(data),
      }));

      setPatients(updatedPatients);

      // Đếm số bệnh nhân ốm
      setNumberSick(updatedPatients.filter((p) => p.status === "Ốm").length);
    };

    fetchPatientsData();
    const intervalId = setInterval(fetchPatientsData, 2500);

    return () => clearInterval(intervalId);
  }, []);
 
  
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.searchBox}>
            <TouchableOpacity 
            style={{flexDirection:'row', justifyContent:'center', alignItems:'center', backgroundColor:'white', height:45, width:120, borderRadius:25,}}
            onPress={async () => {
              try {
                await auth().signOut();
                navigation.replace("Login"); 
              } catch (error) {
                console.error("Đăng xuất thất bại:", error);
              }
            }}>
              <MaterialCommunityIcons name='logout' size={30}></MaterialCommunityIcons>
              <Text>Đăng xuất</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.welcomeBox}>
            <Image
              source={require("../../assets/image/avt.jpg")}
              style={styles.avatar}
            />
            <View>
              <Text style={{ marginLeft: 20 }}>Thứ 6, 29 th9, 2024</Text>
              <Text style={styles.welcomeText}>Xin chào, Bác sĩ!</Text>
            </View>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.boxTop}>
          <View style={[styles.twoBox, { backgroundColor: "#0f67fe" }]}>
            <MaterialCommunityIcons
              name="account-group-outline"
              size={40}
              style={{ marginLeft: 5 }}
            />
            <View>
              <Text style={styles.statsText}>{patients.length}</Text>
              <Text style={styles.statsSubText}>Số bệnh nhân</Text>
            </View>
          </View>
          <View style={[styles.twoBox, { backgroundColor: "#fa4d5e" }]}>
            <MaterialCommunityIcons
              name="account-group-outline"
              size={40}
              style={{ marginLeft: 5 }}
            />
            <View>
              <Text style={styles.statsText}>{numberSick}</Text>
              <Text style={styles.statsSubText}>Bệnh nhân ốm</Text>
            </View>
          </View>
        </View>

        {/* Patient List */}
        <Text style={styles.listTitle}>Danh sách bệnh nhân</Text>
        <ScrollView>
          {patients.map((patient) => (
            <TouchableOpacity
              key={patient.id}
              style={styles.boxPatient}
              onPress={() => navigation.navigate("InforPatient", { deviceId: patient.id })}
            >
              <View style={styles.avtView}>
                <Ionicons name="person-outline" size={35} />
              </View>
              <View style={styles.inforView}>
                 <Text style={styles.nameText}>{patient.name}</Text> 
                 <Text style={styles.sexText}>{patient.sex}</Text> 
              </View>
              <View
                style={[
                  styles.status,
                  patient.status === "Ốm"
                    ? { backgroundColor: "#fa4d5e" }
                    : { backgroundColor: "#1EFF65" },
                ]}
              >
                <Text style={{ color: "white" }}>{patient.status}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ListPatient;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ecf2fa",
  },
  header: {
    height: hei * 0.25,
    alignItems: "center",
  },
  searchBox: {
    height: 50,
    width: wid * 0.88,
  //  backgroundColor: "white",
    marginVertical: 15,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  welcomeBox: {
    height: 115,
    width: wid,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    height: 80,
    width: 80,
    borderRadius: 15,
    marginLeft: 27,
  },
  welcomeText: {
    fontWeight: "bold",
    fontSize: 28,
    marginLeft: 20,
  },
  boxTop: {
    height: hei * 0.15,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  twoBox: {
    height: hei * 0.15,
    width: wid * 0.38,
    flexDirection: "row",
    borderRadius: 20,
    alignItems: "center",
  },
  statsText: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
  },
  statsSubText: {
    color: "white",
    fontSize: 14,
    opacity: 0.7,
  },
  listTitle: {
    fontWeight: "bold",
    fontSize: 16,
    paddingLeft: 30,
    marginTop: 20,
  },
  boxPatient: {
    height: hei * 0.1,
    width: wid * 0.89,
    backgroundColor: "white",
    borderRadius: 20,
    marginTop: 25,
    marginLeft: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  avtView: {
    height: 50,
    width: 50,
    borderRadius: 10,
    backgroundColor: "#d0e4ff",
    marginHorizontal: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  inforView: {
    height: hei * 0.1,
    width: 170,
    justifyContent: "center",
  },
  nameText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
  sexText: {
    color: "black",
    fontSize: 12,
  },
  status: {
    height: 30,
    width: 85,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginLeft:-40,
  },
});
