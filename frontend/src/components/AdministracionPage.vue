<template>
  <div class="admin-container">
    <!-- SIDEBAR -->
    <aside class="admin-sidebar">
      <div class="sidebar-logo">La <span>Brasa</span></div>
      <nav class="sidebar-nav">
        <button :class="{ active: currentTab === 'usuarios' }" @click="currentTab = 'usuarios'">
          👤 Usuarios
        </button>
      </nav>
      <button class="btn-logout" @click="handleLogout">🚪 Cerrar sesión</button>
    </aside>

    <!-- MAIN -->
    <main class="admin-main">
      <header class="admin-header">
        <h1>Usuarios</h1>
      </header>

      <!-- LOADING -->
      <div v-if="loading" class="state-msg">Cargando usuarios...</div>

      <!-- ERROR -->
      <div v-else-if="error" class="state-msg error">{{ error }}</div>

      <!-- TABLA -->
      <div v-else class="admin-card table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Email</th>
              <th>Rol</th>
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
            </tr>
          </tbody>
        </table>
        <p class="total">Total: {{ usuarios.length }} usuarios</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "vue-router";

const usuarios = ref([]);
const loading = ref(true);
const error = ref("");
const currentTab = ref("usuarios");
const router = useRouter();

const fetchUsuarios = async () => {
  loading.value = true;
  error.value = "";
  try {
    const res = await fetch("/api/Usuario");
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const json = await res.json();
    usuarios.value = json.value;
  } catch (e) {
    error.value = "No se pudieron cargar los usuarios. Comprueba que la API está activa.";
  } finally {
    loading.value = false;
  }
};

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
  font-family: "Montserrat", sans-serif;
  background: #fdfbf9;
}

/* SIDEBAR */
.admin-sidebar {
  background: #1a1410;
  color: #f5f0e8;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
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
}
.admin-header {
  margin-bottom: 2.5rem;
}
.admin-header h1 {
  font-family: "Cormorant Garamond", serif;
  font-size: 2.5rem;
  font-weight: 300;
  color: #1a1410;
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

/* BADGE ROL */
.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: capitalize;
}
.badge.cliente {
  background: #e8f4ea;
  color: #2e7d32;
}
.badge.empleado {
  background: #fff3e0;
  color: #e65100;
}
.badge.admin {
  background: #fce4ec;
  color: #c62828;
}

/* TOTAL */
.total {
  padding: 1rem 1.2rem;
  font-size: 0.75rem;
  color: #a89880;
  border-top: 1px solid #f0ebe4;
  text-align: right;
}
</style>