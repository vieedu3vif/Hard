/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import ListPatient from './src/screens/home/ListPatient';
import InforPatient from './src/screens/home/InforPatient';
import HearRate from './src/screens/home/HeartRate';
import Liinechart from './src/components/LiineChart';
import Temperature from './src/screens/home/Temperature';
import Spo2 from './src/screens/home/Spo2';
import Notify from './src/ultis/Notify';
import Test from './src/screens/home/Test';
import Appnavigation from './src/screens/navigations/Appnavigation';
import Login from './src/screens/welcome/Login';
import Signup from './src/screens/welcome/Signup';



AppRegistry.registerComponent(appName, () => Appnavigation);
