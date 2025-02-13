import React, { useState, useEffect } from "react";
import { Text, View, SafeAreaView, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons"
import FontAwesome5 from "react-native-vector-icons/FontAwesome5"
import Liinechart from "../../components/LiineChart";
import fetchLatestTelemetryDataDevice from "../../assets/API/APIGetAttrs";
import fetchHistoricalTelemetryData from "../../assets/API/APIhistory";
import moment from "moment";



const hei = Dimensions.get("window").height;
const wid = Dimensions.get("window").width;
const key = "spo2";
const codeMax = "MAX";
const codeMin = "MIN";
const codeAVG = "AVG";
const Spo2 = ({route})=>{
    const {deviceId} = route.params;
    const [spo2, setSpo2] = useState(null);
    const [maxSpo2, setMaxSpo2] = useState(null);
    const [minSpo2, setMinSpo2] = useState(null);
    const [chartData, setChartData] = useState(null);
    useEffect(() => {
        const getTelemetryData = async(deviceId) => {
            let res = await fetchLatestTelemetryDataDevice(deviceId);
//            console.log("res2", res);
            if (res != null && "spo2" in res){
               
                setSpo2(res?.spo2[0]?.value);
            }
        }
    getTelemetryData(deviceId);

    const intervalId = setInterval(() => getTelemetryData(deviceId), 2000);

    return () => clearInterval(intervalId);
},[])

useEffect(() => {
    const getMaxData = async (deviceId, key, code) => {
        let history = await fetchHistoricalTelemetryData(deviceId, key, code);
        if (history != null && "spo2" in history) {
                setMaxSpo2(Math.max(...history.spo2.map(item => item.value)));
        }
    };
    getMaxData(deviceId, key, codeMax);

    const interval = setInterval(() => getMaxData(deviceId, key, codeMax), 3000);
    return () => clearInterval(interval);
}, []);
useEffect(() => {
    const getMinData = async (deviceId, key, code) => {
        let history = await fetchHistoricalTelemetryData(deviceId, key, code);
        if (history != null && "spo2" in history) {
                setMinSpo2(Math.min(...history.spo2.map(item => item.value)));
            
            
        }
    };
    getMinData(deviceId, key, codeMin);

    const interval = setInterval(() => getMinData(deviceId, key, codeMin), 3000);
    return () => clearInterval(interval);
}, []);



useEffect(() => {
    const getAVGData = async (deviceId, key, code) => {
        let history = await fetchHistoricalTelemetryData(deviceId, key, code);
        if (history != null && "spo2" in history) {
            const maxElements = 5;
            const last8Elements = history.spo2.slice(-maxElements);

            if (last8Elements.length > 0) {
                const labels = last8Elements.map(item =>
                    moment(parseInt(item.ts)).format('HH:mm')
                );
            //    console.log(labels)
                const data = last8Elements.map(item => {
                    const num = parseFloat(item.value);
                    return num });
//                console.log(data); 
                setChartData({
                    labels: labels,
                    datasets: [{ data: data }]
                });
            }
        }
    };   
    getAVGData(deviceId, key, codeAVG);
    const interval = setInterval(() => getAVGData(deviceId, key, codeAVG), 2000);
    return () => clearInterval(interval);
}, []);
    
    return (
        <SafeAreaView>
            <View style ={styles.container}>
                <View style={styles.MainBox}>
                    <View style={styles.firstBox}>
                    <FontAwesome5 name="air-freshener" size={120}></FontAwesome5>
                    </View>
                    <View style={styles.secondBox}>
                        <Text style={{
                            fontSize:50,
                            fontWeight:'bold',
                            color:'white'
                        }}> {spo2== null ? "NA": spo2} <Text style={{
                            fontSize:24,
                            fontWeight:'bold',
                            color:'#8f8f8f'
                        }}>%</Text>
                        </Text>
                        <Text style={{
                            fontSize:24,
                            fontWeight:'bold',
                            color:'white'
                        }}>SpO2</Text>
                    </View>
                </View>
                <View style={{
                    height: hei * 0.03,
                    justifyContent: 'center',
                //    marginTop:25,
                }}>
                    <Text style={[styles.normalText, { paddingLeft: 25 }]}>Chỉ số hàng giờ</Text>
                </View>
                <View style ={styles.hoursBox}>
                   <View style={styles.miniBox}>
                    <Text style={styles.miniTex}>Thấp nhất</Text>
                    <Text style={styles.numberText}>{minSpo2}</Text>
                    <Text style={styles.unitText}>%</Text>
                   </View>
                   <View style={styles.miniBox}>
                    <Text style={styles.miniTex}>Cao nhất</Text>
                    <Text style={styles.numberText}>{maxSpo2}</Text>
                    <Text style={styles.unitText}>%</Text>
                   </View>
                </View>
                <View style={styles.chartBox}>
                    <View style={{
                        height:30,
                        marginLeft: 20,
                        marginTop:10,
                    }}>
                        <Text style={styles.normalText}>Biểu đồ</Text>
                    </View>
                    { chartData == null
                        ? <></>
                        :
                        <Liinechart height={250} width={350} data={chartData} backgroundGradient='#14142F' fillShadowGradientFrom='#14142F' fillShadowGradientTo='#14142F' colorLine={`rgb(93,246,108)`} Opacity={0}></Liinechart>
                        // <></>
                    }
                </View>
            </View>
        </SafeAreaView>
    )
}
export default Spo2

const styles = StyleSheet.create({
    container :{
        flex : 1,
    },
    MainBox: {
        width: wid*0.89,
        height: hei * 0.25,
        borderRadius: 25,
        backgroundColor:"#3dd6db",
        marginLeft:22,
        marginTop:15,
        flexDirection:'row'
    },
    normalText : {
        fontSize:16,
        fontWeight:'bold',
        color:'black',
    },
    miniTex:{
        fontSize:13,
        fontWeight:'bold',
        color:'black',
    },
    numberText:{
        fontSize:23,
        fontWeight:'bold',
        color:'black'
    },
    unitText:{
        fontSize: 13,
        fontWeight:"bold",
        color:'#8F8F8F'
    },
    hoursBox:{
        width: wid * 0.89,
        height: hei *0.13,
        backgroundColor:'white',
        borderRadius:25,
        flexDirection:"row",
        marginLeft:23,
        marginTop:10,
    },
    miniBox:{
        width: wid * 0.45,
        alignItems:'center',
        justifyContent:'center',
    //    backgroundColor:'red'
    },
    firstBox:{
        width:wid * 0.45,
        justifyContent:'center',
        alignItems:'center'

    },
    secondBox:{
        width:wid * 0.5,
        justifyContent:'center',
    //    alignItems:'center'
    },
    chartBox:{
        width: wid * 0.89,
        height: hei* 0.4,
        backgroundColor:'white',
        marginLeft:23,
        marginTop:20,
        borderRadius:25,
    }
})