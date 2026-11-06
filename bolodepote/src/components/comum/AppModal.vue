<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { estadoModal, fecharModal } from '../../composables/useModal'

const botaoConfirmar = ref<HTMLButtonElement | null>(null)

watch(
  () => estadoModal.aberto,
  async (aberto) => {
    if (aberto) {
      await nextTick()
      botaoConfirmar.value?.focus()
    }
  },
)

function aoTeclar(e: KeyboardEvent) {
  if (e.key === 'Escape') fecharModal(false)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="estadoModal.aberto" class="modal-fundo" @click.self="fecharModal(false)" @keydown="aoTeclar">
      <div
        class="modal"
        :class="`modal-${estadoModal.tom}`"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        aria-describedby="modal-mensagem"
      >
        <h2 id="modal-titulo">{{ estadoModal.titulo }}</h2>
        <p id="modal-mensagem">{{ estadoModal.mensagem }}</p>
        <div class="acoes">
          <button
            v-if="estadoModal.textoCancelar"
            type="button"
            class="btn btn-ghost"
            @click="fecharModal(false)"
          >
            {{ estadoModal.textoCancelar }}
          </button>
          <button
            ref="botaoConfirmar"
            type="button"
            class="btn"
            :class="{ 'btn-perigo': estadoModal.tom === 'perigo' || estadoModal.tom === 'aviso' }"
            @click="fecharModal(true)"
          >
            {{ estadoModal.textoConfirmar }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
