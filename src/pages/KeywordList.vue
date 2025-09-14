<template>
  <div>
    <div class="q-pa-md q-gutter-md flex justify-between items-center">
      <h2>Listado de Keywords</h2>
      <q-btn color="primary" label="Crear Keyword" @click="showCreateDialog = true" />
    </div>

    <q-table
      :columns="columns"
      :rows="keywords"
      row-key="id"
      flat
      bordered
      separator="cell"
      class="shadow-2"
    >
      <template v-slot:body-cell-name="props">
        <q-td :props="props" align="left">
          {{ props.row.name }}
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props" align="center">
          <q-btn dense flat icon="edit" color="blue" round @click="abrirEditarKeyword(props.row)" />
          <q-btn
            dense
            flat
            icon="delete"
            color="red"
            round
            @click="abrirConfirmarEliminar(props.row)"
          />
        </q-td>
      </template>
    </q-table>

    <!-- Dialog para crear nueva keyword -->
    <q-dialog v-model="showCreateDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Crear nueva keyword</div>
        </q-card-section>

        <q-card-section>
          <q-input
            filled
            v-model="newKeywordName"
            label="Nombre de la keyword"
            autofocus
            clearable
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancelar"
            color="primary"
            v-close-popup
            @click="showCreateDialog = false"
          />
          <q-btn
            flat
            label="Crear"
            color="primary"
            @click="crearKeywordApi"
            :disable="!newKeywordName.trim()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog para editar keyword -->
    <q-dialog v-model="showEditDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Editar keyword</div>
        </q-card-section>

        <q-card-section>
          <q-input
            filled
            v-model="editKeyword.name"
            label="Nombre de la keyword"
            autofocus
            clearable
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup @click="cancelarEditar" />
          <q-btn
            flat
            label="Guardar"
            color="primary"
            @click="guardarEdicion"
            :disable="!editKeyword.name.trim()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Confirmación de eliminación -->
    <q-dialog v-model="showConfirmDelete" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="text-h6">Confirmar eliminación</q-card-section>
        <q-card-section>
          ¿Seguro que deseas eliminar la keyword "<strong>{{ keywordAEliminar?.name }}</strong
          >"?
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup @click="cancelarEliminar" />
          <q-btn flat label="Eliminar" color="negative" @click="confirmarEliminar" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import { Notify } from 'quasar'

const keywords = ref([])

const showCreateDialog = ref(false)
const newKeywordName = ref('')

const showEditDialog = ref(false)
const editKeyword = reactive({ id: null, name: '' })

const showConfirmDelete = ref(false)
const keywordAEliminar = ref(null)

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'name', label: 'Nombre', field: 'name', align: 'left', sortable: true },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' },
]

async function cargarKeywords() {
  try {
    const response = await axios.get('http://localhost/cloudback/public/api/keyword')
    keywords.value = response.data.respuesta.data
  } catch (error) {
    console.error('Error cargando keywords:', error)
  }
}

async function crearKeywordApi() {
  if (!newKeywordName.value.trim()) return
  try {
    const response = await axios.post('http://localhost/cloudback/public/api/keyword', {
      name: newKeywordName.value.trim(),
    })
    const data = response.data
    if (data.codigoRetorno === 200) {
      Notify.create({ type: 'positive', message: `Keyword creada: ${data.respuesta.name}` })
      showCreateDialog.value = false
      newKeywordName.value = ''
      cargarKeywords()
    } else {
      Notify.create({ type: 'negative', message: data.glosaRetorno || 'Error desconocido' })
    }
  } catch (error) {
    console.error('Error creando keyword:', error)
    Notify.create({ type: 'negative', message: 'Error de conexión o servidor al crear keyword' })
  }
}

function abrirEditarKeyword(keyword) {
  editKeyword.id = keyword.id
  editKeyword.name = keyword.name
  showEditDialog.value = true
}

function cancelarEditar() {
  showEditDialog.value = false
  editKeyword.id = null
  editKeyword.name = ''
}

async function guardarEdicion() {
  if (!editKeyword.name.trim()) return
  try {
    const response = await axios.put(`http://localhost/cloudback/public/api/keyword`, {
      id: editKeyword.id,
      name: editKeyword.name,
    })
    const data = response.data
    if (data.codigoRetorno === 200) {
      Notify.create({ type: 'positive', message: `Keyword actualizada: ${data.respuesta.name}` })
      showEditDialog.value = false
      cargarKeywords()
    } else {
      Notify.create({ type: 'negative', message: data.glosaRetorno || 'Error desconocido' })
    }
  } catch (error) {
    console.error('Error actualizando keyword:', error)
    Notify.create({
      type: 'negative',
      message: 'Error de conexión o servidor al actualizar keyword',
    })
  }
}

function abrirConfirmarEliminar(keyword) {
  keywordAEliminar.value = keyword
  showConfirmDelete.value = true
}

function cancelarEliminar() {
  keywordAEliminar.value = null
  showConfirmDelete.value = false
}

async function confirmarEliminar() {
  if (!keywordAEliminar.value) return
  try {
    const response = await axios.delete(
      `http://localhost/cloudback/public/api/keyword/${keywordAEliminar.value.id}`,
    )
    const data = response.data
    if (data.codigoRetorno === 200) {
      Notify.create({ type: 'positive', message: 'Keyword eliminada correctamente' })
      showConfirmDelete.value = false
      keywordAEliminar.value = null
      cargarKeywords()
    } else {
      Notify.create({ type: 'negative', message: data.glosaRetorno || 'Error desconocido' })
    }
  } catch (error) {
    console.error('Error eliminando keyword:', error)
    Notify.create({ type: 'negative', message: 'Error de conexión o servidor al eliminar keyword' })
  }
}

onMounted(() => {
  cargarKeywords()
})
</script>
