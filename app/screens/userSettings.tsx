import { View, Text } from "react-native-animatable";

import { useAuth } from "../context/AuthContext";


export default function UserSettingsScreen() {
    const { user } = useAuth(); 


    return (
        <>
        <View><Text>Hello, {user.name}</Text></View>
        </>
    )
}