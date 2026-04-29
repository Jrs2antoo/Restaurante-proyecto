<template>
  <div id="app">
    <!-- NAVBAR -->
    <nav :class="{ scrolled: isScrolled }">
      <RouterLink to="/" class="nav-logo">La <span>Brasa</span></RouterLink>
      <ul class="nav-links">
        <li><RouterLink to="/">Inicio</RouterLink></li>
        <li><RouterLink to="/catalogo">Menú</RouterLink></li>
        <li><RouterLink to="/reservas">Reservas</RouterLink></li>
        <li>
          <RouterLink to="/login" class="nav-btn">Iniciar Sesión</RouterLink>
        </li>
      </ul>
    </nav>

    <!-- HERO -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <p class="hero-eyebrow">Granada, desde 2008</p>
        <h1 class="hero-title">
          Cocina con<br />
          <em>alma propia</em>
        </h1>
        <p class="hero-sub">
          Producto local, fuego lento y una mesa que siempre te espera.
        </p>
        <RouterLink to="/reservas" class="hero-cta">Reservar mesa</RouterLink>
      </div>
      <div class="hero-scroll">
        <div class="hero-scroll-line"></div>
        <span>Descubrir</span>
      </div>
    </section>

    <!-- POR QUÉ VENIR -->
    <section class="why" id="why">
      <div class="why-inner">
        <div class="reveal">
          <p class="section-label">Por qué elegirnos</p>
          <h2 class="section-title">
            Cada plato cuenta<br /><em>una historia</em>
          </h2>
          <div class="why-line"></div>
          <p class="why-desc">
            En La Brasa cocinamos con ingredientes de temporada seleccionados
            cada mañana en el mercado local. Nuestros cocineros combinan la
            tradición andaluza con técnicas contemporáneas para ofrecerte una
            experiencia que va mucho más allá de comer.
          </p>
        </div>
        <div class="why-cards reveal" style="transition-delay: 0.15s">
          <div class="why-card" v-for="card in cards" :key="card.title">
            <div class="why-card-icon">{{ card.icon }}</div>
            <h3>{{ card.title }}</h3>
            <p>{{ card.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CITA -->
    <div class="quote-band reveal">
      <blockquote>
        "La mejor cocina es aquella que nace del respeto al producto, al
        territorio y al comensal."
      </blockquote>
      <cite>— Rafael Moreno, Chef Ejecutivo</cite>
    </div>

    <!-- GALERÍA -->
    <section class="gallery" id="gallery">
      <div class="gallery-header reveal">
        <div>
          <p class="section-label">Nuestro espacio</p>
          <h2 class="section-title">Ambiente, <em>sabor &amp; detalle</em></h2>
        </div>
      </div>
      <div class="gallery-grid reveal" style="transition-delay: 0.1s">
        <div class="gallery-item g1">
          <img
            src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=900&auto=format&fit=crop&q=80"
            alt="Sala principal del restaurante"
          />
          <div class="gallery-overlay"><span>Sala principal</span></div>
        </div>
        <div class="gallery-item g2">
          <img
            src="https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&auto=format&fit=crop&q=80"
            alt="Plato estrella"
          />
          <div class="gallery-overlay"><span>Plato estrella</span></div>
        </div>
        <div class="gallery-item g3">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=700&auto=format&fit=crop&q=80"
            alt="Interior acogedor"
          />
          <div class="gallery-overlay"><span>Interior</span></div>
        </div>
        <div class="gallery-item g4">
          <img
            src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&auto=format&fit=crop&q=80"
            alt="Barra y coctelería"
          />
          <div class="gallery-overlay"><span>Barra</span></div>
        </div>
        <div class="gallery-item g5">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&auto=format&fit=crop&q=80"
            alt="Alta cocina"
          />
          <div class="gallery-overlay"><span>Alta cocina</span></div>
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

<script setup>
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";

const isScrolled = ref(false);

const cards = [
  {
    icon: "🌿",
    title: "Producto local",
    desc: "Proveedores de Granada y la Alpujarra seleccionados con mimo.",
  },
  {
    icon: "🔥",
    title: "Cocina a la brasa",
    desc: "El fuego como protagonista, realzando sabores auténticos.",
  },
  {
    icon: "🍷",
    title: "Carta de vinos",
    desc: "Más de 80 referencias de bodegas andaluzas y nacionales.",
  },
  {
    icon: "🏡",
    title: "Ambiente único",
    desc: "Un espacio cálido, íntimo, perfecto para cualquier ocasión.",
  },
];

onMounted(() => {
  window.addEventListener("scroll", () => {
    isScrolled.value = window.scrollY > 40;
  });

  const revealEls = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  revealEls.forEach((el) => io.observe(el));
});
</script>

<style>
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

html {
  scroll-behavior: smooth;
}

body {
  font-family: "Montserrat", sans-serif;
  background: var(--cream);
  color: var(--text);
  overflow-x: hidden;
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
.nav-links a:hover {
  color: var(--gold);
}
.nav-links a:hover::after {
  width: 100%;
}
.nav-btn {
  background: var(--gold) !important;
  color: var(--dark) !important;
  padding: 8px 22px !important;
  border-radius: 2px;
  font-weight: 600 !important;
  transition:
    background 0.3s,
    transform 0.2s !important;
}
.nav-btn:hover {
  background: #e0aa45 !important;
  transform: translateY(-1px);
}
.nav-btn::after {
  display: none !important;
}

/* ─── HERO ─── */
.hero {
  position: relative;
  height: 100vh;
  min-height: 640px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.hero-bg {
  position: absolute;
  inset: 0;
  background: url("https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&auto=format&fit=crop&q=80")
    center/cover no-repeat;
  transform: scale(1.08);
  animation: kenBurns 18s ease-in-out infinite alternate;
}
@keyframes kenBurns {
  from {
    transform: scale(1.08) translate(0, 0);
  }
  to {
    transform: scale(1.14) translate(-1%, -1%);
  }
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    160deg,
    rgba(26, 20, 16, 0.72) 0%,
    rgba(26, 20, 16, 0.45) 60%,
    rgba(107, 76, 42, 0.3) 100%
  );
}
.hero-content {
  position: relative;
  text-align: center;
  color: var(--cream);
  padding: 0 1.5rem;
  animation: fadeUp 1.1s ease both;
}
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(30px);
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
  margin-bottom: 1.2rem;
  animation: fadeUp 1.1s 0.15s ease both;
}
.hero-title {
  font-family: "Cormorant Garamond", serif;
  font-size: clamp(3.5rem, 9vw, 7.5rem);
  font-weight: 300;
  line-height: 1;
  margin-bottom: 1.4rem;
  animation: fadeUp 1.1s 0.3s ease both;
}
.hero-title em {
  display: block;
  font-style: italic;
  color: var(--gold);
}
.hero-sub {
  font-size: 0.88rem;
  font-weight: 300;
  letter-spacing: 0.1em;
  opacity: 0.85;
  max-width: 420px;
  margin: 0 auto 2.6rem;
  line-height: 1.8;
  animation: fadeUp 1.1s 0.45s ease both;
}
.hero-cta {
  display: inline-block;
  padding: 14px 44px;
  border: 1px solid var(--gold);
  color: var(--cream);
  text-decoration: none;
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  font-weight: 500;
  transition:
    background 0.3s,
    color 0.3s;
  animation: fadeUp 1.1s 0.6s ease both;
}
.hero-cta:hover {
  background: var(--gold);
  color: var(--dark);
}
.hero-scroll {
  position: absolute;
  bottom: 2.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--cream);
  opacity: 0.5;
  font-size: 0.62rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  animation: fadeUp 1.4s 1s ease both;
}
.hero-scroll-line {
  width: 1px;
  height: 40px;
  background: var(--cream);
  animation: scrollPulse 2s ease infinite;
}
@keyframes scrollPulse {
  0%,
  100% {
    opacity: 0.3;
    transform: scaleY(1);
  }
  50% {
    opacity: 0.7;
    transform: scaleY(1.1);
  }
}

/* ─── SECTION BASE ─── */
section {
  padding: 7rem 5vw;
}
.section-label {
  font-size: 0.65rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 0.9rem;
}
.section-title {
  font-family: "Cormorant Garamond", serif;
  font-size: clamp(2.2rem, 4vw, 3.4rem);
  font-weight: 300;
  line-height: 1.15;
  color: var(--dark);
}
.section-title em {
  font-style: italic;
  color: var(--brown);
}

/* ─── POR QUÉ ELEGIRNOS ─── */
.why {
  background: var(--dark);
  position: relative;
  overflow: hidden;
}
.why::before {
  content: "";
  position: absolute;
  top: -80px;
  right: -80px;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(201, 150, 58, 0.12) 0%,
    transparent 70%
  );
}
.why-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5rem;
  align-items: center;
}
.why .section-title {
  color: var(--cream);
}
.why .section-title em {
  color: var(--gold);
}
.why-desc {
  color: rgba(245, 240, 232, 0.65);
  font-size: 0.88rem;
  line-height: 2;
  margin-top: 1.4rem;
  font-weight: 300;
}
.why-line {
  width: 48px;
  height: 1px;
  background: var(--gold);
  margin: 1.6rem 0;
}
.why-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
.why-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(201, 150, 58, 0.2);
  border-radius: 4px;
  padding: 2rem 1.6rem;
  transition:
    border-color 0.3s,
    background 0.3s,
    transform 0.3s;
  cursor: default;
}
.why-card:hover {
  border-color: var(--gold);
  background: rgba(201, 150, 58, 0.07);
  transform: translateY(-3px);
}
.why-card-icon {
  font-size: 1.9rem;
  margin-bottom: 1rem;
}
.why-card h3 {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.15rem;
  font-weight: 400;
  color: var(--cream);
  margin-bottom: 0.5rem;
}
.why-card p {
  font-size: 0.78rem;
  color: rgba(245, 240, 232, 0.55);
  line-height: 1.8;
  font-weight: 300;
}

/* ─── QUOTE BAND ─── */
.quote-band {
  background: var(--warm);
  padding: 5rem 5vw;
  text-align: center;
}
.quote-band blockquote {
  font-family: "Cormorant Garamond", serif;
  font-size: clamp(1.5rem, 3vw, 2.4rem);
  font-weight: 300;
  font-style: italic;
  color: var(--brown);
  max-width: 760px;
  margin: 0 auto;
  line-height: 1.5;
}
.quote-band cite {
  display: block;
  margin-top: 1.2rem;
  font-family: "Montserrat", sans-serif;
  font-size: 0.68rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--gold);
  font-style: normal;
}

/* ─── GALERÍA ─── */
.gallery {
  background: var(--cream);
}
.gallery-header {
  max-width: 1200px;
  margin: 0 auto 3.5rem;
}
.gallery-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: 260px 260px;
  gap: 14px;
}
.gallery-item {
  overflow: hidden;
  border-radius: 3px;
  position: relative;
}
.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}
.gallery-item:hover img {
  transform: scale(1.06);
}
.g1 {
  grid-column: 1 / 6;
  grid-row: 1 / 2;
}
.g2 {
  grid-column: 6 / 9;
  grid-row: 1 / 2;
}
.g3 {
  grid-column: 9 / 13;
  grid-row: 1 / 3;
}
.g4 {
  grid-column: 1 / 4;
  grid-row: 2 / 3;
}
.g5 {
  grid-column: 4 / 9;
  grid-row: 2 / 3;
}
.gallery-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(26, 20, 16, 0.55) 0%,
    transparent 50%
  );
  opacity: 0;
  transition: opacity 0.4s;
  display: flex;
  align-items: flex-end;
  padding: 1.2rem;
}
.gallery-item:hover .gallery-overlay {
  opacity: 1;
}
.gallery-overlay span {
  font-size: 0.72rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--cream);
  font-weight: 500;
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

/* ─── SCROLL REVEAL ─── */
.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition:
    opacity 0.7s ease,
    transform 0.7s ease;
}
.reveal.visible {
  opacity: 1;
  transform: none;
}

/* ─── RESPONSIVE ─── */
@media (max-width: 900px) {
  .why-inner {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  .gallery-grid {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
  }
  .g1,
  .g2,
  .g3,
  .g4,
  .g5 {
    grid-column: auto;
    grid-row: auto;
  }
}
@media (max-width: 600px) {
  .nav-links {
    display: none;
  }
  .why-cards {
    grid-template-columns: 1fr;
  }
  .gallery-grid {
    grid-template-columns: 1fr;
  }
}
</style>
