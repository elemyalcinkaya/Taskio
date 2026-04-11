import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BoardsScreen from '../screens/boards/BoardsScreen';
import BoardDetailScreen from '../screens/boards/BoardDetailScreen';
import AddTaskScreen from '../screens/tasks/AddTaskScreen';
import TaskDetailScreen from '../screens/tasks/TaskDetailScreen';

const Stack = createNativeStackNavigator();

const darkHeader = {
    headerShown: true,
    headerStyle: { backgroundColor: '#1A1F3A' },
    headerTintColor: '#FFFFFF',
    headerTitleStyle: { fontWeight: '700', color: '#FFFFFF' },
    headerShadowVisible: false,
};

const BoardsStackNavigator = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Boards" component={BoardsScreen} />
        <Stack.Screen name="BoardDetail" component={BoardDetailScreen} options={{ ...darkHeader, title: 'Pano' }} />
        <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ ...darkHeader, title: 'Görev Detayı' }} />
        <Stack.Screen name="AddTask" component={AddTaskScreen} options={{ ...darkHeader, title: '' }} />
    </Stack.Navigator>
);

export default BoardsStackNavigator;
