import { useNavigation } from "@react-navigation/core";
import React, { useLayoutEffect } from "react";
import { Foundation, Ionicons, AntDesign } from "@expo/vector-icons";
import {
  View,
  Text,
  Button,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import useAuth from "../hooks/useAuth";
import tw from "tailwind-rn";
import { SafeAreaView } from "react-native-safe-area-context";

const LoginScreen = () => {
  const { signInWithGoogle, loading } = useAuth();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  return (
    <View style={tw("flex-1")}>
      <ImageBackground
        resizeMode="cover"
        style={tw("flex-1")}
        source={require("../assets/src/bg-madu.png")}
      >
        <Text
          style={[
            tw("absolute bottom-72 font-bold text-personalizado text-4xl "),
            { marginHorizontal: "38%" },
          ]}
        >
          Madu
        </Text>
        <Text
          style={[
            tw("absolute bottom-64 font-bold text-personalizado text-2xl"),
            { marginHorizontal: "16%" },
          ]}
        >
          encontre oportunidades.
        </Text>

        <TouchableOpacity
          style={[
            tw(
              "absolute bottom-24 w-60 bg-pink-400 p-3 rounded-2xl flex-row items-center justify-between "
            ),
            { marginHorizontal: "17%" },
          ]}
          onPress={signInWithGoogle}
        >
          <AntDesign name="linkedin-square" size={25} color="white" />
          <Text style={tw("font-bold text-xl text-white text-center p-1")}>
            Sign in with Linkedin
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            tw(
              "absolute bottom-5 w-60 bg-pink-400 p-3 rounded-2xl flex-row items-center justify-between "
            ),
            { marginHorizontal: "17%" },
          ]}
          onPress={signInWithGoogle}
        >
          <AntDesign name="google" size={25} color="white" />
          <Text style={tw("font-bold text-xl text-white text-center p-1")}>
            Sign in with Google
          </Text>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
};

export default LoginScreen;
