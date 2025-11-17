export interface UsuarioRequest{
    nome:string,
    email:string,

}

export interface AlterarSenhaRequest{
    senhaAtual:string,
    novaSenha:string,
}