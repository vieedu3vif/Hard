import React, { useState } from "react";
import { Text, View, SafeAreaView, StyleSheet, Dimensions, TextInput, TouchableOpacity, Alert } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import auth from "@react-native-firebase/auth";
import { useNavigation } from "@react-navigation/native";

const hei = Dimensions.get("window").height;
const wid = Dimensions.get("window").width;

const Signup = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSignup = async () => {
        try {
            const userCredential = await auth().createUserWithEmailAndPassword(email, password);
            Alert.alert("Thành công", "Đăng ký tài khoản thành công!, vui lòng quay lại trang đăng nhập");
        } catch (error) {
            Alert.alert("Lỗi đăng ký", error.message);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
                <View style={styles.topBox}></View>
                <View style={styles.middleBox}>
                    <Text style={{ fontSize: 18, marginBottom: 20 }}>Vui lòng điền thông tin của bạn</Text>
                    <View style={styles.boxInfor}>
                        <AntDesign name="mail" size={35} />
                        <TextInput
                            placeholder="Nhập địa chỉ email của bạn"
                            style={{ flex: 1, marginLeft: 10 }}
                            onChangeText={setEmail}
                            value={email}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                    <View style={styles.boxInfor}>
                        <AntDesign name="unlock" size={35} />
                        <TextInput
                            placeholder="Nhập mật khẩu"
                            style={{ flex: 1, marginLeft: 10 }}
                            onChangeText={setPassword}
                            value={password}
                            secureTextEntry
                        />
                    </View>
                    <TouchableOpacity style={styles.loginButton} onPress={handleSignup}>
                        <Text style={{ fontSize: 16, color: "white" }}>Đăng ký</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.replace("Login")}>
                        <Text style={{ fontSize: 16, color: "blue", marginTop: 10 }}>Quay lại trang đăng nhập</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default Signup;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topBox: {
        height: hei * 0.1,
        width: wid,
    },
    boxInfor: {
        height: 60,
        width: wid * 0.9,
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        marginVertical: 20,
    },
    middleBox: {
        height: hei * 0.6,
        justifyContent: "center",
        alignItems: "center",
    },
    loginButton: {
        height: 60,
        width: 150,
        backgroundColor: "blue",
        borderRadius: 35,
        marginVertical: 20,
        justifyContent: "center",
        alignItems: "center",
    },
});
