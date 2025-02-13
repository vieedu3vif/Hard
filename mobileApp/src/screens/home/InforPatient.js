import React, { useState, useEffect } from "react";
import { Text, View, SafeAreaView, TouchableOpacity, Image, StyleSheet, Dimensions, } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons"
import FontAwesome6 from "react-native-vector-icons/FontAwesome6"
import FontAwesome5 from "react-native-vector-icons/FontAwesome5"
import { useNavigation } from '@react-navigation/native'; 
import fetchLatestTelemetryDataDevice from "../../assets/API/APIGetAttrs";
const hei = Dimensions.get("window").height;
const wid = Dimensions.get("window").width;

const InforPatient = ({route}) => {
    const {deviceId } = route.params;
    const [temperature, setTemperature] = useState(null);
    const [heartRate, setHeartRate] = useState(null);
    const [spo2, setSpo2] = useState(null);
    const [name, setName] = useState(null);
    const [sex, setSex] = useState(null);
    const navigation = useNavigation(); 
   
    useEffect(() => {
        const getTelemetryData = async(deviceId) => {
           
            let res = await fetchLatestTelemetryDataDevice(deviceId);
            if (res != null &&  "temperature" in res && "heart_rate" in res && "spo2" in res && "name" in res && "sex" in res){
                setTemperature(res?.temperature[0]?.value);
                setHeartRate(res?.heart_rate[0]?.value);
                setSpo2(res?.spo2[0]?.value);
                setName(res?.name[0]?.value);
                setSex(res?.sex[0]?.value);
            }
        }
    getTelemetryData(deviceId);

    const intervalId = setInterval(() => getTelemetryData(deviceId), 2000);

    return () => clearInterval(intervalId);
},[])

const getPatientStatus = (deviceData, key) => {
    if (!deviceData) {
      return "Dữ liệu không hợp lệ";
    }
    if(key =="temp") {

        if(deviceData > 37.2) {
            return "Bất thường";
        }
        return "Bình thường";
      }
    if(key =="hr") {

        if(deviceData > 130 || deviceData < 60) {
            return "Bất thường";
        }
        return "Bình thường";
    }
  
      if(key =="sp") {

        if(deviceData < 95) {
            return "Bất thường";
        }
        return "Bình thường";
      }
      return "Dữ liệu không hợp lệ";
  };
  const hrStatus = getPatientStatus(heartRate, "hr");
  const tpStatus = getPatientStatus(temperature, "temp");
  const spStatus = getPatientStatus(spo2,"sp");

    return (
        <SafeAreaView>
            <View style = {styles.container}>
                <View style={styles.boxTop}>
                    <Image source={require("../../assets/image/avt.jpg")} style={{height:75, width:75, borderRadius:15, marginTop:75,}}></Image>
                    <Text style={{fontWeight:"bold", fontSize:28, color:"black", marginTop:10,}}>{name}</Text>
                    <Text>{sex}</Text>
                </View>
                <View style={{flex:1,}}>
                    <TouchableOpacity style={styles.boxInfor}
                    onPress={() => navigation.navigate('HeartRate', { deviceId})}>
                        <View style = {[styles.avtView, {backgroundColor: "#ffe0e2"}]}>
                            <Ionicons name="heart-outline" size={35}></Ionicons>
                        </View>
                        <View style ={styles.inforView}>
                            <Text style={styles.nameText}>Nhịp tim</Text>
                            <Text style={styles.sexText}>{heartRate == null ? "NA": heartRate} bpm</Text>
                        </View>
                        <View style={[styles.status, hrStatus === "Bất thường" ? { backgroundColor: '#fa4d5e' } : { backgroundColor: '#1EFF65' }]}>
                            <Text>{hrStatus}</Text>
                        </View>
                   </TouchableOpacity>
                   <TouchableOpacity style={styles.boxInfor}
                   onPress={() => navigation.navigate('Temperature', { deviceId})}>
                        <View style = {[styles.avtView, {backgroundColor: "#f9ffdb"}]}>
                            <FontAwesome6 name="temperature-empty" size={35}></FontAwesome6>
                        </View>
                        <View style ={styles.inforView}>
                            <Text style={styles.nameText}>Nhiệt độ</Text>
                            <Text style={styles.sexText}>{temperature == null ? "NA": temperature}</Text>

                        </View>
                        <View style={[styles.status, tpStatus === "Bất thường" ? { backgroundColor: '#fa4d5e' } : { backgroundColor: '#1EFF65' }]}>
                            <Text>{tpStatus}</Text>
                        </View>
                   </TouchableOpacity>
                   <TouchableOpacity style={styles.boxInfor}
                   onPress={() => navigation.navigate('SpO2', { deviceId})}>
                        <View style = {[styles.avtView, {backgroundColor: "#d3fff5"}]}>
                        <FontAwesome5 name="air-freshener" size={35}></FontAwesome5>
                        </View>
                        <View style ={styles.inforView}>
                            <Text style={styles.nameText}>SpO2</Text>
                            <Text style={styles.sexText}>{spo2 == null ? "NA": spo2}%</Text>
                        </View>
                        <View style={[styles.status, spStatus === "Bất thường" ? { backgroundColor: '#fa4d5e' } : { backgroundColor: '#1EFF65' }]}>
                            <Text>{spStatus}</Text>
                        </View>
                   </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}
export default InforPatient
const styles = StyleSheet.create({
    container:{
        flex: 1,
    },
    boxTop :{
        height: hei * 0.35,
        backgroundColor:"#d0e4ff",
        borderBottomLeftRadius:35,
        borderBottomRightRadius:35,
        justifyContent:"center",
        alignItems:"center",
    },
    boxInfor:{
        height: hei * 0.1,
        width: wid * 0.89,
        backgroundColor: 'white',
        borderRadius:20,
        marginTop:35,
        marginLeft:24,
        flexDirection:'row',
        alignItems:'center',
    },
    avtView: {
        height:50,
        width:50,
        borderRadius:10,
    //    backgroundColor:"#d0e4ff",
        marginHorizontal:15, 
        justifyContent:'center',
        alignItems:'center'
    },
    inforView :{
        height: hei * 0.1,
        width: 170,
    //    backgroundColor:'green',
        justifyContent:'center',
    //    alignItems:'center'
    }, 
    nameText : {
        color:'black',
        fontSize: 16,
        fontWeight:'bold'
    },
    sexText:{
        color:'black',
        fontSize :12,
    },
    status:{
        height:30,
        width:85,
        backgroundColor:'#95F8A7',
        borderRadius:5,
        justifyContent:'center',
        alignItems:'center',
        marginLeft:-40,
    }
})