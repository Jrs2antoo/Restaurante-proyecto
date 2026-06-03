<script setup>
import { Icon } from '@iconify/vue'
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  signInWithPopup,
} from 'firebase/auth'

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()
const auth = getAuth()

// ── Guarda el usuario en MySQL vía DAB (ignora duplicados) ──
async function saveUserToDb(nombre, userEmail, passwordHash = 'firebase-auth') {
  if (!userEmail) {
    console.warn('saveUserToDb: email vacío, se omite')
    return
  }
  try {
    const payload = {
      nombre: nombre || '',
      apellido: '',
      email: userEmail,
      contraseña: passwordHash,
      rol: 'cliente'
    }
    const res = await fetch('/api/Usuario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const body = await res.text()

    // 409 Conflict = ya existe, no es error crítico
    if (!res.ok && res.status !== 409) {
      console.error('saveUserToDb: error del servidor', res.status, body)
    }
  } catch (e) {
    console.error('saveUserToDb: error de red', e)
  }
}

// Login con email/contraseña — aquí NO guardamos porque el usuario
// ya existe en la BD desde el registro. Solo guardamos en social login,
// donde el usuario puede entrar por primera vez sin haber pasado por /register.
async function login() {
  error.value = ''
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    router.push('/')
  } catch (e) {
    console.error('login error:', e.code, e.message)
    error.value = 'Email o contraseña incorrectos'
  }
}

// ── Login social: guarda si es la primera vez ──
async function loginSocial(ProviderClass) {
  error.value = ''
  try {
    const { user } = await signInWithPopup(auth, new ProviderClass())

    if (!user.email) {
      console.warn('El proveedor no devolvió email; no se guarda en BD')
      router.push('/')
      return
    }

    // Intenta insertar — si ya existe (409), el servidor lo ignora
    await saveUserToDb(user.displayName || '', user.email, user.uid)
    router.push('/')
  } catch (e) {
    console.error('loginSocial error:', e.code, e.message)
    if (e.code !== 'auth/popup-closed-by-user') {
      error.value = 'Error al iniciar sesión. Inténtalo de nuevo.'
    }
  }
}

const loginGoogle   = () => loginSocial(GoogleAuthProvider)
const loginFacebook = () => loginSocial(FacebookAuthProvider)
const loginTwitter  = () => loginSocial(TwitterAuthProvider)
</script>

<template>
  <div class="page">
    <div class="bg-flame"></div>

    <div class="card">

      <!-- Logo -->
      <div class="logo">
        <div class="flame-wrap">
          <svg width="28" height="32" viewBox="0 0 28 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2C14 2 4 12 4 20C4 25.5 8.5 30 14 30C19.5 30 24 25.5 24 20C24 15 20 11 20 11C20 11 18.5 16 15 17.5C15 17.5 19 12.5 14 2Z" fill="#D85A30"/>
            <path d="M14 15C14 15 9 19.5 9 23C9 25.8 11.2 28 14 28C16.8 28 19 25.8 19 23C19 19.5 14 15 14 15Z" fill="#EF9F27"/>
          </svg>
        </div>
        <div class="brand">la<span>Brasa</span></div>
        <div class="tagline">El sabor que te espera</div>
      </div>

      <!-- Social buttons -->
      <div class="social-grid">

        <button class="social-btn" @click="loginGoogle">
          <Icon icon="devicon:google" width="18" />
          Continuar con Google
        </button>

        <button class="social-btn" @click="loginFacebook">
          <Icon icon="logos:facebook" width="18" />
          Continuar con Facebook
        </button>

        <button class="social-btn" @click="loginTwitter">
          <Icon icon="fa6-brands:x-twitter" width="18" />
          Continuar con X
        </button>

      </div>

      <!-- Divider -->
      <div class="divider">o entra con tu correo</div>

      <!-- Form -->
      <div class="field">
        <label for="email">Correo electrónico</label>
        <input id="email" v-model="email" type="email" placeholder="tu@email.com" autocomplete="email" />
      </div>

      <div class="field">
        <label for="password">Contraseña</label>
        <input id="password" v-model="password" type="password" placeholder="••••••••" autocomplete="current-password" />
      </div>

      <p v-if="error" class="error">{{ error }}</p>

      <div class="forgot">
        <RouterLink to="/recuperar">¿Olvidaste tu contraseña?</RouterLink>
      </div>

      <button class="submit-btn" @click="login">Entrar a laBrasa</button>
      <!-- Register footer -->
      <div class="register-footer">
        ¿No tienes cuenta? <RouterLink to="/register">Regístrate aquí</RouterLink>
      </div>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@400;500&display=swap');

.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #F7F4EF;
  background-image:
      url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D85A30' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  font-family: 'DM Sans', sans-serif;
  padding: 2rem 1rem;
  position: relative;
}

.bg-flame {
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse 70% 45% at 50% 100%, rgba(216, 90, 48, 0.13) 0%, transparent 70%);
  pointer-events: none;
}

.card {
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid rgba(0, 0, 0, 0.09);
  padding: 2.75rem 2.25rem 2.25rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 4px 40px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 1;
  animation: fadeUp 0.45s ease both;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Logo ── */
.logo {
  text-align: center;
  margin-bottom: 2rem;
}

.flame-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: linear-gradient(145deg, #FFF0E8, #FFDCC8);
  border-radius: 16px;
  border: 1px solid rgba(216, 90, 48, 0.18);
  margin-bottom: 0.75rem;
}

.brand {
  font-family: 'Playfair Display', serif;
  font-size: 30px;
  font-weight: 700;
  color: #1A1A18;
  letter-spacing: -0.5px;
  line-height: 1;
}

.brand span {
  color: #D85A30;
}

.tagline {
  font-size: 13px;
  color: #A8A89F;
  margin-top: 5px;
  letter-spacing: 0.04em;
}

/* ── Social buttons ── */
.social-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 1.5rem;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 11px 16px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.10);
  background: #ffffff;
  color: #1A1A18;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, transform 0.1s;
}

.social-btn:hover {
  background: #FAFAF8;
  border-color: rgba(0, 0, 0, 0.20);
}

.social-btn:active {
  transform: scale(0.98);
}

.social-btn svg {
  flex-shrink: 0;
}

/* ── Divider ── */
.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1.5rem;
  font-size: 12px;
  color: #A8A89F;
  letter-spacing: 0.04em;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(0, 0, 0, 0.09);
}

/* ── Form ── */
.field {
  margin-bottom: 14px;
}

label {
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: #6B6B65;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  margin-bottom: 6px;
}

input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 11px 14px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.10);
  background: #F4F1EC;
  color: #1A1A18;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
}

input[type="email"]:focus,
input[type="password"]:focus {
  border-color: #D85A30;
  box-shadow: 0 0 0 3px rgba(216, 90, 48, 0.12);
  background: #ffffff;
}

input::placeholder {
  color: #A8A89F;
}

/* ── Forgot ── */
.forgot {
  text-align: right;
  margin-bottom: 18px;
}

.forgot a {
  font-size: 12px;
  color: #D85A30;
  text-decoration: none;
}

.forgot a:hover {
  text-decoration: underline;
}

/* ── Submit ── */
.submit-btn {
  width: 100%;
  padding: 13px;
  border-radius: 12px;
  border: none;
  background: #D85A30;
  color: #ffffff;
  font-family: 'Playfair Display', serif;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.01em;
  transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
  box-shadow: 0 4px 16px rgba(216, 90, 48, 0.30);
}

.submit-btn:hover {
  background: #993C1D;
  box-shadow: 0 6px 20px rgba(216, 90, 48, 0.38);
}

.submit-btn:active {
  transform: scale(0.98);
}

/* ── Register footer ── */
.register-footer {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid rgba(0, 0, 0, 0.09);
  font-size: 13.5px;
  color: #6B6B65;
}

.register-footer a {
  color: #D85A30;
  font-weight: 500;
  text-decoration: none;
}

.register-footer a:hover {
  text-decoration: underline;
}
</style>
