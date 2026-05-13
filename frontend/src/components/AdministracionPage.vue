<template>
  <div class="admin-container">
    <aside class="admin-sidebar">
      <RouterLink to="/" class="nav-logo">La <span>Brasa</span></RouterLink>
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
        <button v-if="currentTab === 'reservas'" class="btn-add" @click="openAddReserva">+ Nueva Reserva</button>
      </header>

      <div v-if="loading" class="state-msg">Conectando con la base de datos...</div>
      <div v-else-if="error" class="state-msg error">{{ error }}</div>

      <div v-else class="admin-card table-wrapper">
        <div class="table-wrapper">

        <!-- TABLA USUARIOS -->
        <table v-if="currentTab === 'usuarios'">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Apellidos</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in usuarios" :key="u.idUsuario">
              <td>{{ u.idUsuario }}</td>
              <td>{{ u.nombre }}</td>
              <td>{{ u.apellido }}</td>
              <td>{{ u.email }}</td>
              <td><span class="badge" :class="u.rol">{{ u.rol }}</span></td>
              <td class="actions">
                <button class="btn-edit" @click="openEditUsuario(u)">✏️ Editar</button>
                <button class="btn-delete" @click="confirmDelete('usuario', u.idUsuario)">🗑️ Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- TABLA PRODUCTOS -->
        <table v-if="currentTab === 'productos'">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Categoría</th>
              <th>Descripción</th>
              <th>Disponible</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in productos" :key="p.idProducto">
              <td>{{ p.idProducto }}</td>
              <td>{{ p.nombre }}</td>
              <td>{{ p.precio }}€</td>
              <td>{{ p.categoria }}</td>
              <td class="td-desc">{{ p.descripcion || '—' }}</td>
              <td><span class="badge" :class="p.disponible ? 'disponible' : 'nodisponible'">{{ p.disponible ? 'Sí' : 'No' }}</span></td>
              <td class="actions">
                <button class="btn-edit" @click="openEditProducto(p)">✏️ Editar</button>
                <button class="btn-delete" @click="confirmDelete('producto', p.idProducto)">🗑️ Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- TABLA MESAS -->
        <table v-if="currentTab === 'mesas'">
          <thead>
            <tr>
              <th>ID Mesa</th>
              <th>Capacidad</th>
              <th>Ubicación</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
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
                <button class="btn-edit" @click="openEditMesa(m)">✏️ Editar</button>
                <button class="btn-delete" @click="confirmDelete('mesa', m.idMesa)">🗑️ Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- TABLA RESERVAS -->
        <table v-if="currentTab === 'reservas'">
          <thead>
            <tr>
              <th>ID</th>
              <th>Mesa</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Personas</th>
              <th>Fianza</th>
              <th>Estado Pago</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in reservas" :key="r.idReserva">
              <td>{{ r.idReserva }}</td>
              <td>Mesa {{ r.idMesa }}</td>
              <td>{{ r.fecha }}</td>
              <td>{{ r.hora }}</td>
              <td>{{ r.numPersonas }}</td>
              <td>{{ r.fianza }}€</td>
              <td><span class="badge" :class="r.estadoPago === 'pagado' ? 'disponible' : 'nodisponible'">{{ r.estadoPago }}</span></td>
              <td class="actions">
                <button class="btn-edit" @click="openEditReserva(r)">✏️ Editar</button>
                <button class="btn-delete" @click="confirmDelete('reserva', r.idReserva)">🗑️ Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- ═══════════════════════════════════
         MODAL EDITAR / CREAR USUARIO
    ═══════════════════════════════════ -->
    <div v-if="modalUsuario" class="modal-overlay" @click.self="modalUsuario = false">
      <div class="modal">
        <h2>Editar Usuario</h2>
        <div class="form-group">
          <label>Nombre</label>
          <input v-model="editingUsuario.nombre" type="text" placeholder="Nombre" />
        </div>
        <div class="form-group">
          <label>Apellidos</label>
          <input v-model="editingUsuario.apellido" type="text" placeholder="Apellidos" />
        </div>
        <div class="form-group">
          <label>Email (no editable)</label>
          <input :value="editingUsuario.email" type="text" disabled class="input-disabled" />
        </div>
        <div class="form-group">
          <label>Rol</label>
          <select v-model="editingUsuario.rol">
            <option value="admin">admin</option>
            <option value="empleado">empleado</option>
            <option value="cliente">cliente</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="modalUsuario = false">Cancelar</button>
          <button class="btn-save" @click="saveUsuario">Guardar cambios</button>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════
         MODAL EDITAR / CREAR PRODUCTO
    ═══════════════════════════════════ -->
    <div v-if="modalProducto" class="modal-overlay" @click.self="modalProducto = false">
      <div class="modal">
        <h2>{{ editingProducto.idProducto ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
        <div class="form-group">
          <label>Nombre</label>
          <input v-model="editingProducto.nombre" type="text" placeholder="Nombre del producto" />
        </div>
        <div class="form-group">
          <label>Precio (€)</label>
          <input v-model="editingProducto.precio" type="number" step="0.01" min="0" placeholder="0.00" />
        </div>
        <div class="form-group">
          <label>Categoría</label>
          <input v-model="editingProducto.categoria" type="text" placeholder="Ej: Entrante, Principal, Postre..." />
        </div>
        <div class="form-group">
          <label>Descripción</label>
          <textarea v-model="editingProducto.descripcion" placeholder="Descripción del producto..." rows="3"></textarea>
        </div>
        <div class="form-group">
          <label>Disponible</label>
          <select v-model="editingProducto.disponible">
            <option :value="true">Sí</option>
            <option :value="false">No</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="modalProducto = false">Cancelar</button>
          <button class="btn-save" @click="saveProducto">Guardar en Base de Datos</button>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════
         MODAL EDITAR / CREAR MESA
    ═══════════════════════════════════ -->
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

    <!-- ═══════════════════════════════════
         MODAL EDITAR / CREAR RESERVA
    ═══════════════════════════════════ -->
    <div v-if="modalReserva" class="modal-overlay" @click.self="modalReserva = false">
      <div class="modal">
        <h2>{{ editingReserva.idReserva ? 'Editar Reserva #' + editingReserva.idReserva : 'Nueva Reserva' }}</h2>
        <div class="form-group">
          <label>ID Mesa</label>
          <input v-model="editingReserva.idMesa" type="number" min="1" placeholder="Número de mesa" />
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
          <label>Número de personas</label>
          <input v-model="editingReserva.numPersonas" type="number" min="1" placeholder="Pax" />
        </div>
        <div class="form-group">
          <label>Fianza (€)</label>
          <input v-model="editingReserva.fianza" type="number" step="0.01" min="0" placeholder="0.00" />
        </div>
        <div class="form-group">
          <label>Estado de pago</label>
          <select v-model="editingReserva.estadoPago">
            <option value="pendiente">Pendiente</option>
            <option value="pagado">Pagado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="modalReserva = false">Cancelar</button>
          <button class="btn-save" @click="saveReserva">Guardar en Base de Datos</button>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════
         MODAL CONFIRMACIÓN ELIMINAR
    ═══════════════════════════════════ -->
    <div v-if="deleteConfirm.show" class="modal-overlay">
      <div class="modal modal-sm">
        <div class="delete-icon">🗑️</div>
        <h2>¿Estás seguro?</h2>
        <p>Esta acción eliminará el registro permanentemente de la base de datos y no se puede deshacer.</p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="deleteConfirm.show = false">No, cancelar</button>
          <button class="btn-delete-confirm" @click="executeDelete">Sí, eliminar</button>
        </div>
      </div>
    </div>

    <!-- TOAST NOTIFICACIÓN -->
    <div v-if="toast.show" :class="['toast', toast.type]">{{ toast.msg }}</div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { getAuth, signOut, deleteUser } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
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

const modalUsuario  = ref(false);
const modalProducto = ref(false);
const modalMesa     = ref(false);
const modalReserva  = ref(false);
const editingUsuario  = ref({});
const editingProducto = ref({});
const editingMesa     = ref({});
const editingReserva  = ref({});
const deleteConfirm   = ref({ show: false, type: "", id: null });

const toast = ref({ show: false, type: "success", msg: "" });
const showToast = (msg, type = "success") => {
  toast.value = { show: true, type, msg };
  setTimeout(() => { toast.value.show = false; }, 3000);
};

// ─── CARGA DE DATOS ───────────────────────────────────
const refresh = async () => {
  loading.value = true;
  error.value = "";
  try {
    const endpoint = currentTab.value === 'usuarios'  ? 'Usuario'  :
                     currentTab.value === 'productos' ? 'Producto' :
                     currentTab.value === 'reservas'  ? 'Reserva'  : 'Mesa';

    const res = await fetch(`${API}/${endpoint}`);
    if (!res.ok) throw new Error();
    const data = await res.json();

    if (currentTab.value === 'usuarios')  usuarios.value  = data.value || data;
    if (currentTab.value === 'productos') productos.value = data.value || data;
    if (currentTab.value === 'reservas')  reservas.value  = data.value || data;
    if (currentTab.value === 'mesas')     mesas.value     = data.value || data;
  } catch {
    error.value = "Error al conectar con la API.";
  } finally {
    loading.value = false;
  }
};

watch(currentTab, refresh, { immediate: true });

// ─── USUARIOS ─────────────────────────────────────────
const openEditUsuario = (u) => {
  editingUsuario.value = { ...u };
  modalUsuario.value = true;
};

const saveUsuario = async () => {
  const { idUsuario, nombre, apellido, rol } = editingUsuario.value;
  try {
    const res = await fetch(`${API}/Usuario/idUsuario/${idUsuario}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, apellido, rol })
    });
    if (!res.ok) throw new Error();
    modalUsuario.value = false;
    showToast("Usuario actualizado correctamente.");
    refresh();
  } catch {
    showToast("Error al actualizar el usuario.", "error");
  }
};

// ─── PRODUCTOS ────────────────────────────────────────
const openAddProducto = () => {
  editingProducto.value = { nombre: "", precio: "", categoria: "", descripcion: "", disponible: true };
  modalProducto.value = true;
};

const openEditProducto = (p) => {
  editingProducto.value = { ...p };
  modalProducto.value = true;
};

const saveProducto = async () => {
  const { idProducto, nombre, precio, categoria, descripcion, disponible } = editingProducto.value;
  const payload = {
    nombre,
    precio: parseFloat(precio),
    categoria,
    descripcion,
    disponible: disponible === true || disponible === "true"
  };
  try {
    const url    = idProducto ? `${API}/Producto/idProducto/${idProducto}` : `${API}/Producto`;
    const method = idProducto ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error();
    modalProducto.value = false;
    showToast(idProducto ? "Producto actualizado." : "Producto creado.");
    refresh();
  } catch {
    showToast("Error al guardar el producto.", "error");
  }
};

// ─── MESAS ────────────────────────────────────────────
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
  const payload = {
    capacidad: parseInt(capacidad),
    ubicacion,
    disponible: disponible === true || disponible === "true"
  };
  try {
    const url    = idMesa ? `${API}/Mesa/idMesa/${idMesa}` : `${API}/Mesa`;
    const method = idMesa ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error();
    modalMesa.value = false;
    showToast(idMesa ? "Mesa actualizada." : "Mesa creada.");
    refresh();
  } catch {
    showToast("Error al guardar la mesa.", "error");
  }
};

// ─── RESERVAS ─────────────────────────────────────────
const openAddReserva = () => {
  editingReserva.value = { idMesa: "", fecha: "", hora: "", numPersonas: 1, fianza: 0, estadoPago: "pendiente" };
  modalReserva.value = true;
};

const openEditReserva = (r) => {
  editingReserva.value = { ...r };
  modalReserva.value = true;
};

const saveReserva = async () => {
  const { idReserva, idMesa, fecha, hora, numPersonas, fianza, estadoPago } = editingReserva.value;
  const payload = {
    idMesa: parseInt(idMesa),
    fecha,
    hora,
    numPersonas: parseInt(numPersonas),
    fianza: parseFloat(fianza),
    estadoPago
  };
  try {
    const url    = idReserva ? `${API}/Reserva/idReserva/${idReserva}` : `${API}/Reserva`;
    const method = idReserva ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error();
    modalReserva.value = false;
    showToast(idReserva ? "Reserva actualizada." : "Reserva creada.");
    refresh();
  } catch {
    showToast("Error al guardar la reserva.", "error");
  }
};

// ─── ELIMINAR ─────────────────────────────────────────
const confirmDelete = (type, id) => {
  deleteConfirm.value = { show: true, type, id };
};

// Busca el usuario en Firestore por email y borra su documento
async function deleteFromFirestore(email) {
  try {
    const db = getFirestore();
    const q = query(collection(db, "usuarios"), where("email", "==", email));
    const snap = await getDocs(q);
    const deletes = snap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletes);
    console.log("Firestore: documento eliminado para", email);
  } catch (e) {
    console.warn("Firestore: no se pudo eliminar el documento", e);
  }
}

// Borra el usuario de Firebase Auth (solo funciona si es el usuario actualmente logueado)
async function deleteFromFirebaseAuth(email) {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    // Solo se puede borrar si el email coincide con el usuario actual
    if (currentUser && currentUser.email === email) {
      await deleteUser(currentUser);
      console.log("Firebase Auth: usuario eliminado");
    } else {
      console.warn("Firebase Auth: no se puede borrar otro usuario desde el cliente. Usa Firebase Admin SDK en backend.");
    }
  } catch (e) {
    console.warn("Firebase Auth: error al eliminar", e);
  }
}

const executeDelete = async () => {
  const { type, id } = deleteConfirm.value;
  const endpointMap = {
    usuario:  "Usuario/idUsuario",
    producto: "Producto/idProducto",
    reserva:  "Reserva/idReserva",
    mesa:     "Mesa/idMesa"
  };

  try {
    // 1. Si es usuario, borramos también de Firebase
    if (type === "usuario") {
      const usuario = usuarios.value.find(u => u.idUsuario === id);
      if (usuario?.email) {
        await deleteFromFirestore(usuario.email);
        await deleteFromFirebaseAuth(usuario.email);
      }
    }

    // 2. Borramos de la BD (MySQL vía DAB)
    const res = await fetch(`${API}/${endpointMap[type]}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error();

    deleteConfirm.value.show = false;
    showToast("Registro eliminado correctamente.");
    refresh();
  } catch {
    deleteConfirm.value.show = false;
    showToast("No se pudo eliminar el registro.", "error");
  }
};

const handleLogout = () => {
  signOut(getAuth());
  router.push("/login");
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Montserrat:wght@400;600&display=swap");

.nav-logo {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.7rem;
  font-weight: 600;
  color: var(--cream, #f5f0e8);
  letter-spacing: 0.06em;
  text-decoration: none;
}

.nav-logo span {
  color: var(--gold, #c9963a);
  font-style: italic;
}
/* ── RESET TOTAL SCOPED ── */
.admin-container { all: initial; }

.admin-container,
.admin-container * {
  box-sizing: border-box !important;
  font-family: "Montserrat", sans-serif;
}

/* ── LAYOUT ── */
.admin-container {
  display: flex !important;
  flex-direction: row !important;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #fdfbf9;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
}

/* ── SIDEBAR ── */
.admin-sidebar {
  width: 240px !important;
  min-width: 240px !important;
  max-width: 240px !important;
  flex-shrink: 0 !important;
  height: 100vh !important;
  background: #1a1410 !important;
  color: #f5f0e8 !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: stretch !important;
  justify-content: flex-start !important;
  padding: 2rem 1rem !important;
  position: relative !important;
  z-index: 10 !important;
  overflow: hidden !important;
}

.sidebar-logo {
  font-family: "Cormorant Garamond", serif !important;
  font-size: 1.8rem !important;
  text-align: center !important;
  color: #f5f0e8 !important;
  letter-spacing: 1px !important;
  padding-bottom: 1.5rem !important;
  margin-bottom: 1rem !important;
  border-bottom: 1px solid rgba(255,255,255,0.1) !important;
  display: block !important;
  width: 100% !important;
  position: static !important;
  float: none !important;
  flex-shrink: 0 !important;
  line-height: 1.3 !important;
}
.sidebar-logo span { color: #c9963a !important; }

/* ── NAV (ACTUALIZADO) ── */
.sidebar-nav {
  display: flex !important;
  flex-direction: column !important;
  align-items: stretch !important;
  gap: 4px !important;
  width: 100% !important;
  flex: 1 !important;
  overflow-y: auto !important;
  position: static !important;
  /* Eliminamos padding lateral del contenedor para que el hover llegue al borde */
  margin: 0 -1rem !important; 
}

.sidebar-nav button {
  all: unset !important;
  box-sizing: border-box !important;
  display: flex !important;
  align-items: center !important;
  width: 100% !important;
  /* Aumentamos el padding lateral para compensar el margen negativo del contenedor */
  padding: 12px 24px !important; 
  border-radius: 0 !important; /* Cambiado a 0 para que cubra de borde a borde rectamente */
  font-family: "Montserrat", sans-serif !important;
  font-size: 0.88rem !important;
  color: #a89880 !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
  position: relative !important;
}

.sidebar-nav button.active {
  color: #fff !important;
  font-weight: 600 !important;
}

.sidebar-nav button:hover:not(.active) {
  
  color: #f5f0e8 !important;
  padding-left: 30px !important; /* Efecto sutil de desplazamiento al entrar */
}

/* ── LOGOUT ── */
.btn-logout {
  all: unset !important;
  box-sizing: border-box !important;
  display: block !important;
  width: 100% !important;
  flex-shrink: 0 !important;
  background: transparent !important;
  border: 1px solid rgba(255,255,255,0.12) !important;
  color: #888 !important;
  padding: 10px !important;
  border-radius: 7px !important;
  cursor: pointer !important;
  font-family: "Montserrat", sans-serif !important;
  font-size: 0.85rem !important;
  text-align: center !important;
  margin-top: 0.75rem !important;
  transition: all 0.2s !important;
}
.btn-logout:hover {
  background: rgba(211,47,47,0.15) !important;
  color: #ef9a9a !important;
  border-color: rgba(211,47,47,0.4) !important;
}

/* ── MAIN ── */
.admin-main {
  flex: 1 !important;
  min-width: 0 !important;
  height: 100vh !important;
  overflow-y: auto !important;
  padding: 2.5rem 3rem !important;
  background: #fdfbf9 !important;
  display: block !important;
}

.admin-header {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin-bottom: 2rem !important;
}

.admin-header h1 {
  font-family: "Cormorant Garamond", serif !important;
  font-size: 2.4rem !important;
  color: #1a1410 !important;
  margin: 0 !important;
  line-height: 1.2 !important;
}

.btn-add {
  flex-shrink: 0 !important;
  background: #c9963a !important;
  color: white !important;
  border: none !important;
  padding: 10px 22px !important;
  border-radius: 6px !important;
  font-family: "Montserrat", sans-serif !important;
  font-weight: 600 !important;
  font-size: 0.88rem !important;
  cursor: pointer !important;
  white-space: nowrap !important;
}
.btn-add:hover { background: #b8852e !important; }

/* ── CARD + TABLA ── */
.admin-card {
  background: white !important;
  border-radius: 10px !important;
  border: 1px solid #f0ebe4 !important;
  box-shadow: 0 4px 25px rgba(0,0,0,0.04) !important;
  overflow: hidden !important;
}

.table-wrapper { overflow-x: auto !important; }

table {
  width: 100% !important;
  border-collapse: collapse !important;
  min-width: 580px !important;
}

thead tr { background: #fcfaf8 !important; }

th {
  padding: 0.9rem 1.2rem !important;
  text-align: left !important;
  font-size: 0.7rem !important;
  text-transform: uppercase !important;
  letter-spacing: 1.2px !important;
  color: #8a735a !important;
  border-bottom: 2px solid #f0ebe4 !important;
  white-space: nowrap !important;
  font-weight: 600 !important;
}

td {
  padding: 0.9rem 1.2rem !important;
  border-bottom: 1px solid #f5f0ea !important;
  font-size: 0.88rem !important;
  color: #3a3830 !important;
  vertical-align: middle !important;
}

tbody tr:last-child td { border-bottom: none !important; }
tbody tr:hover { background: #fdfaf7 !important; }

.td-desc {
  max-width: 200px !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

/* ── BADGES ── */
.badge {
  display: inline-block !important;
  padding: 3px 10px !important;
  border-radius: 20px !important;
  font-size: 0.72rem !important;
  font-weight: 600 !important;
}
.badge.disponible   { background: #e8f5e9 !important; color: #2e7d32 !important; }
.badge.nodisponible { background: #ffebee !important; color: #c62828 !important; }
.badge.admin        { background: #fff1f1 !important; color: #d32f2f !important; }
.badge.empleado     { background: #e3f2fd !important; color: #1565c0 !important; }
.badge.cliente      { background: #f3e5f5 !important; color: #6a1b9a !important; }
.badge.pendiente    { background: #fff8e1 !important; color: #e65100 !important; }
.badge.pagado       { background: #e8f5e9 !important; color: #2e7d32 !important; }
.badge.cancelado    { background: #ffebee !important; color: #c62828 !important; }

/* ── ACCIONES ── */
.actions {
  display: flex !important;
  gap: 6px !important;
  align-items: center !important;
}

.btn-edit,
.btn-delete {
  all: unset !important;
  box-sizing: border-box !important;
  border: 1px solid #e8e3dc !important;
  padding: 5px 12px !important;
  border-radius: 5px !important;
  cursor: pointer !important;
  font-size: 0.78rem !important;
  font-weight: 600 !important;
  font-family: "Montserrat", sans-serif !important;
  white-space: nowrap !important;
  background: #f8f6f3 !important;
  color: #5a5040 !important;
}
.btn-edit:hover   { background: #eef2ff !important; color: #3f51b5 !important; border-color: #c5cae9 !important; }
.btn-delete:hover { background: #fff0f0 !important; color: #d32f2f !important; border-color: #ffcdd2 !important; }

/* ── MENSAJES ── */
.state-msg {
  padding: 4rem !important;
  text-align: center !important;
  color: #8a735a !important;
  font-size: 0.95rem !important;
}
.state-msg.error { color: #d32f2f !important; }

/* ── MODALES ── */
.modal-overlay {
  position: fixed !important;
  inset: 0 !important;
  background: rgba(20,14,10,0.7) !important;
  backdrop-filter: blur(3px) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 9999 !important;
}

.modal {
  background: white !important;
  padding: 2.5rem !important;
  border-radius: 12px !important;
  width: 90% !important;
  max-width: 460px !important;
  max-height: 90vh !important;
  overflow-y: auto !important;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2) !important;
}

.modal h2 {
  font-family: "Cormorant Garamond", serif !important;
  font-size: 1.6rem !important;
  color: #1a1410 !important;
  margin-bottom: 1.5rem !important;
}

.modal-sm { max-width: 380px !important; text-align: center !important; }
.modal-sm p { color: #666 !important; margin-top: 0.4rem !important; font-size: 0.9rem !important; }
.delete-icon { font-size: 2.5rem !important; }

.form-group { margin-bottom: 1.2rem !important; }

.form-group label {
  display: block !important;
  font-size: 0.73rem !important;
  font-weight: 600 !important;
  color: #6b4c2a !important;
  margin-bottom: 6px !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100% !important;
  padding: 10px 14px !important;
  border: 1px solid #ddd !important;
  border-radius: 6px !important;
  font-size: 0.9rem !important;
  font-family: "Montserrat", sans-serif !important;
  color: #1a1410 !important;
  background: white !important;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none !important;
  border-color: #c9963a !important;
  box-shadow: 0 0 0 3px rgba(201,150,58,0.1) !important;
}

.form-group textarea { resize: vertical !important; }
.input-disabled { background: #f5f5f5 !important; color: #999 !important; cursor: not-allowed !important; }

.modal-actions {
  display: flex !important;
  justify-content: flex-end !important;
  gap: 10px !important;
  margin-top: 1.8rem !important;
}

.btn-cancel {
  all: unset !important;
  box-sizing: border-box !important;
  background: #f5f0e8 !important;
  padding: 10px 20px !important;
  border-radius: 6px !important;
  cursor: pointer !important;
  font-family: "Montserrat", sans-serif !important;
  font-size: 0.88rem !important;
  color: #555 !important;
}
.btn-cancel:hover { background: #ede8df !important; }

.btn-save {
  all: unset !important;
  box-sizing: border-box !important;
  background: #c9963a !important;
  color: white !important;
  padding: 10px 22px !important;
  border-radius: 6px !important;
  cursor: pointer !important;
  font-family: "Montserrat", sans-serif !important;
  font-weight: 600 !important;
  font-size: 0.88rem !important;
}
.btn-save:hover { background: #b8852e !important; }

.btn-delete-confirm {
  all: unset !important;
  box-sizing: border-box !important;
  background: #d32f2f !important;
  color: white !important;
  padding: 10px 22px !important;
  border-radius: 6px !important;
  cursor: pointer !important;
  font-family: "Montserrat", sans-serif !important;
  font-weight: 600 !important;
  font-size: 0.88rem !important;
}
.btn-delete-confirm:hover { background: #b71c1c !important; }

/* ── TOAST ── */
.toast {
  position: fixed !important;
  bottom: 2rem !important;
  right: 2rem !important;
  padding: 14px 24px !important;
  border-radius: 8px !important;
  font-family: "Montserrat", sans-serif !important;
  font-size: 0.9rem !important;
  font-weight: 600 !important;
  z-index: 99999 !important;
  box-shadow: 0 6px 20px rgba(0,0,0,0.15) !important;
  animation: slideIn 0.3s ease !important;
}
.toast.success { background: #2e7d32 !important; color: white !important; }
.toast.error   { background: #c62828 !important; color: white !important; }

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>