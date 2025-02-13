import React, { useState, useEffect } from "react";
import { Text, View, SafeAreaView, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6"
import fetchLatestTelemetryDataDevice from "../../assets/API/APIGetAttrs";
import fetchHistoricalTelemetryData from "../../assets/API/APIhistory";
import Liinechart from "../../components/LiineChart";
import moment from "moment";


const hei = Dimensions.get("window").height;
const wid = Dimensions.get("window").width;
const key = "temperature";
const codeMax = "MAX";
const codeMin = "MIN";
const codeAVG = "AVG";
const Temperature = ({route})=>{
    const {deviceId} = route.params;
    const [temperature, setTemperature] = useState(null);
    const [maxTemp, setMaxTemp] = useState(null);
    const [minTemp, setMinTemp] = useState(null);
    const [chartData, setChartData] = useState(null);
    useEffect(() => {
        const getTelemetryData = async(deviceId) => {
            let res = await fetchLatestTelemetryDataDevice(deviceId);
       
            if (res != null && "temperature" in res){
                setTemperature(res?.temperature[0]?.value);
            }
        }
    getTelemetryData(deviceId);
    const intervalId = setInterval(() => getTelemetryData(deviceId), 2000);

    return () => clearInterval(intervalId);
},[])
useEffect(() => {
    const getMaxData = async (deviceId, key, code) => {
        let history = await fetchHistoricalTelemetryData(deviceId, key, code);
        if (history != null && "temperature" in history) {
                setMaxTemp(Math.max(...history.temperature.map(item => item.value)));
        }
    };
    getMaxData(deviceId, key, codeMax);

    const interval = setInterval(() => getMaxData(deviceId, key, codeMax), 3000);
    return () => clearInterval(interval);
}, []);
useEffect(() => {
    const getMinData = async (deviceId, key, code) => {
        let history = await fetchHistoricalTelemetryData(deviceId, key, code);
        if (history != null && "temperature" in history) {
                setMinTemp(Math.min(...history.temperature.map(item => item.value)));
            
            
        }
    };
    getMinData(deviceId, key, codeMin);

    const interval = setInterval(() => getMinData(deviceId, key, codeMin), 3000);
    return () => clearInterval(interval);
}, []);



useEffect(() => {
    const getAVGData = async (deviceId, key, code) => {
        let history = await fetchHistoricalTelemetryData(deviceId, key, code);
        if (history != null && "temperature" in history) {
            const maxElements = 5;
            const last8Elements = history.temperature.slice(-maxElements);

            if (last8Elements.length > 0) {
                const labels = last8Elements.map(item =>
                    moment(parseInt(item.ts)).format('HH:mm')
                );
            //    console.log(labels)
                const data = last8Elements.map(item => {
                    const num = parseFloat(item.value);
                    return num });
 //               console.log(data); 
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
                    <FontAwesome6 name="temperature-empty" size={140}></FontAwesome6>
                    </View>
                    <View style={styles.secondBox}>
                        <Text style={{
                            fontSize:50,
                            fontWeight:'bold',
                            color:'white',
                            marginLeft: -20,
                        }}> {temperature == null ? "NA": temperature} <Text style={{
                            fontSize:24,
                            fontWeight:'bold',
                            color:'#8f8f8f'
                        }}>°C</Text>
                        </Text>
                        <Text style={{
                            fontSize:24,
                            fontWeight:'bold',
                            color:'white'
                        }}>Nhiệt độ</Text>
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
                    <Text style={styles.numberText}>{minTemp}</Text>
                    <Text style={styles.unitText}>°C</Text>
                   </View>
                   <View style={styles.miniBox}>
                    <Text style={styles.miniTex}>Cao nhất</Text>
                    <Text style={styles.numberText}>{maxTemp}</Text>
                    <Text style={styles.unitText}>°C</Text>
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
export default Temperature

const styles = StyleSheet.create({
    container :{
        flex : 1,
    },
    MainBox: {
        width: wid*0.89,
        height: hei * 0.25,
        borderRadius: 25,
        backgroundColor:"#ffaa02",
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
        width: wid * 0.4,
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