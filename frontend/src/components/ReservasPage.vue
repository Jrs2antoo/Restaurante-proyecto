<template>
  <div id="app">
    <!-- NAVBAR -->
    <Cabecera />

    <!-- HERO RESERVAS -->
    <section class="reservas-hero">
      <div class="reservas-hero-bg"></div>
      <div class="reservas-hero-overlay"></div>
      <div class="reservas-hero-content">
        <p class="hero-eyebrow">Experiencia completa</p>
        <h1 class="hero-title">Reserva tu<br /><em>mesa</em></h1>
        <p class="hero-sub">Asegura tu lugar y vive una noche que recordarás.</p>
      </div>
    </section>

    <!-- FORMULARIO DE RESERVA -->
    <section class="reservas-section">
      <div class="reservas-wrapper">

        <!-- PASO INDICADOR -->
        <div class="steps-bar">
          <div
            v-for="(step, i) in steps"
            :key="i"
            class="step-item"
            :class="{ active: currentStep === i + 1, done: currentStep > i + 1 }"
          >
            <div class="step-circle">
              <span v-if="currentStep > i + 1">✓</span>
              <span v-else>{{ i + 1 }}</span>
            </div>
            <span class="step-label">{{ step }}</span>
          </div>
          <div class="steps-progress-bar">
            <div class="steps-progress-fill" :style="{ width: ((currentStep - 1) / (steps.length - 1)) * 100 + '%' }"></div>
          </div>
        </div>

        <!-- PASO 1: Fecha, Mesa y Personas -->
        <Transition name="step-fade" mode="out-in">
          <div v-if="currentStep === 1" key="step1" class="step-content">
            <div class="step-header">
              <p class="section-label">Paso 1 de 3</p>
              <h2 class="step-title">Elige fecha, zona<br /><em>y mesa</em></h2>
            </div>

            <div class="form-grid">
              <!-- Fecha -->
              <div class="form-group full-width">
                <label class="form-label">Fecha de la reserva</label>
                <div class="calendar-wrapper">
                  <div class="calendar-nav">
                    <button class="cal-nav-btn" @click="prevMonth">‹</button>
                    <span class="cal-month-title">{{ mesActualNombre }} {{ anioActual }}</span>
                    <button class="cal-nav-btn" @click="nextMonth">›</button>
                  </div>
                  <div class="calendar-grid">
                    <span v-for="d in diasSemana" :key="d" class="cal-dow">{{ d }}</span>
                    <span
                      v-for="(day, idx) in diasCalendario"
                      :key="idx"
                      class="cal-day"
                      :class="{
                        empty: !day,
                        past: day && isPast(day),
                        selected: day && isSameDay(day, fechaSeleccionada),
                        today: day && isToday(day),
                        unavailable: day && !isPast(day) && !isDayAvailable(day)
                      }"
                      @click="day && !isPast(day) && isDayAvailable(day) && selectFecha(day)"
                    >
                      {{ day ? day.getDate() : '' }}
                    </span>
                  </div>
                  <div class="calendar-legend">
                    <span class="legend-item"><span class="legend-dot available"></span>Disponible</span>
                    <span class="legend-item"><span class="legend-dot unavailable"></span>Sin mesas</span>
                    <span class="legend-item"><span class="legend-dot selected-dot"></span>Seleccionado</span>
                  </div>
                </div>
              </div>

              <!-- Personas -->
              <div class="form-group full-width">
                <label class="form-label">Número de comensales</label>
                <div class="personas-selector">
                  <button class="personas-btn" @click="personas > 1 && personas--">−</button>
                  <div class="personas-display">
                    <span class="personas-num">{{ personas }}</span>
                    <span class="personas-label">{{ personas === 1 ? 'persona' : 'personas' }}</span>
                  </div>
                  <button class="personas-btn" @click="personas < 12 && personas++">+</button>
                </div>
                <p class="form-hint">Máximo 12 personas. Para grupos mayores llámanos.</p>
              </div>
            </div>

            <!-- Ubicación -->
            <div class="ubicacion-section">
              <label class="form-label">¿Dónde prefieres sentarte?</label>
              <div class="ubicacion-cards">
                <button
                  class="ubicacion-card"
                  :class="{ selected: ubicacion === 'interior' }"
                  @click="ubicacion = 'interior'"
                >
                  <div class="ubicacion-icon">🏠</div>
                  <h3>Interior</h3>
                  <p>Ambiente íntimo con decoración andaluza, climatizado todo el año.</p>
                  <div class="ubicacion-check">✓</div>
                </button>
                <button
                  class="ubicacion-card"
                  :class="{ selected: ubicacion === 'terraza' }"
                  @click="ubicacion = 'terraza'"
                >
                  <div class="ubicacion-icon">🌿</div>
                  <h3>Terraza exterior</h3>
                  <p>Bajo el cielo de Granada. Disponible según condiciones meteorológicas.</p>
                  <div class="ubicacion-check">✓</div>
                </button>
              </div>
            </div>

            <!-- Mesa -->
            <div class="mesas-section" v-if="fechaSeleccionada">
              <div class="disponibilidad-info">
                <div class="disp-badge" :class="disponibilidadMesas.clase">
                  <span class="disp-dot"></span>
                  {{ disponibilidadMesas.texto }}
                </div>
              </div>
              <div class="mesas-grid">
                <button
                  v-for="mesa in mesasDisponibles"
                  :key="mesa.idMesa"
                  class="mesa-card"
                  :class="{
                    selected: mesaSeleccionada === mesa.idMesa,
                    ocupada: !mesa.disponible,
                    insuficiente: mesa.disponible && mesa.capacidad < personas
                  }"
                  :disabled="!mesa.disponible || mesa.capacidad < personas"
                  :title="mesa.disponible ? `Mesa ${mesa.idMesa} - ${mesa.capacidad} personas` : `Mesa ${mesa.idMesa} - ocupada este día`"
                  @click="seleccionarMesa(mesa)"
                >
                  <span class="mesa-icon">🪑</span>
                  <span class="mesa-num">Mesa {{ mesa.idMesa }}</span>
                  <span class="mesa-capacidad">{{ mesa.capacidad }} {{ mesa.capacidad === 1 ? 'persona' : 'personas' }}</span>
                  <span v-if="!mesa.disponible" class="mesa-tag">Ocupada</span>
                  <span v-else-if="mesa.capacidad < personas" class="mesa-tag">Pequeña</span>
                </button>
              </div>
            </div>

            <div class="step-actions">
              <button
                class="btn-primary"
                :disabled="!canGoStep2"
                @click="goStep(2)"
              >
                Continuar <span>→</span>
              </button>
            </div>
          </div>
        </Transition>

        <!-- PASO 2: Datos personales -->
        <Transition name="step-fade" mode="out-in">
          <div v-if="currentStep === 2" key="step2" class="step-content">
            <div class="step-header">
              <p class="section-label">Paso 2 de 3</p>
              <h2 class="step-title">Tus datos<br /><em>de contacto</em></h2>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Nombre completo <span class="required">*</span></label>
                <input v-model="contacto.nombre" class="form-input" type="text" placeholder="Rafael Moreno" :readonly="contactoBloqueado.nombre" />
              </div>
              <div class="form-group">
                <label class="form-label">Teléfono <span class="required">*</span></label>
                <input v-model="contacto.telefono" class="form-input" type="tel" placeholder="+34 600 000 000" :readonly="contactoBloqueado.telefono" />
              </div>
              <div class="form-group full-width">
                <label class="form-label">Correo electrónico <span class="required">*</span></label>
                <input v-model="contacto.email" class="form-input" type="email" placeholder="tu@correo.com" :readonly="contactoBloqueado.email" />
              </div>
              <div class="form-group full-width">
                <label class="form-label">Peticiones especiales <span class="optional">(opcional)</span></label>
                <textarea
                  v-model="contacto.peticiones"
                  class="form-input form-textarea"
                  placeholder="Alergias, aniversarios, menú infantil, accesibilidad..."
                  rows="3"
                ></textarea>
              </div>
            </div>

            <!-- Resumen lateral -->
            <div class="resumen-card">
              <p class="resumen-title">Tu reserva</p>
              <div class="resumen-items">
                <div class="resumen-item">
                  <span class="resumen-icon">📅</span>
                  <span>{{ fechaFormateada }}</span>
                </div>
                <div class="resumen-item">
                  <span class="resumen-icon">🕐</span>
                  <span>Mesa {{ mesaSeleccionada }}</span>
                </div>
                <div class="resumen-item">
                  <span class="resumen-icon">👥</span>
                  <span>{{ personas }} {{ personas === 1 ? 'persona' : 'personas' }}</span>
                </div>
                <div class="resumen-item">
                  <span class="resumen-icon">{{ ubicacion === 'interior' ? '🏠' : '🌿' }}</span>
                  <span>{{ ubicacion === 'interior' ? 'Interior' : 'Terraza' }}</span>
                </div>
              </div>
            </div>

            <div class="step-actions">
              <button class="btn-secondary" @click="goStep(1)">← Volver</button>
              <button class="btn-primary" :disabled="!canGoStep3" @click="goStep(3)">
                Continuar al pago <span>→</span>
              </button>
            </div>
          </div>
        </Transition>

        <!-- PASO 3: Pago de fianza -->
        <Transition name="step-fade" mode="out-in">
          <div v-if="currentStep === 3" key="step3" class="step-content">
            <div class="step-header">
              <p class="section-label">Paso 3 de 3</p>
              <h2 class="step-title">Fianza de<br /><em>reserva</em></h2>
            </div>

            <div class="pago-layout">
              <!-- Resumen de reserva -->
              <div class="pago-resumen">
                <div class="pago-resumen-header">
                  <span>Resumen de reserva</span>
                </div>
                <div class="resumen-items">
                  <div class="resumen-item">
                    <span class="resumen-icon">👤</span>
                    <span>{{ contacto.nombre }}</span>
                  </div>
                  <div class="resumen-item">
                    <span class="resumen-icon">📅</span>
                    <span>{{ fechaFormateada }}</span>
                  </div>
                  <div class="resumen-item">
                    <span class="resumen-icon">🕐</span>
                    <span>Mesa {{ mesaSeleccionada }}</span>
                  </div>
                  <div class="resumen-item">
                    <span class="resumen-icon">👥</span>
                    <span>{{ personas }} {{ personas === 1 ? 'persona' : 'personas' }}</span>
                  </div>
                  <div class="resumen-item">
                    <span class="resumen-icon">{{ ubicacion === 'interior' ? '🏠' : '🌿' }}</span>
                    <span>{{ ubicacion === 'interior' ? 'Interior' : 'Terraza' }}</span>
                  </div>
                </div>
                <div class="pago-fianza-info">
                  <div class="fianza-row">
                    <span>Fianza por comensal</span>
                    <span>{{ fianzaPorPersona }}€</span>
                  </div>
                  <div class="fianza-row">
                    <span>Comensales</span>
                    <span>× {{ personas }}</span>
                  </div>
                  <div class="fianza-total">
                    <span>Total fianza</span>
                    <span class="fianza-amount">{{ fianzaTotal }}€</span>
                  </div>
                  <p class="fianza-nota">
                    La fianza se descuenta íntegramente de tu consumición.
                    En caso de cancelación con menos de 24h, no es reembolsable.
                  </p>
                </div>
              </div>

              <!-- Formulario de pago -->
              <div class="pago-form">
                <div class="metodos-pago">
                  <button
                    v-for="m in metodosPago"
                    :key="m.id"
                    class="metodo-btn"
                    :class="{ selected: metodoPago === m.id }"
                    @click="metodoPago = m.id"
                  >
                    <span class="metodo-icon">{{ m.icon }}</span>
                    <span>{{ m.label }}</span>
                    <div class="metodo-check">✓</div>
                  </button>
                </div>

                <!-- Tarjeta de crédito -->
                <div v-if="metodoPago === 'tarjeta'" class="tarjeta-form">
                  <div class="form-grid">
                    <div class="form-group full-width">
                      <label class="form-label">Número de tarjeta</label>
                      <input
                        v-model="pago.numero"
                        class="form-input"
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        maxlength="19"
                        @input="formatCard"
                      />
                    </div>
                    <div class="form-group full-width">
                      <label class="form-label">Titular de la tarjeta</label>
                      <input v-model="pago.titular" class="form-input" type="text" placeholder="Nombre como aparece en la tarjeta" />
                    </div>
                    <div class="form-group">
                      <label class="form-label">Caducidad</label>
                      <input v-model="pago.expiry" class="form-input" type="text" placeholder="MM/AA" maxlength="5" @input="formatExpiry" />
                    </div>
                    <div class="form-group">
                      <label class="form-label">CVV</label>
                      <input
                        v-model="pago.cvv"
                        class="form-input"
                        type="text"
                        placeholder="•••"
                        maxlength="4"
                      />
                    </div>
                  </div>
                </div>

                <!-- Bizum -->
                <div v-if="metodoPago === 'bizum'" class="bizum-form">
                  <div class="bizum-logo">Bizum</div>
                  <div class="form-group">
                    <label class="form-label">Número de teléfono Bizum</label>
                    <input v-model="pago.bizumTel" class="form-input" type="tel" placeholder="+34 600 000 000" />
                  </div>
                  <p class="form-hint">Recibirás una solicitud de pago de {{ fianzaTotal }}€ en tu app Bizum.</p>
                </div>

                <!-- Seguridad -->
                <div class="seguridad-badge">
                  <span>🔒</span>
                  <span>Pago seguro cifrado SSL. No almacenamos datos de tarjeta.</span>
                </div>

                <div class="step-actions">
                  <button class="btn-secondary" @click="goStep(2)">← Volver</button>
                  <button
                    class="btn-primary btn-pago"
                    :disabled="!canPagar || pagando"
                    @click="confirmarReserva"
                  >
                    <span v-if="!pagando">Pagar {{ fianzaTotal }}€ y confirmar</span>
                    <span v-else class="loading-dots">Procesando<span>.</span><span>.</span><span>.</span></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>

        <!-- PASO 4: Confirmación -->
        <Transition name="step-fade" mode="out-in">
          <div v-if="currentStep === 4" key="step4" class="step-content confirmacion">
            <div class="confirmacion-icon">✓</div>
            <h2 class="confirmacion-title">¡Reserva confirmada!</h2>
            <p class="confirmacion-sub">
              Hemos enviado los detalles a <strong>{{ contacto.email }}</strong>.
              Te esperamos con ganas.
            </p>
            <div class="confirmacion-card">
              <div class="confirmacion-ref">
                <span class="confirmacion-ref-label">Referencia</span>
                <span class="confirmacion-ref-num">#{{ referencia }}</span>
              </div>
              <div class="resumen-items">
                <div class="resumen-item">
                  <span class="resumen-icon">👤</span>
                  <span>{{ contacto.nombre }}</span>
                </div>
                <div class="resumen-item">
                  <span class="resumen-icon">📅</span>
                  <span>{{ fechaFormateada }}</span>
                </div>
                <div class="resumen-item">
                  <span class="resumen-icon">🕐</span>
                  <span>Mesa {{ mesaSeleccionada }}</span>
                </div>
                <div class="resumen-item">
                  <span class="resumen-icon">👥</span>
                  <span>{{ personas }} {{ personas === 1 ? 'persona' : 'personas' }}</span>
                </div>
                <div class="resumen-item">
                  <span class="resumen-icon">{{ ubicacion === 'interior' ? '🏠' : '🌿' }}</span>
                  <span>{{ ubicacion === 'interior' ? 'Interior' : 'Terraza' }}</span>
                </div>
                <div class="resumen-item">
                  <span class="resumen-icon">💳</span>
                  <span>Fianza pagada: {{ fianzaTotal }}€</span>
                </div>
              </div>
            </div>
            <div class="confirmacion-actions">
              <RouterLink to="/" class="btn-secondary">← Volver al inicio</RouterLink>
              <button class="btn-primary" @click="nuevaReserva">Nueva reserva</button>
            </div>
          </div>
        </Transition>

      </div>
    </section>

    <!-- FOOTER -->
    <Footer />
  </div>
</template>

<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Cabecera from "./Cabecera.vue";
import Footer from "./Footer.vue";

const DAB = "/api";

export default {
  name: "ReservasPage",
  components: { Cabecera, Footer },

  data() {
    const hoy = new Date();

    return {
      usuarioActual: null,

      currentStep: 1,
      steps: ["Disponibilidad", "Tus datos", "Pago"],

      // Calendario
      mesVista: new Date(hoy.getFullYear(), hoy.getMonth(), 1),
      diasSemana: ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"],
      fechaSeleccionada: null,

      // Reserva
      mesaSeleccionada: null,
      personas: 2,
      ubicacion: "interior",

      // Datos BD
      todasLasMesas: [],
      reservasDelDia: [],
      reservasPorFecha: {},

      cargandoMesas: false,
      cargandoReservas: false,

      // Contacto
      contacto: {
        nombre: "",
        telefono: "",
        email: "",
        peticiones: "",
      },

      contactoBloqueado: {
        nombre: false,
        telefono: false,
        email: false,
      },

      // Pago
      metodoPago: "tarjeta",

      metodosPago: [
        {
          id: "tarjeta",
          icon: "💳",
          label: "Tarjeta",
        },
        {
          id: "bizum",
          icon: "📱",
          label: "Bizum",
        },
      ],

      pago: {
        numero: "",
        titular: "",
        expiry: "",
        cvv: "",
        bizumTel: "",
      },

      showCVV: false,
      pagando: false,
      referencia: "",

      fianzaPorPersona: 2.5,
    };
  },

  computed: {

    anioActual() {
      return this.mesVista.getFullYear();
    },

    mesActualNombre() {
      return this.mesVista
          .toLocaleString("es-ES", { month: "long" })
          .replace(/^\w/, c => c.toUpperCase());
    },

    diasCalendario() {

      const year = this.mesVista.getFullYear();
      const month = this.mesVista.getMonth();

      const primerDia = new Date(year, month, 1);

      let startDow = primerDia.getDay();

      startDow = startDow === 0 ? 6 : startDow - 1;

      const totalDias = new Date(year, month + 1, 0).getDate();

      const dias = [];

      for (let i = 0; i < startDow; i++) {
        dias.push(null);
      }

      for (let d = 1; d <= totalDias; d++) {
        dias.push(new Date(year, month, d));
      }

      return dias;
    },

    fechaISO() {

      if (!this.fechaSeleccionada) return "";

      const d = this.fechaSeleccionada;

      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    },

    mesasDisponibles() {

      if (!this.fechaSeleccionada) return [];

      const mesasOcupadasIds = this.reservasDelDia
          .filter(r =>
              r.estado === "confirmada" ||
              r.estado === "pendiente"
          )
          .map(r => r.idMesa);

      return this.todasLasMesas

          .filter(m => {

            const ubUsuario = this.ubicacion.toLowerCase();
            const ubMesa = (m.ubicacion || "").toLowerCase();

            return ubUsuario === "cualquiera" || ubMesa === ubUsuario;
          })

          .map(m => ({

            ...m,

            disponible:
                !!m.disponible &&
                !mesasOcupadasIds.includes(m.idMesa),
          }));
    },

    mesasLibres() {
      return this.mesasDisponibles.filter(m => m.disponible).length;
    },

    disponibilidadMesas() {

      if (this.cargandoMesas || this.cargandoReservas) {
        return {
          texto: "Comprobando disponibilidad…",
          clase: "disp-gris",
        };
      }

      const libres = this.mesasLibres;

      if (libres === 0) {
        return {
          texto: "Sin mesas disponibles",
          clase: "disp-rojo",
        };
      }

      if (libres <= 2) {
        return {
          texto: `¡Últimas ${libres} mesas disponibles!`,
          clase: "disp-amarillo",
        };
      }

      return {
        texto: `${libres} mesas disponibles`,
        clase: "disp-verde",
      };
    },

    fechaFormateada() {

      if (!this.fechaSeleccionada) return "–";

      return this.fechaSeleccionada.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    },

    fianzaTotal() {
      return this.fianzaPorPersona * this.personas;
    },

    canGoStep2() {

      return (
          this.fechaSeleccionada &&
          this.ubicacion &&
          this.mesaSeleccionada
      );
    },

    canGoStep3() {

      return (
          this.contacto.nombre &&
          this.contacto.telefono &&
          this.contacto.email
      );
    },

    canPagar() {

      if (this.metodoPago === "tarjeta") {

        return (
            this.pago.numero.length >= 19 &&
            this.pago.titular &&
            this.pago.expiry.length === 5 &&
            this.pago.cvv.length >= 3
        );
      }

      if (this.metodoPago === "bizum") {
        return this.pago.bizumTel.length >= 9;
      }

      return false;
    },
  },

  watch: {

    async fechaSeleccionada(nuevaFecha) {

      if (!nuevaFecha) return;

      this.mesaSeleccionada = null;

      await this.cargarReservasDelDia();
    },

    ubicacion() {
      this.mesaSeleccionada = null;
    },

    personas() {

      const mesa = this.mesasDisponibles.find(
          m => m.idMesa === this.mesaSeleccionada
      );

      if (!mesa || mesa.capacidad < this.personas) {
        this.mesaSeleccionada = null;
      }
    },
  },

  mounted() {

    const auth = getAuth();

    onAuthStateChanged(auth, async user => {
      this.usuarioActual = user;
      await this.autocompletarContacto();
    });

    Promise.all([
      this.cargarMesas(),
      this.cargarReservasMes(),
    ]);
  },

  methods: {
    async autocompletarContacto() {

      const emailUsuario =
          this.usuarioActual?.email;

      if (!emailUsuario) return;

      this.contacto.email = emailUsuario;
      this.contactoBloqueado.email = true;

      if (!this.contacto.nombre && this.usuarioActual?.displayName) {
        this.contacto.nombre = this.usuarioActual.displayName;
        this.contactoBloqueado.nombre = true;
      }

      try {

        const usuarioRes =
            await fetch(`${DAB}/Usuario`);

        if (!usuarioRes.ok) return;

        const usuarioJson =
            await usuarioRes.json();

        const usuarios =
            usuarioJson.value || [];

        const usuarioMySQL =
            usuarios.find(
                u =>
                    u.email?.toLowerCase() ===
                    emailUsuario.toLowerCase()
            );

        if (!usuarioMySQL) return;

        const nombreCompleto =
            `${usuarioMySQL.nombre || ""} ${usuarioMySQL.apellido || ""}`
                .trim();

        if (nombreCompleto) {
          this.contacto.nombre = nombreCompleto;
          this.contactoBloqueado.nombre = true;
        }

        const clienteRes =
            await fetch(`${DAB}/Cliente`);

        if (!clienteRes.ok) return;

        const clienteJson =
            await clienteRes.json();

        const clientes =
            clienteJson.value || [];

        const clienteMySQL =
            clientes.find(c => c.idUsuario === usuarioMySQL.idUsuario);

        if (clienteMySQL?.telefono) {
          this.contacto.telefono = clienteMySQL.telefono;
          this.contactoBloqueado.telefono = true;
        }

      } catch (e) {

        console.error("Error autocompletando contacto:", e);
      }
    },

    prevMonth() {

      const d = new Date(this.mesVista);

      d.setMonth(d.getMonth() - 1);

      this.mesVista = d;

      this.cargarReservasMes();
    },

    nextMonth() {

      const d = new Date(this.mesVista);

      d.setMonth(d.getMonth() + 1);

      this.mesVista = d;

      this.cargarReservasMes();
    },

    isPast(day) {

      const hoy = new Date();

      hoy.setHours(0, 0, 0, 0);

      return day < hoy;
    },

    isToday(day) {
      return day.toDateString() === new Date().toDateString();
    },

    isSameDay(a, b) {

      if (!a || !b) return false;

      return a.toDateString() === b.toDateString();
    },

    isDayAvailable(day) {

      if (this.isPast(day)) return false;

      const iso =
          `${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}`;

      const reservasEseDia =
          this.reservasPorFecha[iso] || [];

      const mesasOcupadas =
          reservasEseDia
              .filter(r =>
                  r.estado === "confirmada" ||
                  r.estado === "pendiente"
              )
              .map(r => r.idMesa);

      return mesasOcupadas.length < this.todasLasMesas.length;
    },

    selectFecha(day) {
      this.fechaSeleccionada = day;
    },

    seleccionarMesa(mesa) {

      if (!mesa.disponible) return;

      if (mesa.capacidad < this.personas) return;

      this.mesaSeleccionada = mesa.idMesa;
    },

    async cargarMesas() {

      this.cargandoMesas = true;

      try {

        const res = await fetch(`${DAB}/Mesa`);

        const json = await res.json();

        this.todasLasMesas = json.value || [];

      } catch (e) {

        console.error("Error cargando mesas:", e);

        this.todasLasMesas = [];

      } finally {

        this.cargandoMesas = false;
      }
    },

    async cargarReservasDelDia() {

      if (!this.fechaISO) return;

      this.cargandoReservas = true;

      try {

        const res = await fetch(`${DAB}/Reserva`);

        const json = await res.json();

        const todas = json.value || [];

        this.reservasDelDia = todas.filter(r => {

          if (!r.fecha) return false;

          const fecha = String(r.fecha).substring(0, 10);

          return fecha === this.fechaISO;
        });

      } catch (e) {

        console.error("Error cargando reservas:", e);

        this.reservasDelDia = [];

      } finally {

        this.cargandoReservas = false;
      }
    },

    async cargarReservasMes() {

      try {

        const res = await fetch(`${DAB}/Reserva`);

        const json = await res.json();

        const reservas = json.value || [];

        const cache = {};

        reservas.forEach(r => {

          if (!r.fecha) return;

          const fecha = String(r.fecha).substring(0, 10);

          if (!cache[fecha]) {
            cache[fecha] = [];
          }

          cache[fecha].push(r);
        });

        this.reservasPorFecha = cache;

      } catch (e) {

        console.error("Error cargando reservas mes:", e);

        this.reservasPorFecha = {};
      }
    },

    goStep(n) {

      this.currentStep = n;

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },

    formatCard(e) {

      let v =
          e.target.value
              .replace(/\D/g, "")
              .substring(0, 16);

      this.pago.numero =
          v.replace(/(.{4})/g, "$1 ").trim();
    },

    formatExpiry(e) {

      let v =
          e.target.value
              .replace(/\D/g, "")
              .substring(0, 4);

      if (v.length > 2) {
        v = v.substring(0, 2) + "/" + v.substring(2);
      }

      this.pago.expiry = v;
    },

    formatCardNum(num) {

      if (!num) {
        return "•••• •••• •••• ••••";
      }

      const padded =
          num.replace(/\s/g, "").padEnd(16, "•");

      return padded
          .replace(/(.{4})/g, "$1 ")
          .trim();
    },

    async confirmarReserva() {

      this.pagando = true;

      try {

        const mesaElegida =
            this.mesasDisponibles.find(
                m => m.idMesa === this.mesaSeleccionada
            );

        if (!mesaElegida) {
          throw new Error("Mesa no disponible");
        }

        const emailUsuario = this.usuarioActual?.email;

        if (!emailUsuario) {
          throw new Error("Debes iniciar sesión");
        }

        const usuarioMySQL =
            await this.obtenerOCrearUsuarioMySQL(emailUsuario);

        const fechaLimite = new Date();

        fechaLimite.setHours(
            fechaLimite.getHours() + 48
        );

        const fechaLimiteISO =
            fechaLimite
                .toISOString()
                .slice(0, 19)
                .replace("T", " ");

        const body = {

          idUsuario:
          usuarioMySQL.idUsuario,

          idMesa:
          mesaElegida.idMesa,

          fecha:
          this.fechaISO,

          hora:
              "20:00:00",

          numPersonas:
          this.personas,

          estado:
              "pendiente",

          fianza:
          this.fianzaTotal,

          estadoPago:
              "pendiente",

          fechaPago:
              null,

          metodoPago:
              this.metodoPago === "bizum"
                  ? "transferencia"
                  : "tarjeta",

          fechaLimitePago:
          fechaLimiteISO,
        };

        console.log("[POST Reserva]", body);

        const res = await fetch(`${DAB}/Reserva`, {

          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(body),
        });

        if (!res.ok) {

          const txt = await res.text();

          throw new Error(txt);
        }

        const data = await res.json();

        const reservaCreada =
            data.value?.[0] || data;

        // Recargar
        await this.cargarReservasDelDia();
        await this.cargarReservasMes();

        this.referencia =
            "LB" +
            String(
                reservaCreada.idReserva || Date.now()
            )
                .slice(-6)
                .toUpperCase();

        this.currentStep = 4;

      } catch (e) {

        console.error("Error reserva:", e);

        alert(e.message);

      } finally {

        this.pagando = false;
      }
    },

    async obtenerOCrearUsuarioMySQL(emailUsuario) {

      const usuarioRes =
          await fetch(`${DAB}/Usuario`);

      if (!usuarioRes.ok) {
        throw new Error("No se pudieron cargar los usuarios");
      }

      const usuarioJson =
          await usuarioRes.json();

      const usuarios =
          usuarioJson.value || [];

      const usuarioExistente =
          usuarios.find(
              u =>
                  u.email?.toLowerCase() ===
                  emailUsuario.toLowerCase()
          );

      if (usuarioExistente?.idUsuario) {
        await this.obtenerOCrearClienteMySQL(usuarioExistente.idUsuario);
        return usuarioExistente;
      }

      const partesNombre =
          this.contacto.nombre
              .trim()
              .split(/\s+/);

      const nombre =
          partesNombre.shift() ||
          this.usuarioActual?.displayName ||
          emailUsuario.split("@")[0];

      const apellido =
          partesNombre.join(" ") || "";

      const nuevoUsuario = {
        nombre,
        apellido,
        email: emailUsuario,
        "contraseña": "firebase",
        rol: "cliente",
      };

      const crearRes =
          await fetch(`${DAB}/Usuario`, {

            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify(nuevoUsuario),
          });

      if (!crearRes.ok) {

        const txt =
            await crearRes.text();

        throw new Error(txt || "No se pudo crear el usuario en MySQL");
      }

      const creadoJson =
          await crearRes.json();

      const usuarioCreado =
          creadoJson.value?.[0] || creadoJson;

      if (!usuarioCreado?.idUsuario) {
        throw new Error("Usuario creado sin idUsuario");
      }

      await this.obtenerOCrearClienteMySQL(usuarioCreado.idUsuario);

      return usuarioCreado;
    },

    async obtenerOCrearClienteMySQL(idUsuario) {

      const clienteRes =
          await fetch(`${DAB}/Cliente`);

      if (!clienteRes.ok) {
        throw new Error("No se pudieron cargar los clientes");
      }

      const clienteJson =
          await clienteRes.json();

      const clientes =
          clienteJson.value || [];

      const clienteExistente =
          clientes.find(c => c.idUsuario === idUsuario);

      if (clienteExistente) {
        return clienteExistente;
      }

      const nuevoCliente = {
        idUsuario,
        telefono: this.contacto.telefono || null,
        direccion: null,
      };

      const crearClienteRes =
          await fetch(`${DAB}/Cliente`, {

            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify(nuevoCliente),
          });

      if (!crearClienteRes.ok) {

        const txt =
            await crearClienteRes.text();

        throw new Error(txt || "No se pudo crear el cliente en MySQL");
      }

      const creadoJson =
          await crearClienteRes.json();

      return creadoJson.value?.[0] || creadoJson;
    },

    nuevaReserva() {

      this.currentStep = 1;

      this.fechaSeleccionada = null;

      this.mesaSeleccionada = null;

      this.personas = 2;

      this.ubicacion = "interior";

      this.reservasDelDia = [];

      this.contacto = {
        nombre: "",
        telefono: "",
        email: "",
        peticiones: "",
      };

      this.contactoBloqueado = {
        nombre: false,
        telefono: false,
        email: false,
      };

      this.autocompletarContacto();

      this.pago = {
        numero: "",
        titular: "",
        expiry: "",
        cvv: "",
        bizumTel: "",
      };

      this.metodoPago = "tarjeta";

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
  },
};
</script>
<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap");

* { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --cream: #f5f0e8;
  --dark: #1a1410;
  --brown: #6b4c2a;
  --gold: #c9963a;
  --warm: #e8ddd0;
  --text: #2d2520;
}

#app {
  font-family: "Jost", sans-serif;
  background: var(--cream);
  color: var(--text);
  min-height: 100vh;
}

/* ─── HERO ─── */
.reservas-hero {
  position: relative;
  height: 50vh;
  min-height: 340px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.reservas-hero-bg {
  position: absolute; inset: 0;
  background-image: url("https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80");
  background-size: cover;
  background-position: center 40%;
  animation: kenBurns 18s ease-in-out infinite alternate;
}
@keyframes kenBurns {
  from { transform: scale(1.04); }
  to { transform: scale(1.1) translate(-0.5%, -0.5%); }
}
.reservas-hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(160deg, rgba(26,20,16,0.78) 0%, rgba(26,20,16,0.5) 60%, rgba(107,76,42,0.3) 100%);
}
.reservas-hero-content {
  position: relative;
  text-align: center;
  color: var(--cream);
  animation: fadeUp 1s ease both;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.hero-eyebrow {
  font-size: 0.65rem; letter-spacing: 0.3em;
  text-transform: uppercase; color: var(--gold); margin-bottom: 1rem;
}
.hero-title {
  font-family: "Cormorant Garamond", serif;
  font-size: clamp(2.5rem, 6vw, 5rem);
  font-weight: 300; line-height: 1;
}
.hero-title em { font-style: italic; color: var(--gold); }
.hero-sub {
  font-size: 0.85rem; font-weight: 300;
  opacity: 0.8; margin-top: 1rem; letter-spacing: 0.06em;
}

/* ─── SECCIÓN PRINCIPAL ─── */
.reservas-section {
  padding: 5rem 5vw 6rem;
  background: var(--cream);
}
.reservas-wrapper {
  max-width: 880px;
  margin: 0 auto;
}

/* ─── STEPS BAR ─── */
.steps-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  margin-bottom: 4rem;
}
.steps-progress-bar {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  height: 1px;
  background: rgba(45, 37, 32, 0.15);
  z-index: 0;
}
.steps-progress-fill {
  height: 100%;
  background: var(--gold);
  transition: width 0.5s ease;
}
.step-item {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  position: relative; z-index: 1;
}
.step-circle {
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--warm); border: 1.5px solid rgba(45, 37, 32, 0.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem; font-weight: 500; color: rgba(45, 37, 32, 0.4);
  transition: all 0.3s; font-family: "Jost", sans-serif;
}
.step-item.active .step-circle {
  background: var(--dark); border-color: var(--dark);
  color: var(--cream); transform: scale(1.1);
}
.step-item.done .step-circle {
  background: var(--gold); border-color: var(--gold);
  color: var(--dark); font-weight: 700;
}
.step-label {
  font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase;
  color: rgba(45, 37, 32, 0.45); font-weight: 500;
}
.step-item.active .step-label { color: var(--dark); }
.step-item.done .step-label { color: var(--gold); }

/* ─── STEP CONTENT ─── */
.step-content { animation: fadeUp 0.45s ease both; }
.step-header { margin-bottom: 3rem; }
.section-label {
  font-size: 0.62rem; letter-spacing: 0.3em; text-transform: uppercase;
  color: var(--gold); margin-bottom: 0.8rem;
}
.step-title {
  font-family: "Cormorant Garamond", serif;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 300; line-height: 1.15; color: var(--dark);
}
.step-title em { font-style: italic; color: var(--brown); }

/* ─── FORM GRID ─── */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.8rem;
  margin-bottom: 2.4rem;
}
.form-group.full-width { grid-column: 1 / -1; }
.form-label {
  display: block;
  font-size: 0.68rem; letter-spacing: 0.18em; text-transform: uppercase;
  font-weight: 500; color: rgba(45, 37, 32, 0.6); margin-bottom: 0.6rem;
}
.required { color: var(--gold); }
.optional { font-weight: 300; text-transform: none; letter-spacing: 0; font-size: 0.75rem; }
.form-input {
  width: 100%; padding: 13px 16px;
  background: white; border: 1px solid rgba(45, 37, 32, 0.18);
  border-radius: 3px; font-family: "Jost", sans-serif;
  font-size: 0.9rem; color: var(--text);
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}
.form-input:focus {
  border-color: var(--gold);
  box-shadow: 0 0 0 3px rgba(201, 150, 58, 0.1);
}
.form-textarea { resize: vertical; min-height: 80px; }
.form-hint { font-size: 0.75rem; color: rgba(45,37,32,0.5); margin-top: 0.6rem; }

/* ─── CALENDARIO ─── */
.calendar-wrapper {
  background: white;
  border: 1px solid rgba(45, 37, 32, 0.12);
  border-radius: 4px;
  padding: 1.4rem;
}
.calendar-nav {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 1.2rem;
}
.cal-nav-btn {
  width: 32px; height: 32px; border-radius: 50%; background: none;
  border: 1px solid rgba(45, 37, 32, 0.2); cursor: pointer;
  font-size: 1.1rem; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; color: var(--text);
}
.cal-nav-btn:hover { background: var(--gold); border-color: var(--gold); color: var(--dark); }
.cal-month-title {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.1rem; font-weight: 400; color: var(--dark);
}
.calendar-grid {
  display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;
}
.cal-dow {
  text-align: center; font-size: 0.6rem; letter-spacing: 0.15em;
  text-transform: uppercase; color: rgba(45,37,32,0.4); padding: 4px 0 8px;
  font-weight: 500;
}
.cal-day {
  aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
  font-size: 0.82rem; border-radius: 50%; cursor: pointer;
  transition: all 0.15s; font-weight: 300; color: var(--text);
  border: 1px solid transparent;
}
.cal-day:not(.empty):not(.past):not(.unavailable):hover {
  background: rgba(201, 150, 58, 0.15);
  border-color: rgba(201, 150, 58, 0.4);
}
.cal-day.today { font-weight: 600; border-color: rgba(201, 150, 58, 0.5); }
.cal-day.selected { background: var(--dark) !important; color: var(--cream) !important; border-color: var(--dark) !important; }
.cal-day.past { opacity: 0.25; cursor: not-allowed; }
.cal-day.unavailable { opacity: 0.4; cursor: not-allowed; text-decoration: line-through; }
.cal-day.empty { cursor: default; }
.calendar-legend {
  display: flex; gap: 1.4rem; margin-top: 1.2rem; padding-top: 1rem;
  border-top: 1px solid rgba(45,37,32,0.08);
}
.legend-item { display: flex; align-items: center; gap: 6px; font-size: 0.7rem; color: rgba(45,37,32,0.55); }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; }
.legend-dot.available { background: var(--gold); opacity: 0.7; }
.legend-dot.unavailable { background: rgba(45,37,32,0.2); }
.legend-dot.selected-dot { background: var(--dark); }

/* ─── HORARIOS ─── */
.horarios-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;
}
.horario-btn {
  position: relative; padding: 12px 10px; background: white;
  border: 1px solid rgba(45,37,32,0.15); border-radius: 3px;
  cursor: pointer; font-family: "Jost", sans-serif; font-size: 0.9rem;
  color: var(--text); transition: all 0.2s; text-align: center;
}
.horario-btn:hover:not(.unavailable) { border-color: var(--gold); background: rgba(201,150,58,0.06); }
.horario-btn.selected { background: var(--dark) !important; border-color: var(--dark) !important; color: var(--cream) !important; }
.horario-btn.unavailable { opacity: 0.4; cursor: not-allowed; }
.hora-tag {
  display: block; font-size: 0.6rem; letter-spacing: 0.1em;
  text-transform: uppercase; opacity: 0.6; margin-top: 2px;
}

/* ─── PERSONAS ─── */
.personas-selector {
  display: flex; align-items: center; gap: 0; border: 1px solid rgba(45,37,32,0.15);
  border-radius: 3px; overflow: hidden; background: white;
}
.personas-btn {
  width: 48px; height: 54px; background: none; border: none;
  cursor: pointer; font-size: 1.4rem; color: var(--text); font-weight: 300;
  transition: background 0.2s;
}
.personas-btn:hover { background: rgba(201,150,58,0.1); color: var(--gold); }
.personas-display {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  justify-content: center; border-left: 1px solid rgba(45,37,32,0.1);
  border-right: 1px solid rgba(45,37,32,0.1);
}
.personas-num {
  font-family: "Cormorant Garamond", serif; font-size: 1.8rem;
  font-weight: 400; color: var(--dark); line-height: 1;
}
.personas-label { font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase; opacity: 0.5; }

/* ─── DISPONIBILIDAD ─── */
.disponibilidad-info { margin-top: 1.2rem; }
.disp-badge {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 14px; border-radius: 20px; font-size: 0.75rem;
  font-weight: 500; margin-bottom: 1rem;
}
.disp-dot {
  width: 8px; height: 8px; border-radius: 50%;
  animation: pulse 1.5s ease infinite;
}
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.7; }
}
.disp-verde { background: rgba(74,181,100,0.12); color: #2d7a45; }
.disp-verde .disp-dot { background: #4ab564; }
.disp-amarillo { background: rgba(201,150,58,0.12); color: var(--brown); }
.disp-amarillo .disp-dot { background: var(--gold); }
.disp-rojo { background: rgba(220,80,80,0.1); color: #a33; }
.disp-rojo .disp-dot { background: #dc5050; }
.mesas-preview { display: flex; flex-wrap: wrap; gap: 6px; }
.mesa-chip {
  display: flex; align-items: center; gap: 4px;
  padding: 4px 10px; border-radius: 3px; font-size: 0.7rem;
  background: white; border: 1px solid rgba(201,150,58,0.3);
  color: var(--text); font-weight: 500;
}
.mesa-chip.ocupada { opacity: 0.3; text-decoration: line-through; border-color: rgba(45,37,32,0.1); }
.mesa-icon { font-size: 0.8rem; }
.mesas-section { margin-bottom: 2.4rem; }
.mesas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-top: 0.8rem;
}
.mesa-card {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 4px 10px;
  min-height: 76px;
  padding: 14px;
  background: white;
  border: 1.5px solid rgba(45,37,32,0.12);
  border-radius: 4px;
  cursor: pointer;
  font-family: "Jost", sans-serif;
  color: var(--text);
  text-align: left;
  transition: border-color 0.2s, background 0.2s;
}
.mesa-card:hover:not(:disabled) { border-color: var(--gold); background: rgba(201,150,58,0.06); }
.mesa-card.selected { border-color: var(--dark); background: rgba(26,20,16,0.04); }
.mesa-card.ocupada,
.mesa-card.insuficiente {
  opacity: 0.45;
  cursor: not-allowed;
}
.mesa-card .mesa-icon { grid-row: span 2; font-size: 1.2rem; }
.mesa-num { font-size: 0.86rem; font-weight: 500; color: var(--dark); }
.mesa-capacidad { font-size: 0.72rem; color: rgba(45,37,32,0.55); }
.mesa-tag {
  position: absolute;
  right: 10px;
  bottom: 8px;
  font-size: 0.56rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(45,37,32,0.5);
}

/* ─── UBICACIÓN ─── */
.ubicacion-section { margin-bottom: 2.4rem; }
.ubicacion-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; margin-top: 0.8rem; }
.ubicacion-card {
  position: relative; padding: 1.6rem; background: white;
  border: 1.5px solid rgba(45,37,32,0.12); border-radius: 4px;
  cursor: pointer; text-align: left; font-family: "Jost", sans-serif;
  transition: all 0.25s;
}
.ubicacion-card:hover { border-color: var(--gold); }
.ubicacion-card.selected { border-color: var(--dark); background: rgba(26,20,16,0.02); }
.ubicacion-icon { font-size: 2rem; margin-bottom: 0.8rem; display: block; }
.ubicacion-card h3 { font-size: 0.95rem; font-weight: 500; color: var(--dark); margin-bottom: 0.4rem; }
.ubicacion-card p { font-size: 0.78rem; color: rgba(45,37,32,0.55); line-height: 1.6; }
.ubicacion-check {
  position: absolute; top: 12px; right: 12px;
  width: 22px; height: 22px; border-radius: 50%;
  background: var(--dark); color: var(--cream);
  font-size: 0.7rem; display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.2s;
}
.ubicacion-card.selected .ubicacion-check { opacity: 1; }

/* ─── RESUMEN CARD ─── */
.resumen-card {
  background: var(--dark); border-radius: 4px;
  padding: 1.6rem; margin-bottom: 2rem;
}
.resumen-title {
  font-size: 0.62rem; letter-spacing: 0.25em; text-transform: uppercase;
  color: var(--gold); margin-bottom: 1.2rem; font-weight: 500;
}
.resumen-items { display: flex; flex-direction: column; gap: 0.7rem; }
.resumen-item { display: flex; align-items: center; gap: 10px; }
.resumen-icon { font-size: 1rem; width: 24px; text-align: center; }
.resumen-item span:last-child { font-size: 0.85rem; color: var(--cream); font-weight: 300; }

/* ─── PAGO LAYOUT ─── */
.pago-layout { display: grid; grid-template-columns: 1fr 1.4fr; gap: 2.4rem; align-items: start; }
.pago-resumen { background: var(--dark); border-radius: 4px; padding: 1.6rem; }
.pago-resumen-header {
  font-size: 0.62rem; letter-spacing: 0.25em; text-transform: uppercase;
  color: var(--gold); margin-bottom: 1.2rem; font-weight: 500;
}
.pago-fianza-info { margin-top: 1.4rem; padding-top: 1.2rem; border-top: 1px solid rgba(245,240,232,0.1); }
.fianza-row { display: flex; justify-content: space-between; font-size: 0.8rem; color: rgba(245,240,232,0.55); margin-bottom: 0.5rem; }
.fianza-total { display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--cream); margin-top: 0.8rem; padding-top: 0.8rem; border-top: 1px solid rgba(245,240,232,0.2); font-weight: 500; }
.fianza-amount { font-family: "Cormorant Garamond", serif; font-size: 1.4rem; font-weight: 400; color: var(--gold); }
.fianza-nota { font-size: 0.7rem; color: rgba(245,240,232,0.35); margin-top: 1rem; line-height: 1.6; }

/* ─── MÉTODOS DE PAGO ─── */
.metodos-pago { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 1.6rem; }
.metodo-btn {
  position: relative; display: flex; align-items: center; gap: 10px;
  padding: 12px 14px; background: white; border: 1.5px solid rgba(45,37,32,0.12);
  border-radius: 4px; cursor: pointer; font-family: "Jost", sans-serif;
  font-size: 0.78rem; color: var(--text); transition: all 0.2s; text-align: left;
}
.metodo-btn:hover { border-color: var(--gold); }
.metodo-btn.selected { border-color: var(--dark); background: rgba(26,20,16,0.02); }
.metodo-icon { font-size: 1.2rem; }
.metodo-check {
  position: absolute; top: 6px; right: 8px;
  width: 18px; height: 18px; border-radius: 50%;
  background: var(--dark); color: var(--cream);
  font-size: 0.6rem; display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.2s;
}
.metodo-btn.selected .metodo-check { opacity: 1; }

/* ─── TARJETA VISUAL ─── */
.tarjeta-preview {
  width: 100%; aspect-ratio: 1.6;
  border-radius: 12px; margin-bottom: 1.6rem;
  perspective: 1000px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s;
}
.tarjeta-preview.flipped { transform: rotateY(180deg); }
.tarjeta-front, .tarjeta-back {
  position: absolute; inset: 0;
  border-radius: 12px;
  padding: 1.4rem 1.6rem;
  backface-visibility: hidden;
}
.tarjeta-front {
  background: linear-gradient(135deg, var(--dark) 0%, #3a2a1a 60%, var(--brown) 100%);
  display: flex; flex-direction: column; justify-content: space-between;
}
.tarjeta-back {
  background: linear-gradient(135deg, #2d2520 0%, #1a1410 100%);
  transform: rotateY(180deg);
  display: flex; flex-direction: column; justify-content: center;
}
.tarjeta-chip {
  width: 36px; height: 26px; border-radius: 4px;
  background: linear-gradient(135deg, #d4af37 0%, #f0c040 50%, #b8952a 100%);
}
.tarjeta-num {
  font-size: clamp(0.8rem, 2.5vw, 1.05rem);
  color: var(--cream); letter-spacing: 0.25em; font-weight: 300;
  font-family: "Jost", monospace;
}
.tarjeta-bottom { display: flex; gap: 2rem; }
.tarjeta-sublabel { font-size: 0.55rem; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(245,240,232,0.4); margin-bottom: 2px; }
.tarjeta-val { font-size: 0.78rem; color: var(--cream); text-transform: uppercase; letter-spacing: 0.1em; }
.tarjeta-strip { height: 44px; background: rgba(0,0,0,0.6); margin: 0 -1.6rem; }
.tarjeta-cvv-row { display: flex; align-items: center; gap: 10px; margin-top: 1.2rem; justify-content: flex-end; }
.tarjeta-cvv-box { background: white; border-radius: 3px; padding: 6px 14px; font-size: 0.9rem; color: var(--text); letter-spacing: 0.2em; min-width: 60px; text-align: center; }
.tarjeta-cvv-label { font-size: 0.65rem; color: rgba(245,240,232,0.5); letter-spacing: 0.2em; text-transform: uppercase; }

/* ─── BIZUM ─── */
.bizum-form { margin-bottom: 1rem; }
.bizum-logo {
  font-family: "Cormorant Garamond", serif; font-size: 2rem;
  color: #004b9b; font-weight: 400; margin-bottom: 1.2rem;
  letter-spacing: 0.05em;
}

/* ─── SEGURIDAD ─── */
.seguridad-badge {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; background: rgba(74,181,100,0.06);
  border: 1px solid rgba(74,181,100,0.2); border-radius: 4px;
  font-size: 0.72rem; color: rgba(45,37,32,0.55); margin: 1.4rem 0;
}

/* ─── BOTONES ─── */
.step-actions { display: flex; gap: 1rem; margin-top: 2.4rem; }
.btn-primary {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 14px 36px; background: var(--dark); color: var(--cream);
  border: none; cursor: pointer; font-family: "Jost", sans-serif;
  font-size: 0.72rem; letter-spacing: 0.2em; text-transform: uppercase;
  font-weight: 500; transition: background 0.25s, transform 0.15s;
  border-radius: 2px;
}
.btn-primary:hover:not(:disabled) { background: var(--brown); }
.btn-primary:active:not(:disabled) { transform: scale(0.99); }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-primary.btn-pago { background: var(--gold); color: var(--dark); }
.btn-primary.btn-pago:hover:not(:disabled) { background: #b8852e; }
.btn-secondary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 14px 28px; background: transparent; color: var(--text);
  border: 1px solid rgba(45,37,32,0.2); cursor: pointer;
  font-family: "Jost", sans-serif; font-size: 0.72rem;
  letter-spacing: 0.2em; text-transform: uppercase; font-weight: 400;
  transition: border-color 0.2s, color 0.2s; text-decoration: none;
  border-radius: 2px;
}
.btn-secondary:hover { border-color: var(--text); }

/* ─── LOADING DOTS ─── */
.loading-dots span {
  animation: blink 1.4s ease infinite;
}
.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink {
  0%, 80%, 100% { opacity: 0.2; }
  40% { opacity: 1; }
}

/* ─── CONFIRMACIÓN ─── */
.confirmacion {
  text-align: center;
  padding: 2rem 0;
}
.confirmacion-icon {
  width: 80px; height: 80px; border-radius: 50%;
  background: var(--gold); color: var(--dark);
  font-size: 2rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 1.6rem;
  animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
@keyframes popIn {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.confirmacion-title {
  font-family: "Cormorant Garamond", serif;
  font-size: clamp(2rem, 4vw, 3.2rem); font-weight: 300; color: var(--dark);
  margin-bottom: 0.8rem;
}
.confirmacion-sub { font-size: 0.88rem; color: rgba(45,37,32,0.6); margin-bottom: 2.4rem; }
.confirmacion-card {
  max-width: 440px; margin: 0 auto 2.4rem;
  background: var(--dark); border-radius: 4px; padding: 2rem;
  text-align: left;
}
.confirmacion-ref {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 1.4rem; padding-bottom: 1rem;
  border-bottom: 1px solid rgba(245,240,232,0.1);
}
.confirmacion-ref-label { font-size: 0.62rem; letter-spacing: 0.25em; text-transform: uppercase; color: rgba(245,240,232,0.4); }
.confirmacion-ref-num {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.4rem; color: var(--gold); font-weight: 400;
}
.confirmacion-actions { display: flex; gap: 1rem; justify-content: center; }

/* ─── TRANSITIONS ─── */
.step-fade-enter-active, .step-fade-leave-active { transition: opacity 0.3s, transform 0.3s; }
.step-fade-enter-from { opacity: 0; transform: translateX(20px); }
.step-fade-leave-to { opacity: 0; transform: translateX(-20px); }

/* ─── RESPONSIVE ─── */
@media (max-width: 700px) {
  .form-grid { grid-template-columns: 1fr; }
  .form-group.full-width { grid-column: 1; }
  .ubicacion-cards { grid-template-columns: 1fr; }
  .pago-layout { grid-template-columns: 1fr; }
  .metodos-pago { grid-template-columns: 1fr; }
  .horarios-grid { grid-template-columns: repeat(4, 1fr); }
  .confirmacion-actions { flex-direction: column; align-items: center; }
  .steps-bar { gap: 0; }
  .step-label { display: none; }
}
</style>
