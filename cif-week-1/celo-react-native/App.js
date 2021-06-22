import React, { useEffect, useState } from 'react';
import "./global"
import { web3,kit } from "./root"
import { StyleSheet, Text, View, LogBox, Button, Image, TextInput } from 'react-native';
import { waitForAccountAuth,requestAccountAddress, requestTxSig, FeeCurrency, waitForSignedTxs} from "@celo/dappkit"
import * as Linking from "expo-linking"
import abi from "./contracts/abi.json"
import { toTxResult } from '@celo/connect';

// import { StatusBar } from 'expo-status-bar';

LogBox.ignoreLogs([
  "Warning: The provided value 'moz",
  "Warning: The provided value 'ms-stream",
])

export default function App() {


  const [state, setState] = useState({
    address: 'Not logged in',
    phoneNumber: 'Not logged in',
    cUSDBalance: 'Not logged in',
    helloWorldContract: {},
    salutation: '',
    textInput: '',
    loading : false
    // isLoadingBalance : false
  })
  
 
 

  const connectDeveloperWallet = async () => {

     // A string you can pass to DAppKit, that you can use to listen to the response for that request
     const requestId = 'connect'

     // Ask the Celo Alfajores Wallet for user info
     requestAccountAddress({
      dappName: 'Hello Celo',
      callback: Linking.makeUrl("/"),
       requestId
     })
    
    console.log("awaiting account auth")
    const dappkitResponse = await waitForAccountAuth(requestId)

    console.log("dappkit response: ",dappkitResponse)
    console.log("account auth complete")
    kit.defaultAccount = dappkitResponse.address

    const stableToken = await kit.contracts.getStableToken();
    // Get the user account balance (cUSD)
    const cUSDBalanceBig = await stableToken.balanceOf(kit.defaultAccount);

    // Convert from a big number to a string
    let cUSDBalance = cUSDBalanceBig.toString();
    
    // Update state
    setState(state => ({
      ...state,
      cUSDBalance,
      phoneNumber: dappkitResponse.phoneNumber,
      address: dappkitResponse.address, 
    }))
   
  }

  const read = async () => {
    const salutation = await state.helloWorldContract.methods.sayHello().call()
    setState((state) => {
      return {
        ...state,
          salutation
      }
    })
  }

  const write = async () => {
    try {
      
    
    setState((state) => ({ ...state, loading: true }))
    const requestId = "Write"
    const txObject = await state.helloWorldContract.methods.setName(state.textInput)

    requestTxSig(kit,
      [{
        from: state.address,
        to: state.helloWorldContract.options.address,
        tx: txObject,
        feeCurrency : FeeCurrency.cUSD
      }]
      , { 
        dappName: 'Hello Celo',
        callback: Linking.makeUrl("/"),
        requestId
      })
    
      // get the response of transaction signing from celo wallet
    const dappkitResponse = await waitForSignedTxs(requestId)
    const tx = dappkitResponse.rawTxs[0]
    
    let result = await toTxResult(kit.web3.eth.sendSignedTransaction(tx)).waitReceipt()
    console.log(`Hello World contract update transaction receipt: `, result)
      await read()
    }
    catch (err) {
      console.log("error occured in writing to blockchain: ",err)
    }
    finally {
      setState((state)=>({...state,loading : false}))
    }
    
  }



  useEffect(() => {
    (async () => {

      const helloWorldContract = new web3.eth.Contract(
        abi,
        "0xcFCf2Ee8fdb6FDcbb8AE6A7021cFC1e0FCC81061" // this is my test contract which I deployed on alfajores, feel free to replace the abi and this address with your own contract
      );

      // console.log("helloContract",await helloContract.methods.sayHello().call())
      setState(state => ({
        ...state,
        helloWorldContract
      }))
    })()
  }, [])
  
  // console.log(state)

  return (
    <View style={styles.container}>
      <Image resizeMode='contain' source={require("./assets/white-wallet-rings.png")}></Image>
        
        <Text style={styles.title}>Connect to Developer Wallet First</Text>
        <Button title="Connect" 
          onPress={connectDeveloperWallet} />
        <Text style={styles.title}>Account Info:</Text>
        <Text>Current Account Address:</Text>
        <Text>{state.address}</Text>
        <Text>Phone number: {state.phoneNumber}</Text>
        <Text>cUSD Balance: {state.cUSDBalance}</Text>

        <Text style={styles.title}>Read HelloWorld</Text>
        <Button title="Read Contract Name" 
          onPress={read} />
        
        <Text>Salutation: {state.salutation}</Text>
        <Text style={styles.title}>Write to HelloWorld</Text>
        <Text>New contract name:</Text>
        <TextInput
          style={{  borderColor: 'black', borderWidth: 1, backgroundColor: 'white' }}
          placeholder="input new name here"
        onChangeText={(textInput) => setState((state) => ({ ...state,textInput}))}
          value={state.textInput}
          />
      <Button style={{ padding: 30 }} title={state.loading ? "Updating...":"update contract name"}
          onPress={write} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#35d07f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginVertical: 8, 
    fontSize: 20, 
    fontWeight: 'bold'
  }
});
