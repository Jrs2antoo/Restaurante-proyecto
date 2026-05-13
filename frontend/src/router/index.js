import { createRouter, createWebHistory } from "vue-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import HomePage from "@/components/HomePage.vue";
import CatalogoPage from "@/components/CatalogoPage.vue";
import LoginPage from "@/components/LoginPage.vue";
import RegisterPage from "@/components/RegisterPage.vue";
import AdministracionPage from "@/components/AdministracionPage.vue";
import ReservasPage from "@/components/ReservasPage.vue";
import MisReservasPage from "@/components/MisReservasPage.vue";

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
        {
            path: "/reservas",
            component: ReservasPage,
            meta: { requireAuth: true, onlyAdmin: false },
        },
        {
            path: "/mis-reservas",
            component: MisReservasPage,
            meta: { requireAuth: true, onlyAdmin: false },
        },
    ],
});

const esperarUsuario = () => {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
            unsubscribe();
            resolve(user);
        });
    });
};

router.beforeEach(async (to) => {
    const usuarioLogueado = await esperarUsuario();
    const ADMIN_ID = "0zqRdP39nXRgH7Cl3ukyjEqEy6v2";

    // Usuario no es admin intentando entrar a ruta de admin
    if (to.meta.onlyAdmin && usuarioLogueado?.uid !== ADMIN_ID) {
        return "/";
    }

    // Ruta protegida sin estar logueado
    if (to.meta.requireAuth && !usuarioLogueado) {
        return "/login";
    }

    // Ya logueado intentando entrar a login/register
    if (!to.meta.requireAuth && usuarioLogueado && to.path !== "/") {
        return "/";
    }
});

export default router;