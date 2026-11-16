import React, {useCallback, useEffect, useState} from 'react';
import {Alert, FlatList, Platform, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList, User} from '../types';
import api from '../services/api';
import {Action, ErrorText, Field, Screen, Title, colors, cardStyle} from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'ManageUsers'>;
type UserPage = {data: User[]; page: number; totalPages: number; total: number};
export default function ManageUsersScreen({navigation}: Props) {
 const [tipo,setTipo]=useState<'p'|'a'>('p'),[users,setUsers]=useState<User[]>([]),[page,setPage]=useState(1),[totalPages,setTotalPages]=useState(1);
 const [name,setName]=useState(''),[email,setEmail]=useState(''),[senha,setSenha]=useState(''),[editing,setEditing]=useState<number|null>(null);
 const [loading,setLoading]=useState(false),[saving,setSaving]=useState(false),[error,setError]=useState('');
 const load=useCallback(async()=>{try{setLoading(true);const {data}=await api.get<UserPage>('/users',{params:{tipo,page,limit:8}});setUsers(data.data);setTotalPages(Math.max(1,data.totalPages));}catch(e:any){setError(e?.response?.data?.message||'Não foi possível carregar os usuários.');}finally{setLoading(false);}},[tipo,page]);
 useEffect(()=>{load();},[load]);
 const reset=()=>{setName('');setEmail('');setSenha('');setEditing(null);setError('');};
 const save=async()=>{if(!name.trim()||!email.trim()||(!editing&&!senha.trim())){setError('Preencha nome, e-mail e senha para novos usuários.');return;}try{setSaving(true);setError('');const body:any={name:name.trim(),email:email.trim(),tipo};if(senha.trim())body.senha=senha.trim();if(editing)await api.put(`/users/${editing}`,body);else await api.post('/users',body);reset();await load();}catch(e:any){setError(e?.response?.data?.message||'Não foi possível salvar o usuário.');}finally{setSaving(false);}};
 const confirmDelete=(user:User)=>{const run=async()=>{try{await api.delete(`/users/${user.id}`);await load();}catch(e:any){const msg=e?.response?.data?.message||'Não foi possível excluir o usuário.';if(Platform.OS==='web')window.alert(msg);else Alert.alert('Erro',msg);}};if(Platform.OS==='web'){if(window.confirm(`Excluir ${user.name}?`))void run();}else Alert.alert('Excluir usuário',`Deseja excluir ${user.name}?`,[{text:'Cancelar',style:'cancel'},{text:'Excluir',style:'destructive',onPress:()=>void run()}]);};
 return <Screen>
  <Title>Gerenciar usuários</Title>
  <View style={{flexDirection:'row',gap:10,marginBottom:14}}><View style={{flex:1}}><Action title="Professores" secondary={tipo!=='p'} onPress={()=>{setTipo('p');setPage(1);reset();}}/></View><View style={{flex:1}}><Action title="Alunos" secondary={tipo!=='a'} onPress={()=>{setTipo('a');setPage(1);reset();}}/></View></View>
  <View style={cardStyle}>
   <Text style={{fontSize:18,fontWeight:'800',color:colors.text,marginBottom:12}}>{editing?'Editar usuário':`Cadastrar ${tipo==='p'?'professor':'aluno'}`}</Text>
   <Field placeholder="Nome de usuário" value={name} onChangeText={setName} autoCapitalize="none"/><Field placeholder="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"/><Field placeholder={editing?'Nova senha (deixe em branco para manter)':'Senha'} value={senha} onChangeText={setSenha} secureTextEntry/>
   {!!error&&<ErrorText>{error}</ErrorText>}
   <Action title={saving?'Salvando...':editing?'Salvar alterações':'Cadastrar usuário'} onPress={save} disabled={saving}/>
   {editing&&<Action title="Cancelar edição" secondary onPress={reset}/>}
  </View>
  <Text style={{fontSize:18,fontWeight:'800',color:colors.text,marginBottom:10}}>{tipo==='p'?'Professores':'Alunos'} cadastrados</Text>
  {loading?<Text style={{color:colors.muted}}>Carregando...</Text>:<FlatList data={users} keyExtractor={u=>String(u.id)} renderItem={({item})=><View style={[cardStyle,{padding:13}]}><Text style={{fontWeight:'800',fontSize:16,color:colors.text}}>{item.name}</Text><Text style={{color:colors.muted,marginTop:3}}>{item.email}</Text><View style={{flexDirection:'row',gap:10,marginTop:8}}><View style={{flex:1}}><Action title="Editar" secondary onPress={()=>{setEditing(item.id);setName(item.name);setEmail(item.email);setSenha('');setError('');}}/></View><View style={{flex:1}}><Action title="Excluir" secondary onPress={()=>confirmDelete(item)}/></View></View></View>} ListEmptyComponent={<Text style={{color:colors.muted}}>Nenhum usuário encontrado.</Text>} contentContainerStyle={{paddingBottom:10}}/>}
  <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:8}}><Action title="Anterior" secondary disabled={page<=1} onPress={()=>setPage(p=>Math.max(1,p-1))}/><Text style={{color:colors.muted}}>Página {page} de {totalPages}</Text><Action title="Próxima" secondary disabled={page>=totalPages} onPress={()=>setPage(p=>Math.min(totalPages,p+1))}/></View>
  <Action title="Voltar ao feed" secondary onPress={()=>navigation.goBack()}/>
 </Screen>;
}
