export interface Post {
  id: number; materia: string; assunto: string; descricao: string; habilitado: number; autor?: string;
}
export interface User { id: number; name: string; email: string; tipo: 'p' | 'a'; }
export type RootStackParamList = {
  Login: undefined; ProfessorFeed: undefined; StudentFeed: undefined; NewPost: undefined;
  EditPost: { id: number }; PostDetails: { id: number }; ManageUsers: undefined;
};
