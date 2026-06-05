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
        <div class="tagline">Crea tu cuenta</div>
      </div>

      <!-- Error / éxito -->
      <transition name="fade">
        <div v-if="errorMsg" class="alert alert-error">⚠️ {{ errorMsg }}</div>
      </transition>
      <transition name="fade">
        <div v-if="successMsg" class="alert alert-success">✓ {{ successMsg }}</div>
      </transition>

      <!-- Social buttons -->
      <div class="social-grid">

        <button class="social-btn" @click="handleGoogle" :disabled="loading">
          <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuar con Google
        </button>

        <button class="social-btn" @click="handleFacebook" :disabled="loading">
          <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
          </svg>
          Continuar con Facebook
        </button>

        <button class="social-btn" @click="handleTwitter" :disabled="loading">
          <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#1A1A18"/>
          </svg>
          Continuar con X
        </button>

      </div>

      <!-- Divider -->
      <div class="divider">o regístrate con tu correo</div>

      <!-- Form -->
      <div class="field">
        <label for="nombre">Nombre completo</label>
        <input id="nombre" v-model="form.nombre" type="text" placeholder="Tu nombre" autocomplete="name" :disabled="loading" />
      </div>

      <div class="field">
        <label for="email">Correo electrónico</label>
        <input id="email" v-model="form.email" type="email" placeholder="tu@email.com" autocomplete="email" :disabled="loading" />
      </div>

      <div class="field">
        <label for="password">Contraseña</label>
        <div class="input-wrap">
          <input id="password" v-model="form.password" :type="showPass ? 'text' : 'password'" placeholder="••••••••" autocomplete="new-password" :disabled="loading" />
          <button type="button" class="toggle-pass" @click="showPass = !showPass" tabindex="-1">
            {{ showPass ? '🙈' : '👁️' }}
          </button>
        </div>
        <div v-if="form.password" class="strength-bar">
          <div class="strength-fill" :class="strengthClass" :style="{ width: strengthPercent + '%' }"></div>
        </div>
        <p v-if="form.password" class="strength-label">{{ strengthLabel }}</p>
      </div>

      <div class="field">
        <label for="confirm">Confirmar contraseña</label>
        <input id="confirm" v-model="form.confirm" :type="showPass ? 'text' : 'password'" placeholder="••••••••" autocomplete="new-password" :disabled="loading" :class="{ 'input-error': passwordMismatch }" />
        <p v-if="passwordMismatch" class="mismatch-msg">Las contraseñas no coinciden</p>
      </div>

      <button class="submit-btn" @click="handleRegister" :disabled="loading || !formValid">
        <span v-if="!loading">Crear cuenta en laBrasa</span>
        <span v-else class="spinner"></span>
      </button>

      <!-- Login footer -->
      <div class="register-footer">
        ¿Ya tienes cuenta? <RouterLink :to="{ path: '/login', query: route.query.redirect ? { redirect: route.query.redirect } : {} }">Inicia sesión</RouterLink>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiUrl } from '@/config/api'
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  signInWithPopup,
} from 'firebase/auth'

const router = useRouter()
const route = useRoute()
const auth = getAuth()

const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const showPass = ref(false)

const form = ref({ nombre: '', email: '', password: '', confirm: '' })

const destinoTrasRegistro = () => {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/'
}

// ── Guarda el usuario en MySQL vía DAB ──
async function saveUserToDb(nombre, email, passwordHash = 'firebase-auth') {
  if (!email) {
    console.warn('saveUserToDb: email vacío, se omite')
    return
  }

  try {
    const payload = {
      nombre: nombre || '',
      apellido: '',
      email: email,
      contraseña: passwordHash,
      rol: 'cliente'
    }
    const res = await fetch(apiUrl('/Usuario'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const body = await res.text()

    // 409 Conflict = duplicado, no es error crítico
    if (!res.ok && res.status !== 409) {
      console.error('saveUserToDb: error del servidor', res.status, body)
    }
  } catch (e) {
    console.error('saveUserToDb: error de red', e)
  }
}

const passwordStrength = computed(() => {
  const p = form.value.password
  if (!p) return 0
  let s = 0
  if (p.length >= 8) s++
  if (p.length >= 12) s++
  if (/[A-Z]/.test(p)) s++
  if (/[0-9]/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return s
})
const strengthPercent = computed(() => (passwordStrength.value / 5) * 100)
const strengthClass = computed(() => {
  const s = passwordStrength.value
  if (s <= 1) return 'weak'
  if (s <= 3) return 'medium'
  return 'strong'
})
const strengthLabel = computed(() => {
  const s = passwordStrength.value
  if (s <= 1) return 'Contraseña débil'
  if (s <= 3) return 'Contraseña aceptable'
  return 'Contraseña segura'
})

const passwordMismatch = computed(() => form.value.confirm && form.value.password !== form.value.confirm)
const formValid = computed(() =>
  form.value.nombre.trim() &&
  form.value.email.trim() &&
  form.value.password.length >= 6 &&
  form.value.password === form.value.confirm
)

async function handleRegister() {
  if (!formValid.value) return
  errorMsg.value = ''
  successMsg.value = ''
  loading.value = true
  try {
    const { user } = await createUserWithEmailAndPassword(auth, form.value.email.trim(), form.value.password)
    await updateProfile(user, { displayName: form.value.nombre.trim() })
    await saveUserToDb(form.value.nombre.trim(), form.value.email.trim(), user.uid)
    successMsg.value = '¡Cuenta creada! Redirigiendo...'
    setTimeout(() => router.push(destinoTrasRegistro()), 1400)
  } catch (err) {
    console.error('handleRegister error:', err.code, err.message)
    errorMsg.value = firebaseError(err.code)
  } finally {
    loading.value = false
  }
}

async function handleSocial(ProviderClass) {
  errorMsg.value = ''
  loading.value = true
  try {
    const { user } = await signInWithPopup(auth, new ProviderClass())

    if (!user.email) {
      console.warn('El proveedor no devolvió email; no se guarda en BD')
      router.push(destinoTrasRegistro())
      return
    }

    await saveUserToDb(user.displayName || '', user.email, user.uid)
    router.push(destinoTrasRegistro())
  } catch (err) {
    console.error('handleSocial error:', err.code, err.message)
    if (err.code !== 'auth/popup-closed-by-user') {
      errorMsg.value = firebaseError(err.code)
    }
  } finally {
    loading.value = false
  }
}

const handleGoogle   = () => handleSocial(GoogleAuthProvider)
const handleFacebook = () => handleSocial(FacebookAuthProvider)
const handleTwitter  = () => handleSocial(TwitterAuthProvider)

function firebaseError(code) {
  const map = {
    'auth/email-already-in-use':   'Este correo ya está registrado.',
    'auth/invalid-email':          'El formato del correo no es válido.',
    'auth/weak-password':          'La contraseña debe tener al menos 6 caracteres.',
    'auth/network-request-failed': 'Error de red. Comprueba tu conexión.',
    'auth/too-many-requests':      'Demasiados intentos. Espera un momento.',
    'auth/account-exists-with-different-credential': 'Ya existe una cuenta con ese correo.',
  }
  return map[code] || 'Ha ocurrido un error. Inténtalo de nuevo.'
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@400;500&display=swap');

.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #F7F4EF;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D85A30' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
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

.logo { text-align: center; margin-bottom: 2rem; }

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
.brand span { color: #D85A30; }

.tagline { font-size: 13px; color: #A8A89F; margin-top: 5px; letter-spacing: 0.04em; }

.alert {
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 13px;
  margin-bottom: 1rem;
}
.alert-error   { background: #FEF0EE; border: 1px solid rgba(216, 90, 48, 0.3); color: #993C1D; }
.alert-success { background: #EEFAF2; border: 1px solid rgba(39, 174, 96, 0.3); color: #1E7A45; }

.social-grid { display: flex; flex-direction: column; gap: 10px; margin-bottom: 1.5rem; }

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
.social-btn:hover:not(:disabled) { background: #FAFAF8; border-color: rgba(0, 0, 0, 0.20); }
.social-btn:active:not(:disabled) { transform: scale(0.98); }
.social-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1.5rem;
  font-size: 12px;
  color: #A8A89F;
  letter-spacing: 0.04em;
}
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: rgba(0, 0, 0, 0.09); }

.field { margin-bottom: 14px; }

label {
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: #6B6B65;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  margin-bottom: 6px;
}

input[type="text"],
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
input:focus { border-color: #D85A30; box-shadow: 0 0 0 3px rgba(216, 90, 48, 0.12); background: #ffffff; }
input.input-error { border-color: rgba(216, 90, 48, 0.5); box-shadow: 0 0 0 3px rgba(216, 90, 48, 0.08); }
input::placeholder { color: #A8A89F; }
input:disabled { opacity: 0.5; cursor: not-allowed; }

.input-wrap { position: relative; display: flex; }
.input-wrap input { flex: 1; padding-right: 40px; }
.toggle-pass {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  opacity: 0.5;
  padding: 0;
  transition: opacity 0.15s;
}
.toggle-pass:hover { opacity: 0.85; }

.strength-bar { height: 3px; background: rgba(0,0,0,0.07); border-radius: 2px; margin-top: 8px; overflow: hidden; }
.strength-fill { height: 100%; border-radius: 2px; transition: width 0.4s ease, background 0.4s ease; }
.strength-fill.weak   { background: #D85A30; }
.strength-fill.medium { background: #EF9F27; }
.strength-fill.strong { background: #27ae60; }
.strength-label { font-size: 11px; color: #A8A89F; margin-top: 5px; letter-spacing: 0.04em; }
.mismatch-msg { font-size: 11px; color: #D85A30; margin-top: 5px; }

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
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
  margin-top: 4px;
}
.submit-btn:hover:not(:disabled) { background: #993C1D; box-shadow: 0 6px 20px rgba(216, 90, 48, 0.38); }
.submit-btn:active:not(:disabled) { transform: scale(0.98); }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.register-footer {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid rgba(0, 0, 0, 0.09);
  font-size: 13.5px;
  color: #6B6B65;
}
.register-footer a { color: #D85A30; font-weight: 500; text-decoration: none; }
.register-footer a:hover { text-decoration: underline; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
