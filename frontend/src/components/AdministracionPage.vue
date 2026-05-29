<template>
  <div class="admin-wrapper">
    <Cabecera />
    <div class="admin-container">

      <!-- SIDEBAR -->
      <aside class="admin-sidebar">
        <nav class="sidebar-nav">
          <button :class="{ active: currentTab === 'usuarios' }" @click="currentTab = 'usuarios'">👤 Usuarios</button>
          <button :class="{ active: currentTab === 'productos' }" @click="currentTab = 'productos'">🍽️ Productos</button>
          <button :class="{ active: currentTab === 'reservas' }" @click="currentTab = 'reservas'">📅 Reservas</button>
          <button :class="{ active: currentTab === 'mesas' }" @click="currentTab = 'mesas'">🪑 Mesas</button>
        </nav>
      </aside>

      <!-- MAIN -->
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
                  <td><span class="badge" :class="u.rolVisual">{{ u.rolVisual }}</span></td>
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
                  <td>{{ formatHora(r.hora) }}</td>
                  <td>{{ r.numPersonas }}</td>
                  <td>{{ formatFianza(r.fianza, r.numPersonas) }}</td>
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
    </div>

    <!-- ═══ MODAL EDITAR / CREAR USUARIO ═══ -->
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

    <!-- ═══ MODAL EDITAR / CREAR PRODUCTO ═══ -->
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
          <select v-model="editingProducto.categoria">
            <option v-for="categoria in categoriasProducto" :key="categoria" :value="categoria">
              {{ categoria }}
            </option>
          </select>
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

    <!-- ═══ MODAL EDITAR / CREAR MESA ═══ -->
    <div v-if="modalMesa" class="modal-overlay" @click.self="modalMesa = false">
      <div class="modal">
        <h2>{{ editingMesa.idMesa ? 'Editar Mesa #' + editingMesa.idMesa : 'Nueva Mesa' }}</h2>
        <div class="form-group">
          <label>Capacidad (personas)</label>
          <input v-model="editingMesa.capacidad" type="number" min="1" />
        </div>
        <div class="form-group">
          <label>Ubicación</label>
          <select v-model="editingMesa.ubicacion">
            <option v-for="ubicacion in ubicacionesMesa" :key="ubicacion" :value="ubicacion">
              {{ ubicacion }}
            </option>
          </select>
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

    <!-- ═══ MODAL EDITAR / CREAR RESERVA ═══ -->
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

    <!-- ═══ MODAL CONFIRMACIÓN ELIMINAR ═══ -->
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

    <!-- TOAST -->
    <div v-if="toast.show" :class="['toast', toast.type]">{{ toast.msg }}</div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { getAuth, signOut, deleteUser } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { useRouter } from "vue-router";
import Cabecera from "./Cabecera.vue";
import Footer from "./Footer.vue";

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

const categoriasProducto = [
  "Entrantes",
  "Carnes",
  "Pescados",
  "Postres",
  "Bebidas"
];

const ubicacionesMesa = [
  "Interior",
  "Terraza"
];

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
const normalizarFianza = (fianza, personas) => {
  const importe = Number(fianza);
  if (!Number.isFinite(importe)) return 0;

  const importeEsperado = Number(personas || 0) * 2.5;

  if (importeEsperado && Math.abs(importe / 10 - importeEsperado) < 0.01) {
    return importe / 10;
  }

  return importe;
};

const formatFianza = (fianza, personas) =>
  `${normalizarFianza(fianza, personas).toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}€`;

const formatHora = (hora) => String(hora || "").substring(0, 5);

const cargarUsuariosConRolVisual = async () => {
  const [usuariosData, administradoresData] = await Promise.all([
    fetch(`${API}/Usuario`).then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    }),
    fetch(`${API}/Administrador`).then(res => res.ok ? res.json() : { value: [] })
  ]);

  const administradoresIds = new Set(
    (administradoresData.value || administradoresData || []).map(a => Number(a.idUsuario))
  );

  usuarios.value = (usuariosData.value || usuariosData || []).map(u => ({
    ...u,
    rolVisual: administradoresIds.has(Number(u.idUsuario)) ? "admin" : u.rol
  }));
};

const refresh = async () => {
  loading.value = true;
  error.value = "";
  try {
    if (currentTab.value === 'usuarios') {
      await cargarUsuariosConRolVisual();
      return;
    }

    const endpoint = currentTab.value === 'usuarios'  ? 'Usuario'  :
                     currentTab.value === 'productos' ? 'Producto' :
                     currentTab.value === 'reservas'  ? 'Reserva'  : 'Mesa';

    const res = await fetch(`${API}/${endpoint}`);
    if (!res.ok) throw new Error();
    const data = await res.json();

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
  editingUsuario.value = { ...u, rol: u.rolVisual || u.rol };
  modalUsuario.value = true;
};

const saveUsuario = async () => {
  const { idUsuario, nombre, apellido, rol } = editingUsuario.value;
  const rolUsuario = rol === "admin" ? "empleado" : rol;

  try {
    const res = await fetch(`${API}/Usuario/idUsuario/${idUsuario}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, apellido, rol: rolUsuario })
    });
    if (!res.ok) throw new Error(await res.text());

    await syncUsuarioRol(idUsuario, rol);

    modalUsuario.value = false;
    showToast("Usuario actualizado correctamente.");
    refresh();
  } catch (e) {
    console.error("Error actualizando usuario:", e);
    showToast("Error al actualizar el usuario.", "error");
  }
};

// ─── PRODUCTOS ────────────────────────────────────────
const openAddProducto = () => {
  editingProducto.value = { nombre: "", precio: "", categoria: "Entrantes", descripcion: "", disponible: true };
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
  editingMesa.value = { capacidad: 2, ubicacion: "Interior", disponible: true };
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

const deleteApi = async (url, { ignoreNotFound = false } = {}) => {
  const res = await fetch(url, { method: "DELETE" });
  if (ignoreNotFound && res.status === 404) return;
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `Error ${res.status} al eliminar ${url}`);
  }
};

const fetchApiList = async (entity, filter = "") => {
  const url = filter
      ? `${API}/${entity}?$filter=${encodeURIComponent(filter)}`
      : `${API}/${entity}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return data.value || data || [];
};

const postApi = async (url, body, { ignoreConflict = false } = {}) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (ignoreConflict && (res.status === 409 || res.status === 400)) return;
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `Error ${res.status} al crear ${url}`);
  }
};

const ensureEmpleado = async (idUsuario, puesto = "mesero") => {
  const id = Number(idUsuario);
  const empleado = await fetchApiList("Empleado", `idUsuario eq ${id}`);

  if (empleado.length) {
    await fetch(`${API}/Empleado/idUsuario/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ puesto }),
    });
    return;
  }

  await postApi(`${API}/Empleado`, { idUsuario: id, puesto }, { ignoreConflict: true });
};

const ensureAdministrador = async (idUsuario) => {
  const id = Number(idUsuario);
  const administrador = await fetchApiList("Administrador", `idUsuario eq ${id}`);

  if (!administrador.length) {
    await postApi(`${API}/Administrador`, { idUsuario: id }, { ignoreConflict: true });
  }
};

const syncUsuarioRol = async (idUsuario, rolVisual) => {
  if (rolVisual === "admin") {
    await ensureEmpleado(idUsuario, "administrador");
    await ensureAdministrador(idUsuario);
    return;
  }

  if (rolVisual === "empleado") {
    await deleteApi(`${API}/Administrador/idUsuario/${Number(idUsuario)}`, { ignoreNotFound: true });
    await ensureEmpleado(idUsuario, "mesero");
    return;
  }

  if (rolVisual === "cliente") {
    const id = Number(idUsuario);
    await deleteApi(`${API}/Administrador/idUsuario/${id}`, { ignoreNotFound: true });
    await deleteApi(`${API}/Empleado/idUsuario/${id}`, { ignoreNotFound: true });
    const clientes = await fetchApiList("Cliente", `idUsuario eq ${id}`);
    if (!clientes.length) {
      await postApi(`${API}/Cliente`, { idUsuario: id }, { ignoreConflict: true });
    }
  }
};

const deleteUsuarioRelations = async (idUsuario) => {
  const id = Number(idUsuario);
  const [reservasUsuario, cliente, empleado, cocinero, administrador] = await Promise.all([
    fetchApiList("Reserva", `idUsuario eq ${id}`),
    fetchApiList("Cliente", `idUsuario eq ${id}`),
    fetchApiList("Empleado", `idUsuario eq ${id}`),
    fetchApiList("Cocinero", `idUsuario eq ${id}`),
    fetchApiList("Administrador", `idUsuario eq ${id}`)
  ]);

  await Promise.all(reservasUsuario.map(r => deleteApi(`${API}/Reserva/idReserva/${r.idReserva}`)));
  if (cocinero.length) await deleteApi(`${API}/Cocinero/idUsuario/${id}`);
  if (administrador.length) await deleteApi(`${API}/Administrador/idUsuario/${id}`);
  if (empleado.length) await deleteApi(`${API}/Empleado/idUsuario/${id}`);
  if (cliente.length) await deleteApi(`${API}/Cliente/idUsuario/${id}`);
};

const cleanupFirebaseUser = async (email) => {
  if (!email) return;
  await deleteFromFirestore(email);
  await deleteFromFirebaseAuth(email);
};

async function deleteFromFirestore(email) {
  try {
    const db = getFirestore();
    const q = query(collection(db, "usuarios"), where("email", "==", email));
    const snap = await getDocs(q);
    await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
  } catch (e) {
    console.warn("Firestore: no se pudo eliminar el documento", e);
  }
}

async function deleteFromFirebaseAuth(email) {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.email === email) {
      await deleteUser(currentUser);
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
    let usuarioEmail = "";
    if (type === "usuario") {
      const usuario = usuarios.value.find(u => u.idUsuario === id);
      usuarioEmail = usuario?.email || "";
      await deleteUsuarioRelations(id);
    }

    await deleteApi(`${API}/${endpointMap[type]}/${id}`);
    deleteConfirm.value.show = false;
    showToast("Registro eliminado correctamente.");
    refresh();

    if (type === "usuario" && usuarioEmail) {
      cleanupFirebaseUser(usuarioEmail);
    }
  } catch (e) {
    console.error("Error al eliminar:", e);
    deleteConfirm.value.show = false;
    showToast("No se pudo eliminar el registro.", "error");
  }
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Montserrat:wght@400;600&display=swap");

/* ── WRAPPER: ocupa el espacio bajo el NavBar ── */
.admin-wrapper {
  padding-top: 72px;
  min-height: 100vh;
  background: #f7f2ea;
  box-sizing: border-box;
}

/* ── LAYOUT: sidebar + contenido ── */
.admin-container {
  display: flex;
  min-height: calc(100vh - 72px);
}

/* ── SIDEBAR ── */
.admin-sidebar {
  width: 208px;
  min-width: 208px;
  background: linear-gradient(180deg, #1a1410 0%, #22180f 100%);
  display: flex;
  flex-direction: column;
  padding: 1.4rem 0;
  position: sticky;
  top: 72px;
  height: calc(100vh - 72px);
  overflow-y: auto;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.sidebar-nav button {
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 11px 22px;
  font-family: "Montserrat", sans-serif;
  font-size: 0.82rem;
  color: #a89880;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.sidebar-nav button.active {
  color: #fff;
  font-weight: 600;
  border-left-color: #c9963a;
  background: rgba(201, 150, 58, 0.1);
}

.sidebar-nav button:hover:not(.active) {
  color: #f5f0e8;
  background: rgba(255, 255, 255, 0.05);
  padding-left: 30px;
}

/* ── MAIN ── */
.admin-main {
  flex: 1;
  min-width: 0;
  padding: 2.6rem 3rem;
  background: #f7f2ea;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1180px;
  margin: 0 auto 1.8rem;
}

.admin-header h1 {
  font-family: "Cormorant Garamond", serif;
  font-size: 2.2rem;
  color: #1a1410;
  margin: 0;
  line-height: 1.2;
}

.btn-add {
  background: #c9963a;
  color: white;
  border: none;
  padding: 10px 22px;
  border-radius: 6px;
  font-family: "Montserrat", sans-serif;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}
.btn-add:hover { background: #b8852e; }

/* ── CARD + TABLA ── */
.admin-card {
  background: white;
  border-radius: 6px;
  border: 1px solid #e9dfd2;
  box-shadow: 0 10px 30px rgba(26, 20, 16, 0.05);
  overflow: hidden;
  max-width: 1180px;
  margin: 0 auto;
}

.table-wrapper { overflow-x: auto; }

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 760px;
  table-layout: fixed;
}

th:last-child,
td:last-child {
  width: 210px;
}

thead tr { background: #fcfaf8; }

th {
  padding: 0.85rem 1rem;
  text-align: left;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: #8a735a;
  border-bottom: 2px solid #f0ebe4;
  white-space: nowrap;
  font-weight: 600;
}

td {
  padding: 0.82rem 1rem;
  border-bottom: 1px solid #f5f0ea;
  font-size: 0.88rem;
  color: #3a3830;
  vertical-align: middle;
}

tbody tr:last-child td { border-bottom: none; }
tbody tr:hover { background: #fdfaf7; }

.td-desc {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── BADGES ── */
.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 600;
}
.badge.disponible   { background: #e8f5e9; color: #2e7d32; }
.badge.nodisponible { background: #ffebee; color: #c62828; }
.badge.admin        { background: #fff1f1; color: #d32f2f; }
.badge.empleado     { background: #e3f2fd; color: #1565c0; }
.badge.cliente      { background: #f3e5f5; color: #6a1b9a; }
.badge.pendiente    { background: #fff8e1; color: #e65100; }
.badge.pagado       { background: #e8f5e9; color: #2e7d32; }
.badge.cancelado    { background: #ffebee; color: #c62828; }

/* ── ACCIONES ── */
.actions {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: flex-start;
}

.btn-edit,
.btn-delete {
  border: 1px solid #e8e3dc;
  padding: 5px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: "Montserrat", sans-serif;
  white-space: nowrap;
  background: #f8f6f3;
  color: #5a5040;
}
.btn-edit:hover   { background: #eef2ff; color: #3f51b5; border-color: #c5cae9; }
.btn-delete:hover { background: #fff0f0; color: #d32f2f; border-color: #ffcdd2; }

/* ── MENSAJES ── */
.state-msg {
  padding: 4rem;
  text-align: center;
  color: #8a735a;
  font-size: 0.95rem;
}
.state-msg.error { color: #d32f2f; }

/* ── MODALES ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(20,14,10,0.7);
  backdrop-filter: blur(3px);
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
  max-width: 460px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}

.modal h2 {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.6rem;
  color: #1a1410;
  margin-bottom: 1.5rem;
}

.modal-sm { max-width: 380px; text-align: center; }
.modal-sm p { color: #666; margin-top: 0.4rem; font-size: 0.9rem; }
.delete-icon { font-size: 2.5rem; }

.form-group { margin-bottom: 1.2rem; }

.form-group label {
  display: block;
  font-size: 0.73rem;
  font-weight: 600;
  color: #6b4c2a;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  font-family: "Montserrat", sans-serif;
  color: #1a1410;
  background: white;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #c9963a;
  box-shadow: 0 0 0 3px rgba(201,150,58,0.1);
}

.form-group textarea { resize: vertical; }
.input-disabled { background: #f5f5f5; color: #999; cursor: not-allowed; }

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 1.8rem;
}

.btn-cancel {
  background: #f5f0e8;
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-family: "Montserrat", sans-serif;
  font-size: 0.88rem;
  color: #555;
}
.btn-cancel:hover { background: #ede8df; }

.btn-save {
  background: #c9963a;
  color: white;
  padding: 10px 22px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-family: "Montserrat", sans-serif;
  font-weight: 600;
  font-size: 0.88rem;
}
.btn-save:hover { background: #b8852e; }

.btn-delete-confirm {
  background: #d32f2f;
  color: white;
  padding: 10px 22px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-family: "Montserrat", sans-serif;
  font-weight: 600;
  font-size: 0.88rem;
}
.btn-delete-confirm:hover { background: #b71c1c; }

/* ── TOAST ── */
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 14px 24px;
  border-radius: 8px;
  font-family: "Montserrat", sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  z-index: 99999;
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
  animation: slideIn 0.3s ease;
}
.toast.success { background: #2e7d32; color: white; }
.toast.error   { background: #c62828; color: white; }

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .admin-container { flex-direction: column; }
  .admin-sidebar {
    width: 100%;
    height: auto;
    position: static;
    flex-direction: row;
    padding: 0.5rem;
    overflow-x: auto;
  }
  .sidebar-nav { flex-direction: row; gap: 0; }
  .sidebar-nav button { padding: 10px 16px; border-left: none; border-bottom: 3px solid transparent; white-space: nowrap; }
  .sidebar-nav button.active { border-left-color: transparent; border-bottom-color: #c9963a; }
  .admin-main { padding: 1.5rem; }
}
</style>
