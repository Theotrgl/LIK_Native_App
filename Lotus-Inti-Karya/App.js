import React, { useEffect, useState } from "react";
import Form from "./pages/main";
import Register from "./pages/register";
import Login from "./pages/login";
import RootStack from "./navigators/RootStack";
import { NavigationContainer } from "@react-navigation/native";

export default function App() {
  // const [loggedIn, setLoggedIn] = useState(false)
  // useEffect(() => {
  //   setLoggedIn(true)
  // }, []);
  return (
    // <NavigationContainer>
    //   {loggedIn ? <RootStack/> : <AuthNavigator/>}
    // </NavigationContainer>
    <RootStack />
  );
}
