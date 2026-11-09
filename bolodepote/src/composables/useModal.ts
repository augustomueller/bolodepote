import { reactive } from 'vue'

export type TomModal = 'info' | 'sucesso' | 'erro' | 'perigo' | 'aviso'

interface EstadoModal {
  aberto: boolean
  titulo: string
  mensagem: string
  tom: TomModal
  textoConfirmar: string
  textoCancelar: string | null
  resolver: ((ok: boolean) => void) | null
}

/** Estado único compartilhado: só existe um modal aberto por vez (renderizado em App.vue). */
export const estadoModal = reactive<EstadoModal>({
  aberto: false,
  titulo: '',
  mensagem: '',
  tom: 'info',
  textoConfirmar: 'OK',
  textoCancelar: null,
  resolver: null,
})

interface OpcoesModal {
  titulo: string
  mensagem: string
  tom?: TomModal
  textoConfirmar?: string
  textoCancelar?: string
}

function abrir(opcoes: OpcoesModal, comCancelar: boolean): Promise<boolean> {
  // Se já houver um modal aberto, ele é fechado como "cancelado"
  estadoModal.resolver?.(false)
  return new Promise((resolve) => {
    Object.assign(estadoModal, {
      aberto: true,
      titulo: opcoes.titulo,
      mensagem: opcoes.mensagem,
      tom: opcoes.tom ?? 'info',
      textoConfirmar: opcoes.textoConfirmar ?? (comCancelar ? 'Confirmar' : 'OK'),
      textoCancelar: comCancelar ? (opcoes.textoCancelar ?? 'Cancelar') : null,
      resolver: resolve,
    })
  })
}

export function fecharModal(ok: boolean) {
  const resolver = estadoModal.resolver
  estadoModal.aberto = false
  estadoModal.resolver = null
  resolver?.(ok)
}

/** Pergunta ao usuário; resolve `true` se confirmar, `false` se cancelar/fechar. */
export function confirmar(opcoes: OpcoesModal): Promise<boolean> {
  return abrir({ tom: 'perigo', ...opcoes }, true)
}

/** Mostra uma mensagem informativa (erro, sucesso etc.) com um único botão. */
export async function avisar(opcoes: OpcoesModal): Promise<void> {
  await abrir(opcoes, false)
}

export function avisarErro(mensagem: string, titulo = 'Algo deu errado') {
  return avisar({ titulo, mensagem, tom: 'erro' })
}
