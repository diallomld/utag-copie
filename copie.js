import firestore from '@react-native-firebase/firestore';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from '@rneui/base';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';
import ActiveOrderScreen from '../orders/ActiveOrderScreen';
import DeliveredOrderScreen from '../orders/DeliveredOrderScreen';
import NewOrderScreen from '../orders/NewOrderScreen';


const Tab = createBottomTabNavigator();

const screenOptions = (route, color) => {
  let iconName;

  switch (route.name) {
    case 'NewOrders':
      iconName = 'shopping-cart';
      break;
    case 'ActiveOrder':
      iconName = 'notifications-active';
      break;
    case 'DeliveredOrder':
      iconName = 'outbox';
      break;
    default:
      break;
  }

  return <Icon name={iconName} color={color} size={30} />;
};

function CourseScreen({ navigation, route }) {

  const { coords, idDocLivreur } = route.params
  const [cptNew, setCptNew] = useState(0)
  const [NewDeliveries, setNewDeliveries] = useState(0)
  const [cptAccepted, setCptAccepted] = useState(0)
  const [cptDelivered, setCptDelivered] = useState(0)

  const getNewDeliveries = () => {
    firestore()
      .collection("livraisons")
      .where('status', '==', 'en cours')
      .onSnapshot({
        error: (e) => console.error(e),
        next: (querySnapshot) => {
          setCptNew(querySnapshot.size)
          let tab = []
          querySnapshot.forEach(doc => {
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
          setNewDeliveries(tab)
        },
        complete: (e) => console.log('Requete complete')
      })
  }
  const getAcceptedDeliveries = () => {
    firestore()
      .collection("livraisons")
      .where('status', '==', 'accepter')
      .onSnapshot({
        error: (e) => console.error(e),
        next: (querySnapshot) => {
          setCptAccepted(querySnapshot.size)
        },
        complete: (e) => console.log('Requete complete')
      })
  }
  const getDeliveredDeliveries = () => {
    firestore()
      .collection("livraisons")
      .where('status', '==', 'livrer')
      .onSnapshot({
        error: (e) => console.error(e),
        next: (querySnapshot) => {
          setCptDelivered(querySnapshot.size)
        },
        complete: (e) => console.log('Requete complete')
      })
  }

  useEffect(() => {
    getNewDeliveries()
    getAcceptedDeliveries()
    getDeliveredDeliveries()
    console.log(JSON.stringify(coords))
    console.log('NewDeliveries ', NewDeliveries)
  }, [])


  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: Colors.orange,
      tabBarIcon: ({ color }) => screenOptions(route, color),

    })}>
      <Tab.Screen initialParams={{ coords, idDocLivreur, NewDeliveries }} name="NewOrders" options={{ title: 'Nouvelle Commande', tabBarLabelStyle: { fontSize: 12 }, tabBarBadge: cptNew, tabBarBadgeStyle: { backgroundColor: Colors.orange, color: Colors.white, } }} component={NewOrderScreen} />
      <Tab.Screen initialParams={{ coords, idDocLivreur }} name="ActiveOrder" component={ActiveOrderScreen} options={{ title: ' Acceptees', tabBarLabelStyle: { fontSize: 12 }, tabBarBadge: cptAccepted, tabBarBadgeStyle: { backgroundColor: Colors.orange, color: Colors.white, } }} />
      <Tab.Screen initialParams={{ coords, idDocLivreur }} name="DeliveredOrder" component={DeliveredOrderScreen} options={{ title: 'Delivres', tabBarLabelStyle: { fontSize: 12 }, tabBarBadge: cptDelivered, tabBarBadgeStyle: { backgroundColor: Colors.orange, color: Colors.white, } }} />
    </Tab.Navigator>
  );
}

export default CourseScreen;


const styles = StyleSheet.create({
  txtbutton: {
    fontSize: 30,
    textAlign: "center",
    color: Colors.white
  },
})
