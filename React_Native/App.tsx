import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {StatusBar} from 'expo-status-bar';
import {RootStackParamList} from './src/types';
import LoginScreen from './src/screens/LoginScreen';
import FeedScreen from './src/screens/FeedScreen';
import PostFormScreen from './src/screens/PostFormScreen';
import PostDetailsScreen from './src/screens/PostDetailsScreen';
import ManageUsersScreen from './src/screens/ManageUsersScreen';
import {colors} from './src/components/ui';

const Stack=createNativeStackNavigator<RootStackParamList>();
export default function App(){
 return <NavigationContainer><StatusBar style="dark"/><Stack.Navigator initialRouteName="Login" screenOptions={{headerStyle:{backgroundColor:colors.dark},headerTintColor:'#fff',headerTitleStyle:{fontWeight:'700'},contentStyle:{backgroundColor:colors.bg}}}>
  <Stack.Screen name="Login" component={LoginScreen} options={{title:'Plataforma Educacional'}}/>
  <Stack.Screen name="ProfessorFeed" component={FeedScreen} options={{title:'Área do professor'}}/>
  <Stack.Screen name="StudentFeed" component={FeedScreen} options={{title:'Área do aluno'}}/>
  <Stack.Screen name="NewPost" component={PostFormScreen} options={{title:'Novo post'}}/>
  <Stack.Screen name="EditPost" component={PostFormScreen} options={{title:'Editar post'}}/>
  <Stack.Screen name="PostDetails" component={PostDetailsScreen} options={{title:'Detalhes do post'}}/>
  <Stack.Screen name="ManageUsers" component={ManageUsersScreen} options={{title:'Gerenciar usuários'}}/>
 </Stack.Navigator></NavigationContainer>;
}
