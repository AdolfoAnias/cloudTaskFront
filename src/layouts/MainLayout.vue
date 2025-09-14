<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="drawerOpen = !drawerOpen" />
        <q-toolbar-title>Cloud Aplication</q-toolbar-title>

        <!-- Mostrar ícono persona y botón salir solo si está logueado -->
        <div v-if="isLoggedIn" class="row items-center q-gutter-sm">
          <q-btn flat round icon="person" />
          <q-btn flat label="Salir" @click="logout" />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawerOpen" side="left" bordered content-class="bg-grey-1">
      <!-- menú lateral -->
      <q-list padding>
        <q-item clickable v-ripple @click="goToRoute('tasks')" class="q-px-md q-my-sm">
          <q-item-section side class="text-primary">
            <q-icon name="assignment" />
          </q-item-section>
          <q-item-section> Tareas </q-item-section>
        </q-item>

        <q-item clickable v-ripple @click="goToRoute('keywords')" class="q-px-md q-my-sm">
          <q-item-section side class="text-primary">
            <q-icon name="label" />
          </q-item-section>
          <q-item-section> Palabras Clave </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const drawerOpen = ref(true)
const router = useRouter()

// Aquí controlas si el usuario está logueado, por ejemplo consultando localStorage, pinia o store
const isLoggedIn = ref(true) // simulado true para ejemplo

function logout() {
  // Limpiar sesión local o token
  localStorage.removeItem('userToken')
  // Redirigir a login
  router.push('/login')
  // También actualizar estado si usas store o pinia
  isLoggedIn.value = false
}

function goToRoute(routeName) {
  drawerOpen.value = false // cerrar menú al navegar
  router.push({ name: routeName })
}
</script>
