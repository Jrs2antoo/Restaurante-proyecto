<template>
  <div class="admin-container">
    <aside class="admin-sidebar">
      <div class="sidebar-logo">La <span>Brasa</span> Admin</div>
      <nav class="sidebar-nav">
        <button @click="currentTab = 'reservas'" :class="{ active: currentTab === 'reservas' }">
          📅 Reservas
        </button>
        <button @click="currentTab = 'productos'" :class="{ active: currentTab === 'productos' }">
          🍳 Carta/Productos
        </button>
        <button @click="currentTab = 'mesas'" :class="{ active: currentTab === 'mesas' }">
          🪑 Mesas
        </button>
      </nav>
    </aside>

    <main class="admin-main">
      <header class="admin-header">
        <h1>Gestión de {{ currentTab.charAt(0).toUpperCase() + currentTab.slice(1) }}</h1>
        <button class="btn-add" @click="openModal">+ Nuevo Registro</button>
      </header>

      <div class="admin-card table-wrapper">
        <table v-if="dataList.length">
          <thead>
            <tr>
              <th v-for="key in Object.keys(dataList[0])" :key="key">{{ key }}</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in dataList" :key="item.id">
              <td v-for="(val, key) in item" :key="key">{{ val }}</td>
              <td>
                <button class="btn-action edit" @click="editItem(item)">✏️</button>
                <button class="btn-action delete" @click="deleteItem(item.id)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="loading-text">Cargando datos de la API...</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";

const currentTab = ref("reservas");
const dataList = ref([]);
const API_URL = "http://localhost:3000/api";

// Función para obtener datos dinámicamente según la entidad
const fetchData = async () => {
  dataList.value = [];
  try {
    // El nombre de la entidad en tu DAB config empieza con mayúscula
    const entity = currentTab.value.charAt(0).toUpperCase() + currentTab.value.slice(1).replace(/s$/, ""); 
    const response = await fetch(`${API_URL}/${entity}`);
    const json = await response.json();
    dataList.value = json.value; // DAB devuelve los datos en un array "value"
  } catch (error) {
    console.error("Error cargando datos:", error);
  }
};

const deleteItem = async (id) => {
  if (confirm("¿Estás seguro de eliminar este registro?")) {
    const entity = currentTab.value.charAt(0).toUpperCase() + currentTab.value.slice(1).replace(/s$/, "");
    await fetch(`${API_URL}/${entity}/id/${id}`, { method: "DELETE" });
    fetchData();
  }
};

watch(currentTab, fetchData);
onMounted(fetchData);
</script>

<style scoped>
.admin-container {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
  background: #fdfbf9;
  font-family: 'Montserrat', sans-serif;
}

/* SIDEBAR */
.admin-sidebar {
  background: #1a1410;
  color: #f5f0e8;
  padding: 2rem;
}
.sidebar-logo {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 3rem;
}
.sidebar-logo span { color: #c9963a; }

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.sidebar-nav button {
  background: transparent;
  border: none;
  color: #f5f0e8;
  text-align: left;
  padding: 12px;
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: 4px;
  transition: 0.3s;
}
.sidebar-nav button.active, .sidebar-nav button:hover {
  background: rgba(201, 150, 58, 0.2);
  color: #c9963a;
}

/* MAIN CONTENT */
.admin-main {
  padding: 3rem;
}
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
}
.admin-header h1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 2.5rem;
  color: #1a1410;
}

.btn-add {
  background: #c9963a;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 2px;
  cursor: pointer;
  font-weight: 600;
}

/* TABLE */
.admin-card {
  background: white;
  padding: 1.5rem;
  border-radius: 4px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}
th {
  text-align: left;
  padding: 1rem;
  background: #f8f5f2;
  color: #6b4c2a;
  text-transform: uppercase;
  letter-spacing: 1px;
}
td {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}
.btn-action {
  background: none;
  border: none;
  cursor: pointer;
  margin-right: 8px;
  filter: grayscale(1);
  transition: 0.2s;
}
.btn-action:hover { filter: grayscale(0); transform: scale(1.2); }
</style>