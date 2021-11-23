import { useNavigation } from "@react-navigation/core";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Button,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useAuth from "../hooks/useAuth";
import tw from "tailwind-rn";
import { Entypo, AntDesign, Octicons, Ionicons, Foundation } from "@expo/vector-icons";
import Swiper from "react-native-deck-swiper";
import {
  collection,
  doc,
  DocumentSnapshot,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "@firebase/firestore";
import { db } from "../firebase";
import generateId from "../lib/generateid";

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const swipeRef = useRef(null);

  useLayoutEffect(
    () =>
      onSnapshot(doc(db, "users", user.uid), (snapshot) => {
        if (!snapshot.exists()) {
          navigation.navigate("Modal");
        }
      }),
    []
  );

  useEffect(() => {
    let unsub;

    const fetchCards = async () => {
      const passes = await getDocs(
        collection(db, "users", user.uid, "passes")
      ).then((snapshot) => snapshot.docs.map((doc) => doc.id));

      const swipes = await getDocs(
        collection(db, "users", user.uid, "swipes")
      ).then((snapshot) => snapshot.docs.map((doc) => doc.id));

      const passedUserIds = passes.length > 0 ? passes : ["teste"];
      const swipesUserIds = swipes.length > 0 ? passes : ["teste"];
      console.log(swipesUserIds);
      unsub = onSnapshot(
        query(
          collection(db, "users"),
          where("id", "not-in", [...passedUserIds, ...swipesUserIds])
        ),
        (snapshot) => {
          setProfiles(
            snapshot.docs
              .filter((doc) => doc.id !== user.uid)
              .map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }))
          );
        }
      );
    };
    fetchCards();
    return unsub;
  }, [db]);

  const swipeLeft = (cardIndex) => {
    if (!profiles[cardIndex]) return;

    const userSwiped = profiles[cardIndex];
    console.log(`You swiped PASS on ${userSwiped.displayName}`);

    setDoc(doc(db, "users", user.uid, "passes", userSwiped.id), userSwiped);
  };
  const swipeRight = async (cardIndex) => {
    if (!profiles[cardIndex]) return;

    const userSwiped = profiles[cardIndex];
    const loggedInProfile = await (
      await getDoc(doc(db, "users", user.uid))
    ).data();

    // Check if the user swiped on you...
    getDoc(doc(db, "users", userSwiped.id, "swipes", user.uid)).then(
      (documentSnapshot) => {
        if (documentSnapshot.exists()) {
          //user has matched with you before you matched with them..
          //Create a MATCH
          console.log(`Ebaa, ${userSwiped.displayName} quer te conhecer`);
          setDoc(
            doc(db, "users", user.uid, "swipes", userSwiped.id),
            userSwiped
          );

          //Create a match
          setDoc(doc(db, "matches", generateId(user.uid, userSwiped.id)), {
            users: {
              [user.uid]: loggedInProfile,
              [userSwiped.id]: userSwiped,
            },
            usersMatched: [user.uid, userSwiped.id],
            timestamp: serverTimestamp(),
          }).catch((error) => {
            alert(error.message);
          });

          navigation.navigate("Match", {
            loggedInProfile,
            userSwiped,
          });
        } else {
          //User has swiped as first interaction between the two didn't get swiped on
          console.log(
            `You swiped on ${userSwiped.displayName} (${userSwiped.job})`
          );
          setDoc(
            doc(db, "users", user.uid, "swipes", userSwiped.id),
            userSwiped
          );
        }
      }
    );

    console.log(`You swiped on ${userSwiped.displayName} (${userSwiped.job})`);

    setDoc(doc(db, "users", user.uid, "swipes", userSwiped.id), userSwiped);
  };

  return (
    <SafeAreaView style={tw("flex-1 bg-white")}>
      <View style={tw("flex-row  items-center justify-between relative px-5")}>
        <TouchableOpacity onPress={logout}>
          <Image
            style={tw("h-10 w-10 mt-1 rounded-full")}
            source={{ uri: user.photoURL }}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Modal")}>
          <Octicons name="settings" size={35} color="#19516f" />
        </TouchableOpacity>
      </View>

      <View
        style={tw(
          "flex-row mt-4 -mb-12 items-center justify-between relative px-10"
        )}
      >
        <TouchableOpacity
          onPress={() => swipeRef.current.swipeLeft()}
          style={tw(
            "items-center justify-center rounded-full w-10 h-10 bg-blue-per"
          )}
        >
          <Foundation name="crown" size={20} style={tw("text-white")} />
        </TouchableOpacity>
        <View style={tw("flex-1 items-left")}>
          <Text
            style={tw("ml-4 text-left text-base text-personalizado font-bold")}
          >
            Upgrade para premium
          </Text>
          <Text
            style={tw("ml-4 text-left text-sm text-personalizado font-thin")}
          >
            Sua oportunidade está aqui
          </Text>
        </View>

        <TouchableOpacity
          style={tw(
            "items-center justify-center rounded-full w-8 h-8 bg-blue-300"
          )}
        >
          <AntDesign name="close" size={15} color="white" />
        </TouchableOpacity>
      </View>

      <View style={tw("flex-1 -mt-8")}>
        <Swiper
          ref={swipeRef}
          containerStyle={{ backgroundColor: "transparent" }}
          cards={profiles}
          stackSize={5}
          cardIndex={0}
          animateCardOpacity
          verticalSwipe={false}
          onSwipedLeft={(cardIndex) => {
            console.log("swipe pass");
            swipeLeft(cardIndex);
          }}
          onSwipedRight={(cardIndex) => {
            console.log("match");
            swipeRight(cardIndex);
          }}
          overlayLabels={{
            left: {
              title: "Dispensar",
              style: {
                label: {
                  textAlign: "center",
                  color: "red",
                },
              },
            },
            right: {
              title: "Conhecer",
              style: {
                label: {
                  textAlign: "center",
                  color: "#4DED30",
                },
              },
            },
          }}
          renderCard={(card) =>
            card ? (
              <View
                key={card.id}
                style={tw("relative bg-white h-4/6 rounded-3xl mt-16")}
              >
                <Image
                  style={tw("absolute h-full top-0 w-full rounded-3xl")}
                  source={{ uri: card.photoURL }}
                />
                <View
                  style={[
                    tw(
                      "absolute bottom-0 w-full bg-white flex-row justify-between items-center h-20 px-6 py-2 rounded-b-3xl"
                    ),
                  ]}
                >
                  <View>
                    <Text style={tw("text-xl font-bold ")}>
                      {card.displayName}
                    </Text>
                    <Text>{card.job}</Text>
                  </View>
                  <Text style={tw("text-2xl font-bold ")}>{card.age}</Text>
                </View>
              </View>
            ) : (
              <View
                style={[
                  tw(
                    "relative bg-white h-4/6 rounded-3xl justify-center items-center mt-16"
                  ),
                  styles.cardShadow,
                ]}
              >
                <Text style={tw("font-bold pb-5")}>
                  Oops, nenhum perfil encontrado
                </Text>
                <Entypo name="emoji-sad" size={60} color="#5271ff" />
              </View>
            )
          }
        />
      </View>

      <View style={tw("flex flex-row justify-evenly")}>
        <TouchableOpacity
          onPress={() => swipeRef.current.swipeLeft()}
          style={tw(
            "items-center justify-center rounded-full w-14 h-14 bg-yellow-50"
          )}
        >
          <Entypo name="cross" size={35} style={tw("text-yellow-400")} />
        </TouchableOpacity>

        <TouchableOpacity
          style={tw(
            "items-center justify-center rounded-full w-16 h-16 bg-blue-per"
          )}
        >
          <Entypo name="rainbow" size={35} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => swipeRef.current.swipeRight()}
          style={tw(
            "items-center justify-center rounded-full w-14 h-14 bg-pink-50"
          )}
        >
          <AntDesign name="heart" size={30} style={tw("text-pink-400")} />
        </TouchableOpacity>
      </View>

      <View
        style={tw(
          "h-16 mx-5 my-2 rounded-3xl bg-red-400 flex flex-row justify-evenly"
        )}
      >
        <TouchableOpacity
          style={tw("mt-4")}
          onPress={() => navigation.navigate("Chat")}
        >
          <Ionicons name="chatbubbles" size={35} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
});
