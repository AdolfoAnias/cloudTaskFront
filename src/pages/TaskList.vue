<template>
  <div>
    <div class="q-pa-md q-gutter-md flex justify-between items-center">
      <h2>Listado de Tareas</h2>
      <q-btn color="primary" label="Crear Tarea" @click="showCreateDialog = true" />
    </div>

    <q-table
      :columns="taskColumns"
      :rows="tasks"
      row-key="id"
      flat
      bordered
      separator="cell"
      class="shadow-2"
    >
      <template v-slot:body-cell-keywords="props">
        <q-td :props="props" align="left">
          {{ (props.row.keywords || []).map((k) => k.name).join(', ') }}
        </q-td>
      </template>

      <template v-slot:body-cell-estado="props">
        <q-td :props="props" align="center">
          <q-badge
            :color="props.row.is_done ? 'green' : 'orange'"
            :label="props.row.is_done ? 'Completada' : 'Pendiente'"
          />
          <q-btn
            dense
            flat
            round
            :icon="props.row.is_done ? 'toggle_on' : 'toggle_off'"
            :color="props.row.is_done ? 'green' : 'grey'"
            @click="abrirConfirmarCambioEstado(props.row)"
            class="q-ml-sm"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props" align="center">
          <q-btn dense flat icon="edit" color="blue" round @click="abrirEditarTarea(props.row)" />
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

    <q-dialog v-model="showCreateDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Crear nueva tarea</div>
        </q-card-section>

        <q-card-section>
          <q-input filled v-model="newTaskTitle" label="Título de la tarea" autofocus clearable />
          <q-select
            filled
            v-model="newTaskKeywords"
            :options="keywords"
            label="Seleccionar Keywords"
            option-label="name"
            option-value="id"
            multiple
            emit-value
            map-options
            use-chips
            clearable
            class="q-mt-md"
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
            @click="crearTareaApi"
            :disable="!newTaskTitle.trim()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showConfirmDelete" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="text-h6">Confirmar eliminación</q-card-section>
        <q-card-section>
          ¿Seguro que deseas eliminar la tarea "<strong>{{ tareaAEliminar?.title }}</strong
          >"?
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup @click="cancelarEliminar" />
          <q-btn flat label="Eliminar" color="negative" @click="confirmarEliminar" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showEditDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Editar tarea</div>
        </q-card-section>

        <q-card-section>
          <q-input filled v-model="editTask.title" label="Título de la tarea" autofocus clearable />
          <q-checkbox v-model="editTask.is_done" label="Completada" class="q-mt-md" />
          <q-select
            filled
            v-model="editTask.keywords"
            :options="keywords"
            label="Seleccionar Keywords"
            option-label="name"
            option-value="id"
            multiple
            emit-value
            map-options
            use-chips
            clearable
            class="q-mt-md"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup @click="cancelarEditar" />
          <q-btn
            flat
            label="Guardar"
            color="primary"
            @click="guardarEdicion"
            :disable="!editTask.title.trim()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showConfirmEstado" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="text-h6">Confirmar cambio de estado</q-card-section>
        <q-card-section>
          ¿Quieres marcar la tarea "<strong>{{ tareaCambioEstado?.title }}</strong
          >" como <strong>{{ tareaCambioEstado?.is_done ? 'Pendiente' : 'Completada' }}</strong
          >?
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancelar"
            color="primary"
            v-close-popup
            @click="cancelarCambioEstado"
          />
          <q-btn flat label="Sí, cambiar" color="secondary" @click="confirmarCambioEstado" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import { Notify } from 'quasar'

const tasks = ref([])
const keywords = ref([])
const newTaskKeywords = ref([])

const showCreateDialog = ref(false)
const newTaskTitle = ref('')

const showConfirmDelete = ref(false)
const tareaAEliminar = ref(null)

const showEditDialog = ref(false)
const editTask = reactive({ id: null, title: '', is_done: false, keywords: [] })

const showConfirmEstado = ref(false)
const tareaCambioEstado = ref(null)

const taskColumns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'title', label: 'Título', field: 'title', align: 'left', sortable: true },
  { name: 'keywords', label: 'Palabras clave asociadas', field: 'keywords', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'is_done', align: 'center' },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' },
]

async function cargarTareas() {
  try {
    const response = await axios.get('http://localhost/cloudback/public/api/task')
    console.log(response)
    tasks.value = response.data.respuesta.data
  } catch (error) {
    console.error('Error cargando tareas:', error)
  }
}

async function cargarKeywords() {
  try {
    const response = await axios.get('http://localhost/cloudback/public/api/keyword')
    keywords.value = response.data.respuesta.data
    console.log(keywords.value)
  } catch (error) {
    console.error('Error cargando keywords:', error)
  }
}

async function crearTareaApi() {
  if (!newTaskTitle.value.trim()) return
  try {
    const response = await axios.post('http://localhost/cloudback/public/api/task', {
      title: newTaskTitle.value.trim(),
      keywords: newTaskKeywords.value,
    })
    const data = response.data
    if (data.codigoRetorno === 200) {
      Notify.create({
        type: 'positive',
        message: `Tarea creada correctamente: ${data.respuesta.title}`,
      })
      showCreateDialog.value = false
      newTaskTitle.value = ''
      newTaskKeywords.value = []
      cargarTareas()
    } else {
      Notify.create({
        type: 'negative',
        message: `Error al crear tarea: ${data.glosaRetorno || 'Error desconocido'}`,
      })
    }
  } catch (error) {
    console.error('Error creando tarea:', error)
    Notify.create({
      type: 'negative',
      message: 'Error de conexión o servidor al crear tarea',
    })
  }
}

function abrirConfirmarEliminar(task) {
  tareaAEliminar.value = task
  showConfirmDelete.value = true
}

function cancelarEliminar() {
  tareaAEliminar.value = null
  showConfirmDelete.value = false
}

async function confirmarEliminar() {
  if (!tareaAEliminar.value) return
  try {
    const response = await axios.delete(
      `http://localhost/cloudback/public/api/task/${tareaAEliminar.value.id}`,
    )
    const data = response.data
    if (data.codigoRetorno === 200) {
      Notify.create({
        type: 'positive',
        message: `Tarea eliminada correctamente`,
      })
      showConfirmDelete.value = false
      tareaAEliminar.value = null
      cargarTareas()
    } else {
      Notify.create({
        type: 'negative',
        message: `Error al eliminar tarea: ${data.glosaRetorno || 'Error desconocido'}`,
      })
    }
  } catch (error) {
    console.error('Error eliminando tarea:', error)
    Notify.create({
      type: 'negative',
      message: 'Error de conexión o servidor al eliminar tarea',
    })
  }
}

function abrirEditarTarea(task) {
  editTask.id = task.id
  editTask.title = task.title
  editTask.is_done = task.is_done || false
  editTask.keywords = task.keywords?.map((k) => k.id) || []
  showEditDialog.value = true
}

function cancelarEditar() {
  showEditDialog.value = false
  editTask.id = null
  editTask.title = ''
  editTask.is_done = false
  editTask.keywords = []
}

async function guardarEdicion() {
  if (!editTask.title.trim()) return
  try {
    const response = await axios.put(`http://localhost/cloudback/public/api/task`, {
      id: editTask.id,
      title: editTask.title,
      is_done: editTask.is_done,
      keywords: editTask.keywords,
    })
    const data = response.data
    if (data.codigoRetorno === 200) {
      Notify.create({
        type: 'positive',
        message: `Tarea actualizada correctamente: ${data.respuesta.title}`,
      })
      showEditDialog.value = false
      cargarTareas()
    } else {
      Notify.create({
        type: 'negative',
        message: `Error al actualizar tarea: ${data.glosaRetorno || 'Error desconocido'}`,
      })
    }
  } catch (error) {
    console.error('Error actualizando tarea:', error)
    Notify.create({
      type: 'negative',
      message: 'Error de conexión o servidor al actualizar tarea',
    })
  }
}

function abrirConfirmarCambioEstado(task) {
  tareaCambioEstado.value = task
  showConfirmEstado.value = true
}

function cancelarCambioEstado() {
  tareaCambioEstado.value = null
  showConfirmEstado.value = false
}

async function confirmarCambioEstado() {
  if (!tareaCambioEstado.value) return
  try {
    const response = await axios.patch(
      `http://localhost/cloudback/public/api/task/${tareaCambioEstado.value.id}/toggle`,
      {
        is_done: !tareaCambioEstado.value.is_done,
      },
    )
    const data = response.data
    if (data.codigoRetorno === 200) {
      Notify.create({
        type: 'positive',
        message: 'El estado de la tarea se cambió correctamente',
      })
      showConfirmEstado.value = false
      cargarTareas()
    } else {
      Notify.create({
        type: 'negative',
        message: `Error al cambiar el estado de la tarea: ${data.glosaRetorno || 'Error desconocido'}`,
      })
    }
  } catch (error) {
    console.error('Error cambiando estado de tarea:', error)
    Notify.create({
      type: 'negative',
      message: 'Error de conexión o servidor al cambiar estado',
    })
  }
}

onMounted(() => {
  cargarTareas()
  cargarKeywords()
})
</script>
