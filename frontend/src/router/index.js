import { createRouter, createWebHistory } from "vue-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { apiUrl } from "@/config/api";
import { getUserDbEmail } from "@/config/authUser";
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
            meta: { requireAuth: false, onlyAdmin: false },
        },
        {
            path: "/administracion",
            component: AdministracionPage,
            meta: { requireAuth: true, onlyAdmin: true },
        },
        {
            path: "/reservas",
            component: ReservasPage,
            meta: { requireAuth: false, onlyAdmin: false },
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

const fetchApiList = async (entity, filter = "") => {
    const url = filter
        ? apiUrl(`${entity}?$filter=${encodeURIComponent(filter)}`)
        : apiUrl(entity);
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.value || data || [];
};

const esAdministrador = async (user) => {
    const email = getUserDbEmail(user).toLowerCase();
    if (!email) return false;

    const usuarios = await fetchApiList(
        "Usuario",
        `email eq '${email.replaceAll("'", "''")}'`
    );
    const usuario = usuarios.find(u => u.email?.toLowerCase() === email);

    if (!usuario?.idUsuario) return false;

    const administradores = await fetchApiList(
        "Administrador",
        `idUsuario eq ${Number(usuario.idUsuario)}`
    );

    return administradores.length > 0;
};

router.beforeEach(async (to) => {
    const usuarioLogueado = await esperarUsuario();

    // Ruta protegida sin estar logueado
    if (to.meta.requireAuth && !usuarioLogueado) {
        return { path: "/login", query: { redirect: to.fullPath } };
    }

    // Usuario no es admin intentando entrar a ruta de admin
    if (to.meta.onlyAdmin && !(await esAdministrador(usuarioLogueado))) {
        return "/";
    }

    if ((to.path === "/login" || to.path === "/register") && usuarioLogueado) {
        const redirect = typeof to.query.redirect === "string" ? to.query.redirect : "/";
        return redirect.startsWith("/") ? redirect : "/";
    }
});

export default router;
