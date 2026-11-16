import React,{useEffect,useState} from 'react';
import {ActivityIndicator,Switch,Text,View,Alert} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList,Post} from '../types';
import api from '../services/api';
import {Action,ErrorText,Field,Screen,Title,colors} from '../components/ui';

type Props=NativeStackScreenProps<RootStackParamList,'NewPost'|'EditPost'>;
export default function PostFormScreen({navigation,route}:Props) {
 const editing=route.name==='EditPost';const id=editing?(route.params as {id:number}).id:undefined;
 const [autor,setAutor]=useState(''),[materia,setMateria]=useState(''),[assunto,setAssunto]=useState(''),[descricao,setDescricao]=useState(''),[habilitado,setHabilitado]=useState(true),[loading,setLoading]=useState(false),[saving,setSaving]=useState(false),[error,setError]=useState('');
 useEffect(()=>{if(editing&&id){api.get<Post>(`/posts/${id}`).then(({data:p})=>{setAutor(p.autor||'');setMateria(p.materia||'');setAssunto(p.assunto||'');setDescricao(p.descricao||'');setHabilitado(p.habilitado===1);}).catch(()=>setError('Não foi possível carregar o post.')).finally(()=>setLoading(false));}else setLoading(false);},[editing,id]);
 async function submit(){if(!autor||!materia||!assunto||!descricao){setError('Preencha todos os campos.');return;}try{setSaving(true);setError('');const body={autor,materia,assunto,descricao,habilitado:habilitado?1:0};if(editing)await api.put(`/posts/${id}`,body);else await api.post('/posts',body);navigation.goBack();}catch{setError(editing?'Não foi possível atualizar o post.':'Não foi possível criar o post.');}finally{setSaving(false);}}
 if(loading)return <Screen><ActivityIndicator color={colors.pink}/></Screen>;
 return <Screen><Title>{editing?'Atualizar Post':'Novo Post'}</Title><Text style={{fontWeight:'700',marginBottom:6}}>Autor</Text><Field value={autor} onChangeText={setAutor} placeholder="Digite o nome do autor"/><Text style={{fontWeight:'700',marginBottom:6}}>Matéria</Text><Field value={materia} onChangeText={setMateria} placeholder="Ex: Matemática"/><Text style={{fontWeight:'700',marginBottom:6}}>Assunto</Text><Field value={assunto} onChangeText={setAssunto} placeholder="Digite o título do post"/><Text style={{fontWeight:'700',marginBottom:6}}>Descrição</Text><Field value={descricao} onChangeText={setDescricao} placeholder="Escreva o conteúdo do post..." multiline/><View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:16}}><Text style={{fontWeight:'700'}}> {editing?'Post habilitado':'Publicar post'}</Text><Switch value={habilitado} onValueChange={setHabilitado} trackColor={{true:colors.pink}}/></View>{!!error&&<ErrorText>{error}</ErrorText>}<Action title={saving?(editing?'Atualizando...':'Publicando...'):(editing?'Atualizar Post':'Publicar Post')} onPress={submit} disabled={saving}/><Action title="Cancelar" secondary onPress={()=>navigation.goBack()}/></Screen>;
}
