import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useNavigation } from '@react-navigation/native';

// Stack navigators for each tab
import HomeStackNavigator from './HomeStackNavigator';
import BoardsStackNavigator from './BoardsStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';

const Tab = createBottomTabNavigator();

// Hiçbir zaman render edilmeyecek boş ekran (AddTask butonu tabBarButton ile override ediliyor)
const EmptyScreen = () => <View style={{ flex: 1 }} />;

// Eşit hizalı, ortalanmış Add butonu (Yazısız, sadece ikon tarzı ile eşit hizayı korur)
const AddButton = () => {
    const navigation = useNavigation();
    return (
        <TouchableOpacity style={styles.addTabButton} onPress={() => navigation.navigate('AddTask')}>
            <View style={styles.addIconContainer}>
                <Feather name="plus" size={24} color={COLORS.white} />
            </View>
        </TouchableOpacity>
    );
};

const BottomTabNavigator = () => {
    const insets = useSafeAreaInsets();
    // iPhone home indicator alanını hesaba kat (minimum 8px padding)
    const bottomPadding = Math.max(insets.bottom, 8);

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: [styles.tabBar, { height: 56 + bottomPadding, paddingBottom: bottomPadding }],
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textMuted,
                tabBarLabelStyle: styles.tabLabel,
                tabBarItemStyle: styles.tabItem,
            }}>
            <Tab.Screen
                name="Home"
                component={HomeStackNavigator}
                options={{
                    tabBarLabel: 'Ana Sayfa',
                    tabBarIcon: ({ color }) => <Feather name="home" size={22} color={color} />,
                }}
            />
            <Tab.Screen
                name="Boards"
                component={BoardsStackNavigator}
                options={{
                    tabBarLabel: 'Panolar',
                    tabBarIcon: ({ color }) => <Feather name="layout" size={22} color={color} />,
                }}
            />
            {/* Görev Ekle Butonu */}
            <Tab.Screen
                name="AddTaskPlaceholder"
                component={EmptyScreen}
                options={{
                    tabBarLabel: '',
                    tabBarIcon: () => null,
                    tabBarButton: () => <AddButton />,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileStackNavigator}
                options={{
                    tabBarLabel: 'Profil',
                    tabBarIcon: ({ color }) => <Feather name="user" size={22} color={color} />,
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
        paddingTop: 8,
        elevation: 0,
    },
    tabItem: {
        flex: 1,
        justifyContent: 'center',
        paddingVertical: 5,
    },
    tabLabel: {
        fontSize: 11,
        fontWeight: '500',
        marginTop: 4,
    },
    addTabButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
    },
});

export default BottomTabNavigator;

