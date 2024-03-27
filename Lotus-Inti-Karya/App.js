import React from "react";
import Form from "./pages/main";
import Register from "./pages/register";
import Login from "./pages/login";

import RootStack from "./navigators/RootStack";

export default function App() {
  return <RootStack />;
}
