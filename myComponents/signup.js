import * as React from 'react';
import {useState} from 'react';
import {Text, TextInput, ToastAndroid, TouchableOpacity, View} from 'react-native';
import {signupStyle} from './signupStyle';
import * as SQLite from 'expo-sqlite';
import {useNavigation} from '@react-navigation/native';
import * as Crypto from 'expo-crypto';

const serverIPAddress = '192.168.43.154';
const performXOROperation = (str1, str2, str3) => {
    let result = '';
    const maxLength = Math.max(str1.length, str2.length, str3.length);

    for (let i = 0; i < maxLength; i++) {
        const char1 = str1.charCodeAt(i) || 0;
        const char2 = str2.charCodeAt(i) || 0;
        const char3 = str3.charCodeAt(i) || 0;

        const xorResult = char1 ^ char2 ^ char3;

        result += String.fromCharCode(xorResult);
    }

    return result;
};

// Perform the XOR-like operation on the provided strings
async function generateSHA256(text) {
    return await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        text
    );
}

// Call the function to generate the hash

const db = SQLite.openDatabase('./UserDatabase.db');
db.transaction(tx => {
    tx.executeSql(
        'CREATE TABLE IF NOT EXISTS Users (id INTEGER PRIMARY KEY AUTOINCREMENT, userid TEXT, signature TEXT,password TEXT, A1 TEXT);',

        [],
        () => console.log('Table Users created successfully'),
        error => console.error('Error creating table:', error)
    );
});
function Signup() {
    const navigation = useNavigation(); // Use useNavigation hook

    const [userID, setUserID] = useState('');
    const [password, setPassword] = useState('');
    const [A1performed,setA1performed]=useState('');
    const [secertKey, setSecertKey] = useState('');
    const [randomNumber, setRandomNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [registrationResult, setRegistrationResult] = useState({ accountCreated: false, message: '', signature: '', error: false });
    const [signature, setSignature] = useState('');
    function clean() {
        setUserID('');
        setPassword('');
        setSecertKey('');
        setRandomNumber('');
    }
    const getButtonText = () => {
        if (isSubmitting) {
            return 'Registering...';
        } else if (registrationResult.accountCreated) {
            return 'Registered Successfully 🎉🎉🎉';
        } else if (registrationResult.error) {
            return 'Failed to register, try again 😞';
        } else {
            return 'Register Now';
        }
    };

    async function connectServerToRegister() {
        setIsSubmitting(true);
        try {
            setA1performed(await generateSHA256(performXOROperation(userID||password,randomNumber,secertKey)));
            const A1 =await generateSHA256(performXOROperation(userID||password,randomNumber,secertKey));
            const A0 = await generateSHA256(userID);
            console.log(`https://${serverIPAddress}:3000/signup`);
            const response = await fetch(`http://${serverIPAddress}:3000/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    A0: A0.toString(),
                    A1: A1.toString(),
                })
            });
            console.log(response.ok);
            if (response.ok) {


                const responseData = await response.json();
                if (responseData.success) {
                    setSignature(responseData.signature);
                    setRegistrationResult({
                        accountCreated: true,
                        message: 'Account Created Successfully',
                        signature: responseData.signature,
                        error: false
                    });
                    console.log(responseData.signature);
                     db.transaction(async tx => {
                         console.log(signature.toString());
                         tx.executeSql(
                             'INSERT INTO Users (userid, signature,password,A1) VALUES (?, ?, ?,?);',

                             [await generateSHA256(userID), responseData.signature.toString(), await generateSHA256(password), await generateSHA256(performXOROperation(userID || password, randomNumber, secertKey))],
                             () => {
                                 console.log('Data inserted successfully');
                             },
                             (tx, error) => {
                                 console.error('Error inserting data:', error);
                             }
                         );
                     });
                     console.log('hi baby')
                    db.transaction(tx => {
                        tx.executeSql(
                            'SELECT * FROM Users;',
                            [],
                            (_, { rows }) => {
                                const data = rows._array; // Retrieve the records from the query result
                                console.log('Retrieved Records:', data); // Log records to console
                            },
                            (tx, error) => {
                                console.error('Error retrieving data:', error);
                            }
                        );
                    });
                } else {
                    setRegistrationResult({
                        accountCreated: false,
                        message: 'Account Creation Failed',
                        error: false,
                        signature: 'false'
                    });
                }
            } else {
                setRegistrationResult({
                    accountCreated: false,
                    message: 'Failed to register. Server error.',
                    error: true,
                    signature: 'false'
                });
            }
        } catch (error) {
            setRegistrationResult({
                accountCreated: false,
                message: error.message,
                error: true,
                signature: 'false'
            });
        }
        finally {
            setIsSubmitting(false);
        }
    }
    function sleep(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    return (
        <View style={signupStyle.container}>
            <Text style={signupStyle.registerHead}>REGISTER AS USER</Text>
            <TextInput style={signupStyle.inputText} placeholder='UserID' placeholderTextColor='#000000' onChangeText={setUserID} />
            <TextInput style={signupStyle.inputText} placeholder='Password' placeholderTextColor='#000000' onChangeText={setPassword} />
            <TextInput style={signupStyle.inputText} placeholder='Random Number [0-9999]++' placeholderTextColor='#000000' onChangeText={setRandomNumber} />
            <TextInput style={signupStyle.inputText} placeholder='Security Key' placeholderTextColor='#000000' onChangeText={setSecertKey} />
            <TouchableOpacity style={signupStyle.btn} title={getButtonText()} onPress={() => {
                if (userID.length !== 0 || password.length !== 0 || secertKey.length !== 0 || randomNumber.length !== 0) {
                    connectServerToRegister().then(r=>
                        sleep(1000).then(() =>navigation.navigate('Signin'))
                    );
                } else {
                    ToastAndroid.show('Please fill all the fields', ToastAndroid.SHORT);
                }
            }} disabled={isSubmitting}>
                <Text style={signupStyle.btnText}>{getButtonText()}</Text>
            </TouchableOpacity>
        </View>
    );
}

export default Signup;
