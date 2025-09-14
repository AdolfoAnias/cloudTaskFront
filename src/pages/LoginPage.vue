<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import axios from 'axios'

const $q = useQuasar()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false) // estado de carga

async function login() {
  loading.value = true
  try {
    const response = await axios.post('http://localhost/cloudback/public/api/login', {
      email: email.value,
      password: password.value,
    })
    localStorage.setItem('token', response.data.token)
    $q.notify({ type: 'positive', message: 'Usted se ha logueado al sistema correctamente!' })
    router.push('/tasks')
  } catch {
    $q.notify({ type: 'negative', message: 'Error en login' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <q-page class="flex flex-center">
    <q-form @submit.prevent="login" class="login-form">
      <img src="/logo.jpg" alt="Logo" class="login-logo" />

      <q-input v-model="email" filled label="Email" type="email" required class="login-input" />
      <q-input
        v-model="password"
        filled
        label="Password"
        type="password"
        required
        class="login-input"
      />
      <q-btn
        label="Login"
        type="submit"
        color="primary"
        class="login-button"
        :loading="loading"
        :disable="loading"
        style="width: auto; min-width: 140px"
        size="md"
      />
    </q-form>
  </q-page>
</template>

<style scoped>
.login-form {
  width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-logo {
  width: 140px;
  height: auto;
  margin-bottom: 24px; /* espacio debajo del logo */
}

.login-input {
  margin-bottom: 18px; /* espacio entre inputs */
  --q-input-filled-bg-color: #f4f6f8; /* fondo claro */
  --q-input-filled-focus-bg-color: #ffffff;
  border-radius: 8px;
}

.login-button {
  width: 100%;
  margin-top: 12px;
  border-radius: 8px;
}
</style>
