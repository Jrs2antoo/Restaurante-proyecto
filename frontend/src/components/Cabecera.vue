<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { apiUrl } from "@/config/api";
import { getUserDbEmail } from "@/config/authUser";

const router = useRouter();
const route = useRoute();
const auth = getAuth();

const isScrolled = ref(false);
const usuarioActual = ref(null);
const menuAbierto = ref(false);
const menuMovilAbierto = ref(false);
const esAdmin = ref(false);

let unsubscribeAuth = null;

const nombreUsuario = computed(() => {
  const u = usuarioActual.value;
  if (!u) return "";
  return u.displayName || u.email?.split("@")[0] || "Usuario";
});

const inicialUsuario = computed(() =>
  nombreUsuario.value.charAt(0).toUpperCase(),
);

const navSolido = computed(() =>
  isScrolled.value || route.path === "/administracion" || menuMovilAbierto.value,
);

const toggleMenu = () => {
  menuAbierto.value = !menuAbierto.value;
};

const toggleMenuMovil = () => {
  menuMovilAbierto.value = !menuMovilAbierto.value;
  menuAbierto.value = false;
};

const cerrarMenuMovil = () => {
  menuMovilAbierto.value = false;
  menuAbierto.value = false;
};

const handleClickFuera = (e) => {
  if (!e.target.closest(".nav-user-menu")) {
    menuAbierto.value = false;
  }
  if (!e.target.closest("nav")) {
    menuMovilAbierto.value = false;
  }
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 40;
};

const fetchApiList = async (entity, filter = "") => {
  const url = filter
    ? apiUrl(`${entity}?$filter=${encodeURIComponent(filter)}`)
    : apiUrl(entity);
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return data.value || data || [];
};

const comprobarAdmin = async (user) => {
  const email = getUserDbEmail(user).toLowerCase();
  if (!email) { esAdmin.value = false; return; }

  const usuarios = await fetchApiList("Usuario", `email eq '${email.replaceAll("'", "''")}'`);
  const usuario = usuarios.find((u) => u.email?.toLowerCase() === email);
  if (!usuario?.idUsuario) { esAdmin.value = false; return; }

  const administradores = await fetchApiList("Administrador", `idUsuario eq ${Number(usuario.idUsuario)}`);
  esAdmin.value = administradores.length > 0;
};

const cerrarSesion = async () => {
  menuAbierto.value = false;
  menuMovilAbierto.value = false;
  await signOut(auth);
  router.push("/");
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  document.addEventListener("click", handleClickFuera);
  unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
    usuarioActual.value = user;
    await comprobarAdmin(user);
  });
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  document.removeEventListener("click", handleClickFuera);
  if (unsubscribeAuth) unsubscribeAuth();
});
</script>

<template>
  <nav :class="{ scrolled: navSolido, 'menu-open': menuMovilAbierto }">
    <RouterLink to="/" class="nav-logo" @click="cerrarMenuMovil">
      La <span>Brasa</span>
    </RouterLink>

    <!-- Links desktop -->
    <ul class="nav-links">
      <li><RouterLink to="/">Inicio</RouterLink></li>
      <li><RouterLink to="/catalogo">Menú</RouterLink></li>
      <li><RouterLink to="/reservas">Reservas</RouterLink></li>
      <li v-if="usuarioActual">
        <RouterLink to="/mis-reservas">Mis Reservas</RouterLink>
      </li>

      <li v-if="!usuarioActual">
        <RouterLink to="/login" class="nav-btn">Iniciar Sesión</RouterLink>
      </li>

      <li v-else class="nav-user-menu">
        <button class="nav-user-btn" @click="toggleMenu">
          <span class="nav-user-avatar">{{ inicialUsuario }}</span>
          <span class="nav-user-name">{{ nombreUsuario }}</span>
          <span class="nav-user-chevron" :class="{ open: menuAbierto }">▾</span>
        </button>
        <div v-if="menuAbierto" class="nav-dropdown">
          <RouterLink
            v-if="esAdmin"
            to="/administracion"
            class="nav-dropdown-item"
            @click="menuAbierto = false"
          >⚙️ Administración</RouterLink>
          <button class="nav-dropdown-item nav-logout" @click="cerrarSesion">
            🚪 Cerrar sesión
          </button>
        </div>
      </li>
    </ul>

    <!-- Botón hamburguesa móvil -->
    <button
      class="hamburger"
      :class="{ active: menuMovilAbierto }"
      @click.stop="toggleMenuMovil"
      aria-label="Menú"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>

    <!-- Menú móvil desplegable -->
    <Transition name="menu-movil">
      <div v-if="menuMovilAbierto" class="nav-movil" @click.stop>
        <ul class="nav-movil-links">
          <li><RouterLink to="/" @click="cerrarMenuMovil">Inicio</RouterLink></li>
          <li><RouterLink to="/catalogo" @click="cerrarMenuMovil">Menú</RouterLink></li>
          <li><RouterLink to="/reservas" @click="cerrarMenuMovil">Reservas</RouterLink></li>
          <li v-if="usuarioActual">
            <RouterLink to="/mis-reservas" @click="cerrarMenuMovil">Mis Reservas</RouterLink>
          </li>
          <li v-if="esAdmin">
            <RouterLink to="/administracion" @click="cerrarMenuMovil">⚙️ Administración</RouterLink>
          </li>
        </ul>

        <div class="nav-movil-footer">
          <template v-if="!usuarioActual">
            <RouterLink to="/login" class="nav-movil-btn" @click="cerrarMenuMovil">
              Iniciar Sesión
            </RouterLink>
          </template>
          <template v-else>
            <div class="nav-movil-user">
              <span class="nav-movil-avatar">{{ inicialUsuario }}</span>
              <span class="nav-movil-nombre">{{ nombreUsuario }}</span>
            </div>
            <button class="nav-movil-logout" @click="cerrarSesion">
              🚪 Cerrar sesión
            </button>
          </template>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@300;400;500;600&display=swap");

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
  transition: background 0.4s, box-shadow 0.4s;
}
nav.scrolled {
  background: rgba(26, 20, 16, 0.96);
  box-shadow: 0 2px 24px rgba(0, 0, 0, 0.3);
}

/* ─── LOGO ─── */
.nav-logo {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.7rem;
  font-weight: 600;
  color: var(--cream, #f5f0e8);
  letter-spacing: 0.06em;
  text-decoration: none;
  flex-shrink: 0;
  z-index: 101;
}
.nav-logo span {
  color: var(--gold, #c9963a);
  font-style: italic;
}

/* ─── LINKS DESKTOP ─── */
.nav-links {
  display: flex;
  gap: 2.4rem;
  list-style: none;
  align-items: center;
}
.nav-links a {
  font-family: "Montserrat", sans-serif;
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--cream, #f5f0e8);
  text-decoration: none;
  position: relative;
  padding-bottom: 4px;
  transition: color 0.3s;
  white-space: nowrap;
}
.nav-links a::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--gold, #c9963a);
  transition: width 0.3s;
}
.nav-links a:hover,
.nav-links a.router-link-active {
  color: var(--gold, #c9963a);
}
.nav-links a.router-link-active::after,
.nav-links a:hover::after {
  width: 100%;
}

/* ─── BOTÓN INICIAR SESIÓN ─── */
.nav-btn {
  border: 1px solid rgba(201, 150, 58, 0.6);
  padding: 8px 20px !important;
  border-radius: 2px;
  transition: background 0.3s, color 0.3s, border-color 0.3s;
  line-height: 1 !important;
}
.nav-btn::after { display: none !important; }
.nav-btn:hover {
  background: var(--gold, #c9963a) !important;
  border-color: var(--gold, #c9963a) !important;
  color: var(--dark, #1a1410) !important;
}

/* ─── USUARIO ─── */
.nav-user-menu { position: relative; }
.nav-user-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(26, 20, 16, 0.55);
  border: 1.5px solid var(--gold, #c9963a);
  border-radius: 999px;
  padding: 6px 14px 6px 6px;
  cursor: pointer;
  color: #f5f0e8;
  font-family: "Montserrat", sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  transition: background 0.2s, color 0.2s;
  white-space: nowrap;
}
.nav-user-btn:hover {
  background: var(--gold, #c9963a);
  color: var(--dark, #1a1410);
}
.nav-user-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--gold, #c9963a);
  color: var(--dark, #1a1410);
  font-weight: 600;
  font-size: 0.72rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.nav-user-chevron {
  font-size: 0.75rem;
  opacity: 0.7;
  transition: transform 0.25s;
}
.nav-user-chevron.open { transform: rotate(180deg); }

/* ─── DROPDOWN DESKTOP ─── */
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
.nav-dropdown-item,
a.nav-dropdown-item,
a.nav-dropdown-item.router-link-active {
  display: block;
  width: 100%;
  padding: 12px 18px;
  font-family: "Montserrat", sans-serif;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--dark, #1a1410) !important;
  text-decoration: none;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s, color 0.2s;
}
.nav-dropdown-item::after,
a.nav-dropdown-item::after { display: none !important; }
.nav-dropdown-item:hover,
a.nav-dropdown-item:hover {
  background: rgba(201, 150, 58, 0.12);
  color: var(--gold, #c9963a) !important;
}
.nav-logout { border-top: 1px solid rgba(201, 150, 58, 0.15); }

/* ─── HAMBURGUESA ─── */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 101;
  padding: 4px;
}
.hamburger span {
  display: block;
  width: 24px;
  height: 1.5px;
  background: var(--cream, #f5f0e8);
  border-radius: 2px;
  transition: transform 0.3s, opacity 0.3s, width 0.3s;
  transform-origin: center;
}
.hamburger.active span:nth-child(1) {
  transform: translateY(6.5px) rotate(45deg);
}
.hamburger.active span:nth-child(2) {
  opacity: 0;
  width: 0;
}
.hamburger.active span:nth-child(3) {
  transform: translateY(-6.5px) rotate(-45deg);
}

/* ─── MENÚ MÓVIL ─── */
.nav-movil {
  position: fixed;
  top: 72px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(20, 15, 10, 0.97);
  backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2.5rem 8vw 3rem;
  z-index: 99;
  overflow-y: auto;
}
.nav-movil-links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.nav-movil-links li {
  border-bottom: 1px solid rgba(201, 150, 58, 0.12);
}
.nav-movil-links a {
  display: block;
  font-family: "Cormorant Garamond", serif;
  font-size: clamp(1.8rem, 6vw, 2.4rem);
  font-weight: 300;
  color: var(--cream, #f5f0e8);
  text-decoration: none;
  padding: 1rem 0;
  letter-spacing: 0.04em;
  transition: color 0.2s, padding-left 0.2s;
}
.nav-movil-links a:hover,
.nav-movil-links a.router-link-active {
  color: var(--gold, #c9963a);
  padding-left: 0.5rem;
}

.nav-movil-footer {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 2rem;
}
.nav-movil-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 32px;
  background: var(--gold, #c9963a);
  color: var(--dark, #1a1410);
  font-family: "Montserrat", sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  text-decoration: none;
  border-radius: 2px;
  transition: background 0.2s;
}
.nav-movil-btn:hover { background: #b8852e; }

.nav-movil-user {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid rgba(201, 150, 58, 0.15);
}
.nav-movil-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--gold, #c9963a);
  color: var(--dark, #1a1410);
  font-weight: 700;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.nav-movil-nombre {
  font-family: "Montserrat", sans-serif;
  font-size: 0.82rem;
  color: var(--cream, #f5f0e8);
  font-weight: 500;
}
.nav-movil-logout {
  width: 100%;
  padding: 12px;
  background: rgba(200, 80, 80, 0.1);
  border: 1px solid rgba(200, 80, 80, 0.25);
  border-radius: 2px;
  color: #e07070;
  font-family: "Montserrat", sans-serif;
  font-size: 0.68rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s;
}
.nav-movil-logout:hover { background: rgba(200, 80, 80, 0.18); }

/* ─── TRANSICIÓN MENÚ MÓVIL ─── */
.menu-movil-enter-active,
.menu-movil-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.menu-movil-enter-from,
.menu-movil-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

/* ─── RESPONSIVE ─── */

/* Tablet: ocultar nombre usuario, reducir gaps */
@media (max-width: 900px) {
  .nav-links { gap: 1.6rem; }
  .nav-user-name { display: none; }
  .nav-user-btn { padding: 6px 10px 6px 6px; }
}

/* Tablet pequeña / móvil grande: ocultar links, mostrar hamburguesa */
@media (max-width: 700px) {
  .nav-links { display: none; }
  .hamburger { display: flex; }
}
</style>