import React, {useEffect, useState} from "react";
import {Image, Text, ToastAndroid, TouchableOpacity, View} from "react-native";
import {qrcodeViewStyle} from "./QrcodeViewStyle";
import * as Crypto from 'expo-crypto';
import {useNavigation, useRoute} from "@react-navigation/native";
import {Base64} from "js-base64";



function QrcodeView() {
    const navigation = useNavigation(); // Use useNavigation hook
    const route = useRoute();
    const [qrcodeImageBase64, setQrcodeImageBase64] = useState('');
    const [timer, setTimer] = useState(10000); // 300 seconds = 5 minutes
    useEffect(() => {
        const countdown = setInterval(() => {
            setTimer((prevTimer) => {
                if (prevTimer === 0) {
                    clearInterval(countdown);
                    ToastAndroid.show('Session Expired', ToastAndroid.SHORT);
                    navigation.setOptions({ // Use navigation.setOptions to update state in navigation
                        params: {
                            ...route.params, // Preserve other params
                            signinResult: { // Update the signinResult in navigation params
                                User: false,
                                message: '',
                                error: false,
                            }
                        }
                    });
                    navigation.navigate('Signin');
                }
                return prevTimer - 1000; // Decrement timer by 1 second (1000 milliseconds)
            });
        }, 1000); // Run the interval every second (1000 milliseconds)

        return () => clearInterval(countdown); // Clean up the interval on component unmount
    }, [navigation, route.params]);
    const minutes = Math.floor(timer / 60000);
    const seconds = ((timer % 60000) / 1000).toFixed(0);

    return (
        <View style={qrcodeViewStyle.container}>
            <View style={qrcodeViewStyle.timerContainer}>
                <Text>Session ends at</Text>
                <Text style={{ fontSize: 24, color:'red'}}>
                    {`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
                </Text>
            </View>
            <View>

                {/* Other content of the QR code view */}
                <Text style={qrcodeViewStyle.heading}>QrcodeView</Text>
                {route.params.qrcodes ? (
                    <Image
                        source={{ uri: `data:image/png;base64,${route.params.qrcodes}` }}
                        style={{ width: 300, height: 300, borderWidth: 6, borderColor: 'black',borderRadius: 40 }}
                    />
                ) : (
                    <Text>No QR Code image available</Text>
                )}
                <Text style={qrcodeViewStyle.amount}>Amount : {Base64.decode(route.params.amount)}</Text>
                <Text style={qrcodeViewStyle.mobilenumber}>Mobile Number : {Base64.decode(route.params.mobileNumber)}</Text>
                <Text style={qrcodeViewStyle.ifsc}>IFSC Code : {Base64.decode(route.params.ifscCode)}</Text>
                <Text style={qrcodeViewStyle.accountnumber}>Account Number : {route.params.accountNumber}</Text>


            </View>
            <TouchableOpacity style={qrcodeViewStyle.btn} title='Signout' onPress={()=>{
                navigation.setOptions({ // Use navigation.setOptions to update state in navigation
                    params: {
                        ...route.params, // Preserve other params
                        signinResult: { // Update the signinResult in navigation params
                            User: false,
                            message: '',
                            error: false,
                        }
                    }
                });
                navigation.navigate('Signin');

            }
            }>
                <Text style={{color:'white',fontWeight:'bold'}}>Withdraw Completed</Text>
            </TouchableOpacity>
        </View>
    );
}

export default QrcodeView;
