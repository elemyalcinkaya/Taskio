import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import TaskDetailScreen from '../screens/tasks/TaskDetailScreen';
import AddTaskScreen from '../screens/tasks/AddTaskScreen';

const Stack = createNativeStackNavigator();

const HomeStackNavigator = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ headerShown: true, title: 'Görev Detayı' }} />
        <Stack.Screen name="AddTask" component={AddTaskScreen} />
    </Stack.Navigator>
);

export default HomeStackNavigator;
