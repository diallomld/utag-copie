import { ActivityIndicator, Alert, Dimensions, FlatList, Modal, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import firestore from '@react-native-firebase/firestore';
import { Badge, Card, Icon, Image } from '@rneui/base';
import Colors from '../../constants/Colors';

const { width } = Dimensions.get('window')


function DelivredOrderScreen({ navigation, route }) {

  const [livraisons, setLivraisons] = useState([])
  const [load, setLoad] = useState(null)
  const [cptNew, setcptNew] = useState(0)
  let tab = []



  const Item = ({ designation, type, index, createdAt }) => (
    <>

      <TouchableOpacity onPress={() => {


        Alert.alert(
          `Commande numero #12-tag ${designation}`,
          `Demarrer la course...`,
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel"
            },
            {
              text: "Ok",
              onPress: () => {},
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

    <Item userId={item.userId} type={item.type} nom={item.nom} createdAt={item.createdAt} index={item.index} designation={item.designation} />

  );

  const getDeliveredOrder = () => {

    setLoad(true)
    firestore()
      .collection("livraisons")
      .where('status', '==', 'livrer')
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
    getDeliveredOrder()
  }, [])

  return (
    <SafeAreaView style={{ alignContent: 'center' }}>

      <View style={{ justifyContent: 'center', alignContent: 'center', alignItems: 'center', marginVertical: 20, marginBottom: 20 }}>

        {
          load && <ActivityIndicator color={Colors.orange} size={'large'} />
        }

        <Text style={{ fontSize: 20, fontWeight:'bold' }}>{cptNew} Livraison(s) effectuee(s)</Text>

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




export default DelivredOrderScreen
