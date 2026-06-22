// Service de persistência dos dados do usuário no localStorage

export interface DadosUsuario {
  clienteNome: string
  setor: string
}

const KEYS = {
  clienteNome: 'clienteNome',
  setor: 'setor',
} as const

export function getDadosUsuario(): DadosUsuario {
  return {
    clienteNome: localStorage.getItem(KEYS.clienteNome) ?? '',
    setor: localStorage.getItem(KEYS.setor) ?? '',
  }
}

export function setClienteNome(nome: string) {
  localStorage.setItem(KEYS.clienteNome, nome)
}

export function setSetor(setor: string) {
  localStorage.setItem(KEYS.setor, setor)
}

export function salvarDadosUsuario(dados: DadosUsuario) {
  setClienteNome(dados.clienteNome)
  setSetor(dados.setor)
}
