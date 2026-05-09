import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/profile/ProfileScreen';
import PeopleScreen from '../screens/people/PeopleScreen';

const Stack = createNativeStackNavigator();

const ProfileStackNavigator = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="People" component={PeopleScreen} />
    </Stack.Navigator>
);

export default ProfileStackNavigator;
