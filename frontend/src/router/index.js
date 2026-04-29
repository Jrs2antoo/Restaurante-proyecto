import { createRouter, createWebHistory } from "vue-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import HomePage from "@/components/HomePage.vue";
import CatalogoPage from "@/components/CatalogoPage.vue";
import LoginPage from "@/components/LoginPage.vue";
import RegisterPage from "@/components/RegisterPage.vue";
import AdministracionPage from "@/components/AdministracionPage.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: HomePage,
      meta: { requireAuth: false, onlyAdmin: false },
    },
    {
      path: "/login",
      component: LoginPage,
      meta: { requireAuth: false, onlyAdmin: false },
    },
    {
      path: "/register",
      component: RegisterPage,
      meta: { requireAuth: false, onlyAdmin: false },
    },
    {
      path: "/catalogo",
      component: CatalogoPage,
      meta: { requireAuth: true, onlyAdmin: false },
    },
    {
      path: "/administracion",
      component: AdministracionPage,
      meta: { requireAuth: true, onlyAdmin: true },
    },
  ],
});

const esperarUsuario = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      unsubscribe(); // Deja de escuchar en cuanto recibe la primera respuesta
      resolve(user);
    });
  });
};

router.beforeEach(async (to, from) => {
  const usuarioLogueado = await esperarUsuario();
  const ADMIN_ID = "0zqRdP39nXRgH7Cl3ukyjEqEy6v2";

  if (to.meta.onlyAdmin && usuarioLogueado?.uid !== ADMIN_ID) {
    return "/inicio"; // Redirige a la página de administración si el usuario no es admin
  }

  if (to.meta.requireAuth && !usuarioLogueado) {
    return "/login";
  }

  if (!to.meta.requireAuth && usuarioLogueado) {
    return "/inicio"; // Redirige a la página de inicio si el usuario ya está logueado
  }
});
export default router;
