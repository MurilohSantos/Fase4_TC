import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';

export const colors = { pink:'#ed145b', pinkDark:'#c10e49', dark:'#474747', bg:'#f5f5f7', text:'#242424', muted:'#777', border:'#dedee3', white:'#fff', green:'#16834a', red:'#c62828' };
export function Screen({children}: React.PropsWithChildren) { return <View style={s.screen}>{children}</View>; }
export function Title({children}: React.PropsWithChildren) { return <Text style={s.title}>{children}</Text>; }
export function Field(props: React.ComponentProps<typeof TextInput>) { return <TextInput placeholderTextColor="#999" {...props} style={[s.input, props.multiline && {height:150,textAlignVertical:'top'}, props.style]} />; }
export function Action({title,onPress,secondary=false,disabled=false}: {title:string;onPress:()=>void;secondary?:boolean;disabled?:boolean}) {
 return <Pressable disabled={disabled} onPress={onPress} style={[s.button,secondary&&s.secondary,disabled&&{opacity:.6}]}><Text style={[s.buttonText,secondary&&{color:colors.dark}]}>{title}</Text></Pressable>;
}
export function Busy() { return <View style={{padding:30,alignItems:'center'}}><ActivityIndicator color={colors.pink}/><Text style={{marginTop:8,color:colors.muted}}>Carregando...</Text></View>; }
export function ErrorText({children}: React.PropsWithChildren) { return <Text style={s.error}>{children}</Text>; }
export const cardStyle: ViewStyle = {backgroundColor:colors.white,borderRadius:16,padding:16,marginBottom:14,borderWidth:1,borderColor:'#eeeeef'};
const s=StyleSheet.create({
 screen:{flex:1,backgroundColor:colors.bg,padding:18}, title:{fontSize:26,fontWeight:'800',color:colors.text,marginBottom:16},
 input:{backgroundColor:colors.white,borderWidth:1,borderColor:colors.border,borderRadius:10,paddingHorizontal:14,paddingVertical:12,fontSize:16,color:colors.text,marginBottom:12},
 button:{backgroundColor:colors.pink,borderRadius:12,paddingVertical:14,paddingHorizontal:18,alignItems:'center',justifyContent:'center',marginTop:6},
 secondary:{backgroundColor:'#ececef'},buttonText:{color:colors.white,fontWeight:'700',fontSize:15},
 error:{color:colors.red,marginVertical:8,fontSize:14}
});
