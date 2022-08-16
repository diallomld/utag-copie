import { Button, Input } from '@rneui/base';
import { Image } from '@rneui/themed';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../constants/Colors';

import auth from "@react-native-firebase/auth";
import { Formik } from 'formik';
import * as yup from 'yup';

import Icon from "react-native-vector-icons/FontAwesome"
import { AuthClientContext } from '../services/clients/AuthClientProvider';
function RegisterScreen({ navigation }) {

    const credentials = {
        email: '',
        password: '',
    }

    const livreurValidationSchema = yup.object().shape({
        email: yup
            .string()
            .email("Veuillez entrer une adresse e-mail valide")
            .required("L'email est obligatoire"),
        password: yup
            .string()
            .matches(/\w*[a-z]\w*/, "Le mot de passe doit comporter une lettre")
            .matches(/\w*[A-Z]\w*/, "Le mot de passe doit comporter une lettre majuscule")
            .matches(/\d/, "Password must have a number")
            .matches(/[!@#$%^&*()\-_"=+{}; :,<.>]/, "Le mot de passe doit avoir un caractère spécial")
            .min(8, ({ min }) => `Le mot de passe doit comporter au moins ${min} caractères.`)
            .required('Le mot de passe est obligatoire'),
    })

    const [livreur, setLivreur] = useState(credentials)
    const [isShow, setIsShow] = useState(true)
    const [loading, setLoading] = useState(false)
    const [isLogged, setIsLogged] = useState(false)

    const { setUser } = useContext(AuthClientContext)

    const handleSubmit = (values, actions) => {

        setLoading(true)
        auth()
            .signInWithEmailAndPassword(values.email, values.password)
            .then(() => {
                setLoading(false)
                Alert.alert('Connexion', "Bravo, Connexion reussit !",
                    [
                        { text: "OK", onPress: () => navigation.push("DashbordLivreur") }
                    ]
                )
            })
            .catch(error => {
                setLoading(false)
                if (error.code === 'auth/email-already-in-use') {
                    alert('Cette adresse e-mail est déjà utilisée !');
                }

                if (error.code === 'auth/invalid-email') {
                    alert("Cette adresse e-mail n'est pas valide !");
                }
                if (error.code === 'auth/user-not-found') {
                    alert("Il n'y a pas d'enregistrement d'utilisateur correspondant à cet identifiant. L'utilisateur a peut-être été supprimé !");
                }

                console.alert(error);
            });

    }

    const onAuthStateChanged = (user) => {
        //console.log('user', user);
        if (user) {
            setIsLogged(true)
            setUser(user)
            navigation.navigate("DashbordLivreur", {
                livreur: user
            })
        }else{
            setIsLogged(false)
        }
    }
    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
        return subscriber; // unsubscribe on unmount
    }, []);

    return (
        <View style={{ alignContent: 'center' }}>
            <ImageBackground
                source={require("../assets/back-home.png")}
                style={{ width: '100%', height: '100%' }}>

                <View style={{ justifyContent: 'center', alignContent: 'center', alignItems: 'center', marginVertical: 100 }}>
                    {
                        isLogged && (
                            <View>
                                <Text>connexion en cours...</Text>
                                 <ActivityIndicator color={Colors.orange} size={'large'} />
                            </View>
                        )
                    }
                    <Image
                        source={require("../assets/logutag.png")}
                        style={{ width: 390, height: 200 }}
                    />
                    <Formik
                        initialValues={livreur}
                        onSubmit={(values, actions) => handleSubmit(values, actions)}
                        validationSchema={livreurValidationSchema}
                    >
                        {({ handleChange, handleBlur, handleSubmit, values, touched, isValid, errors }) => (
                            <>
                                <Input
                                    placeholder="saisir email ou telephone"
                                    leftIcon={{ type: 'font-awersome', name: 'mail' }}
                                    value={values.email}
                                    onBlur={handleBlur('email')}
                                    onChangeText={handleChange("email")}
                                    autoCorrect={false}
                                    errorMessage={(errors.email && touched.email) && errors.email}
                                    errorStyle={styles.errorInput}
                                    keyboardType="email-address"

                                />
                                <Input placeholder="Mot de passe"
                                    leftIcon={{ type: 'AntDesign', name: 'lock' }}
                                    secureTextEntry={isShow}
                                    rightIcon={
                                        <TouchableOpacity onPress={() => setIsShow(!isShow)}>
                                            <Icon
                                                name={isShow ? 'eye' : 'eye-slash'}
                                                size={30}
                                                color={Colors.orange}
                                            />
                                        </TouchableOpacity>
                                    }
                                    onChangeText={handleChange("password")}
                                    value={values.password}
                                    onBlur={handleBlur('password')}
                                    autoCorrect={false}
                                    errorMessage={(errors.password && touched.password) && errors.password}
                                    errorStyle={styles.errorInput}
                                />
                                {
                                    loading && <ActivityIndicator color={Colors.orange} size={'large'} />
                                }
                                <Button
                                    title="Se connecter"
                                    buttonStyle={{
                                        backgroundColor: Colors.orange,
                                        borderRadius: 20,
                                    }}
                                    containerStyle={{
                                        width: 200,
                                        marginHorizontal: 75,
                                        marginVertical: 10,
                                        justifyContent: 'center',
                                        alignContent: 'center'
                                    }}
                                    titleStyle={styles.txtbutton}
                                    // onPress={() => {
                                    //     navigation.navigate("DashbordLivreur")
                                    // }}
                                    disabled={!isValid}
                                    onPress={handleSubmit}
                                />
                            </>
                        )}
                    </Formik>
                </View>
            </ImageBackground>

        </View>
    );
}

export default RegisterScreen;


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
