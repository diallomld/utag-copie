import { Button, Icon, Input } from '@rneui/base';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, PermissionsAndroid, StyleSheet, Text, View } from 'react-native';
import RadioButtonRN from 'radio-buttons-react-native';

import Colors from '../../constants/Colors';

import * as yup from 'yup';
import { Formik } from 'formik';
import auth from "@react-native-firebase/auth";
import firestore from '@react-native-firebase/firestore';

import Geolocation from 'react-native-geolocation-service'

function PostDeliveryScreen({ navigation }) {

    const deliveryValidationSchema = yup.object().shape({
        // type: yup.string()
        //     .min(3, ({ min, value }) => ` Il reste ${min - value.length} caracteres pour passer `)
        //     .required("ce champ est obligatoire"),
        nom: yup.string()
            .min(3, ({ min, value }) => ` Il reste ${min - value.length} caracteres pour passer `)
            .required("ce champ est obligatoire"),
        code: yup.string()
            .min(3, ({ min, value }) => ` Il reste ${min - value.length} caracteres pour passer `)
            .required("ce champ est obligatoire"),
        adresse: yup.string()
            .min(3, ({ min, value }) => ` Il reste ${min - value.length} caracteres pour passer `)
            .required("ce champ est obligatoire"),
        designation: yup.string()
            .min(3, ({ min, value }) => ` Il reste ${min - value.length} caracteres pour passer `)
            .required("ce champ est obligatoire"),
        tel: yup
            .string()
            .matches(/(77|78|76|70|75)(\d){7}\b/, 'Entrez un numéro de téléphone valide')
            .required('Le numero telephone es obligatoire'),
    })

    const deliveryObject = {
        nom: '',
        type: '',
        tel: '',
        designation:'',
        adresse: '',
        code: '',
    }
    const data = [
        {
            label: 'Document'
        },
        {
            label: 'Colis'
        }
    ];

    const [type, setType] = useState("")
    const [delivery, setDelivery] = useState(deliveryObject)
    const [loading, setLoading] = useState(false)

    const handleSubmit = (values, actions) => {

        setLoading(true)

        firestore()
            .collection("livraisons")
            .add({
                nom: values.nom,
                designation: values.designation,
                type: type,
                tel: values.tel,
                adresse: values.adresse,
                status:'en cours',
                code: values.code,
                userId: auth().currentUser.uid

            })
            .then(() => {
                setLoading(false)
                Alert.alert("Poste de Livraison", "Livraison poster avec success, un livreur va bientot prendre votre commande !!!",
                    [{
                        text: "ok", onPress: () => navigation.goBack()
                    }]
                )
            })
            .catch((e) => console.error("erreur lors de l'enregistrement ",e))


    }

    const requestGeolocationPermission = async () => {
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
            alert("Vous pouvez utiliser la localisation");
          } else {
            alert("Permission de la localistion non accordé");
          }
        } catch (err) {
          console.warn(err);
        }
      };

    useEffect(()=>{
        requestGeolocationPermission()
        .then(()=>{
            Geolocation.getCurrentPosition(
                (position) => {
                  console.error(position);
                },
                (error) => {
                  // See error code charts below.
                  console.error(error.code, error.message);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000, forceRequestLocation:true }
            );
        })
        .catch(e=> console.error('erreur ',e))
    },[])

    return (
        <View style={{ alignContent: 'center' }}>
            <ImageBackground
                source={require("../../assets/back-home.png")}
                style={{ width: '100%', height: '100%' }}>


                <Formik
                    initialValues={delivery}
                    onSubmit={(values, actions) => handleSubmit(values, actions)}
                    validationSchema={deliveryValidationSchema}
                >
                    {({ handleChange, handleBlur, handleSubmit, values, touched, isValid, errors }) => (

                        <View style={{ justifyContent: 'center', alignContent: 'center', alignItems: 'center', marginVertical: 50 }}>
                            {/* <Image
                                source={require("../../assets/logutag.png")}
                                style={{ width: 390, height: 200 }}
                            /> */}
                            <RadioButtonRN
                                data={data}
                                style={{ flexDirection: 'row', padding: 20, }}
                                boxStyle={{ width: 150, height: 100, marginHorizontal: 20, justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}
                                textStyle={{ padding: 16, fontSize: 15 }}
                                activeColor={Colors.orange}
                                selectedBtn={(e) => setType(e.label)}
                                //boxActiveBgColor={Colors.orange}
                                boxDeactiveBgColor={'#f5f5f0'}
                                //deactiveColor={Colors.white}
                                icon={
                                    <Icon
                                        name="check-circle"
                                        size={25}
                                        color={Colors.orange}
                                    />
                                }
                            />
                            <Input
                                placeholder="Designation"
                                leftIcon={{ type: 'AntDesign', name: 'add-box', color: Colors.orange }}
                                onChangeText={handleChange("designation")}
                                value={values.designation}
                                onBlur={handleBlur('designation')}
                                errorMessage={(errors.designation && touched.designation) && errors.designation}
                                errorStyle={styles.errorInput}
                            />
                            <Input
                                placeholder="Nom Destinataire"
                                leftIcon={{ type: 'AntDesign', name: 'contacts', color: Colors.orange }}
                                onChangeText={handleChange("nom")}
                                value={values.nom}
                                onBlur={handleBlur('nom')}
                                errorMessage={(errors.nom && touched.nom) && errors.nom}
                                errorStyle={styles.errorInput}
                            />
                            <Input
                                placeholder="Adress destinataire"
                                leftIcon={{ type: 'AntDesign', name: 'contacts', color: Colors.orange }}
                                onChangeText={handleChange("adresse")}
                                value={values.adresse}
                                onBlur={handleBlur('adresse')}
                                errorMessage={(errors.adresse && touched.adresse) && errors.adresse}
                                errorStyle={styles.errorInput}
                            />
                            <Input
                                placeholder="Code myhali du destinateur"
                                leftIcon={{ type: 'AntDesign', name: 'code', color: Colors.orange }}
                                onChangeText={handleChange("code")}
                                value={values.code}
                                onBlur={handleBlur('code')}
                                errorMessage={(errors.code && touched.code) && errors.code}
                                errorStyle={styles.errorInput}
                            />
                            <Input
                                placeholder="Téléphone Destinataire"
                                leftIcon={{ type: 'AntDesign', name: 'phone', color: Colors.orange }}
                                onChangeText={handleChange("tel")}
                                value={values.tel}
                                onBlur={handleBlur('tel')}
                                errorMessage={(errors.tel && touched.tel) && errors.adresse}
                                errorStyle={styles.errorInput}
                                keyboardType='phone-pad'
                            />
                            {
                                loading && <ActivityIndicator color={Colors.orange} size={'large'} />
                            }
                            <Button
                                title="Poster la livraison"
                                buttonStyle={{
                                    backgroundColor: Colors.orange,
                                    borderRadius: 20,
                                }}
                                containerStyle={{
                                    width: 300,
                                    marginHorizontal: 75,
                                    marginVertical: 10,
                                    justifyContent: 'center',
                                    alignContent: 'center'
                                }}
                                titleStyle={styles.txtbutton}
                                disabled={!isValid}
                                onPress={handleSubmit}
                            />
                        </View>
                    )}
                </Formik>
            </ImageBackground>

        </View>
    );
}

export default PostDeliveryScreen;


const styles = StyleSheet.create({
    txtbutton: {
        fontSize: 30,
        textAlign: "center",
        color: Colors.white
    },
    errorInput: {
        fontSize: 18
    },
})
