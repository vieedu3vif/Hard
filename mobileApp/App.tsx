import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ListPatient from './src/screens/home/ListPatient'; 
import InforPatient from './src/screens/home/InforPatient';
import HearRate from './src/screens/home/HeartRate';
import Temperature from './src/screens/home/Temperature';
import Spo2 from './src/screens/home/Spo2';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <View></View>
  );
}
