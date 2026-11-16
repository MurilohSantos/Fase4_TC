import React,{useEffect,useState} from 'react';
import {ActivityIndicator,Pressable,Text,View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList,Post} from '../types';
import api from '../services/api';
import {Action,Screen,Title,colors,cardStyle} from '../components/ui';
export default function PostDetailsScreen({navigation,route}:NativeStackScreenProps<RootStackParamList,'PostDetails'>){
 const [post,setPost]=useState<Post|null>(null),[liked,setLiked]=useState(false),[error,setError]=useState('');
 useEffect(()=>{api.get<Post>(`/posts/${route.params.id}`).then(r=>setPost(r.data)).catch(()=>setError('Não foi possível carregar o post.'));},[route.params.id]);
 if(!post)return <Screen>{error?<Text>{error}</Text>:<ActivityIndicator color={colors.pink}/>}<Action title="Voltar" secondary onPress={()=>navigation.goBack()}/></Screen>;
 return <Screen><Pressable onPress={()=>navigation.goBack()}><Text style={{color:colors.pink,fontWeight:'700',marginBottom:16}}>← Voltar</Text></Pressable><View style={cardStyle}><Text style={{fontWeight:'800',fontSize:16}}>{post.autor||'Autor não informado'}</Text><Text style={{color:'#777',marginTop:4,marginBottom:18}}>{post.materia}</Text><Title>{post.assunto}</Title><Text style={{fontSize:16,lineHeight:25,color:'#444'}}>{post.descricao}</Text><View style={{flexDirection:'row',alignItems:'center',marginTop:20,gap:18}}><Pressable onPress={()=>setLiked(!liked)}><Text style={{fontSize:26,color:colors.pink}}>{liked?'♥':'♡'}</Text></Pressable><Text style={{color:'#777'}}>{post.habilitado===1?'Publicado':'Desativado'}</Text></View></View></Screen>;
}
