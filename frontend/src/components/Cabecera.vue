<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

const router = useRouter();
const route = useRoute();
const auth = getAuth();

const isScrolled = ref(false);
const usuarioActual = ref(null);
const menuAbierto = ref(false);
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
  isScrolled.value || route.path === "/administracion",
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

const fetchApiList = async (entity, filter = "") => {
  const url = filter
    ? `/api/${entity}?$filter=${encodeURIComponent(filter)}`
    : `/api/${entity}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return data.value || data || [];
};

const comprobarAdmin = async (user) => {
  const email = user?.email?.toLowerCase();
  if (!email) {
    esAdmin.value = false;
    return;
  }

  const usuarios = await fetchApiList(
    "Usuario",
    `email eq '${email.replaceAll("'", "''")}'`,
  );
  const usuario = usuarios.find((u) => u.email?.toLowerCase() === email);

  if (!usuario?.idUsuario) {
    esAdmin.value = false;
    return;
  }

  const administradores = await fetchApiList(
    "Administrador",
    `idUsuario eq ${Number(usuario.idUsuario)}`,
  );

  esAdmin.value = administradores.length > 0;
};

const cerrarSesion = async () => {
  menuAbierto.value = false;
  await signOut(auth);
  router.push("/login");
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
  <nav :class="{ scrolled: navSolido }">
    <RouterLink to="/" class="nav-logo">La <span>Brasa</span></RouterLink>

    <ul class="nav-links">
      <li><RouterLink to="/">Inicio</RouterLink></li>
      <li><RouterLink to="/catalogo">Menú</RouterLink></li>
      <li><RouterLink to="/reservas">Reservas</RouterLink></li>
      <li v-if="usuarioActual">
        <RouterLink to="/mis-reservas">Mis Reservas</RouterLink>
      </li>

      <li v-if="!usuarioActual">
        <RouterLink to="/login" class="nav-btn"> Iniciar Sesión </RouterLink>
      </li>

      <li v-else class="nav-user-menu">
        <button class="nav-user-btn" @click="toggleMenu">
          <span class="nav-user-avatar">{{ inicialUsuario }}</span>
          <span class="nav-user-name">{{ nombreUsuario }}</span>
          <span class="nav-user-chevron" :class="{ open: menuAbierto }">
            ▾
          </span>
        </button>

        <div v-if="menuAbierto" class="nav-dropdown">
          <RouterLink
            v-if="esAdmin"
            to="/administracion"
            class="nav-dropdown-item nav-logout"
            @click="menuAbierto = false"
          >
            ⚙️ Administración
          </RouterLink>
          <button class="nav-dropdown-item nav-logout" @click="cerrarSesion">
            🚪 Cerrar sesión
          </button>
        </div>
      </li>
    </ul>
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
  color: var(--cream, #f5f0e8);
  letter-spacing: 0.06em;
  text-decoration: none;
}
.nav-logo span {
  color: var(--gold, #c9963a);
  font-style: italic;
}
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
.nav-links a.nav-active,
.nav-links a.router-link-active {
  color: var(--gold, #c9963a);
}
.nav-links a.nav-active::after,
.nav-links a.router-link-active::after,
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
  background: var(--gold, #c9963a) !important;
  border-color: var(--gold, #c9963a) !important;
  color: var(--dark, #1a1410) !important;
}
.nav-user-menu {
  position: relative;
}
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
  transition:
    background 0.2s,
    color 0.2s;
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
.nav-dropdown-item,
.nav-dropdown .nav-dropdown-item,
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
  transition:
    background 0.2s,
    color 0.2s;
}
.nav-dropdown-item::after,
a.nav-dropdown-item::after {
  display: none !important;
}
.nav-dropdown-item:hover,
a.nav-dropdown-item:hover {
  background: rgba(201, 150, 58, 0.12);
  color: var(--gold, #c9963a) !important;
}
.nav-logout {
  border-top: 1px solid rgba(201, 150, 58, 0.15);
}

@media (max-width: 700px) {
  .nav-links {
    gap: 1.2rem;
  }
}
</style>
