<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header con menú navegación que usa Vue Router -->
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>Home</q-toolbar-title>

        <!-- Botones que usan router-link para navegar -->
        <q-btn
          flat
          dense
          label="Tareas"
          :color="$route.name === 'tasks' ? 'primary' : 'grey-8'"
          to="/tasks"
          replace
          class="q-ml-sm"
        />
        <q-btn
          flat
          dense
          label="Keywords"
          :color="$route.name === 'keywords' ? 'primary' : 'grey-8'"
          to="/keywords"
          replace
          class="q-ml-sm"
        />

        <q-space />

        <!-- Menú usuario -->
        <q-btn
          dense
          flat
          round
          icon="account_circle"
          ref="userBtn"
          @click="userMenu = !userMenu"
          aria-label="User menu"
        />
        <q-btn flat dense label="Salir" class="q-ml-sm" @click="logout" />

        <q-menu
          v-model="userMenu"
          :anchor="userBtn"
          anchor-origin="bottom right"
          self-origin="top right"
        >
          <q-list style="min-width: 150px">
            <q-item clickable v-ripple v-close-popup @click="logout">
              <q-item-section>Desloguear</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-toolbar>
    </q-header>

    <!-- Contenedor principal para mostrar componentes según ruta -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const userMenu = ref(false)
const userBtn = ref(null)
const router = useRouter()

function logout() {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>
