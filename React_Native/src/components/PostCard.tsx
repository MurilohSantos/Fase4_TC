import React, {useState} from 'react';
import {Alert, Platform, Pressable, Text, View} from 'react-native';
import {Post} from '../types';
import api from '../services/api';
import {cardStyle, colors} from './ui';

export default function PostCard({post,onOpen,onEdit,onDeleted,student=false}:{post:Post;onOpen:()=>void;onEdit?:()=>void;onDeleted?:()=>void;student?:boolean}) {
 const [liked,setLiked]=useState(false),[deleting,setDeleting]=useState(false);
 const executeDelete=async()=>{try{setDeleting(true);await api.delete(`/posts/${post.id}`);if(Platform.OS==='web'){window.alert('Post excluído com sucesso.');}else{Alert.alert('Sucesso','Post excluído com sucesso.');}onDeleted?.();}catch(error:any){const message=error?.response?.data?.message||'Não foi possível excluir o post. Verifique sua sessão e a conexão com a API.';if(Platform.OS==='web')window.alert(message);else Alert.alert('Erro',message);}finally{setDeleting(false);}};
 const remove=()=>{
  if(deleting)return;
  if(Platform.OS==='web'){if(window.confirm('Tem certeza que deseja excluir este post?'))void executeDelete();return;}
  Alert.alert('Excluir post','Tem certeza que deseja excluir este post?',[{text:'Cancelar',style:'cancel'},{text:'Excluir',style:'destructive',onPress:()=>void executeDelete()}]);
 };
 return <View style={cardStyle}>
  <View style={{flexDirection:'row',alignItems:'center',marginBottom:14}}>
   <View style={{width:42,height:42,borderRadius:21,backgroundColor:'#ffe0e9',alignItems:'center',justifyContent:'center',marginRight:10}}><Text style={{fontWeight:'800',color:colors.pink,fontSize:18}}>{(post.autor||post.materia||'?').charAt(0).toUpperCase()}</Text></View>
   <View style={{flex:1}}><Text style={{fontWeight:'800',color:colors.text,fontSize:15}}>{post.autor||'Autor não informado'}</Text><Text style={{color:colors.muted,marginTop:2}}>{post.materia}</Text></View>
   <Text style={{fontSize:11,color:post.habilitado===1?colors.green:colors.muted}}>{post.habilitado===1?'Publicado':'Desativado'}</Text>
  </View>
  <Pressable onPress={onOpen}><Text style={{fontSize:20,fontWeight:'800',color:colors.text,marginBottom:8}}>{post.assunto}</Text><Text style={{fontSize:15,lineHeight:22,color:'#555'}}>{post.descricao.length>160?post.descricao.slice(0,160)+'… Ver mais':post.descricao}</Text></Pressable>
  <View style={{flexDirection:'row',alignItems:'center',marginTop:14,gap:18}}>
   <Pressable onPress={()=>setLiked(!liked)}><Text style={{fontSize:24,color:liked?colors.pink:colors.muted}}>{liked?'♥':'♡'}</Text></Pressable>
   <Pressable onPress={onOpen}><Text style={{fontSize:20}}>💬</Text></Pressable>
   {!student&&<><Pressable onPress={onEdit}><Text style={{fontSize:20}}>✏️</Text></Pressable><Pressable onPress={remove} disabled={deleting}><Text style={{fontSize:20,opacity:deleting ? 0.45 : 1}}>{deleting?'⏳':'🗑️'}</Text></Pressable></>}
  </View>
 </View>;
}
