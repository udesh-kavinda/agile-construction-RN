import { View, Text ,Image, TextInput, StyleSheet, Button } from 'react-native'
import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext';

const Login = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {onLogin} = useAuth();

  const login = async () => {
    const result = await onLogin!(email, password);
    if (result && result.error){
      alert(result.msg);
    }
  }


  return (
    
    <View style={styles.container}>
    <View style={styles.topImageContainer}>
      <Image
        source={require("../../assets/splash.png")}
        style={styles.topImage}
      />
    </View>
    <View style={styles.form}>
    <Image
        source={require("../../assets/splash.png")}
        style={styles.topImage}
      />
      <Text style={styles.signInText}>Sign in to your account</Text>
      <TextInput style={styles.input} placeholder='Email' onChangeText={(text:string)=> setEmail(text)} value={email}></TextInput>
      <TextInput style={styles.input} placeholder='Password' secureTextEntry={true} onChangeText={(text:string)=> setPassword(text)} value={password}></TextInput>
     <Button onPress={login} title='Sing in'></Button>
    </View>
    </View>
  )
}

export default Login

const styles = StyleSheet.create({
  container: {
    alignItems:"center",
    backgroundColor: "#F5F5F5",
    flex: 1,
    width:'100%'
  },
  topImageContainer: {},
  topImage: {
    width: "100%",
    height: 130,
  },
  helloContainer: {},
  helloText: {
    textAlign: "center",
    fontSize: 70,
    fontWeight: "500",
    color: "#262626",
  },
  signInText: {
    textAlign: "center",
    fontSize: 18,
    color:"#262626"
  },
  input:{
    height:44,
    borderWidth:1,
    borderRadius:4,
    padding:10,
  },
  form:{
    gap:10,
    width:'60%'
  }
});