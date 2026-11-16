import React,{useCallback,useEffect,useState} from 'react';
import {FlatList,RefreshControl,Text} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList,Post} from '../types';
import api from '../services/api';
import PostCard from '../components/PostCard';
import {Action,Busy,Field,Screen,Title,colors} from '../components/ui';

type Props=NativeStackScreenProps<RootStackParamList,'ProfessorFeed'|'StudentFeed'>;
export default function FeedScreen({navigation,route}:Props) {
 const student=route.name==='StudentFeed'; const [posts,setPosts]=useState<Post[]>([]); const [search,setSearch]=useState(''); const [loading,setLoading]=useState(true); const [refreshing,setRefreshing]=useState(false);
 const load=async()=>{try{const r=await api.get<Post[]>('/posts');setPosts(r.data);}catch{setPosts([]);}finally{setLoading(false);setRefreshing(false);}};
 useFocusEffect(useCallback(()=>{load();},[]));
 const data=posts.filter(p=>p.assunto.toLowerCase().includes(search.toLowerCase()));
 return <Screen>
  <Title>Feed {student?'do aluno':'do professor'}</Title>
  {!student&&<><Action title="+ Novo Post" onPress={()=>navigation.navigate('NewPost')}/><Action title="Gerenciar Usuários" secondary onPress={()=>navigation.navigate('ManageUsers')}/></>}
  <Field placeholder="Buscar post pelo título..." value={search} onChangeText={setSearch} style={{marginTop:14}}/>
  {loading?<Busy/>:<FlatList data={data} keyExtractor={p=>String(p.id)} renderItem={({item})=><PostCard post={item} student={student} onOpen={()=>navigation.navigate('PostDetails',{id:item.id})} onEdit={()=>navigation.navigate('EditPost',{id:item.id})} onDeleted={load}/>} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>{setRefreshing(true);load();}} tintColor={colors.pink}/>} ListEmptyComponent={<Text style={{textAlign:'center',color:'#777',marginTop:24}}>Nenhum post encontrado.</Text>} contentContainerStyle={{paddingTop:14,paddingBottom:30}}/>}
 </Screen>;
}
