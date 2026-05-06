<template>
  <div class="admin-container">
    <!-- SIDEBAR -->
    <aside class="admin-sidebar">
      <div class="sidebar-logo">La <span>Brasa</span></div>
      <nav class="sidebar-nav">
        <button :class="{ active: currentTab === 'usuarios' }" @click="currentTab = 'usuarios'">
          👤 Usuarios
        </button>
        <button :class="{ active: currentTab === 'productos' }" @click="currentTab = 'productos'">
          🍽️ Productos
        </button>
        <button :class="{ active: currentTab === 'reservas' }" @click="currentTab = 'reservas'">
          📅 Reservas
        </button>
      </nav>
      <button class="btn-logout" @click="handleLogout">🚪 Cerrar sesión</button>
    </aside>

    <!-- MAIN -->
    <main class="admin-main">
      <header class="admin-header">
        <h1>{{ currentTab === 'usuarios' ? 'Usuarios' : currentTab === 'productos' ? 'Productos' : 'Reservas' }}</h1>
        <button v-if="currentTab === 'productos'" class="btn-add" @click="openAddProducto">
          + Añadir producto
        </button>
      </header>

      <!-- LOADING -->
      <div v-if="loading" class="state-msg">Cargando...</div>

      <!-- ERROR -->
      <div v-else-if="error" class="state-msg error">{{ error }}</div>

      <!-- TABLA USUARIOS -->
      <div v-else-if="currentTab === 'usuarios'" class="admin-card table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in usuarios" :key="user.idUsuario">
              <td>{{ user.idUsuario }}</td>
              <td>{{ user.nombre }}</td>
              <td>{{ user.apellido }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span class="badge" :class="user.rol">{{ user.rol }}</span>
              </td>
              <td class="actions">
                <button class="btn-edit" @click="openEditUsuario(user)">✏️ Editar</button>
                <button class="btn-delete" @click="confirmDelete('usuario', user.idUsuario)">🗑️ Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p class="total">Total: {{ usuarios.length }} usuarios</p>
      </div>

      <!-- TABLA PRODUCTOS -->
      <div v-else-if="currentTab === 'productos'" class="admin-card table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>Categoría</th>
              <th>Disponible</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in productos" :key="p.idProducto">
              <td>{{ p.idProducto }}</td>
              <td>{{ p.nombre }}</td>
              <td>{{ p.descripcion }}</td>
              <td>{{ p.precio }} €</td>
              <td>{{ p.categoria }}</td>
              <td>
                <span class="badge" :class="p.disponible ? 'disponible' : 'nodisponible'">
                  {{ p.disponible ? 'Sí' : 'No' }}
                </span>
              </td>
              <td class="actions">
                <button class="btn-edit" @click="openEditProducto(p)">✏️ Editar</button>
                <button class="btn-delete" @click="confirmDelete('producto', p.idProducto)">🗑️ Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p class="total">Total: {{ productos.length }} productos</p>
      </div>

      <!-- TABLA RESERVAS -->
      <div v-else-if="currentTab === 'reservas'" class="admin-card table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Mesa</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Personas</th>
              <th>Estado</th>
              <th>Fianza</th>
              <th>Pago</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in reservas" :key="r.idReserva">
              <td>{{ r.idReserva }}</td>
              <td>{{ r.idUsuario }}</td>
              <td>{{ r.idMesa }}</td>
              <td>{{ r.fecha }}</td>
              <td>{{ r.hora }}</td>
              <td>{{ r.numPersonas }}</td>
              <td>
                <span class="badge" :class="r.estado">{{ r.estado }}</span>
              </td>
              <td>{{ r.fianza }} €</td>
              <td>
                <span class="badge" :class="r.estadoPago">{{ r.estadoPago }}</span>
              </td>
              <td class="actions">
                <button class="btn-edit" @click="openEditReserva(r)">✏️ Editar</button>
                <button class="btn-delete" @click="confirmDelete('reserva', r.idReserva)">🗑️ Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p class="total">Total: {{ reservas.length }} reservas</p>
      </div>
    </main>

    <!-- MODAL EDITAR RESERVA -->
    <div v-if="modalReserva" class="modal-overlay" @click.self="modalReserva = false">
      <div class="modal">
        <h2>Editar reserva</h2>
        <div class="form-group">
          <label>Estado</label>
          <select v-model="editingReserva.estado">
            <option value="pendiente">Pendiente</option>
            <option value="confirmada">Confirmada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
        <div class="form-group">
          <label>Fecha</label>
          <input v-model="editingReserva.fecha" type="date" />
        </div>
        <div class="form-group">
          <label>Hora</label>
          <input v-model="editingReserva.hora" type="time" />
        </div>
        <div class="form-group">
          <label>Nº Personas</label>
          <input v-model="editingReserva.numPersonas" type="number" min="1" />
        </div>
        <div class="form-group">
          <label>Fianza (€)</label>
          <input v-model="editingReserva.fianza" type="number" step="0.01" />
        </div>
        <div class="form-group">
          <label>Estado pago</label>
          <select v-model="editingReserva.estadoPago">
            <option value="pendiente">Pendiente</option>
            <option value="pagado">Pagado</option>
            <option value="reembolsado">Reembolsado</option>
          </select>
        </div>
        <div class="form-group">
          <label>Método pago</label>
          <select v-model="editingReserva.metodoPago">
            <option value="">Sin método</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="modalReserva = false">Cancelar</button>
          <button class="btn-save" @click="saveReserva">Guardar</button>
        </div>
      </div>
    </div>

    <!-- MODAL EDITAR/CREAR USUARIO -->
    <div v-if="modalUsuario" class="modal-overlay" @click.self="modalUsuario = false">
      <div class="modal">
        <h2>{{ editingUsuario.idUsuario ? 'Editar usuario' : 'Nuevo usuario' }}</h2>
        <div class="form-group">
          <label>Nombre</label>
          <input v-model="editingUsuario.nombre" type="text" />
        </div>
        <div class="form-group">
          <label>Apellido</label>
          <input v-model="editingUsuario.apellido" type="text" />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="editingUsuario.email" type="email" />
        </div>
        <div class="form-group">
          <label>Rol</label>
          <select v-model="editingUsuario.rol">
            <option value="cliente">Cliente</option>
            <option value="empleado">Empleado</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="modalUsuario = false">Cancelar</button>
          <button class="btn-save" @click="saveUsuario">Guardar</button>
        </div>
      </div>
    </div>

    <!-- MODAL EDITAR/CREAR PRODUCTO -->
    <div v-if="modalProducto" class="modal-overlay" @click.self="modalProducto = false">
      <div class="modal">
        <h2>{{ editingProducto.idProducto ? 'Editar producto' : 'Nuevo producto' }}</h2>
        <div class="form-group">
          <label>Nombre</label>
          <input v-model="editingProducto.nombre" type="text" />
        </div>
        <div class="form-group">
          <label>Descripción</label>
          <input v-model="editingProducto.descripcion" type="text" />
        </div>
        <div class="form-group">
          <label>Precio (€)</label>
          <input v-model="editingProducto.precio" type="number" step="0.01" />
        </div>
        <div class="form-group">
          <label>Categoría</label>
          <input v-model="editingProducto.categoria" type="text" />
        </div>
        <div class="form-group checkbox-group">
          <label>
            <input v-model="editingProducto.disponible" type="checkbox" />
            Disponible
          </label>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="modalProducto = false">Cancelar</button>
          <button class="btn-save" @click="saveProducto">Guardar</button>
        </div>
      </div>
    </div>

    <!-- MODAL CONFIRMAR BORRADO -->
    <div v-if="deleteConfirm.show" class="modal-overlay" @click.self="deleteConfirm.show = false">
      <div class="modal modal-sm">
        <h2>¿Eliminar?</h2>
        <p>Esta acción no se puede deshacer.</p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="deleteConfirm.show = false">Cancelar</button>
          <button class="btn-delete" @click="executeDelete">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "vue-router";

const API = "/api";

const usuarios = ref([]);
const productos = ref([]);
const reservas = ref([]);
const loading = ref(true);
const error = ref("");
const currentTab = ref("usuarios");
const router = useRouter();

// Modales
const modalUsuario = ref(false);
const modalProducto = ref(false);
const modalReserva = ref(false);
const editingUsuario = ref({});
const editingProducto = ref({});
const editingReserva = ref({});
const deleteConfirm = ref({ show: false, type: "", id: null });

// ─── FETCH ───────────────────────────────────────────
const fetchUsuarios = async () => {
  loading.value = true;
  error.value = "";
  try {
    const res = await fetch(`${API}/Usuario`);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const json = await res.json();
    usuarios.value = json.value;
  } catch (e) {
    error.value = "No se pudieron cargar los usuarios.";
  } finally {
    loading.value = false;
  }
};

const fetchProductos = async () => {
  loading.value = true;
  error.value = "";
  try {
    const res = await fetch(`${API}/Producto`);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const json = await res.json();
    productos.value = json.value;
  } catch (e) {
    error.value = "No se pudieron cargar los productos.";
  } finally {
    loading.value = false;
  }
};

const fetchReservas = async () => {
  loading.value = true;
  error.value = "";
  try {
    const res = await fetch(`${API}/Reserva`);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const json = await res.json();
    reservas.value = json.value;
  } catch (e) {
    error.value = "No se pudieron cargar las reservas.";
  } finally {
    loading.value = false;
  }
};

watch(currentTab, (tab) => {
  if (tab === "usuarios") fetchUsuarios();
  else if (tab === "productos") fetchProductos();
  else fetchReservas();
});

// ─── USUARIOS ────────────────────────────────────────
const openEditUsuario = (user) => {
  editingUsuario.value = { ...user };
  modalUsuario.value = true;
};

const saveUsuario = async () => {
  const { idUsuario, nombre, apellido, email, rol } = editingUsuario.value;
  try {
    const res = await fetch(`${API}/Usuario/idUsuario/${idUsuario}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, apellido, email, rol }),
    });
    if (!res.ok) throw new Error();
    modalUsuario.value = false;
    fetchUsuarios();
  } catch {
    alert("Error al guardar el usuario.");
  }
};

// ─── PRODUCTOS ───────────────────────────────────────
const openEditProducto = (p) => {
  editingProducto.value = { ...p };
  modalProducto.value = true;
};

const openAddProducto = () => {
  editingProducto.value = { nombre: "", descripcion: "", precio: 0, categoria: "", disponible: true };
  modalProducto.value = true;
};

const saveProducto = async () => {
  const { idProducto, nombre, descripcion, precio, categoria, disponible } = editingProducto.value;
  const body = JSON.stringify({ nombre, descripcion, precio: parseFloat(precio), categoria, disponible });
  try {
    let res;
    if (idProducto) {
      res = await fetch(`${API}/Producto/idProducto/${idProducto}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body,
      });
    } else {
      res = await fetch(`${API}/Producto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
    }
    if (!res.ok) throw new Error();
    modalProducto.value = false;
    fetchProductos();
  } catch {
    alert("Error al guardar el producto.");
  }
};

// ─── RESERVAS ─────────────────────────────────────────
const openEditReserva = (r) => {
  editingReserva.value = { ...r };
  modalReserva.value = true;
};

const saveReserva = async () => {
  const { idReserva, estado, fecha, hora, numPersonas, fianza, estadoPago, metodoPago } = editingReserva.value;
  try {
    const res = await fetch(`${API}/Reserva/idReserva/${idReserva}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado, fecha, hora, numPersonas: parseInt(numPersonas), fianza: parseFloat(fianza), estadoPago, metodoPago }),
    });
    if (!res.ok) throw new Error();
    modalReserva.value = false;
    fetchReservas();
  } catch {
    alert("Error al guardar la reserva.");
  }
};

// ─── ELIMINAR ─────────────────────────────────────────
const confirmDelete = (type, id) => {
  deleteConfirm.value = { show: true, type, id };
};

const executeDelete = async () => {
  const { type, id } = deleteConfirm.value;
  const endpoint = type === "usuario"
    ? `${API}/Usuario/idUsuario/${id}`
    : type === "producto"
    ? `${API}/Producto/idProducto/${id}`
    : `${API}/Reserva/idReserva/${id}`;
  try {
    const res = await fetch(endpoint, { method: "DELETE" });
    if (!res.ok) throw new Error();
    deleteConfirm.value.show = false;
    if (type === "usuario") fetchUsuarios();
    else if (type === "producto") fetchProductos();
    else fetchReservas();
  } catch {
    alert("Error al eliminar.");
  }
};

// ─── AUTH ─────────────────────────────────────────────
const handleLogout = async () => {
  await signOut(getAuth());
  router.push("/login");
};

onMounted(fetchUsuarios);
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,400&family=Montserrat:wght@300;400;500;600&display=swap");

.admin-container {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
  height: 100vh;
  font-family: "Montserrat", sans-serif;
  background: #fdfbf9;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

/* SIDEBAR */
.admin-sidebar {
  background: #1a1410;
  color: #f5f0e8;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
  overflow-y: auto;
}
.sidebar-logo {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 3rem;
}
.sidebar-logo span {
  color: #c9963a;
  font-style: italic;
}
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}
.sidebar-nav button {
  background: transparent;
  border: none;
  color: #f5f0e8;
  text-align: left;
  padding: 12px 16px;
  font-family: "Montserrat", sans-serif;
  font-size: 0.85rem;
  cursor: pointer;
  border-radius: 4px;
  transition: 0.2s;
}
.sidebar-nav button.active,
.sidebar-nav button:hover {
  background: rgba(201, 150, 58, 0.2);
  color: #c9963a;
}
.btn-logout {
  background: transparent;
  border: 1px solid rgba(245, 240, 232, 0.15);
  color: rgba(245, 240, 232, 0.5);
  padding: 10px 16px;
  font-family: "Montserrat", sans-serif;
  font-size: 0.8rem;
  cursor: pointer;
  border-radius: 4px;
  text-align: left;
  transition: 0.2s;
}
.btn-logout:hover {
  border-color: #c9963a;
  color: #c9963a;
}

/* MAIN */
.admin-main {
  padding: 3rem;
  overflow-y: auto;
  height: 100vh;
}
.admin-header {
  margin-bottom: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.admin-header h1 {
  font-family: "Cormorant Garamond", serif;
  font-size: 2.5rem;
  font-weight: 300;
  color: #1a1410;
}
.btn-add {
  background: #c9963a;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-family: "Montserrat", sans-serif;
  font-size: 0.85rem;
  cursor: pointer;
  transition: 0.2s;
}
.btn-add:hover {
  background: #b8852e;
}

/* ESTADO */
.state-msg {
  padding: 2rem;
  text-align: center;
  color: #6b4c2a;
  font-size: 0.9rem;
}
.state-msg.error {
  color: #c0392b;
  background: #fdf0ee;
  border-radius: 4px;
}

/* TABLA */
.admin-card {
  background: white;
  border-radius: 4px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}
thead {
  background: #f8f5f2;
}
th {
  padding: 1rem 1.2rem;
  text-align: left;
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #6b4c2a;
  font-weight: 600;
}
td {
  padding: 1rem 1.2rem;
  border-bottom: 1px solid #f0ebe4;
  color: #2d2520;
}
tbody tr:last-child td {
  border-bottom: none;
}
tbody tr:hover {
  background: #fdfaf7;
}

/* ACCIONES */
.actions {
  display: flex;
  gap: 0.5rem;
}
.btn-edit {
  background: #f0f4ff;
  color: #3a5fc9;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: 0.2s;
  font-family: "Montserrat", sans-serif;
}
.btn-edit:hover {
  background: #dce6ff;
}
.btn-delete {
  background: #fff0f0;
  color: #c0392b;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: 0.2s;
  font-family: "Montserrat", sans-serif;
}
.btn-delete:hover {
  background: #ffd6d6;
}

/* BADGES */
.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: capitalize;
}
.badge.cliente { background: #e8f4ea; color: #2e7d32; }
.badge.empleado { background: #fff3e0; color: #e65100; }
.badge.admin { background: #fce4ec; color: #c62828; }
.badge.disponible { background: #e8f4ea; color: #2e7d32; }
.badge.nodisponible { background: #fce4ec; color: #c62828; }
.badge.confirmada { background: #e8f4ea; color: #2e7d32; }
.badge.pendiente { background: #fff3e0; color: #e65100; }
.badge.cancelada { background: #fce4ec; color: #c62828; }
.badge.pagado { background: #e8f4ea; color: #2e7d32; }
.badge.reembolsado { background: #e8f0fe; color: #3a5fc9; }

/* TOTAL */
.total {
  padding: 1rem 1.2rem;
  font-size: 0.75rem;
  color: #a89880;
  border-top: 1px solid #f0ebe4;
  text-align: right;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 20, 16, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal {
  background: white;
  border-radius: 6px;
  padding: 2rem;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.modal-sm {
  max-width: 320px;
  text-align: center;
}
.modal h2 {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.8rem;
  font-weight: 300;
  color: #1a1410;
  margin-bottom: 1.5rem;
}
.modal p {
  color: #6b4c2a;
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6b4c2a;
  margin-bottom: 0.4rem;
  font-weight: 600;
}
.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0d8d0;
  border-radius: 4px;
  font-family: "Montserrat", sans-serif;
  font-size: 0.85rem;
  color: #2d2520;
  background: #fdfbf9;
  box-sizing: border-box;
  transition: border-color 0.2s;
}
.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #c9963a;
}
.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: none;
  font-size: 0.85rem;
  cursor: pointer;
}
.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}
.btn-cancel {
  background: transparent;
  border: 1px solid #e0d8d0;
  color: #6b4c2a;
  padding: 10px 20px;
  border-radius: 4px;
  font-family: "Montserrat", sans-serif;
  font-size: 0.85rem;
  cursor: pointer;
  transition: 0.2s;
}
.btn-cancel:hover {
  border-color: #c9963a;
  color: #c9963a;
}
.btn-save {
  background: #c9963a;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-family: "Montserrat", sans-serif;
  font-size: 0.85rem;
  cursor: pointer;
  transition: 0.2s;
}
.btn-save:hover {
  background: #b8852e;
}
</style>