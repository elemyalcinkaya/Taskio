import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

// Ekranlar
import HomeScreen from '../screens/home/HomeScreen';
import BoardsScreen from '../screens/boards/BoardsScreen';
import AddTaskScreen from '../screens/tasks/AddTaskScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

// Özel Add butonu
const AddButton = ({ onPress }) => (
    <TouchableOpacity style={styles.addButton} onPress={onPress}>
        <Text style={styles.addIcon}>+</Text>
    </TouchableOpacity>
);

const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textMuted,
                tabBarLabelStyle: styles.tabLabel,
            })}>
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text>,
                }}
            />
            <Tab.Screen
                name="Boards"
                component={BoardsScreen}
                options={{
                    tabBarLabel: 'Boards',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📋</Text>,
                }}
            />
            <Tab.Screen
                name="AddTask"
                component={AddTaskScreen}
                options={{
                    tabBarLabel: '',
                    tabBarIcon: () => null,
                    tabBarButton: (props) => (
                        <AddButton onPress={props.onPress} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text>,
                }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: COLORS.surface,
        borderTopColor: COLORS.border,
        borderTopWidth: 1,
        height: 70,
        paddingBottom: 10,
        paddingTop: 8,
    },
    tabLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    addButton: {
        top: -20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    addIcon: {
        fontSize: 28,
        color: COLORS.white,
        fontWeight: 'bold',
        lineHeight: 32,
    },
});

export default BottomTabNavigator;
