import { ActivityIndicator, Alert, Dimensions, FlatList, Modal, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import firestore from '@react-native-firebase/firestore';
import { Badge, Card, Icon, Image } from '@rneui/base';
import Colors from '../../constants/Colors';

const { width, height } = Dimensions.get('window')


function ActiveOrderScreen({ navigation, route }) {

  const [livraisons, setLivraisons] = useState([])
  const [load, setLoad] = useState(null)
  const [cptNew, setcptNew] = useState(0)
  let tab = []

  const { coords } = route.params
  const destination = []

  const getCoordsClient = async (docId) => {

    await firestore()
      .collection("livraisons")
      .doc(`${docId}`)
      .get()
      .then(data => {
          destination.push(data.data().coords.long, data.data().coords.lat)
      })
      .catch(e => console.error("impossible de recuperer la destination", e))

  }

  const Item = ({ designation, type, index, createdAt, docId }) => (
    <>

      <TouchableOpacity onPress={() => {


        Alert.alert(
          `Commande numero #12-tag ${designation}`,
          `Demarrer la course...`,
          [
            {
              text: "Demander moi apres",
              onPress: () => console.log("plustard"),
              style: "cancel"
            },
            {
              text: "Demarrer la course",
              onPress: () => {
                getCoordsClient(docId)
                  .then(() => navigation.navigate("navigation", { coords: coords, docId: docId, destination: destination })
                  )
                  .catch(e => console.error('impossble de recuperer la destination'))
              },
            }
          ]
        );
      }}>
        <Card key={index} containerStyle={{ borderRadius: 10, width: width - 30, }}>

          <Icon name='account-box' size={45} color={Colors.orange} />
          <Card.Title style={{ fontSize: 20, }}> Designation: {designation}</Card.Title>
          <View style={{ justifyContent: 'center', flexDirection: 'row' }}>
            <Icon name='bookmark' size={30} color={Colors.orange} />
            <Text style={{ fontSize: 20, textAlign: 'center' }}> {type}</Text>

            <Badge
              status='primary'
              value={'Active'}
              badgeStyle={{ height: 30, marginLeft: 10 }}
              textStyle={{ fontSize: 20, textAlign: 'center' }}
            />
          </View>

          <Card.Divider style={{ marginTop: 10 }} />
          <View style={{ justifyContent: 'center', flexDirection: 'row' }}>

            <Icon name='timer' size={30} color={Colors.orange} />
            <Text style={{ fontSize: 20, textAlign: 'center', }}>
              {new Date(createdAt.seconds * 1000 + createdAt.nanoseconds / 1000000).toLocaleString('fr-FR', { month: 'long', day: 'numeric' })}
            </Text>
          </View>
        </Card>
      </TouchableOpacity >
    </>
  );

  const renderItem = ({ item }) => (

    <Item docId={item.docId} type={item.type} nom={item.nom} createdAt={item.createdAt} index={item.index} designation={item.designation} />

  );

  const getActiveDelivery = () => {

    setLoad(true)
    firestore()
      .collection("livraisons")
      .where('status', '==', 'accepter')
      .get()
      .then(data => {
        if (data.empty) {
          setLoad(false)
          return
        }
        setcptNew(data.size)
        data.forEach((doc) => {
          tab.push({
            adresse: doc.data().adresse,
            tel: doc.data().tel,
            code: doc.data().code,
            type: doc.data().type,
            nom: doc.data().nom,
            status: doc.data().status,
            designation: doc.data().designation,
            createdAt: doc.data().createdAt,
            docId: doc.id,

          })
        })
        setLivraisons(tab)
        //console.error('liv ', livraisons)
        setLoad(false)
      }).catch(e => console.error(e))



  }

  useEffect(() => {
    //console.log(JSON.stringify(coords))
    getActiveDelivery()
  }, [])

  return (
    <SafeAreaView style={{ alignContent: 'center' }}>

      <View style={{ justifyContent: 'center', alignContent: 'center', alignItems: 'center', marginVertical: 20, marginBottom: 20 }}>

        {
          load && <ActivityIndicator color={Colors.orange} size={'large'} />
        }

        <Text style={{fontSize:20, fontWeight:'bold'}}>{cptNew} Nouvelle(s) Commande acceptee(s)</Text>

        <FlatList
          inverted
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          data={livraisons}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          windowSize={21}
        />
      </View>


    </SafeAreaView>
  );
}




export default ActiveOrderScreen

const styles = StyleSheet.create({


  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  txtbutton: {
    fontSize: 30,
    textAlign: "center",
    color: Colors.white
  },
  deliveryItem: {

    //backgroundColor:Colors.orange,
    //width: '90%',
    borderRadius: 20
  }

})
