<template>
  <div class="admin-container">
    <aside class="admin-sidebar">
      <div class="sidebar-logo">La <span>Brasa</span></div>
      <nav class="sidebar-nav">
        <button :class="{ active: currentTab === 'usuarios' }" @click="currentTab = 'usuarios'">👤 Usuarios</button>
        <button :class="{ active: currentTab === 'productos' }" @click="currentTab = 'productos'">🍽️ Productos</button>
        <button :class="{ active: currentTab === 'reservas' }" @click="currentTab = 'reservas'">📅 Reservas</button>
        <button :class="{ active: currentTab === 'mesas' }" @click="currentTab = 'mesas'">🪑 Mesas</button>
      </nav>
      <button class="btn-logout" @click="handleLogout">🚪 Cerrar sesión</button>
    </aside>

    <main class="admin-main">
      <header class="admin-header">
        <h1>{{ tabTitles[currentTab] }}</h1>
        <button v-if="currentTab === 'productos'" class="btn-add" @click="openAddProducto">+ Nuevo Producto</button>
        <button v-if="currentTab === 'mesas'" class="btn-add" @click="openAddMesa">+ Nueva Mesa</button>
      </header>

      <div v-if="loading" class="state-msg">Conectando con la base de datos...</div>
      <div v-else-if="error" class="state-msg error">{{ error }}</div>

      <div v-else class="admin-card table-wrapper">
        <table v-if="currentTab === 'usuarios'">
          <thead>
            <tr><th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            <tr v-for="u in usuarios" :key="u.idUsuario">
              <td>{{ u.idUsuario }}</td>
              <td>{{ u.nombre }} {{ u.apellido }}</td>
              <td>{{ u.email }}</td>
              <td><span class="badge" :class="u.rol">{{ u.rol }}</span></td>
              <td class="actions">
                <button class="btn-edit" @click="openEditUsuario(u)">✏️</button>
                <button class="btn-delete" @click="confirmDelete('usuario', u.idUsuario)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>

        <table v-if="currentTab === 'productos'">
          <thead>
            <tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Categoría</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            <tr v-for="p in productos" :key="p.idProducto">
              <td>{{ p.idProducto }}</td>
              <td>{{ p.nombre }}</td>
              <td>{{ p.precio }}€</td>
              <td>{{ p.categoria }}</td>
              <td><span class="badge" :class="p.disponible ? 'disponible' : 'nodisponible'">{{ p.disponible ? 'Sí' : 'No' }}</span></td>
              <td class="actions">
                <button class="btn-edit" @click="openEditProducto(p)">✏️</button>
                <button class="btn-delete" @click="confirmDelete('producto', p.idProducto)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>

        <table v-if="currentTab === 'mesas'">
          <thead>
            <tr><th>ID Mesa</th><th>Capacidad</th><th>Ubicación</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            <tr v-for="m in mesas" :key="m.idMesa">
              <td><strong>#{{ m.idMesa }}</strong></td>
              <td>{{ m.capacidad }} personas</td>
              <td>{{ m.ubicacion }}</td>
              <td>
                <span class="badge" :class="m.disponible ? 'disponible' : 'nodisponible'">
                  {{ m.disponible ? 'Disponible' : 'Ocupada' }}
                </span>
              </td>
              <td class="actions">
                <button class="btn-edit" @click="openEditMesa(m)">✏️</button>
                <button class="btn-delete" @click="confirmDelete('mesa', m.idMesa)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>

        <table v-if="currentTab === 'reservas'">
          <thead>
            <tr><th>ID</th><th>Mesa</th><th>Fecha</th><th>Pax</th><th>Fianza</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            <tr v-for="r in reservas" :key="r.idReserva">
              <td>{{ r.idReserva }}</td>
              <td>Mesa {{ r.idMesa }}</td>
              <td>{{ r.fecha }} ({{ r.hora }})</td>
              <td>{{ r.numPersonas }}</td>
              <td>{{ r.fianza }}€ <small>({{ r.estadoPago }})</small></td>
              <td class="actions">
                <button class="btn-edit" @click="openEditReserva(r)">✏️</button>
                <button class="btn-delete" @click="confirmDelete('reserva', r.idReserva)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <div v-if="modalMesa" class="modal-overlay" @click.self="modalMesa = false">
      <div class="modal">
        <h2>{{ editingMesa.idMesa ? 'Editar Mesa #' + editingMesa.idMesa : 'Nueva Mesa' }}</h2>
        <div class="form-group">
          <label>Capacidad (personas)</label>
          <input v-model="editingMesa.capacidad" type="number" min="1" />
        </div>
        <div class="form-group">
          <label>Ubicación</label>
          <input v-model="editingMesa.ubicacion" type="text" placeholder="Ej: Terraza, Ventana..." />
        </div>
        <div class="form-group">
          <label>Estado</label>
          <select v-model="editingMesa.disponible">
            <option :value="true">Disponible</option>
            <option :value="false">Ocupada / No disponible</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="modalMesa = false">Cancelar</button>
          <button class="btn-save" @click="saveMesa">Guardar en Base de Datos</button>
        </div>
      </div>
    </div>

    <div v-if="deleteConfirm.show" class="modal-overlay">
      <div class="modal modal-sm">
        <h2>¿Estás seguro?</h2>
        <p>Esta acción eliminará el registro permanentemente.</p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="deleteConfirm.show = false">No, cancelar</button>
          <button class="btn-delete" @click="executeDelete">Sí, eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "vue-router";

const API = "/api";
const router = useRouter();

const usuarios = ref([]);
const productos = ref([]);
const reservas = ref([]);
const mesas = ref([]);
const loading = ref(false);
const error = ref("");
const currentTab = ref("usuarios");

const tabTitles = {
  usuarios: "Gestión de Personal y Clientes",
  productos: "Carta de Productos",
  reservas: "Control de Reservas",
  mesas: "Configuración de Salón"
};

const modalMesa = ref(false);
const editingMesa = ref({});
const deleteConfirm = ref({ show: false, type: "", id: null });

// CARGA DE DATOS
const refresh = async () => {
  loading.value = true;
  error.value = "";
  try {
    const endpoint = currentTab.value === 'usuarios' ? 'Usuario' : 
                     currentTab.value === 'productos' ? 'Producto' : 
                     currentTab.value === 'reservas' ? 'Reserva' : 'Mesa';
    
    const res = await fetch(`${API}/${endpoint}`);
    const data = await res.json();
    
    if (currentTab.value === 'usuarios') usuarios.value = data.value || data;
    if (currentTab.value === 'productos') productos.value = data.value || data;
    if (currentTab.value === 'reservas') reservas.value = data.value || data;
    if (currentTab.value === 'mesas') mesas.value = data.value || data;
  } catch {
    error.value = "Error al conectar con la API.";
  } finally {
    loading.value = false;
  }
};

watch(currentTab, refresh, { immediate: true });

// LÓGICA MESA (SINCRONIZADA CON TU SQL)
const openAddMesa = () => {
  editingMesa.value = { capacidad: 2, ubicacion: "", disponible: true };
  modalMesa.value = true;
};

const openEditMesa = (m) => {
  editingMesa.value = { ...m };
  modalMesa.value = true;
};

const saveMesa = async () => {
  const { idMesa, capacidad, ubicacion, disponible } = editingMesa.value;
  
  // Payload limpio: solo enviamos lo que pide el SQL
  const payload = {
    capacidad: parseInt(capacidad),
    ubicacion: ubicacion,
    disponible: disponible === true || disponible === "true"
  };

  try {
    const url = idMesa ? `${API}/Mesa/idMesa/${idMesa}` : `${API}/Mesa`;
    const method = idMesa ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error();
    modalMesa.value = false;
    refresh();
  } catch {
    alert("Error al guardar. Verifica que los datos sean correctos.");
  }
};

// ELIMINAR
const confirmDelete = (type, id) => { deleteConfirm.value = { show: true, type, id }; };
const executeDelete = async () => {
  const { type, id } = deleteConfirm.value;
  const endpointMap = { usuario: 'Usuario/idUsuario', producto: 'Producto/idProducto', reserva: 'Reserva/idReserva', mesa: 'Mesa/idMesa' };
  
  try {
    await fetch(`${API}/${endpointMap[type]}/${id}`, { method: "DELETE" });
    deleteConfirm.value.show = false;
    refresh();
  } catch {
    alert("No se pudo eliminar el registro.");
  }
};

const handleLogout = () => { signOut(getAuth()); router.push("/login"); };
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Montserrat:wght@400;600&display=swap");

.admin-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden; /* Evita que la pantalla se rompa */
  background: #fdfbf9;
}

/* SIDEBAR ESTILO BRASA */
.admin-sidebar {
  width: 260px;
  min-width: 260px;
  background: #1a1410;
  color: #f5f0e8;
  display: flex;
  flex-direction: column;
  padding: 2rem 1.5rem;
  z-index: 100;
  box-shadow: 4px 0 15px rgba(0,0,0,0.1);
}

.sidebar-logo {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.8rem;
  margin-bottom: 3rem;
  text-align: center;
}
.sidebar-logo span { color: #c9963a; }

.sidebar-nav {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.sidebar-nav button {
  background: transparent;
  border: none;
  color: #a89880;
  padding: 14px;
  text-align: left;
  cursor: pointer;
  border-radius: 6px;
  font-family: "Montserrat", sans-serif;
  transition: 0.3s;
}

.sidebar-nav button.active, .sidebar-nav button:hover {
  background: rgba(201, 150, 58, 0.15);
  color: #c9963a;
  padding-left: 20px;
}

.btn-logout {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.1);
  color: #665;
  padding: 12px;
  border-radius: 4px;
  cursor: pointer;
}

/* MAIN AREA CON SCROLL INDEPENDIENTE */
.admin-main {
  flex-grow: 1;
  height: 100vh;
  overflow-y: auto;
  padding: 3rem;
  box-sizing: border-box;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
}

.admin-header h1 {
  font-family: "Cormorant Garamond", serif;
  font-size: 2.8rem;
  color: #1a1410;
  margin: 0;
}

.btn-add {
  background: #c9963a;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(201,150,58,0.2);
}

/* TABLA CARDS */
.admin-card {
  background: white;
  border-radius: 8px;
  border: 1px solid #f0ebe4;
  box-shadow: 0 4px 25px rgba(0,0,0,0.03);
}

.table-wrapper { overflow-x: auto; }

table { width: 100%; border-collapse: collapse; }

th {
  padding: 1.2rem;
  text-align: left;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #8a735a;
  background: #fcfaf8;
  border-bottom: 2px solid #f0ebe4;
}

td { padding: 1.2rem; border-bottom: 1px solid #f0ebe4; font-size: 0.9rem; color: #443; }

/* BADGES */
.badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}
.badge.disponible { background: #e8f5e9; color: #2e7d32; }
.badge.nodisponible { background: #ffebee; color: #c62828; }
.badge.admin { background: #fff1f1; color: #d32f2f; }

/* BOTONES ACCIÓN */
.actions { display: flex; gap: 10px; }
.btn-edit, .btn-delete {
  background: #f8f9fa;
  border: 1px solid #eee;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
}
.btn-edit:hover { background: #eef2ff; color: #3f51b5; }
.btn-delete:hover { background: #fff0f0; color: #d32f2f; }

/* MODALES */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 20, 16, 0.85);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
}

.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; font-size: 0.8rem; font-weight: 600; color: #6b4c2a; margin-bottom: 6px; }
.form-group input, .form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-sizing: border-box;
}

.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 2rem; }
.btn-cancel { background: #f5f0e8; border: none; padding: 12px 20px; border-radius: 6px; cursor: pointer; }
.btn-save { background: #c9963a; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; }

.state-msg { padding: 4rem; text-align: center; color: #8a735a; }
</style>