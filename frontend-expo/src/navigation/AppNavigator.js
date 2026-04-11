import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigator from './BottomTabNavigator';
import AuthStackNavigator from './AuthStackNavigator';
import { useAuth } from '../context/AuthContext';

const AppNavigator = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return null; // splash could be shown here
    }

    return (
        <NavigationContainer>
            {user ? <BottomTabNavigator /> : <AuthStackNavigator />}
        </NavigationContainer>
    );
};

export default AppNavigator;
