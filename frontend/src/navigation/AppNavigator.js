import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

// Auth ekranları
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Ana navigator
import BottomTabNavigator from './BottomTabNavigator';

// Detay ekranları
import TaskDetailScreen from '../screens/tasks/TaskDetailScreen';
import BoardDetailScreen from '../screens/boards/BoardDetailScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return null; // SplashScreen burada gösterilebilir
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!user ? (
                    // Giriş yapılmamış - Auth stack
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                    </>
                ) : (
                    // Giriş yapılmış - Ana uygulama
                    <>
                        <Stack.Screen name="Main" component={BottomTabNavigator} />
                        <Stack.Screen
                            name="TaskDetail"
                            component={TaskDetailScreen}
                            options={{ headerShown: true, title: 'Görev Detayı' }}
                        />
                        <Stack.Screen
                            name="BoardDetail"
                            component={BoardDetailScreen}
                            options={{ headerShown: true, title: 'Pano' }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
