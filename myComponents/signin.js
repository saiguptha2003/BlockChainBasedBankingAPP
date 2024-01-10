// In App.js in a new project

import * as React from 'react';
import {View, Text, TextInput, TouchableOpacity, ToastAndroid} from 'react-native';
import {signupStyle} from './signupStyle'
import {useState} from "react";
import * as SQLite from "expo-sqlite";
import {DevToolsSettingsManager} from "react-native/Libraries/DevToolsSettings/DevToolsSettingsManager";
import {useNavigation, useRoute} from "@react-navigation/native";
import * as Crypto from "expo-crypto";
const serverIPAddress = '192.168.43.154';
async function generateSHA256(text) {
    return await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        text
    );
}
function Signin() {

    const navigation = useNavigation(); // Use useNavigation hook
    const route = useRoute();
    const [userID, setUserID] = useState('');
    const [password, setPassword] = useState('');
    const [signature,setSignature]=useState('')
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [signinResult,setSigninResult]=useState({User:false,message:'',error:false});
    function clean(){
        setUserID('');
        setPassword('');
        setSignature('');
    }
    const getButtonText = () => {
        if (isSubmitting) {
            return 'Logging...';
        } else if (signinResult.User) {
            return 'Logged in Successfully 🎉🎉🎉';

        } else if (signinResult.error) {
            return 'Failed to Login, try again 😞';
        } else {
            return 'Login Now';
        }
    };
    async function getSignature() {
        const db = SQLite.openDatabase('UserDatabase.db');
        db.transaction(async tx => {
            tx.executeSql(
                'SELECT signature FROM Users WHERE userid = ?',
                [await generateSHA256(userID.trim())],
                (_, result) => {
                    if (result.rows.length > 0) {
                        const signature = result.rows.item(0).signature.trim();
                        console.log(signature);
                        setSignature(signature);
                        // Use the retrieved signature as needed in your application
                    } else {
                        console.log('No matching user found');
                        // Handle the case where no user with the provided ID and password exists
                    }
                },
                error => console.error('Error retrieving signature:', error)
            );
        });
    }
    async function connectServerToSignin() {
        setIsSubmitting(true);
        try {
            const A0=userID.trim();
            const PW=password.trim();
            const db = SQLite.openDatabase('UserDatabase.db');
            // db.transaction(tx => {
            //     tx.executeSql(
            //         'SELECT signature FROM Users WHERE userid = ?',
            //         [userID.trim()],
            //         (_, result) => {
            //             if (result.rows.length > 0) {
            //                 const signature = result.rows.item(0).signature.trim();
            //                 console.log(signature);
            //                 setSignature(signature);
            //                 // Use the retrieved signature as needed in your application
            //             } else {
            //                 console.log('No matching user found');
            //                 // Handle the case where no user with the provided ID and password exists
            //             }
            //         },
            //         error => console.error('Error retrieving signature:', error)
            //     );
            // });
            await getSignature();


            console.log(`https://${serverIPAddress}:3000/login`)
            console.log(signature);
            const response = await fetch(`http://${serverIPAddress}:3000/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    A0:A0,
                    PW:PW,
                    signk:signature,
                })
            });
            console.log(response.ok);
            if (response.ok) {
                const responseData = await response.json();
                if (responseData.success) {
                    setSigninResult({
                        User: true,
                        message: 'Account Signin Successfully',
                        error: false,
                    });
                    ToastAndroid.show('Account Signin Successfully', ToastAndroid.SHORT);
                } else {
                    setSigninResult({
                        accountCreated: false,
                        message: 'Account Signin Failed',
                        error: false,
                    });
                    ToastAndroid.show('Account Signin Failed', ToastAndroid.SHORT);
                }
            } else {
                setSigninResult({
                    User: false,
                    message: 'Failed to signin. Server error.',
                    error: true,
                });
                ToastAndroid.show(signinResult.message, ToastAndroid.SHORT);
            }
        } catch (error) {
            setSigninResult({
                User: false,
                message:error.message,
                error: true,
            });
            ToastAndroid.show(signinResult.message, ToastAndroid.SHORT);
        }
        finally {
            setIsSubmitting(false); // Set isSubmitting to false when request finishes (success or error)
        }
    }
    return (
        <View style={signupStyle.container}>
            <Text style={signupStyle.registerHead}>SignIn AS USER</Text>
            <TextInput style={signupStyle.inputText} placeholder='UserID' placeholderTextColor='#000000'
                       onChangeText={setUserID}/>
            <TextInput style={signupStyle.inputText} placeholder='Password' placeholderTextColor='#000000'
                       onChangeText={setPassword}/>
            {/*<TextInput style={signupStyle.inputText}  placeholder='Signature' placeholderTextColor='#000000'*/}
            {/*           onChangeText={setSignature}/>*/}
            <TouchableOpacity style={signupStyle.btn} title='Signin' onPress={()=>{
                if(userID.length!==0||password.length!==0){
                    connectServerToSignin().then(()=> {
                        if (signinResult.User) {
                            ToastAndroid.show(signinResult.message, ToastAndroid.SHORT);
                            navigation.navigate('Dashboard', {
                                userID: userID,
                                signature: signature,
                                setSigninResult: setSigninResult, // Pass the setSigninResult function
                            });
                        } else if (signinResult.error) {
                            ToastAndroid.show(signinResult.message, ToastAndroid.SHORT);
                            navigation.navigate('Signin');
                        } else {
                            ToastAndroid.show(signinResult.message, ToastAndroid.SHORT);
                            navigation.navigate('Signin');
                        }
                    });}

                else{
                    ToastAndroid.show('Please fill all the fields', ToastAndroid.SHORT);
                    navigation.navigate('Signin');
                }

            }} disabled={isSubmitting}><Text style={signupStyle.btnText}>{getButtonText()}</Text></TouchableOpacity>
            <Text style={signupStyle.registerHead} onPress={()=>{navigation.navigate('Signup')}}>Don't have an account?</Text>
        </View>
    );
}

export default Signin;
