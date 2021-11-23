import {
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
} from "@firebase/firestore";
import { useNavigation } from "@react-navigation/core";
import React, { useState } from "react";
import { View, Text, Image, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "tailwind-rn";
import { db } from "../firebase";
import useAuth from "../hooks/useAuth";

const ModalScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [image, setImage] = useState(null);
  const [job, setJob] = useState(null);
  const [age, setAge] = useState(null);

  const incompleteForm = !image || !job || !age;

  const deletar = () =>
    deleteDoc(doc(db, "users", user.uid))
      .then(() => {
        alert("Deletado corretamente");
      })
      .catch((error) => {
        alert(error.message);
      });

  const updateUserProfile = () => {
    setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      displayName: user.displayName,
      photoURL: image,
      job: job,
      age: age,
      timestamp: serverTimestamp(),
    })
      .then(() => {
        navigation.navigate("Home");
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  return (
    <SafeAreaView style={tw("flex-1")}>
      <View style={tw("flex-1 items-center pt-1 mt-6")}>
        <Image
          style={tw("h-20 w-full")}
          resizeMode="contain"
          source={require("../assets/src/modal-logo.png")}
        />
        <Text style={tw("text-xl text-gray-500 p-2 font-bold")}>
          Seja Bem-Vindo {user.displayName}
        </Text>
        <TouchableOpacity
          style={tw("right-0 mr-2 rounded-xl absolute")}
          onPress={deletar}
        >
          <Text style={tw("text-center text-red-600 text-xl")}>Deletar</Text>
        </TouchableOpacity>
        <Text style={tw("text-center p-4 text-red-400 font-bold")}>
          Passo 1: Foto do perfil
        </Text>
        <TextInput
          value={image}
          onChangeText={setImage}
          style={tw("text-center text-xl pb-2")}
          placeholder="Insira um url de foto de perfil"
        />

        <Text style={tw("text-center p-4 text-red-400 font-bold")}>
          Passo 2: Seu trabalho
        </Text>
        <TextInput
          value={job}
          onChangeText={(text) => setJob(text)}
          style={tw("text-center text-xl pb-2")}
          placeholder="Insira seu trabalho"
        />

        <Text style={tw("text-center p-4 text-red-400 font-bold")}>
          Passo 3: Idade
        </Text>
        <TextInput
          value={age}
          onChangeText={(text) => setAge(text)}
          style={tw("text-center text-xl pb-2")}
          placeholder="Insira sua idade"
          keyboardType="numeric"
          maxLength={3}
        />

        <TouchableOpacity
          disabled={incompleteForm}
          style={[
            tw("w-64 p-3 rounded-xl absolute bottom-5 bg-blue-500"),
            incompleteForm ? tw("bg-gray-400") : tw("bg-red-500"),
          ]}
          onPress={updateUserProfile}
        >
          <Text style={tw("text-center text-white text-xl")}>
            Alterar perfil
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ModalScreen;
