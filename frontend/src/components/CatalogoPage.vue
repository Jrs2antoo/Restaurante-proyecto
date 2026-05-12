<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

const API = "/api";

const router = useRouter();
const auth = getAuth();

const isScrolled = ref(false);
const usuarioActual = ref(null);
const menuAbierto = ref(false);
const categoriaActiva = ref("Todo");
const busqueda = ref("");

const cargando = ref(true);
const error = ref(null);

const ADMIN_ID = "0zqRdP39nXRgH7Cl3ukyjEqEy6v2";

const categorias = ref(["Todo"]);
const platos = ref([]);

let unsubscribeAuth = null;

const esAdmin = computed(() => usuarioActual.value?.uid === ADMIN_ID);

const nombreUsuario = computed(() => {
  const u = usuarioActual.value;
  if (!u) return "";
  return u.displayName || u.email?.split("@")[0] || "Usuario";
});

const inicialUsuario = computed(() =>
  nombreUsuario.value.charAt(0).toUpperCase(),
);

const toggleMenu = () => {
  menuAbierto.value = !menuAbierto.value;
};

const handleClickFuera = (e) => {
  if (!e.target.closest(".nav-user-menu")) {
    menuAbierto.value = false;
  }
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 40;
};

const cargarProductos = async () => {
  const res = await fetch(
    `${API}/Producto?$filter=disponible eq true&$orderby=categoria,nombre`,
  );

  if (!res.ok) {
    throw new Error(`Error ${res.status} al cargar productos`);
  }

  const json = await res.json();
  const rows = json.value ?? [];

  platos.value = rows.map((p) => ({
    id: p.idProducto,
    nombre: p.nombre,
    categoria: p.categoria,
    precio: parseFloat(p.precio),
    desc: p.descripcion ?? "",
    imagen:
      p.imagen ??
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&auto=format&fit=crop&q=80",
    disponible: !!p.disponible,
    nuevo: !!p.nuevo,
    popular: !!p.popular,
  }));

  const ORDEN_ENUM = [
    "Todo",
    "Entrantes",
    "Carnes",
    "Pescados",
    "Postres",
    "Bebidas",
  ];

  const enBD = [...new Set(rows.map((p) => p.categoria))];

  categorias.value = ORDEN_ENUM.filter((c) => c === "Todo" || enBD.includes(c));
};

const cargarDatos = async () => {
  cargando.value = true;
  error.value = null;

  try {
    await cargarProductos();
  } catch (e) {
    error.value =
      "No se pudo conectar con la base de datos. Inténtalo de nuevo.";
    console.error(e);
  } finally {
    cargando.value = false;
  }
};

const platosFiltrados = computed(() => {
  return platos.value.filter((p) => {
    const enCategoria =
      categoriaActiva.value === "Todo" || p.categoria === categoriaActiva.value;

    const enBusqueda = p.nombre
      .toLowerCase()
      .includes(busqueda.value.toLowerCase());

    return enCategoria && enBusqueda;
  });
});

const cerrarSesion = async () => {
  menuAbierto.value = false;
  await signOut(auth);
  router.push("/login");
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  document.addEventListener("click", handleClickFuera);

  unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    usuarioActual.value = user;
  });

  cargarDatos();
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  document.removeEventListener("click", handleClickFuera);

  if (unsubscribeAuth) unsubscribeAuth();
});
</script>

<template>
  <div id="catalogo-app">
    <nav :class="{ scrolled: isScrolled }">
      <RouterLink to="/" class="nav-logo">La <span>Brasa</span></RouterLink>

      <ul class="nav-links">
        <li><RouterLink to="/">Inicio</RouterLink></li>
        <li><RouterLink to="/catalogo">Menú</RouterLink></li>
        <li><RouterLink to="/reservas">Reservas</RouterLink></li>

        <li v-if="!usuarioActual">
          <RouterLink to="/login" class="nav-btn"> Iniciar Sesión </RouterLink>
        </li>

        <li v-else class="nav-user-menu">
          <button class="nav-user-btn" @click="toggleMenu">
            <span class="nav-user-avatar">{{ inicialUsuario }}</span>
            <span class="nav-user-name">{{ nombreUsuario }}</span>
            <span class="nav-user-chevron" :class="{ open: menuAbierto }"
              >▾</span
            >
          </button>
          <div v-if="menuAbierto" class="nav-dropdown">
            <RouterLink
              v-if="esAdmin"
              to="/administracion"
              class="nav-dropdown-item"
              @click="menuAbierto = false"
              >⚙️ Administración</RouterLink
            >
            <button class="nav-dropdown-item nav-logout" @click="cerrarSesion">
              🚪 Cerrar sesión
            </button>
          </div>
        </li>
      </ul>
    </nav>

    <header class="catalogo-header">
      <div class="catalogo-header-bg"></div>
      <div class="catalogo-header-overlay"></div>

      <div class="catalogo-header-content">
        <p class="hero-eyebrow">Nuestra propuesta</p>
        <h1 class="hero-title">El <em>menú</em></h1>
        <p class="hero-sub">
          Cocina de temporada, fuego de encina y producto granadino de
          proximidad.
        </p>
      </div>
    </header>

    <section class="filtros-section">
      <div class="filtros-inner">
        <div class="filtros-categorias">
          <button
            v-for="cat in categorias"
            :key="cat"
            :class="['filtro-btn', { activo: categoriaActiva === cat }]"
            @click="categoriaActiva = cat"
          >
            {{ cat }}
          </button>
        </div>

        <div class="busqueda-wrap">
          <span class="busqueda-icon">🔍</span>
          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar plato..."
            class="busqueda-input"
          />
        </div>
      </div>
    </section>

    <section class="platos-section">
      <div v-if="cargando" class="estado-carga">
        <div class="spinner"></div>
        <p class="estado-texto">Cargando carta…</p>
      </div>

      <div v-else-if="error" class="estado-error">
        <p class="vacio-emoji">⚠️</p>
        <p class="vacio-texto">{{ error }}</p>
        <button class="reintentar-btn" @click="cargarDatos">Reintentar</button>
      </div>

      <div v-else class="platos-grid">
        <div
          v-for="plato in platosFiltrados"
          :key="plato.id"
          class="plato-card"
        >
          <div class="plato-badges">
            <span v-if="plato.popular" class="badge badge-popular">
              ⭐ Popular
            </span>
            <span v-if="plato.nuevo" class="badge badge-nuevo"> ✦ Nuevo </span>
          </div>

          <div class="plato-body">
            <div class="plato-cat">{{ plato.categoria }}</div>
            <h3 class="plato-nombre">{{ plato.nombre }}</h3>
            <p class="plato-desc">{{ plato.desc }}</p>

            <div class="plato-footer">
              <span class="plato-precio">
                {{ plato.precio.toFixed(2) }} €
              </span>
            </div>
          </div>
        </div>

        <div v-if="platosFiltrados.length === 0" class="vacio">
          <p class="vacio-emoji">🍽️</p>
          <p class="vacio-texto">No encontramos platos con ese criterio.</p>
        </div>
      </div>
    </section>

    <footer>
      <div class="footer-logo">La <span>Brasa</span></div>
      <p class="footer-copy">© 2026 La Brasa Restaurante · Granada</p>
    </footer>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@300;400;500;600&display=swap");

*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --cream: #f5f0e8;
  --dark: #1a1410;
  --brown: #6b4c2a;
  --gold: #c9963a;
  --warm: #e8ddd0;
  --text: #2d2520;
}

#catalogo-app {
  font-family: "Montserrat", sans-serif;
  background: var(--cream);
  color: var(--text);
  min-height: 100vh;
}

/* resto de tu CSS exactamente igual */

/* ─── NAVBAR ─── */
nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 5vw;
  height: 72px;
  background: rgba(26, 20, 16, 0.55);
  transition:
    background 0.4s,
    box-shadow 0.4s;
}
nav.scrolled {
  background: rgba(26, 20, 16, 0.96);
  box-shadow: 0 2px 24px rgba(0, 0, 0, 0.3);
}
.nav-logo {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.7rem;
  font-weight: 600;
  color: var(--cream);
  letter-spacing: 0.06em;
  text-decoration: none;
}
.nav-logo span {
  color: var(--gold);
  font-style: italic;
}
.nav-links {
  display: flex;
  gap: 2.4rem;
  list-style: none;
  align-items: center;
}
.nav-links a {
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--cream);
  text-decoration: none;
  position: relative;
  padding-bottom: 4px;
  transition: color 0.3s;
}
.nav-links a::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--gold);
  transition: width 0.3s;
}
.nav-links a:hover,
.nav-links a.nav-active {
  color: var(--gold);
}
.nav-links a.nav-active::after,
.nav-links a:hover::after {
  width: 100%;
}
.nav-btn {
  border: 1px solid rgba(201, 150, 58, 0.6);
  padding: 8px 20px;
  border-radius: 2px;
  transition:
    background 0.3s,
    color 0.3s,
    border-color 0.3s;
}
.nav-btn:hover {
  background: var(--gold) !important;
  border-color: var(--gold) !important;
  color: var(--dark) !important;
}
.nav-user-menu {
  position: relative;
}
.nav-user-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(26, 20, 16, 0.55);
  border: 1.5px solid var(--gold);
  border-radius: 999px;
  padding: 6px 14px 6px 6px;
  cursor: pointer;
  color: #f5f0e8;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 500;
  transition:
    background 0.2s,
    color 0.2s;
}
.nav-user-btn:hover {
  background: var(--gold);
  color: var(--dark);
}
.nav-user-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--gold);
  color: var(--dark);
  font-weight: 600;
  font-size: 0.72rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nav-user-chevron {
  font-size: 0.75rem;
  opacity: 0.7;
  transition: transform 0.25s;
}
.nav-user-chevron.open {
  transform: rotate(180deg);
}
.nav-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  background: #faf6ef;
  border: 1px solid #d9cfc2;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.22);
  min-width: 200px;
  overflow: hidden;
  z-index: 200;
}
.nav-dropdown-item {
  display: block;
  width: 100%;
  padding: 12px 18px;
  font-family: "Montserrat", sans-serif;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--cream);
  text-decoration: none;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  transition:
    background 0.2s,
    color 0.2s;
}
.nav-dropdown-item:hover {
  background: rgba(201, 150, 58, 0.12);
  color: var(--gold);
}
.nav-logout {
  border-top: 1px solid rgba(201, 150, 58, 0.15);
}

/* ─── HEADER ─── */
.catalogo-header {
  position: relative;
  height: 52vh;
  min-height: 360px;
  margin-top: 0;
  padding-top: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.catalogo-header-bg {
  position: absolute;
  inset: 0;
  background: url("https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&auto=format&fit=crop&q=80")
    center/cover no-repeat;
  transform: scale(1.05);
}
.catalogo-header-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    160deg,
    rgba(26, 20, 16, 0.78) 0%,
    rgba(26, 20, 16, 0.5) 100%
  );
}
.catalogo-header-content {
  position: relative;
  text-align: center;
  color: var(--cream);
  padding: 0 1.5rem;
  animation: fadeUp 0.9s ease both;
}
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.hero-eyebrow {
  font-size: 0.68rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 1rem;
}
.hero-title {
  font-family: "Cormorant Garamond", serif;
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 300;
  line-height: 1;
  margin-bottom: 1.2rem;
}
.hero-title em {
  font-style: italic;
  color: var(--gold);
}
.hero-sub {
  font-size: 0.85rem;
  font-weight: 300;
  letter-spacing: 0.08em;
  opacity: 0.8;
  max-width: 440px;
  margin: 0 auto;
  line-height: 1.8;
}

/* ─── FILTROS ─── */
.filtros-section {
  background: var(--dark);
  padding: 2rem 5vw;
  position: sticky;
  top: 72px;
  z-index: 50;
  border-bottom: 1px solid rgba(201, 150, 58, 0.15);
}
.filtros-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.filtros-categorias {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}
.filtro-btn {
  background: transparent;
  border: 1px solid rgba(245, 240, 232, 0.2);
  color: rgba(245, 240, 232, 0.6);
  font-family: "Montserrat", sans-serif;
  font-size: 0.66rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 7px 16px;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.25s;
}
.filtro-btn:hover {
  border-color: var(--gold);
  color: var(--gold);
}
.filtro-btn.activo {
  background: var(--gold);
  border-color: var(--gold);
  color: var(--dark);
  font-weight: 600;
}
.busqueda-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.busqueda-icon {
  position: absolute;
  left: 12px;
  font-size: 0.85rem;
  pointer-events: none;
}
.busqueda-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(201, 150, 58, 0.2);
  color: var(--cream);
  font-family: "Montserrat", sans-serif;
  font-size: 0.78rem;
  padding: 9px 16px 9px 38px;
  border-radius: 2px;
  outline: none;
  width: 220px;
  transition: border-color 0.3s;
}
.busqueda-input::placeholder {
  color: rgba(245, 240, 232, 0.35);
}
.busqueda-input:focus {
  border-color: var(--gold);
}

/* ─── PLATOS ─── */
.platos-section {
  padding: 4rem 5vw 6rem;
}
.platos-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}
.plato-card {
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(107, 76, 42, 0.1);
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  animation: fadeUp 0.5s ease both;
}
.plato-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 16px 48px rgba(26, 20, 16, 0.12);
}
.plato-img-wrap {
  position: relative;
  height: 210px;
  overflow: hidden;
}
.plato-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.plato-card:hover .plato-img {
  transform: scale(1.06);
}
.plato-badges {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  gap: 6px;
}
.badge {
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 2px;
}
.badge-popular {
  background: var(--gold);
  color: var(--dark);
}
.badge-nuevo {
  background: var(--dark);
  color: var(--gold);
  border: 1px solid var(--gold);
}
.plato-body {
  padding: 1.4rem 1.6rem 1.6rem;
}
.plato-cat {
  font-size: 0.6rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 0.5rem;
  font-weight: 500;
}
.plato-nombre {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.4rem;
  font-weight: 400;
  color: var(--dark);
  margin-bottom: 0.6rem;
  line-height: 1.2;
}
.plato-desc {
  font-size: 0.78rem;
  color: #7a6a5a;
  line-height: 1.75;
  font-weight: 300;
  margin-bottom: 1.2rem;
}
.plato-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(107, 76, 42, 0.1);
  padding-top: 1rem;
}
.plato-precio {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--brown);
}

/* ─── VACÍO ─── */
.vacio {
  grid-column: 1 / -1;
  text-align: center;
  padding: 5rem 0;
}
.vacio-emoji {
  font-size: 3rem;
  margin-bottom: 1rem;
}
.vacio-texto {
  font-size: 0.88rem;
  color: #9a8a7a;
  letter-spacing: 0.08em;
}

/* ─── CARGA / ERROR ─── */
.estado-carga,
.estado-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 0;
  gap: 1.2rem;
}
.estado-texto {
  font-size: 0.82rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(245, 240, 232, 0.45);
}
.spinner {
  width: 36px;
  height: 36px;
  border: 2px solid rgba(201, 150, 58, 0.2);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.reintentar-btn {
  margin-top: 0.5rem;
  background: transparent;
  border: 1px solid rgba(201, 150, 58, 0.5);
  color: var(--gold);
  font-family: "Montserrat", sans-serif;
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 9px 22px;
  border-radius: 2px;
  cursor: pointer;
  transition:
    background 0.25s,
    color 0.25s;
}
.reintentar-btn:hover {
  background: var(--gold);
  color: var(--dark);
}

/* ─── FOOTER ─── */
footer {
  background: var(--dark);
  padding: 2.5rem 5vw;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.footer-logo {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.3rem;
  color: var(--cream);
  font-weight: 400;
}
.footer-logo span {
  color: var(--gold);
  font-style: italic;
}
.footer-copy {
  font-size: 0.68rem;
  color: rgba(245, 240, 232, 0.35);
  letter-spacing: 0.08em;
}

/* ─── RESPONSIVE ─── */
@media (max-width: 700px) {
  .filtros-inner {
    flex-direction: column;
    align-items: flex-start;
  }
  .busqueda-input {
    width: 100%;
  }
  .nav-links {
    gap: 1.2rem;
  }
}
</style>
