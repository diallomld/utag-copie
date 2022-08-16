import React, { useState, useEffect } from 'react';

import { View, ImageBackground, TouchableOpacity, Text, Image, Platform, PermissionsAndroid } from 'react-native';
import ColorsApp from '../../constants/Colors';
import { StyleSheet } from 'react-native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Badge } from '@rneui/base';

import { qrcode, delivery, messages, maps } from "../../constants/Images";
import Colors from '../../constants/Colors';
import QRCode from 'react-native-qrcode-svg';
import firestore from '@react-native-firebase/firestore'
import auth from '@react-native-firebase/auth'
import messaging from '@react-native-firebase/messaging';
import Geolocation from "react-native-geolocation-service";

function LivreurAuthScreen({ navigation }) {


  const [nbqrcode, setNbqrcode] = useState(0)
  const [token, setToken] = useState('')
  const [coords, setCoords] = useState({})
  const [idDocLivreur, setidDocLivreur] = useState('')

  
  // const sendMsg = async()=>{
  //   await admin.messaging().sendToDevice(
  //     token, // ['token_1', 'token_2', ...]
  //     {
  //       data: {
  //         owner: 'lamine',
  //         user: 'fall',
  //         body: 'salut ca marche',
  //       },
  //     }, {
  //       // Required for background/quit data-only messages on iOS
  //       contentAvailable: true,
  //       // Required for background/quit data-only messages on Android
  //       priority: 'high',
  //     }).then(()=> console.log('message envoye'))
  //     .catch(e=>console.log(e))
  // }


  const GetLocation = async () => {

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Permission de la localisation",
          message:
            "Utag a besoin de votre localisation ",
          buttonNeutral: "Demander moi plus tard",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        //alert("La geolocalisation est active");
       Geolocation.getCurrentPosition(
          (position) => {

            //console.log(position.coords)
            const { longitude, latitude } = position.coords

            setCoords({ long: longitude, lat: latitude })
          },
          (error) => {
            // See error code charts below.
            console.error(error.code, error.message);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000, forceRequestLocation:true }
        );
      } else {
        alert("Permission de la localistion non accordé");
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const getTheDeviceToken = () => {

    if (Platform.OS == 'ios') {
      messaging().getAPNSToken().then(token => {
        setToken(token)
        console.log('ios token')
      });
    } else {
      messaging()
        .getToken()
        .then(token =>  {
          setToken(token)
          console.log('android token')
        });
    }
    // Listen to whether the token changes
    messaging().onTokenRefresh(token => {
      setToken(token)
      console.log('// Listen to whether the token changes')
    });
  }

  const getNbqrcode = () => {
    firestore()
      .collection("livreurs")
      .where('email', '==', auth().currentUser.email)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(data => {
          setNbqrcode(data.data().nbqrcode)
          setidDocLivreur(data.id)
          if (token!="" && coords!=null) {
            
            firestore().collection("livreurs")
              .doc(data.id)
              .update({
                token: token,
                coords: coords
              })
          }
          //console.error('data',data.data())
        })
      })
      .catch(e => console.error("erreurrrr", e))


  }

  useEffect(() => {
    GetLocation()
    getTheDeviceToken()
    getNbqrcode()
    //sendMsg()

  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>

      <View style={Styles.container}>
        <ImageBackground
          source={require("../../assets/back-home.png")}
          style={{ width: '100%', height: '100%' }}>
          <View style={Styles.authSection}>

            {/* <Avatar rounded source={avatar} size='large' containerStyle={{ marginVertical: 20 }} /> */}
            <View style={{ width: 150, backgroundColor: Colors.white, marginVertical: 20, borderRadius: 15 }}>
              <View style={{ alignItems: 'center', justifyContent: 'center', alignContent: 'center', marginVertical: 20, }}>

                <QRCode
                  value="Modou Fall, ID: 001 C.I.N: 16481996000"
                  // color={Colors.white}
                  // backgroundColor={Colors.orange}
                  size={100}
                />
              </View>
            </View>
            <View style={{ flexDirection: 'column', justifyContent: 'space-around' }}>
              <Badge status={qrcode <= 0 ? 'error' : 'success'} badgeStyle={{ width: 100, height: 40, marginVertical: 10 }} value={nbqrcode} textStyle={{ color: Colors.white, fontSize: 25 }} />
              <View style={{ height: 40, width: 200, borderRadius: 20, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center', alignContent: 'center', textAlignVertical: 'center' }}>

                <Text style={{ fontSize: 20, }}>Livraisons disponibles</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 40, }}>

              <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', }}>
                <TouchableOpacity onPress={() => {
                  navigation.navigate("navigation")
                }}
                  style={Styles.btn}>
                  <Image
                    source={maps}
                    style={{ width: 90, height: 90 }}
                  />
                </TouchableOpacity>

                <Text style={Styles.txtbtn}>La Carte</Text>

              </View>
              <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginHorizontal: 20 }}>
                <TouchableOpacity onPress={() => {
                  //navigation.navigate("MessageClient")
                }}
                  style={Styles.btn}>
                  <Image
                    source={messages}
                    style={{ width: 90, height: 90 }}
                  />
                </TouchableOpacity>

                <Text style={Styles.txtbtn}>Messages</Text>

              </View>
              <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', }}>
                <TouchableOpacity onPress={() => {
                  navigation.navigate("Courses",{coords:coords, idDocLivreur: idDocLivreur})
                }}
                  style={Styles.btn}>
                  <Image
                    source={delivery}
                    style={{ width: 70, height: 70 }}
                  />
                </TouchableOpacity>

                <Text style={Styles.txtbtn}>Courses</Text>

              </View>
            </View>

          </View>
        </ImageBackground>
      </View>
    </GestureHandlerRootView>
  );
}


export default LivreurAuthScreen;

const Styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  btn: {
    borderRadius: 100,
    backgroundColor: Colors.white,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center'
  },
  txtbtn: {
    fontSize: 25
  },
  btnAuth: {
    backgroundColor: ColorsApp.white,
    borderRadius: 10,
    width: 120,
    height: 50,
    marginHorizontal: 10,
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: 'space-evenly',
    alignItems: 'center'
  },
  btnAuth2: {
    backgroundColor: ColorsApp.white,
    borderRadius: 10,
    width: 170,
    height: 50,
    marginHorizontal: 10,
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: 'space-evenly',
    alignItems: 'center'
  },
  authSection: {
    height: 500,
    width: '100%',
    alignItems: 'center',
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
    backgroundColor: ColorsApp.orange
  },
  txtConAuth: {
    fontSize: 20,
    color: ColorsApp.black,
  },
});
