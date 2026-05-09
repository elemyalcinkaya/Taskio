import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import AuthStackNavigator from './AuthStackNavigator';
import AddTaskScreen from '../screens/tasks/AddTaskScreen';
import { useAuth } from '../context/AuthContext';

const RootStack = createNativeStackNavigator();

// AddTask'ı root seviyesinde modal olarak tanımlıyoruz,
// böylece tab bar'ın herhangi bir yerinden navigate('AddTask') çalışır.
const MainApp = () => (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Tabs" component={BottomTabNavigator} />
        <RootStack.Screen
            name="AddTask"
            component={AddTaskScreen}
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
    </RootStack.Navigator>
);

const AppNavigator = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return null; // splash could be shown here
    }

    return (
        <NavigationContainer>
            {user ? <MainApp /> : <AuthStackNavigator />}
        </NavigationContainer>
    );
};

export default AppNavigator;
