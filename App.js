// In App.js in a new project
import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Signup from './myComponents/signup'
import { NavigationContainer } from "@react-navigation/native";
import Dashboard from "./myComponents/DashBoard";
import qrcodeView from "./myComponents/QrcodeView";
const serverIPAddress = '192.168.43.154';
const Stack = createNativeStackNavigator();


function App() {
  return (
      <NavigationContainer>
        <Stack.Navigator  screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Signin" component={signin} />
            <Stack.Screen name="Signup" component={Signup} />


          <Stack.Screen name="QRCODE" component={qrcodeView} />

          <Stack.Screen name="QrcodeView" component={qrcodeView} />
          <Stack.Screen name="Dashboard" component={Dashboard} />
        </Stack.Navigator>
      </NavigationContainer>
  );
}
import { AppRegistry } from 'react-native';
import signin from "./myComponents/signin";
AppRegistry.registerComponent('YourAppName', () => App); // Register the main component
export default App;
