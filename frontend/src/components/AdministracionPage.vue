<template>
  <div class="admin-page">
    <Cabecera />

    <!-- MOBILE: barra de navegación inferior -->
    <nav class="mobile-tab-bar">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['mobile-tab-btn', { active: currentTab === tab.key }]"
        @click="currentTab = tab.key; sidebarOpen = false"
      >
        <span class="mobile-tab-icon">{{ tab.icon }}</span>
        <span class="mobile-tab-label">{{ tab.label }}</span>
      </button>
    </nav>

    <!-- OVERLAY sidebar móvil -->
    <div
      v-if="sidebarOpen"
      class="sidebar-overlay"
      @click="sidebarOpen = false"
    ></div>

    <div class="admin-container">
      <!-- SIDEBAR -->
      <aside :class="['admin-sidebar', { open: sidebarOpen }]">
        <button class="sidebar-close" @click="sidebarOpen = false">✕</button>
        <nav class="sidebar-nav">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            :class="{ active: currentTab === tab.key }"
            @click="currentTab = tab.key; sidebarOpen = false"
          >
            {{ tab.icon }} {{ tab.label }}
          </button>
        </nav>
        <button class="btn-logout" @click="handleLogout">
          🚪 Cerrar sesión
        </button>
      </aside>

      <main class="admin-main">
        <header class="admin-header">
          <!-- Hamburguesa solo en tablet -->
          <button class="hamburger" @click="sidebarOpen = true">
            <span></span><span></span><span></span>
          </button>
          <h1>{{ tabTitles[currentTab] }}</h1>
          <div class="header-actions">
            <button
              v-if="currentTab === 'productos'"
              class="btn-add"
              @click="openAddProducto"
            >
              <span class="btn-add-icon">+</span>
              <span class="btn-add-text">Nuevo Producto</span>
            </button>
            <button
              v-if="currentTab === 'mesas'"
              class="btn-add"
              @click="openAddMesa"
            >
              <span class="btn-add-icon">+</span>
              <span class="btn-add-text">Nueva Mesa</span>
            </button>
            <button
              v-if="currentTab === 'reservas'"
              class="btn-add"
              @click="openAddReserva"
            >
              <span class="btn-add-icon">+</span>
              <span class="btn-add-text">Nueva Reserva</span>
            </button>
          </div>
        </header>

        <div v-if="loading" class="state-msg">
          Conectando con la base de datos...
        </div>

        <div v-else-if="error" class="state-msg error">{{ error }}</div>

        <div v-else class="admin-card">
          <div class="table-wrapper">

            <!-- TABLA USUARIOS -->
            <table v-if="currentTab === 'usuarios'">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th class="hide-mobile">Apellidos</th>
                  <th class="hide-mobile">Email</th>
                  <th>Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="u in usuarios" :key="u.idUsuario">
                  <td>{{ u.idUsuario }}</td>
                  <td>
                    <div>{{ u.nombre }}</div>
                    <div class="show-mobile sub-text">{{ u.email }}</div>
                  </td>
                  <td class="hide-mobile">{{ u.apellido }}</td>
                  <td class="hide-mobile">{{ u.email }}</td>
                  <td>
                    <span class="badge" :class="u.rolVisual">{{ u.rolVisual }}</span>
                  </td>
                  <td class="actions">
                    <button class="btn-edit" @click="openEditUsuario(u)">✏️</button>
                    <button class="btn-delete" @click="confirmDelete('usuario', u.idUsuario)">🗑️</button>
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
                  <th class="hide-mobile">Precio</th>
                  <th class="hide-mobile">Categoría</th>
                  <th class="hide-tablet">Descripción</th>
                  <th>Disponible</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in productos" :key="p.idProducto">
                  <td>{{ p.idProducto }}</td>
                  <td>
                    <div>{{ p.nombre }}</div>
                    <div class="show-mobile sub-text">{{ formatPrecio(p.precio) }} · {{ p.categoria }}</div>
                  </td>
                  <td class="hide-mobile">{{ formatPrecio(p.precio) }}</td>
                  <td class="hide-mobile">{{ p.categoria }}</td>
                  <td class="td-desc hide-tablet">{{ p.descripcion || "—" }}</td>
                  <td>
                    <span class="badge" :class="p.disponible ? 'disponible' : 'nodisponible'">
                      {{ p.disponible ? "Sí" : "No" }}
                    </span>
                  </td>
                  <td class="actions">
                    <button class="btn-edit" @click="openEditProducto(p)">✏️</button>
                    <button class="btn-delete" @click="confirmDelete('producto', p.idProducto)">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- TABLA MESAS -->
            <table v-if="currentTab === 'mesas'">
              <thead>
                <tr>
                  <th>Mesa</th>
                  <th>Capacidad</th>
                  <th class="hide-mobile">Ubicación</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="m in mesas" :key="m.idMesa">
                  <td><strong>#{{ m.idMesa }}</strong></td>
                  <td>
                    <div>{{ m.capacidad }} pers.</div>
                    <div class="show-mobile sub-text">{{ m.ubicacion }}</div>
                  </td>
                  <td class="hide-mobile">{{ m.ubicacion }}</td>
                  <td>
                    <span class="badge" :class="m.disponible ? 'disponible' : 'nodisponible'">
                      {{ m.disponible ? "Disponible" : "Ocupada" }}
                    </span>
                  </td>
                  <td class="actions">
                    <button class="btn-edit" @click="openEditMesa(m)">✏️</button>
                    <button class="btn-delete" @click="confirmDelete('mesa', m.idMesa)">🗑️</button>
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
                  <th class="hide-mobile">Hora</th>
                  <th class="hide-mobile">Personas</th>
                  <th class="hide-tablet">Fianza</th>
                  <th>Pago</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in reservas" :key="r.idReserva">
                  <td>{{ r.idReserva }}</td>
                  <td>Mesa {{ r.idMesa }}</td>
                  <td>
                    <div>{{ r.fecha }}</div>
                    <div class="show-mobile sub-text">{{ formatHora(r.hora) }} · {{ r.numPersonas }} pers.</div>
                  </td>
                  <td class="hide-mobile">{{ formatHora(r.hora) }}</td>
                  <td class="hide-mobile">{{ r.numPersonas }}</td>
                  <td class="hide-tablet">{{ formatFianza(r.fianza, r.numPersonas) }}</td>
                  <td>
                    <span class="badge" :class="r.estadoPago === 'pagado' ? 'disponible' : 'nodisponible'">
                      {{ r.estadoPago }}
                    </span>
                  </td>
                  <td class="actions">
                    <button class="btn-edit" @click="openEditReserva(r)">✏️</button>
                    <button class="btn-delete" @click="confirmDelete('reserva', r.idReserva)">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>

          </div>
        </div>
      </main>
    </div>

    <!-- ═══ MODAL USUARIO ═══ -->
    <div v-if="modalUsuario" class="modal-overlay" @click.self="modalUsuario = false">
      <div class="modal">
        <button class="modal-x" @click="modalUsuario = false">✕</button>
        <h2>Editar Usuario</h2>
        <div class="form-grid">
          <div class="form-group">
            <label>Nombre</label>
            <input v-model="editingUsuario.nombre" type="text" placeholder="Nombre" />
          </div>
          <div class="form-group">
            <label>Apellidos</label>
            <input v-model="editingUsuario.apellido" type="text" placeholder="Apellidos" />
          </div>
          <div class="form-group full">
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
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="modalUsuario = false">Cancelar</button>
          <button class="btn-save" @click="saveUsuario">Guardar cambios</button>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL PRODUCTO ═══ -->
    <div v-if="modalProducto" class="modal-overlay" @click.self="modalProducto = false">
      <div class="modal">
        <button class="modal-x" @click="modalProducto = false">✕</button>
        <h2>{{ editingProducto.idProducto ? "Editar Producto" : "Nuevo Producto" }}</h2>
        <div class="form-grid">
          <div class="form-group full">
            <label>Nombre</label>
            <input v-model="editingProducto.nombre" type="text" placeholder="Nombre del producto" />
          </div>
          <div class="form-group">
            <label>Precio (€)</label>
            <input v-model="editingProducto.precio" type="text" inputmode="decimal" placeholder="0,00" />
          </div>
          <div class="form-group">
            <label>Categoría</label>
            <select v-model="editingProducto.categoria">
              <option v-for="cat in categoriasProducto" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div class="form-group full">
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
          <div class="form-group full">
            <label>Imagen del producto</label>
            <div class="img-upload-area">
              <img v-if="editingProducto.imagen_url" :src="editingProducto.imagen_url" class="img-preview" />
              <div v-else class="img-placeholder">📷 Sin imagen</div>
              <input type="file" accept="image/*" @change="onImageSelected" class="file-input" ref="fileInputRef" />
              <div class="img-btns">
                <button type="button" class="btn-upload" @click="fileInputRef.click()" :disabled="uploadingImage">
                  {{ uploadingImage ? "Subiendo…" : "📤 Seleccionar imagen" }}
                </button>
                <button v-if="editingProducto.imagen_url" type="button" class="btn-remove-img" @click="editingProducto.imagen_url = ''">
                  ✕ Quitar
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="modalProducto = false">Cancelar</button>
          <button class="btn-save" @click="saveProducto">Guardar en Base de Datos</button>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL MESA ═══ -->
    <div v-if="modalMesa" class="modal-overlay" @click.self="modalMesa = false">
      <div class="modal">
        <button class="modal-x" @click="modalMesa = false">✕</button>
        <h2>{{ editingMesa.idMesa ? "Editar Mesa #" + editingMesa.idMesa : "Nueva Mesa" }}</h2>
        <div class="form-grid">
          <div class="form-group">
            <label>Capacidad (personas)</label>
            <input v-model="editingMesa.capacidad" type="number" min="1" />
          </div>
          <div class="form-group">
            <label>Ubicación</label>
            <select v-model="editingMesa.ubicacion">
              <option v-for="ub in ubicacionesMesa" :key="ub" :value="ub">{{ ub }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Estado</label>
            <select v-model="editingMesa.disponible">
              <option :value="true">Disponible</option>
              <option :value="false">Ocupada / No disponible</option>
            </select>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="modalMesa = false">Cancelar</button>
          <button class="btn-save" @click="saveMesa">Guardar en Base de Datos</button>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL RESERVA ═══ -->
    <div v-if="modalReserva" class="modal-overlay" @click.self="modalReserva = false">
      <div class="modal">
        <button class="modal-x" @click="modalReserva = false">✕</button>
        <h2>{{ editingReserva.idReserva ? "Editar Reserva #" + editingReserva.idReserva : "Nueva Reserva" }}</h2>
        <div class="form-grid">
          <div class="form-group">
            <label>ID Mesa</label>
            <input v-model="editingReserva.idMesa" type="number" min="1" placeholder="Número de mesa" />
          </div>
          <div class="form-group">
            <label>Número de personas</label>
            <input v-model="editingReserva.numPersonas" type="number" min="1" placeholder="Pax" />
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
            <label>Fianza (€)</label>
            <input v-model="editingReserva.fianza" type="number" step="0.01" min="0" placeholder="0.00" />
          </div>
          <div class="form-group">
            <label>Estado de pago</label>
            <select v-model="editingReserva.estadoPago">
              <option value="pendiente">Pendiente</option>
              <option value="pagado">Pagado</option>
              <option value="reembolsado">Reembolsado</option>
            </select>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="modalReserva = false">Cancelar</button>
          <button class="btn-save" @click="saveReserva">Guardar en Base de Datos</button>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL CONFIRMAR ELIMINAR ═══ -->
    <div v-if="deleteConfirm.show" class="modal-overlay">
      <div class="modal modal-sm">
        <div class="delete-icon">🗑️</div>
        <h2>¿Estás seguro?</h2>
        <p>Esta acción eliminará el registro permanentemente y no se puede deshacer.</p>
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
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "vue-router";
import { createClient } from "@supabase/supabase-js";
import Cabecera from "./Cabecera.vue";
import Footer from "./Footer.vue";
import { API_BASE_URL as API } from "@/config/api";

const tabs = [
  { key: "usuarios",  icon: "👤", label: "Usuarios"  },
  { key: "productos", icon: "🍽️", label: "Productos" },
  { key: "reservas",  icon: "📅", label: "Reservas"  },
  { key: "mesas",     icon: "🪑", label: "Mesas"     },
];

const sidebarOpen = ref(false);

const categoriasProducto = ["Entrantes", "Carnes", "Pescados", "Postres", "Bebidas"];
const ubicacionesMesa = ["Interior", "Terraza"];

const parsePrecio = (precio) => {
  const text = String(precio ?? "").trim();
  const normalized = text.includes(",") ? text.replace(/\./g, "").replace(",", ".") : text;
  return Number(normalized);
};
const normalizarPrecioProducto = (precio) => {
  const value = Number(precio);
  if (!Number.isFinite(value)) return 0;
  return value >= 100 ? value / 100 : value;
};
const formatPrecio = (precio) =>
  `${normalizarPrecioProducto(precio).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€`;

const productoSoportaImagenUrl = ref(false);

let _supabase = null;
const getSupabase = () => {
  if (_supabase) return _supabase;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase no configurado");
  _supabase = createClient(url, key);
  return _supabase;
};

const BUCKET = "productos-img";
const fileInputRef = ref(null);
const uploadingImage = ref(false);

const onImageSelected = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  uploadingImage.value = true;
  try {
    const supabase = getSupabase();
    const ext = file.name.split(".").pop();
    const path = `productos/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    editingProducto.value.imagen_url = data.publicUrl;
    showToast("Imagen subida correctamente.");
  } catch (err) {
    console.error(err);
    showToast("Error al subir la imagen.", "error");
  } finally {
    uploadingImage.value = false;
    if (fileInputRef.value) fileInputRef.value.value = "";
  }
};

const router = useRouter();
const usuarios = ref([]);
const productos = ref([]);
const reservas = ref([]);
const mesas = ref([]);
const loading = ref(false);
const error = ref("");
const currentTab = ref("usuarios");

const tabTitles = {
  usuarios: "Usuarios",
  productos: "Productos",
  reservas: "Reservas",
  mesas: "Mesas",
};

const modalUsuario = ref(false);
const modalProducto = ref(false);
const modalMesa = ref(false);
const modalReserva = ref(false);
const editingUsuario = ref({});
const editingProducto = ref({});
const editingMesa = ref({});
const editingReserva = ref({});
const deleteConfirm = ref({ show: false, type: "", id: null });
const toast = ref({ show: false, type: "success", msg: "" });

const showToast = (msg, type = "success") => {
  toast.value = { show: true, type, msg };
  setTimeout(() => { toast.value.show = false; }, 3000);
};

const fetchApiList = async (entity, filter = "") => {
  const url = filter ? `${API}/${entity}?$filter=${encodeURIComponent(filter)}` : `${API}/${entity}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return data.value || data || [];
};

const normalizarFianza = (fianza, personas) => {
  const importe = Number(fianza);
  if (!Number.isFinite(importe)) return 0;
  const importeEsperado = Number(personas || 0) * 2.5;
  if (importeEsperado && Math.abs(importe / 10 - importeEsperado) < 0.01) return importe / 10;
  return importe;
};
const formatFianza = (fianza, personas) =>
  `${normalizarFianza(fianza, personas).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const formatHora = (hora) => String(hora || "").substring(0, 5);

const cargarUsuariosConRolVisual = async () => {
  const [usuariosData, administradoresData] = await Promise.all([
    fetch(`${API}/Usuario`).then((res) => { if (!res.ok) throw new Error(); return res.json(); }),
    fetch(`${API}/Administrador`).then((res) => res.ok ? res.json() : { value: [] }),
  ]);
  const administradoresIds = new Set((administradoresData.value || administradoresData || []).map((a) => Number(a.idUsuario)));
  usuarios.value = (usuariosData.value || usuariosData || []).map((u) => ({
    ...u,
    rolVisual: administradoresIds.has(Number(u.idUsuario)) ? "admin" : u.rol,
  }));
};

const refresh = async () => {
  loading.value = true;
  error.value = "";
  try {
    if (currentTab.value === "usuarios") { await cargarUsuariosConRolVisual(); return; }
    const endpoint = currentTab.value === "productos" ? "Producto" : currentTab.value === "reservas" ? "Reserva" : "Mesa";
    const res = await fetch(`${API}/${endpoint}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    const registros = data.value || data;
    if (currentTab.value === "productos") {
      productos.value = registros;
      productoSoportaImagenUrl.value = registros.some((p) => Object.prototype.hasOwnProperty.call(p, "imagen_url"));
    }
    if (currentTab.value === "reservas") reservas.value = registros;
    if (currentTab.value === "mesas") mesas.value = registros;
  } catch {
    error.value = "Error al conectar con la API.";
  } finally {
    loading.value = false;
  }
};

watch(currentTab, refresh, { immediate: true });

const openEditUsuario = (u) => { editingUsuario.value = { ...u, rol: u.rolVisual || u.rol }; modalUsuario.value = true; };
const saveUsuario = async () => {
  const { idUsuario, nombre, apellido, rol } = editingUsuario.value;
  const rolUsuario = rol === "admin" ? "empleado" : rol;
  try {
    const res = await fetch(`${API}/Usuario/idUsuario/${idUsuario}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, apellido, rol: rolUsuario }),
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

const openAddProducto = () => {
  editingProducto.value = { nombre: "", precio: "", categoria: "Entrantes", descripcion: "", disponible: true, imagen_url: "" };
  modalProducto.value = true;
};
const openEditProducto = (p) => {
  editingProducto.value = { ...p, precio: normalizarPrecioProducto(p.precio).toFixed(2), categoria: categoriasProducto.includes(p.categoria) ? p.categoria : "Entrantes" };
  modalProducto.value = true;
};
const saveProducto = async () => {
  const { idProducto, nombre, precio, categoria, descripcion, disponible, imagen_url } = editingProducto.value;
  const precioNumero = parsePrecio(precio);
  if (!nombre?.trim() || !Number.isFinite(precioNumero) || !categoriasProducto.includes(categoria)) {
    showToast("Revisa nombre, precio y categoría del producto.", "error");
    return;
  }
  const payload = { nombre: nombre.trim(), precio: Number(precioNumero.toFixed(2)), categoria, descripcion: descripcion || null, disponible: disponible === true || disponible === "true" };
  if (productoSoportaImagenUrl.value) payload.imagen_url = imagen_url || null;
  try {
    const url = idProducto ? `${API}/Producto/idProducto/${idProducto}` : `${API}/Producto`;
    const method = idProducto ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(await res.text());
    modalProducto.value = false;
    showToast(idProducto ? "Producto actualizado." : "Producto creado.");
    refresh();
  } catch {
    showToast("Error al guardar el producto.", "error");
  }
};

const openAddMesa = () => { editingMesa.value = { capacidad: 2, ubicacion: "Interior", disponible: true }; modalMesa.value = true; };
const openEditMesa = (m) => { editingMesa.value = { ...m }; modalMesa.value = true; };
const saveMesa = async () => {
  const { idMesa, capacidad, ubicacion, disponible } = editingMesa.value;
  const payload = { capacidad: parseInt(capacidad), ubicacion, disponible: disponible === true || disponible === "true" };
  try {
    const url = idMesa ? `${API}/Mesa/idMesa/${idMesa}` : `${API}/Mesa`;
    const res = await fetch(url, { method: idMesa ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error();
    modalMesa.value = false;
    showToast(idMesa ? "Mesa actualizada." : "Mesa creada.");
    refresh();
  } catch {
    showToast("Error al guardar la mesa.", "error");
  }
};

const openAddReserva = () => { editingReserva.value = { idMesa: "", fecha: "", hora: "", numPersonas: 1, fianza: 0, estadoPago: "pendiente" }; modalReserva.value = true; };
const openEditReserva = (r) => { editingReserva.value = { ...r }; modalReserva.value = true; };
const saveReserva = async () => {
  const { idReserva, idMesa, fecha, hora, numPersonas, fianza, estadoPago } = editingReserva.value;
  const payload = { idMesa: parseInt(idMesa), fecha, hora, numPersonas: parseInt(numPersonas), fianza: parseFloat(fianza), estadoPago };
  try {
    const url = idReserva ? `${API}/Reserva/idReserva/${idReserva}` : `${API}/Reserva`;
    const res = await fetch(url, { method: idReserva ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error();
    modalReserva.value = false;
    showToast(idReserva ? "Reserva actualizada." : "Reserva creada.");
    refresh();
  } catch {
    showToast("Error al guardar la reserva.", "error");
  }
};

const postApi = async (url, body, { ignoreConflict = false } = {}) => {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (ignoreConflict && (res.status === 409 || res.status === 400)) return;
  if (!res.ok) { const msg = await res.text().catch(() => ""); throw new Error(msg || `Error ${res.status}`); }
};
const deleteApi = async (url, { ignoreNotFound = false } = {}) => {
  const res = await fetch(url, { method: "DELETE" });
  if (ignoreNotFound && (res.status === 404 || res.status === 400)) return;
  if (!res.ok) { const msg = await res.text().catch(() => ""); throw new Error(msg || `Error ${res.status}`); }
};
const ensureEmpleado = async (idUsuario, puesto = "mesero") => {
  const id = Number(idUsuario);
  const empleado = await fetchApiList("Empleado", `idUsuario eq ${id}`);
  if (empleado.length) { await fetch(`${API}/Empleado/idUsuario/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ puesto }) }); return; }
  await postApi(`${API}/Empleado`, { idUsuario: id, puesto }, { ignoreConflict: true });
};
const ensureAdministrador = async (idUsuario) => {
  const id = Number(idUsuario);
  const administrador = await fetchApiList("Administrador", `idUsuario eq ${id}`);
  if (!administrador.length) await postApi(`${API}/Administrador`, { idUsuario: id }, { ignoreConflict: true });
};
const syncUsuarioRol = async (idUsuario, rolVisual) => {
  const id = Number(idUsuario);
  if (rolVisual === "admin") { await ensureEmpleado(id, "administrador"); await ensureAdministrador(id); return; }
  if (rolVisual === "empleado") { await deleteApi(`${API}/Administrador/idUsuario/${id}`, { ignoreNotFound: true }); await ensureEmpleado(id, "mesero"); return; }
  if (rolVisual === "cliente") {
    await deleteApi(`${API}/Administrador/idUsuario/${id}`, { ignoreNotFound: true });
    await deleteApi(`${API}/Empleado/idUsuario/${id}`, { ignoreNotFound: true });
    const cliente = await fetchApiList("Cliente", `idUsuario eq ${id}`);
    if (!cliente.length) await postApi(`${API}/Cliente`, { idUsuario: id }, { ignoreConflict: true });
  }
};

const confirmDelete = (type, id) => { deleteConfirm.value = { show: true, type, id }; };
const executeDelete = async () => {
  const { type, id } = deleteConfirm.value;
  const endpointMap = { usuario: "Usuario/idUsuario", producto: "Producto/idProducto", reserva: "Reserva/idReserva", mesa: "Mesa/idMesa" };
  try {
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

const handleLogout = () => { signOut(getAuth()); router.push("/login"); };
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Montserrat:wght@400;600&display=swap");

/* ── VARIABLES ── */
:root {
  --cream: #fdfbf9;
  --dark: #1a1410;
  --gold: #c9963a;
  --gold-hover: #b8852e;
  --brown: #6b4c2a;
  --border: #f0ebe4;
  --text: #3a3830;
  --text-light: #8a735a;
  --sidebar-w: 240px;
  --header-h: 72px;
  --mobile-bar-h: 60px;
}

/* ── RESET ── */
.admin-page * { box-sizing: border-box; }

.admin-page {
  min-height: 100vh;
  background: var(--cream);
  font-family: "Montserrat", sans-serif;
  display: flex;
  flex-direction: column;
}
.admin-page :deep(nav) { background: var(--dark) !important; }

/* Footer sobre la tab bar en móvil */
@media (max-width: 640px) {
  .admin-page :deep(footer) {
    margin-bottom: var(--mobile-bar-h);
  }
}

/* ══════════════════════════════
   MOBILE TAB BAR (solo ≤ 640px)
══════════════════════════════ */
.mobile-tab-bar {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--mobile-bar-h);
  background: var(--dark);
  border-top: 1px solid rgba(201,150,58,0.2);
  z-index: 100;
}

.mobile-tab-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 4px;
  transition: background 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.mobile-tab-btn.active { background: rgba(201,150,58,0.15); }
.mobile-tab-icon { font-size: 1.15rem; }
.mobile-tab-label {
  font-size: 0.56rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgba(245,240,232,0.45);
}
.mobile-tab-btn.active .mobile-tab-label { color: var(--gold); }

/* ══════════════════════════════
   SIDEBAR OVERLAY (tablet)
══════════════════════════════ */
.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(20,14,10,0.6);
  z-index: 40;
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

/* ══════════════════════════════
   LAYOUT PRINCIPAL
══════════════════════════════ */
.admin-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  flex: 1;
  padding-top: var(--header-h);
}

/* ══════════════════════════════
   SIDEBAR
══════════════════════════════ */
.admin-sidebar {
  width: var(--sidebar-w);
  min-width: var(--sidebar-w);
  flex-shrink: 0;
  height: calc(100vh - var(--header-h));
  background: var(--dark);
  color: #f5f0e8;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 0;
  position: sticky;
  top: var(--header-h);
  z-index: 30;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.sidebar-close {
  display: none;
  align-self: flex-end;
  background: none;
  border: none;
  color: rgba(245,240,232,0.5);
  font-size: 1rem;
  cursor: pointer;
  padding: 0 1.2rem 1rem;
  line-height: 1;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
}

.sidebar-nav button {
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 13px 1.5rem;
  font-family: "Montserrat", sans-serif;
  font-size: 0.88rem;
  color: #a89880;
  cursor: pointer;
  transition: all 0.2s;
  gap: 10px;
}
.sidebar-nav button:hover:not(.active) {
  color: #f5f0e8;
  padding-left: 1.9rem;
}
.sidebar-nav button.active {
  color: #fff;
  font-weight: 600;
  background: rgba(201,150,58,0.12);
  border-left: 3px solid var(--gold);
}

.btn-logout {
  all: unset;
  box-sizing: border-box;
  width: calc(100% - 2rem);
  margin: 0.75rem 1rem 0;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.12);
  color: #888;
  padding: 10px;
  border-radius: 7px;
  cursor: pointer;
  font-family: "Montserrat", sans-serif;
  font-size: 0.85rem;
  text-align: center;
  transition: all 0.2s;
}
.btn-logout:hover {
  background: rgba(211,47,47,0.15);
  color: #ef9a9a;
  border-color: rgba(211,47,47,0.4);
}

/* ══════════════════════════════
   MAIN CONTENT
══════════════════════════════ */
.admin-main {
  flex: 1;
  min-width: 0;
  padding: 2rem 2.5rem;
  background: var(--cream);
  display: flex;
  flex-direction: column;
}

.admin-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.8rem;
  flex-wrap: wrap;
}
.admin-header h1 {
  font-family: "Cormorant Garamond", serif;
  font-size: 2.2rem;
  color: var(--dark);
  margin: 0;
  flex: 1;
  min-width: 0;
}

.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  background: none;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 10px;
  cursor: pointer;
  flex-shrink: 0;
}
.hamburger span {
  display: block;
  width: 20px;
  height: 2px;
  background: var(--dark);
  border-radius: 2px;
}

.header-actions { display: flex; gap: 8px; flex-shrink: 0; }

.btn-add {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--gold);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-family: "Montserrat", sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
}
.btn-add:hover { background: var(--gold-hover); }
.btn-add-icon { font-size: 1.1rem; line-height: 1; }

/* ══════════════════════════════
   TABLA
══════════════════════════════ */
.admin-card {
  background: white;
  border-radius: 10px;
  border: 1px solid var(--border);
  box-shadow: 0 4px 25px rgba(0,0,0,0.04);
  overflow: hidden;
}
.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

table { width: 100%; border-collapse: collapse; }
thead tr { background: #fcfaf8; }
th {
  padding: 0.85rem 1rem;
  text-align: left;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: var(--text-light);
  border-bottom: 2px solid var(--border);
  white-space: nowrap;
  font-weight: 600;
}
td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #f5f0ea;
  font-size: 0.86rem;
  color: var(--text);
  vertical-align: middle;
}
tbody tr:last-child td { border-bottom: none; }
tbody tr:hover { background: #fdfaf7; }
.td-desc {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sub-text { font-size: 0.72rem; color: var(--text-light); margin-top: 2px; }
.show-mobile { display: none; }

/* ── BADGES ── */
.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
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
.actions { display: flex; gap: 6px; align-items: center; }
.btn-edit, .btn-delete {
  all: unset;
  box-sizing: border-box;
  border: 1px solid #e8e3dc;
  padding: 6px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.82rem;
  background: #f8f6f3;
  color: #5a5040;
  transition: all 0.15s;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
}
.btn-edit:hover  { background: #eef2ff; color: #3f51b5; border-color: #c5cae9; }
.btn-delete:hover{ background: #fff0f0; color: #d32f2f; border-color: #ffcdd2; }

/* ── ESTADO ── */
.state-msg { padding: 4rem; text-align: center; color: var(--text-light); font-size: 0.95rem; }
.state-msg.error { color: #d32f2f; }

/* ══════════════════════════════
   MODALES
══════════════════════════════ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(20,14,10,0.7);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}
.modal {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  position: relative;
}
.modal h2 {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.6rem;
  color: var(--dark);
  margin-bottom: 1.4rem;
  padding-right: 2rem;
}
.modal-x {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: rgba(45,37,32,0.4);
  line-height: 1;
  padding: 4px;
  transition: color 0.2s;
}
.modal-x:hover { color: var(--dark); }

.modal-sm { max-width: 360px; text-align: center; }
.modal-sm p { color: #666; margin-top: 0.4rem; font-size: 0.88rem; line-height: 1.5; }
.delete-icon { font-size: 2.5rem; }

/* FORM GRID */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-group.full { grid-column: 1 / -1; }

.form-group label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--brown);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: max(0.88rem, 16px);
  font-family: "Montserrat", sans-serif;
  color: var(--dark);
  background: white;
  transition: border-color 0.2s;
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--gold);
  box-shadow: 0 0 0 3px rgba(201,150,58,0.1);
}
.form-group textarea { resize: vertical; }
.input-disabled {
  background: #f5f5f5 !important;
  color: #999 !important;
  cursor: not-allowed !important;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 1.6rem;
  flex-wrap: wrap;
}

.btn-cancel {
  all: unset;
  box-sizing: border-box;
  background: #f5f0e8;
  padding: 10px 18px;
  border-radius: 6px;
  cursor: pointer;
  font-family: "Montserrat", sans-serif;
  font-size: 0.85rem;
  color: #555;
  transition: background 0.2s;
}
.btn-cancel:hover { background: #ede8df; }

.btn-save {
  all: unset;
  box-sizing: border-box;
  background: var(--gold);
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-family: "Montserrat", sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  transition: background 0.2s;
}
.btn-save:hover { background: var(--gold-hover); }

.btn-delete-confirm {
  all: unset;
  box-sizing: border-box;
  background: #d32f2f;
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-family: "Montserrat", sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  transition: background 0.2s;
}
.btn-delete-confirm:hover { background: #b71c1c; }

/* ── IMAGEN ── */
.img-upload-area { display: flex; flex-direction: column; gap: 10px; }
.img-preview {
  width: 100%;
  max-height: 160px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
}
.img-placeholder {
  width: 100%;
  height: 90px;
  background: #f8f6f3;
  border: 2px dashed #d9cec3;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  color: #a89880;
}
.file-input { display: none; }
.img-btns { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.btn-upload {
  all: unset;
  box-sizing: border-box;
  background: #f0ebe4;
  border: 1px solid #d9cec3;
  color: #5a5040;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-family: "Montserrat", sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  transition: background 0.2s;
}
.btn-upload:hover:not(:disabled) { background: #e4dcd2; }
.btn-upload:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-remove-img {
  all: unset;
  box-sizing: border-box;
  color: #d32f2f;
  font-size: 0.78rem;
  cursor: pointer;
  font-family: "Montserrat", sans-serif;
  font-weight: 600;
}
.btn-remove-img:hover { text-decoration: underline; }

/* ── TOAST ── */
.toast {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  padding: 12px 22px;
  border-radius: 8px;
  font-family: "Montserrat", sans-serif;
  font-size: 0.88rem;
  font-weight: 600;
  z-index: 99999;
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
  animation: slideIn 0.3s ease;
  max-width: calc(100vw - 3rem);
}
.toast.success { background: #2e7d32; color: white; }
.toast.error   { background: #c62828; color: white; }
@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ══════════════════════════════════════
   TABLET  (641px – 1024px)
══════════════════════════════════════ */
@media (max-width: 1024px) {
  .sidebar-overlay { display: block; }

  .admin-sidebar {
    position: fixed;
    top: var(--header-h);
    left: 0;
    height: calc(100vh - var(--header-h));
    transform: translateX(-100%);
    z-index: 50;
    padding-top: 0.5rem;
  }
  .admin-sidebar.open { transform: translateX(0); }
  .sidebar-close { display: flex; }

  .hamburger { display: flex; }

  .admin-main { padding: 1.5rem; }
  .admin-header h1 { font-size: 1.8rem; }

  .hide-tablet { display: none; }

  .form-grid { grid-template-columns: 1fr 1fr; }
}

/* ══════════════════════════════════════
   MÓVIL  (≤ 640px)
══════════════════════════════════════ */
@media (max-width: 640px) {
  :root {
    --header-h: 56px;
  }

  .admin-sidebar   { display: none !important; }
  .sidebar-overlay { display: none !important; }
  .hamburger       { display: none !important; }

  .mobile-tab-bar { display: flex; }

  .admin-main {
    padding: 1rem 0.85rem;
    padding-bottom: calc(var(--mobile-bar-h) + 1rem);
  }

  .admin-header {
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  .admin-header h1 { font-size: 1.35rem; }

  .btn-add-text { display: none; }
  .btn-add {
    padding: 9px 12px;
    border-radius: 8px;
    min-width: 40px;
    min-height: 40px;
    justify-content: center;
  }
  .btn-add-icon { font-size: 1.3rem; }

  .hide-mobile { display: none; }
  .show-mobile { display: block; }

  table { min-width: 0; }
  th { padding: 0.65rem 0.7rem; font-size: 0.6rem; }
  td { padding: 0.7rem 0.7rem; font-size: 0.82rem; }

  .btn-edit,
  .btn-delete {
    padding: 7px 9px;
    font-size: 0.95rem;
    min-width: 34px;
    min-height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Modales normales: sheet desde abajo */
  .modal-overlay {
    padding: 0;
    align-items: flex-end;
  }
  .modal {
    border-radius: 18px 18px 0 0;
    max-height: 92vh;
    padding: 1.4rem 1.1rem;
    padding-bottom: max(1.6rem, env(safe-area-inset-bottom));
  }

  /* Modal de confirmación: centrado */
  .modal-overlay:has(.modal-sm) {
    align-items: center;
    padding: 1rem;
  }
  .modal-sm {
    border-radius: 14px;
    max-height: none;
    padding-bottom: 1.4rem;
  }

  .form-grid { grid-template-columns: 1fr; }
  .form-group.full { grid-column: 1; }

  .modal-actions {
    flex-direction: column-reverse;
    gap: 8px;
  }
  .btn-save,
  .btn-cancel,
  .btn-delete-confirm {
    text-align: center;
    justify-content: center;
    width: 100%;
    padding: 13px 20px;
  }

  .toast {
    bottom: calc(var(--mobile-bar-h) + 0.6rem);
    right: 0.75rem;
    left: 0.75rem;
    text-align: center;
    max-width: none;
  }
}
</style>