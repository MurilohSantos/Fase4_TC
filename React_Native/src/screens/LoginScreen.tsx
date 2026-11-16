import React,{useState} from 'react';
import {Alert,Text,View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types';
import api from '../services/api';
import {Action,ErrorText,Field,Screen,Title,colors} from '../components/ui';

export default function LoginScreen({navigation}:NativeStackScreenProps<RootStackParamList,'Login'>) {
 const [name,setName]=useState('');const [senha,setSenha]=useState('');const [loading,setLoading]=useState(false);const [error,setError]=useState('');
 async function login(){if(!name||!senha){setError('Informe o usuário e a senha.');return;}try{setLoading(true);setError('');const r=await api.post('/users/login',{name,senha});const {message,tipo,user,token}=r.data;if(message==='Login realizado com sucesso'){await AsyncStorage.multiSet([['usuario',JSON.stringify(user)],['tipoUsuario',tipo],['token',token]]);navigation.reset({index:0,routes:[{name:tipo==='professor'?'ProfessorFeed':'StudentFeed'}]});}else{setError(tipo!=='professor'?'Acesso permitido somente para professores.':'Não foi possível realizar o login.');}}catch{setError('Usuário ou senha inválidos. Verifique também a conexão com a API.');}finally{setLoading(false);}}
 return <Screen><View style={{flex:1,justifyContent:'center'}}><View style={{backgroundColor:colors.white,borderRadius:20,padding:22}}><Title>Login</Title><Text style={{color:'#777',marginBottom:20}}>Entre para acessar seus posts</Text><Text style={{fontWeight:'700',marginBottom:6}}>Usuário</Text><Field value={name} onChangeText={setName} placeholder="Digite seu usuário" autoCapitalize="none"/><Text style={{fontWeight:'700',marginBottom:6}}>Senha</Text><Field value={senha} onChangeText={setSenha} placeholder="Digite sua senha" secureTextEntry/>{!!error&&<ErrorText>{error}</ErrorText>}<Action title={loading?'Entrando...':'Entrar'} onPress={login} disabled={loading}/></View></View></Screen>;
}
