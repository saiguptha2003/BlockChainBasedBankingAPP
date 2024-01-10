import React, {useEffect, useState} from 'react'
import {ScrollView, Text, TextInput, ToastAndroid, TouchableOpacity, View} from "react-native";
import {useNavigation, useRoute} from "@react-navigation/native";
import {signupStyle} from "./signupStyle";
import {qrcodeViewStyle} from "./QrcodeViewStyle";
import { Base64 } from 'js-base64'

const serverIPAddress = '192.168.43.154';

function DashBoard() {
    const navigation = useNavigation(); // Use useNavigation hook
    const route = useRoute();
    const [amount, setAmount] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [reAccountNumber, setReAccountNumber] = useState('');
    const [qrcoded, setQrcode] = useState({success:false,qrcode:null});
    const [timer, setTimer] = useState(300000); // 300 seconds = 5 minutes
    //300000=5min
    // useEffect(() => {
    //     const countdown = setInterval(() => {
    //         setTimer((prevTimer) => {
    //             if (prevTimer === 0) {
    //                 clearInterval(countdown);
    //                 ToastAndroid.show('Session Expired', ToastAndroid.SHORT);
    //                 clean();
    //                 setTimeout(() => 100);
    //                 navigation.navigate('Signin');
    //                 route.params.setSigninResult({
    //                     User: false,
    //                     message: '',
    //                     error: false,
    //                 });
    //             }
    //             return prevTimer - 1;
    //         });
    //     }, 1000); // Timer decrements every second (1000 milliseconds)
    //
    //     return () => clearInterval(countdown); // Clean up the interval on unmount
    // },  [navigation, route.params]);
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

    async function connectServerToWithdraw() {
        try {
            setAmount(Base64.encode(amount));
            setAccountNumber(Base64.encode(accountNumber));
            setMobileNumber(Base64.encode(mobileNumber));
            setIfscCode(Base64.encode(ifscCode));

            const response = await fetch(`http://${serverIPAddress}:3000/transaction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: amount.toString(),
                    phoneNumber: mobileNumber.toString(),
                    IFSCCode: ifscCode.toString(),
                    accountNumber: accountNumber.toString(),
                    timeInSeconds: new Date().getTime().toString(),
                }),
            });

            console.log('Server response received:', response.status);

            if (response.ok) {
                const responseData = await response.json();
                if (responseData.success) {
                    setQrcode({ success: true, qrcode: responseData.qrcodeImage });
                    console.log('asdfadsfadsf',responseData.qrcodeImage);
                } else {
                    setQrcode({ success: false, qrcode: '' });
                }
            } else {
                console.error('Server responded with error:', response.statusText);
                setQrcode({ success: false, qrcode: '' });
            }
        } catch (error) {
            console.error('Error connecting to the server:', error);
            setQrcode({ success: false, qrcode: '' });
        } finally {
            console.log('Request completed.');
        }
    }



    return (

        <ScrollView>
        <View style={signupStyle.container}>

            <View style={qrcodeViewStyle.timerContainer}>
                <Text>Session ends at</Text>
                <Text style={{ fontSize: 24, color:'red'}}>
                    {`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
                </Text>
            </View>

            <Text style={signupStyle.registerHead}>Dashboard</Text>
            <TextInput style={signupStyle.inputText} placeholder={"Withdraw Amount amount is taken in INR"} onChangeText={setAmount}/>
            <TextInput style={signupStyle.inputText} placeholder={"Mobile Number"} onChangeText={setMobileNumber}/>
            <TextInput style={signupStyle.inputText} placeholder={"IFSC Code"} onChangeText={setIfscCode}/>
            <TextInput style={signupStyle.inputText} placeholder={"Account Number"} onChangeText={setAccountNumber}/>
            <TextInput style={signupStyle.inputText} placeholder={" Re-Account Number"} onChangeText={setReAccountNumber}/>
            <TouchableOpacity style={signupStyle.btn} title={"Withdraw"} onPress={()=>{

                    if(accountNumber===reAccountNumber){
                        connectServerToWithdraw().then(() => {
                            if(qrcoded.success){
                                ToastAndroid.show('QR Code Generated', ToastAndroid.SHORT);
                                navigation.navigate('QrcodeView',{qrcodes:qrcoded.qrcode,amount:amount,
                                    mobileNumber:mobileNumber,ifscCode:ifscCode,accountNumber:accountNumber,
                                    signature:route.params.signature});
                            }
                            else {
                                ToastAndroid.show('QR Code Generation Failed', ToastAndroid.SHORT);



                            }
                        });
                    }
                    else {
                        ToastAndroid.show('Account Number and Re-Account Number are not same', ToastAndroid.SHORT);

                    }

            }}><Text style={signupStyle.btnText}>Withdraw</Text></TouchableOpacity>

        </View>
        </ScrollView>

    );
}

export default DashBoard;
