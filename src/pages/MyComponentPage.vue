<template>
  <q-page class="flex flex-center">
    <q-btn @click="saludar" label="Haz clic aquí" color="primary" />
  </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'

const $q = useQuasar()

function saludar() {
  $q.notify({
    message: '¡Hola desde Quasar con script setup!',
    color: 'green',
  })
}
</script>
