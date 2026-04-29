<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getAuth, signOut } from "firebase/auth";

const router = useRouter();
const isScrolled = ref(false);
const categoriaActiva = ref("Todo");
const busqueda = ref("");

const categorias = ["Todo", "Entrantes", "Carnes", "Pescados", "Postres", "Bebidas"];

const platos = [
  {
    id: 1,
    nombre: "Salmorejo cordobés",
    categoria: "Entrantes",
    precio: 7.5,
    desc: "Crema fría de tomate con huevo duro y jamón ibérico.",
    imagen: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80",
    nuevo: false,
    popular: true,
  },
  {
    id: 2,
    nombre: "Croquetas de puchero",
    categoria: "Entrantes",
    precio: 9.0,
    desc: "Elaboradas con el caldo de nuestro cocido tradicional andaluz.",
    imagen: "https://images.unsplash.com/photo-1541014741259-de529411b96a?w=600&auto=format&fit=crop&q=80",
    nuevo: true,
    popular: false,
  },
  {
    id: 3,
    nombre: "Tabla de ibéricos",
    categoria: "Entrantes",
    precio: 18.0,
    desc: "Selección de embutidos ibéricos con pan de masa madre y aceite de la Alpujarra.",
    imagen: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80",
    nuevo: false,
    popular: true,
  },
  {
    id: 4,
    nombre: "Chuletón de vaca vieja",
    categoria: "Carnes",
    precio: 38.0,
    desc: "Pieza de 600 g a la brasa de encina, sal en escamas y aceite arbequina.",
    imagen: "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=600&auto=format&fit=crop&q=80",
    nuevo: false,
    popular: true,
  },
  {
    id: 5,
    nombre: "Secreto ibérico",
    categoria: "Carnes",
    precio: 22.0,
    desc: "Corte premium al carbón con guarnición de pimientos asados.",
    imagen: "https://images.unsplash.com/photo-1558030006-450675393462?w=600&auto=format&fit=crop&q=80",
    nuevo: false,
    popular: false,
  },
  {
    id: 6,
    nombre: "Carrillera de ternera",
    categoria: "Carnes",
    precio: 19.5,
    desc: "Estofada a baja temperatura durante 8 horas con vino Pedro Ximénez.",
    imagen: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80",
    nuevo: true,
    popular: false,
  },
  {
    id: 7,
    nombre: "Lubina a la sal",
    categoria: "Pescados",
    precio: 26.0,
    desc: "Lubina salvaje entera, costra de sal marina y alioli de azafrán.",
    imagen: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80",
    nuevo: false,
    popular: true,
  },
  {
    id: 8,
    nombre: "Bacalao confitado",
    categoria: "Pescados",
    precio: 21.0,
    desc: "Lomo de bacalao al pil-pil con crema de ajo negro y pimentón de la Vera.",
    imagen: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=600&auto=format&fit=crop&q=80",
    nuevo: false,
    popular: false,
  },
  {
    id: 9,
    nombre: "Torrija caramelizada",
    categoria: "Postres",
    precio: 7.0,
    desc: "Brioche empapado en leche infusionada con canela y helado de vainilla.",
    imagen: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop&q=80",
    nuevo: false,
    popular: true,
  },
  {
    id: 10,
    nombre: "Tarta de queso al horno",
    categoria: "Postres",
    precio: 8.0,
    desc: "Elaborada con queso de cabra de la Alpujarra y coulis de frutos rojos.",
    imagen: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80",
    nuevo: true,
    popular: false,
  },
  {
    id: 11,
    nombre: "Vino tinto Rioja",
    categoria: "Bebidas",
    precio: 5.5,
    desc: "Copa de Rioja Reserva con 18 meses de barrica. Notas a frutos rojos y vainilla.",
    imagen: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80",
    nuevo: false,
    popular: false,
  },
  {
    id: 12,
    nombre: "Agua de Valencia",
    categoria: "Bebidas",
    precio: 8.0,
    desc: "Cóctel clásico con cava, zumo de naranja natural, vodka y gin.",
    imagen: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&auto=format&fit=crop&q=80",
    nuevo: true,
    popular: false,
  },
];

const platosFiltrados = computed(() => {
  return platos.filter((p) => {
    const enCategoria = categoriaActiva.value === "Todo" || p.categoria === categoriaActiva.value;
    const enBusqueda = p.nombre.toLowerCase().includes(busqueda.value.toLowerCase());
    return enCategoria && enBusqueda;
  });
});

async function cerrarSesion() {
  await signOut(getAuth());
  router.push("/login");
}

onMounted(() => {
  window.addEventListener("scroll", () => {
    isScrolled.value = window.scrollY > 40;
  });
});
</script>

<template>
  <div id="catalogo-app">
    <!-- NAVBAR -->
    <nav :class="{ scrolled: isScrolled }">
      <a href="/" class="nav-logo">La <span>Brasa</span></a>
      <ul class="nav-links">
        <li><a href="/">Inicio</a></li>
        <li><a href="/catalogo" class="nav-active">Menú</a></li>
        <li><button class="nav-btn-logout" @click="cerrarSesion">Cerrar sesión</button></li>
      </ul>
    </nav>

    <!-- HEADER DEL CATÁLOGO -->
    <header class="catalogo-header">
      <div class="catalogo-header-bg"></div>
      <div class="catalogo-header-overlay"></div>
      <div class="catalogo-header-content">
        <p class="hero-eyebrow">Nuestra propuesta</p>
        <h1 class="hero-title">El <em>menú</em></h1>
        <p class="hero-sub">Cocina de temporada, fuego de encina y producto granadino de proximidad.</p>
      </div>
    </header>

    <!-- FILTROS -->
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

    <!-- GRID DE PLATOS -->
    <section class="platos-section">
      <div class="platos-grid">
        <div
          v-for="plato in platosFiltrados"
          :key="plato.id"
          class="plato-card"
        >
          <div class="plato-img-wrap">
            <img :src="plato.imagen" :alt="plato.nombre" class="plato-img" />
            <div class="plato-badges">
              <span v-if="plato.popular" class="badge badge-popular">⭐ Popular</span>
              <span v-if="plato.nuevo" class="badge badge-nuevo">✦ Nuevo</span>
            </div>
          </div>
          <div class="plato-body">
            <div class="plato-cat">{{ plato.categoria }}</div>
            <h3 class="plato-nombre">{{ plato.nombre }}</h3>
            <p class="plato-desc">{{ plato.desc }}</p>
            <div class="plato-footer">
              <span class="plato-precio">{{ plato.precio.toFixed(2) }} €</span>
            </div>
          </div>
        </div>

        <!-- Estado vacío -->
        <div v-if="platosFiltrados.length === 0" class="vacio">
          <p class="vacio-emoji">🍽️</p>
          <p class="vacio-texto">No encontramos platos con ese criterio.</p>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
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
  background: rgba(26, 20, 16, 0.96);
  box-shadow: 0 2px 24px rgba(0, 0, 0, 0.3);
  transition: background 0.4s, box-shadow 0.4s;
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
.nav-btn-logout {
  background: transparent;
  border: 1px solid rgba(201, 150, 58, 0.5);
  color: var(--cream);
  font-family: "Montserrat", sans-serif;
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 7px 18px;
  cursor: pointer;
  border-radius: 2px;
  transition: background 0.3s, border-color 0.3s, color 0.3s;
}
.nav-btn-logout:hover {
  background: var(--gold);
  border-color: var(--gold);
  color: var(--dark);
}

/* ─── HEADER ─── */
.catalogo-header {
  position: relative;
  height: 52vh;
  min-height: 360px;
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
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
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
  transition: transform 0.3s, box-shadow 0.3s;
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
