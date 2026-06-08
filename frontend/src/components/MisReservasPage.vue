<template>
  <div id="app">
    <Cabecera />

    <!-- HERO -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <p class="hero-eyebrow">Tu historial</p>
        <h1 class="hero-title">Mis<br /><em>reservas</em></h1>
        <p class="hero-sub">
          Gestiona, modifica o cancela tus reservas en La Brasa.
        </p>
      </div>
    </section>

    <!-- CONTENIDO -->
    <section class="main-section">
      <div class="main-wrapper">
        <!-- CARGANDO -->
        <div v-if="cargando" class="estado-vacio">
          <div class="spinner"></div>
          <p>Cargando tus reservas…</p>
        </div>

        <!-- SIN RESERVAS -->
        <div v-else-if="reservas.length === 0" class="estado-vacio">
          <div class="vacio-icon">📅</div>
          <h2 class="vacio-titulo">Sin reservas</h2>
          <p class="vacio-sub">
            Todavía no tienes ninguna reserva. ¿Te animas a hacer una?
          </p>
          <RouterLink to="/reservas" class="btn-primary"
            >Hacer una reserva</RouterLink
          >
        </div>

        <!-- LISTADO -->
        <div v-else>
          <div class="reservas-header">
            <h2 class="reservas-titulo">
              Tienes {{ reservas.length }}
              {{ reservas.length === 1 ? "reserva" : "reservas" }}
            </h2>
            <RouterLink to="/reservas" class="btn-outline"
              >+ Nueva reserva</RouterLink
            >
          </div>

          <!-- Toast de éxito -->
          <div class="reservas-info">
            <span class="reservas-info-icon">ℹ</span>
            <p>
              Las reservas solo se pueden editar hasta 48 horas antes. Si cancelas con más de 48 horas de antelación, la fianza se marcará para devolución; con menos de 48 horas, no será reembolsable.
            </p>
          </div>

          <Transition name="toast-slide">
            <div v-if="toastMsg" class="toast-success">
              <span class="toast-icon">✓</span>
              {{ toastMsg }}
            </div>
          </Transition>

          <div class="reservas-lista">
            <div
              v-for="reserva in reservas"
              :key="reserva.idReserva"
              class="reserva-card"
              :class="'estado-' + reserva.estado"
            >
              <div class="reserva-estado-bar"></div>
              <div class="reserva-body">
                <div class="reserva-top">
                  <div class="reserva-fecha-bloque">
                    <span class="reserva-dia">{{
                      formatDia(reserva.fecha)
                    }}</span>
                    <span class="reserva-mes">{{
                      formatMes(reserva.fecha)
                    }}</span>
                    <span class="reserva-anio">{{
                      formatAnio(reserva.fecha)
                    }}</span>
                  </div>
                  <div class="reserva-info">
                    <div class="reserva-ref">
                      #LB{{ String(reserva.idReserva).slice(-6).toUpperCase() }}
                    </div>
                    <div class="reserva-detalles">
                      <span class="detalle-item"
                        ><span class="detalle-icon">🪑</span> Mesa
                        {{ reserva.idMesa }}</span
                      >
                      <span class="detalle-item"
                        ><span class="detalle-icon">👥</span>
                        {{ reserva.numPersonas }}
                        {{
                          reserva.numPersonas === 1 ? "persona" : "personas"
                        }}</span
                      >
                      <span class="detalle-item"
                        ><span class="detalle-icon">🕐</span>
                        {{ formatHora(reserva.hora) }}</span
                      >
                      <span v-if="reserva.fianza" class="detalle-item"
                        ><span class="detalle-icon">💳</span> Fianza:
                        {{ formatFianza(reserva.fianza, reserva.numPersonas) }}</span
                      >
                    </div>
                  </div>
                  <div class="reserva-badge-wrap">
                    <span
                      class="estado-badge"
                      :class="'badge-' + reserva.estado"
                    >
                      {{ labelEstado(reserva.estado) }}
                    </span>
                  </div>
                </div>

                <div v-if="reserva.peticiones" class="reserva-peticiones">
                  <span class="detalle-icon">💬</span> {{ reserva.peticiones }}
                </div>

                <div
                  class="reserva-acciones"
                  v-if="reserva.estado !== 'cancelada'"
                >
                  <button
                    class="btn-accion btn-editar"
                    :disabled="!puedeEditarReserva(reserva)"
                    :title="
                      !puedeEditarReserva(reserva)
                        ? 'No se puede editar si quedan menos de 48 horas'
                        : 'Editar reserva'
                    "
                    @click="abrirEdicion(reserva)"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    class="btn-accion btn-cancelar"
                    :disabled="isPasada(reserva.fecha)"
                    :title="
                      isPasada(reserva.fecha)
                        ? 'No se pueden cancelar reservas pasadas'
                        : 'Cancelar reserva'
                    "
                    @click="pedirCancelacion(reserva)"
                  >
                    ✕ Cancelar
                  </button>
                </div>
                <div v-else class="reserva-cancelada-msg">
                  Reserva cancelada
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </section>

    <!-- MODAL CANCELACIÓN -->
    <Transition name="modal-fade">
      <div
        v-if="modalCancelacion"
        class="modal-overlay"
        @click.self="modalCancelacion = false"
      >
        <div class="modal-box modal-cancelacion">
          <div class="modal-icon-warn">⚠️</div>
          <h3 class="modal-title">¿Cancelar reserva?</h3>
          <p class="modal-text">
            Vas a cancelar la reserva del
            <strong>{{ fechaFormateadaModal(reservaAcancelar) }}</strong
            >, mesa <strong>{{ reservaAcancelar?.idMesa }}</strong
            >.
          </p>

          <div
            class="fianza-aviso"
            :class="{ reembolsable: cancelacionConDevolucion }"
          >
            <span class="fianza-aviso-icon">💰</span>
            <div>
              <strong v-if="cancelacionConDevolucion">La fianza será devuelta.</strong>
              <strong v-else>La fianza NO será devuelta.</strong>
              <p>
                {{ mensajeFianzaCancelacion }}
              </p>
            </div>
          </div>

          <div class="modal-acciones">
            <button class="btn-secondary" @click="modalCancelacion = false">
              Mantener reserva
            </button>
            <button
              class="btn-danger"
              :disabled="cancelando"
              @click="confirmarCancelacion"
            >
              <span v-if="!cancelando">
                {{ cancelacionConDevolucion ? "Sí, cancelar y solicitar devolución" : "Sí, cancelar" }}
              </span>
              <span v-else>Cancelando…</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- MODAL EDICIÓN -->
    <Transition name="modal-fade">
      <div
        v-if="modalEdicion"
        class="modal-overlay"
        @click.self="cerrarEdicion"
      >
        <div class="modal-box modal-edicion">
          <button class="modal-close" @click="cerrarEdicion">✕</button>

          <div v-if="pasoEdit === 1">
            <div class="modal-edit-header">
              <span class="section-label"
                >Editando reserva #LB{{
                  String(reservaAeditar?.idReserva).slice(-6).toUpperCase()
                }}</span
              >
              <h3 class="modal-title-left">Cambiar fecha,<br /><em>hora y mesa</em></h3>
            </div>

            <!-- ── FECHA ── -->
            <div class="edit-seccion">
              <label class="form-label">Nueva fecha</label>
              <div class="calendar-wrapper">
                <div class="calendar-nav">
                  <button class="cal-nav-btn" @click="prevMesEdit">‹</button>
                  <span class="cal-month-title"
                    >{{ mesEditNombre }} {{ anioEdit }}</span
                  >
                  <button class="cal-nav-btn" @click="nextMesEdit">›</button>
                </div>
                <div class="calendar-grid">
                  <span v-for="d in diasSemana" :key="d" class="cal-dow">{{
                    d
                  }}</span>
                  <span
                    v-for="(day, idx) in diasCalendarioEdit"
                    :key="idx"
                    class="cal-day"
                    :class="{
                      empty: !day,
                      past: day && isPast(day),
                      selected: day && isSameDay(day, fechaEditSeleccionada),
                      today: day && isToday(day),
                      unavailable:
                        day && !isPast(day) && !isDayAvailableEdit(day),
                    }"
                    @click="
                      day &&
                      !isPast(day) &&
                      isDayAvailableEdit(day) &&
                      selectFechaEdit(day)
                    "
                  >
                    {{ day ? day.getDate() : "" }}
                  </span>
                </div>
                <div class="calendar-legend">
                  <span class="legend-item"
                    ><span class="legend-dot available"></span>Disponible</span
                  >
                  <span class="legend-item"
                    ><span class="legend-dot unavailable"></span>Sin mesas</span
                  >
                  <span class="legend-item"
                    ><span class="legend-dot selected-dot"></span
                    >Seleccionado</span
                  >
                </div>
              </div>
            </div>

            <!-- ── MESA ── -->
            <!-- PERSONAS -->
            <div class="edit-seccion">
              <label class="form-label">N&uacute;mero de comensales</label>
              <div class="personas-selector">
                <button
                  class="personas-btn"
                  :disabled="personasEdit <= personasOriginalEdit"
                  @click="cambiarPersonasEdit(-1)"
                >
                  &minus;
                </button>
                <div class="personas-display">
                  <span class="personas-num">{{ personasEdit }}</span>
                  <span class="personas-label">{{ personasEdit === 1 ? "persona" : "personas" }}</span>
                </div>
                <button
                  class="personas-btn"
                  :disabled="personasEdit >= 12"
                  @click="cambiarPersonasEdit(1)"
                >
                  +
                </button>
              </div>
              <p class="form-hint">
                Puedes aumentar los comensales, pero no reducirlos desde esta pantalla.
              </p>
            </div>

            <div class="edit-seccion" v-if="fechaEditSeleccionada">
              <label class="form-label">&iquest;D&oacute;nde prefieres sentarte?</label>
              <div class="ubicacion-cards">
                <button
                  class="ubicacion-card"
                  :class="{ selected: ubicacionEdit === 'interior' }"
                  @click="seleccionarUbicacionEdit('interior')"
                >
                  <div class="ubicacion-icon">&#127968;</div>
                  <h3>Interior</h3>
                  <p>Ambiente &iacute;ntimo con decoraci&oacute;n andaluza, climatizado todo el a&ntilde;o.</p>
                  <div class="ubicacion-check">&#10003;</div>
                </button>
                <button
                  class="ubicacion-card"
                  :class="{ selected: ubicacionEdit === 'terraza' }"
                  @click="seleccionarUbicacionEdit('terraza')"
                >
                  <div class="ubicacion-icon">&#127807;</div>
                  <h3>Terraza exterior</h3>
                  <p>Bajo el cielo de Granada. Disponible seg&uacute;n condiciones meteorol&oacute;gicas.</p>
                  <div class="ubicacion-check">&#10003;</div>
                </button>
              </div>
            </div>

            <div class="edit-seccion" v-if="fechaEditSeleccionada">
              <label class="form-label">Nueva hora</label>
              <div class="horas-grid">
                <button
                  v-for="h in horasDisponiblesEdit"
                  :key="h"
                  class="hora-btn"
                  :class="{
                    selected: horaEditSeleccionada === h,
                    unavailable: !isHoraAvailableEdit(h),
                  }"
                  :disabled="!isHoraAvailableEdit(h)"
                  @click="seleccionarHoraEdit(h)"
                >
                  {{ h }}
                </button>
              </div>
            </div>

            <div class="edit-seccion" v-if="fechaEditSeleccionada && horaEditSeleccionada">
              <label class="form-label">Selecciona mesa</label>
              <div class="disponibilidad-info">
                <div class="disp-badge" :class="disponibilidadEdit.clase">
                  <span class="disp-dot"></span>
                  {{ disponibilidadEdit.texto }}
                </div>
              </div>
              <div class="mesas-grid">
                <button
                  v-for="mesa in mesasDisponiblesEdit"
                  :key="mesa.idMesa"
                  class="mesa-card"
                  :class="{
                    selected: mesaEditSeleccionada === mesa.idMesa,
                    ocupada: !mesa.disponible,
                    insuficiente:
                      mesa.disponible && !mesaTieneCapacidadCorrectaEdit(mesa),
                  }"
                  :disabled="!mesa.disponible || !mesaTieneCapacidadCorrectaEdit(mesa)"
                  @click="seleccionarMesaEdit(mesa)"
                >
                  <span class="mesa-icon">🪑</span>
                  <span class="mesa-num">Mesa {{ mesa.idMesa }}</span>
                  <span class="mesa-capacidad"
                    >{{ mesa.capacidad }}
                    {{ mesa.capacidad === 1 ? "persona" : "personas" }}</span
                  >
                  <span v-if="!mesa.disponible" class="mesa-tag">Ocupada</span>
                  <span v-else-if="!mesaTieneCapacidadCorrectaEdit(mesa)" class="mesa-tag"
                    >Bloqueada</span
                  >
                </button>
              </div>
            </div>

            <div class="modal-acciones">
              <button class="btn-secondary" @click="cerrarEdicion">
                Cancelar
              </button>
              <button
                class="btn-primary"
                :disabled="!puedeGuardarEdit || guardando"
                @click="guardarEdicion"
              >
                <span v-if="!guardando">
                  {{ personasEdit > personasOriginalEdit ? `Continuar al pago (${fianzaAdicionalFormateada}) →` : 'Guardar cambios' }}
                </span>
                <span v-else>Guardando…</span>
              </button>
            </div>
          </div>

          <!-- PASO 2: Pago de Fianza Adicional -->
          <div v-else class="modal-edit-pago">
            <div class="modal-edit-header">
              <span class="section-label"
                >Abono de fianza adicional #LB{{
                  String(reservaAeditar?.idReserva).slice(-6).toUpperCase()
                }}</span
              >
              <h3 class="modal-title-left">Pago de comensales<br /><em>añadidos</em></h3>
            </div>

            <div class="resumen-pago-edit">
              <div class="fianza-desglose">
                <div class="fianza-desglose-line">
                  <span>Comensales originales:</span>
                  <span>{{ personasOriginalEdit }}</span>
                </div>
                <div class="fianza-desglose-line">
                  <span>Nuevos comensales:</span>
                  <span>{{ personasEdit }}</span>
                </div>
                <div class="fianza-desglose-line">
                  <span>Nuevas personas añadidas:</span>
                  <span>+{{ diferenciaPersonas }}</span>
                </div>
                <div class="fianza-desglose-total">
                  <span>Fianza adicional a pagar:</span>
                  <span class="fianza-amount-edit">{{ fianzaAdicionalFormateada }}</span>
                </div>
              </div>
            </div>

            <div class="metodos-pago">
              <button
                v-for="m in metodosPagoEdit"
                :key="m.id"
                class="metodo-btn"
                :class="{ selected: metodoPagoEdit === m.id }"
                @click="metodoPagoEdit = m.id"
              >
                <span class="metodo-icon">{{ m.icon }}</span>
                <span>{{ m.label }}</span>
                <div class="metodo-check">✓</div>
              </button>
            </div>

            <!-- Tarjeta de crédito -->
            <div v-if="metodoPagoEdit === 'tarjeta'" class="tarjeta-form">
              <div class="form-grid">
                <div class="form-group full-width">
                  <label class="form-label">Número de tarjeta</label>
                  <input
                    v-model="pagoEdit.numero"
                    class="form-input"
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    maxlength="19"
                    @input="formatCardEdit"
                  />
                </div>
                <div class="form-group full-width">
                  <label class="form-label">Titular de la tarjeta</label>
                  <input v-model="pagoEdit.titular" class="form-input" type="text" placeholder="Nombre como aparece en la tarjeta" />
                </div>
                <div class="form-group">
                  <label class="form-label">Caducidad</label>
                  <input v-model="pagoEdit.expiry" class="form-input" type="text" placeholder="MM/AA" maxlength="5" @input="formatExpiryEdit" />
                </div>
                <div class="form-group">
                  <label class="form-label">CVV</label>
                  <input
                    v-model="pagoEdit.cvv"
                    class="form-input"
                    type="text"
                    placeholder="•••"
                    maxlength="4"
                  />
                </div>
              </div>
            </div>

            <!-- Bizum -->
            <div v-if="metodoPagoEdit === 'bizum'" class="bizum-form">
              <div class="bizum-logo">Bizum</div>
              <div class="form-group">
                <label class="form-label">Número de teléfono Bizum</label>
                <input v-model="pagoEdit.bizumTel" class="form-input" type="tel" placeholder="+34 600 000 000" />
              </div>
              <p class="form-hint">Recibirás una solicitud de pago de {{ fianzaAdicionalFormateada }} en tu app Bizum.</p>
            </div>

            <!-- PayPal -->
            <div v-if="metodoPagoEdit === 'paypal'" class="paypal-form">
              <div id="paypal-button-container-edit"></div>
              <p class="form-hint">Paga de forma rápida y segura con tu cuenta de PayPal Sandbox.</p>
            </div>

            <div class="seguridad-badge">
              <span>🔒</span>
              <span>Pago seguro cifrado SSL. No almacenamos datos de tarjeta.</span>
            </div>

            <div class="modal-acciones">
              <button class="btn-secondary" :disabled="guardando" @click="pasoEdit = 1">
                ← Volver
              </button>
              <button
                v-if="metodoPagoEdit !== 'paypal'"
                class="btn-primary"
                :disabled="!canPagarEdit || guardando"
                @click="guardarEdicion"
              >
                <span v-if="!guardando">Pagar {{ fianzaAdicionalFormateada }} y confirmar</span>
                <span v-else class="loading-dots">Procesando<span>.</span><span>.</span><span>.</span></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- FOOTER -->
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-logo">La <span>Brasa</span></div>
        <p class="footer-copy">
          © 2025 La Brasa · Granada · Todos los derechos reservados
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import Cabecera from "./Cabecera.vue";
import Footer from "./Footer.vue";
import { API_BASE_URL as DAB } from "@/config/api";
import { getUserDbEmail } from "@/config/authUser";

export default {
  name: "MisReservasPage",

  components: {
    Cabecera,
    Footer,
  },

  data() {
    return {
      reservas: [],
      cargando: true,
      usuarioActual: null,
      idUsuarioMySQL: null,

      // Toast
      toastMsg: "",
      toastTimer: null,

      // Modal cancelación
      modalCancelacion: false,
      reservaAcancelar: null,
      cancelando: false,

      // Modal edición
      modalEdicion: false,
      reservaAeditar: null,
      guardando: false,
      restaurandoEdicion: false,

      // Calendario edición
      mesVistaEdit: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1,
      ),
      diasSemana: ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"],
      fechaEditSeleccionada: null,

      // Campos editables
      mesaEditSeleccionada: null,
      horaEditSeleccionada: null,
      ubicacionEdit: null,
      personasEdit: 1,
      personasOriginalEdit: 1,
      horasDisponiblesEdit: [
        "13:00",
        "14:00",
        "15:00",
        "20:00",
        "21:00",
        "22:00",
      ],

      // Datos BD
      todasLasMesas: [],
      reservasPorFechaEdit: {},
      reservasDelDiaEdit: [],

      cargandoMesasEdit: false,
      cargandoReservasEdit: false,

      // Paso y pago en edición
      pasoEdit: 1,
      metodoPagoEdit: "tarjeta",
      metodosPagoEdit: [
        { id: "tarjeta", icon: "💳", label: "Tarjeta" },
        { id: "bizum", icon: "📱", label: "Bizum" },
        { id: "paypal", icon: "🅿️", label: "PayPal" },
      ],
      pagoEdit: {
        numero: "",
        titular: "",
        expiry: "",
        cvv: "",
        bizumTel: "",
      },
      pagandoEdit: false,
    };
  },

  computed: {
    anioEdit() {
      return this.mesVistaEdit.getFullYear();
    },

    mesEditNombre() {
      return this.mesVistaEdit
        .toLocaleString("es-ES", { month: "long" })
        .replace(/^\w/, (c) => c.toUpperCase());
    },

    diasCalendarioEdit() {
      const year = this.mesVistaEdit.getFullYear();
      const month = this.mesVistaEdit.getMonth();
      const primerDia = new Date(year, month, 1);
      let startDow = primerDia.getDay();
      startDow = startDow === 0 ? 6 : startDow - 1;
      const totalDias = new Date(year, month + 1, 0).getDate();
      const dias = [];
      for (let i = 0; i < startDow; i++) dias.push(null);
      for (let d = 1; d <= totalDias; d++) dias.push(new Date(year, month, d));
      return dias;
    },

    fechaEditISO() {
      if (!this.fechaEditSeleccionada) return "";
      const d = this.fechaEditSeleccionada;
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    },

    mesasDisponiblesEdit() {
      if (!this.fechaEditSeleccionada || !this.horaEditSeleccionada) return [];
      const mesasOcupadasIds = this.reservasDelDiaEdit
        .filter(
          (r) =>
            (r.estado === "confirmada" || r.estado === "pendiente") &&
            r.idReserva !== this.reservaAeditar?.idReserva &&
            String(r.hora).substring(0, 5) === this.horaEditSeleccionada,
        )
        .map((r) => r.idMesa);
      return this.todasLasMesas
        .filter((m) => {
          const ubUsuario = (this.ubicacionEdit || "").toLowerCase();
          const ubMesa = (m.ubicacion || "").toLowerCase();
          return !ubUsuario || ubMesa === ubUsuario;
        })
        .map((m) => ({
          ...m,
          disponible: !!m.disponible && !mesasOcupadasIds.includes(m.idMesa),
        }))
        .sort(
          (a, b) =>
            Number(a.capacidad) - Number(b.capacidad) ||
            Number(a.idMesa) - Number(b.idMesa),
        );
    },

    mesasLibresEdit() {
      return this.mesasDisponiblesEdit.filter(
        (m) => m.disponible && this.mesaTieneCapacidadCorrectaEdit(m),
      ).length;
    },

    capacidadMesaRequeridaEdit() {
      return Math.ceil(this.personasEdit / 2) * 2;
    },

    disponibilidadEdit() {
      if (this.cargandoMesasEdit || this.cargandoReservasEdit) {
        return { texto: "Comprobando disponibilidad…", clase: "disp-gris" };
      }
      const libres = this.mesasLibresEdit;
      if (libres === 0)
        return { texto: "Sin mesas disponibles", clase: "disp-rojo" };
      if (libres <= 2)
        return {
          texto: `¡Últimas ${libres} mesas disponibles!`,
          clase: "disp-amarillo",
        };
      return { texto: `${libres} mesas disponibles`, clase: "disp-verde" };
    },

    puedeGuardarEdit() {
      return (
        !!this.fechaEditSeleccionada &&
        !!this.horaEditSeleccionada &&
        !!this.mesaEditSeleccionada &&
        this.personasEdit >= this.personasOriginalEdit
      );
    },

    diferenciaPersonas() {
      return Math.max(0, this.personasEdit - this.personasOriginalEdit);
    },

    fianzaAdicional() {
      return this.diferenciaPersonas * 2.5;
    },

    fianzaAdicionalFormateada() {
      return `${Number(this.fianzaAdicional || 0).toLocaleString("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} €`;
    },

    canPagarEdit() {
      if (this.metodoPagoEdit === "tarjeta") {
        return (
          this.pagoEdit.numero.length >= 19 &&
          this.pagoEdit.titular &&
          this.pagoEdit.expiry.length === 5 &&
          this.pagoEdit.cvv.length >= 3
        );
      }
      if (this.metodoPagoEdit === "bizum") {
        return this.pagoEdit.bizumTel.length >= 9;
      }
      return false;
    },

    horasHastaReservaCancelacion() {
      if (!this.reservaAcancelar) return 0;

      return this.horasHastaReserva(this.reservaAcancelar);
    },

    cancelacionConDevolucion() {
      return this.horasHastaReservaCancelacion >= 48;
    },

    mensajeFianzaCancelacion() {
      const fianza = this.reservaAcancelar?.fianza
        ? ` de ${this.formatFianza(
            this.reservaAcancelar.fianza,
            this.reservaAcancelar.numPersonas,
          )}`
        : "";

      if (this.cancelacionConDevolucion) {
        return `Cancelas con más de 48 horas de antelación. La fianza${fianza} queda marcada para devolución.`;
      }

      return `Quedan menos de 48 horas para la reserva. Al ser menos de 48 horas de antelación, la fianza${fianza} ya pagada no será devuelta.`;
    },
  },

  watch: {
    async fechaEditSeleccionada(nuevaFecha) {
      if (!nuevaFecha) return;
      if (!this.restaurandoEdicion) {
        this.horaEditSeleccionada = null;
        this.mesaEditSeleccionada = null;
      }
      await this.cargarReservasDelDiaEdit();
    },

    personasEdit() {
      if (this.horaEditSeleccionada && !this.isHoraAvailableEdit(this.horaEditSeleccionada)) {
        this.horaEditSeleccionada = null;
      }

      const mesa = this.mesasDisponiblesEdit.find(
        (m) => m.idMesa === this.mesaEditSeleccionada,
      );

      if (!mesa || !this.mesaTieneCapacidadCorrectaEdit(mesa)) {
        this.mesaEditSeleccionada = null;
      }
    },

    horaEditSeleccionada() {
      const mesa = this.mesasDisponiblesEdit.find(
        (m) => m.idMesa === this.mesaEditSeleccionada,
      );

      if (!mesa || !this.mesaTieneCapacidadCorrectaEdit(mesa)) {
        this.mesaEditSeleccionada = null;
      }
    },

    pasoEdit(nuevoPaso) {
      if (nuevoPaso === 2) {
        this.$nextTick(() => {
          this.checkAndInitPayPalEdit();
        });
      }
    },

    metodoPagoEdit(nuevoMetodo) {
      if (nuevoMetodo === "paypal") {
        this.$nextTick(() => {
          this.checkAndInitPayPalEdit();
        });
      }
    },
  },

  mounted() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      this.usuarioActual = user;
      if (user) {
        await this.cargarTodo();
      } else {
        this.cargando = false;
      }
    });
  },

  methods: {
    // ── UTILIDADES ──────────────────────────────────────────────

    mostrarToast(msg) {
      this.toastMsg = msg;
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => {
        this.toastMsg = "";
      }, 3500);
    },

    async cerrarSesion() {
      await signOut(getAuth());
      this.$router.push("/login");
    },

    // ── CARGA DE DATOS ──────────────────────────────────────────

    async cargarTodo() {
      this.cargando = true;
      try {
        await this.resolverIdUsuarioMySQL();
        if (this.idUsuarioMySQL) {
          await Promise.all([this.cargarReservas(), this.cargarMesas()]);
        }
      } finally {
        this.cargando = false;
      }
    },

    async resolverIdUsuarioMySQL() {
      const email = getUserDbEmail(this.usuarioActual);
      if (!email) return;
      try {
        const res = await fetch(`${DAB}/Usuario`);
        const json = await res.json();
        const usuario = (json.value || []).find(
          (u) => u.email?.toLowerCase() === email.toLowerCase(),
        );
        this.idUsuarioMySQL = usuario?.idUsuario || null;
      } catch (e) {
        console.error("Error resolviendo usuario:", e);
      }
    },

    async cargarReservas() {
      try {
        const res = await fetch(`${DAB}/Reserva`);
        const json = await res.json();
        this.reservas = (json.value || [])
          .filter((r) => r.idUsuario === this.idUsuarioMySQL)
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      } catch (e) {
        console.error("Error cargando reservas:", e);
        this.reservas = [];
      }
    },

    async cargarMesas() {
      this.cargandoMesasEdit = true;
      try {
        const res = await fetch(`${DAB}/Mesa`);
        const json = await res.json();
        this.todasLasMesas = json.value || [];
      } catch (e) {
        console.error("Error cargando mesas:", e);
      } finally {
        this.cargandoMesasEdit = false;
      }
    },

    // ── FORMATEO ────────────────────────────────────────────────

    formatDia(fecha) {
      return new Date(fecha).getUTCDate();
    },

    formatMes(fecha) {
      return new Date(fecha)
        .toLocaleString("es-ES", { month: "short", timeZone: "UTC" })
        .replace(".", "")
        .toUpperCase();
    },

    formatAnio(fecha) {
      return new Date(fecha).getUTCFullYear();
    },

    formatHora(hora) {
      return String(hora).substring(0, 5);
    },

    normalizarFianza(fianza, personas) {
      const importe = Number(fianza);
      if (!Number.isFinite(importe)) return 0;

      const importeEsperado = Number(personas || 0) * 2.5;

      if (importeEsperado && Math.abs(importe / 10 - importeEsperado) < 0.01) {
        return importe / 10;
      }

      return importe;
    },

    formatFianza(fianza, personas) {
      return `${this.normalizarFianza(fianza, personas).toLocaleString("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}€`;
    },

    labelEstado(estado) {
      const mapa = {
        confirmada: "Confirmada",
        pendiente: "Pendiente",
        cancelada: "Cancelada",
        completada: "Completada",
      };
      return mapa[estado] || estado;
    },

    isPasada(fecha) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      return new Date(fecha) < hoy;
    },

    fechaFormateadaModal(reserva) {
      if (!reserva) return "";
      return new Date(reserva.fecha).toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: "UTC",
      });
    },

    // ── CANCELACIÓN ─────────────────────────────────────────────

    fechaHoraReserva(reserva) {
      const fecha = String(reserva?.fecha || "").substring(0, 10);
      const hora = String(reserva?.hora || "20:00:00").substring(0, 8);
      const [year, month, day] = fecha.split("-").map(Number);
      const [hours, minutes, seconds] = hora.split(":").map(Number);

      return new Date(
        year,
        (month || 1) - 1,
        day || 1,
        hours || 0,
        minutes || 0,
        seconds || 0,
      );
    },

    horasHastaReserva(reserva) {
      return (this.fechaHoraReserva(reserva).getTime() - Date.now()) / (1000 * 60 * 60);
    },

    puedeEditarReserva(reserva) {
      return this.horasHastaReserva(reserva) >= 48;
    },

    pedirCancelacion(reserva) {
      this.reservaAcancelar = reserva;
      this.modalCancelacion = true;
    },

    async confirmarCancelacion() {
      if (!this.reservaAcancelar) return;
      this.cancelando = true;
      try {
        const conDevolucion = this.cancelacionConDevolucion;
        const estaPagado = this.reservaAcancelar.estadoPago === "pagado";
        const updateBody = { estado: "cancelada" };

        if (conDevolucion && estaPagado) {
          updateBody.estadoPago = "reembolsado";
        }

        const res = await fetch(
          `${DAB}/Reserva/idReserva/${this.reservaAcancelar.idReserva}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateBody),
          },
        );
        if (!res.ok) throw new Error(await res.text());

        const idx = this.reservas.findIndex(
          (r) => r.idReserva === this.reservaAcancelar.idReserva,
        );
        if (idx !== -1) {
          this.reservas[idx].estado = "cancelada";
          if (conDevolucion && estaPagado) {
            this.reservas[idx].estadoPago = "reembolsado";
          }
        }

        this.modalCancelacion = false;

        if (estaPagado) {
          if (conDevolucion) {
            this.mostrarToast("Reserva cancelada correctamente. Se ha solicitado la devolución de la fianza.");
          } else {
            this.mostrarToast("Reserva cancelada. Al ser menos de 48 horas de antelación, no se devolverá la fianza ya pagada.");
          }
        } else {
          this.mostrarToast("Reserva cancelada correctamente.");
        }

        this.reservaAcancelar = null;
      } catch (e) {
        console.error("Error cancelando:", e);
        alert("No se pudo cancelar la reserva.");
      } finally {
        this.cancelando = false;
      }
    },

    // ── EDICIÓN ─────────────────────────────────────────────────

    abrirEdicion(reserva) {
      this.restaurandoEdicion = true;
      this.reservaAeditar = reserva;
      this.fechaEditSeleccionada = null;
      this.mesaEditSeleccionada = null;
      this.horaEditSeleccionada = null;
      this.ubicacionEdit = null;
      this.reservasDelDiaEdit = [];
      this.personasOriginalEdit = reserva.numPersonas || 1;
      this.personasEdit = this.personasOriginalEdit;

      const mesaActual = this.todasLasMesas.find(
        (m) => m.idMesa === reserva.idMesa,
      );
      this.ubicacionEdit = mesaActual?.ubicacion?.toLowerCase() || null;

      const f = new Date(reserva.fecha);
      this.mesVistaEdit = new Date(f.getUTCFullYear(), f.getUTCMonth(), 1);
      this.fechaEditSeleccionada = new Date(
        f.getUTCFullYear(),
        f.getUTCMonth(),
        f.getUTCDate(),
      );
      this.horaEditSeleccionada = this.formatHora(reserva.hora || "20:00");
      this.mesaEditSeleccionada = reserva.idMesa;

      // Reset payment variables
      this.pasoEdit = 1;
      this.metodoPagoEdit = "tarjeta";
      this.pagoEdit = {
        numero: "",
        titular: "",
        expiry: "",
        cvv: "",
        bizumTel: "",
      };
      this.pagandoEdit = false;

      this.modalEdicion = true;
      Promise.all([
        this.cargarReservasMesEdit(),
        this.cargarReservasDelDiaEdit(),
      ]).finally(() => {
        this.restaurandoEdicion = false;
      });
    },

    cerrarEdicion() {
      this.modalEdicion = false;
      this.reservaAeditar = null;
      this.fechaEditSeleccionada = null;
      this.mesaEditSeleccionada = null;
      this.horaEditSeleccionada = null;
      this.ubicacionEdit = null;
      this.personasEdit = 1;
      this.personasOriginalEdit = 1;
      this.restaurandoEdicion = false;
      this.pasoEdit = 1;
      this.metodoPagoEdit = "tarjeta";
      this.pagoEdit = {
        numero: "",
        titular: "",
        expiry: "",
        cvv: "",
        bizumTel: "",
      };
      this.pagandoEdit = false;
    },

    // ── CALENDARIO ──────────────────────────────────────────────

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

    isDayAvailableEdit(day) {
      if (this.isPast(day)) return false;
      const iso = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
      const reservasEseDia = this.reservasPorFechaEdit[iso] || [];
      const reservasActivas = reservasEseDia.filter(
        (r) =>
          (r.estado === "confirmada" || r.estado === "pendiente") &&
          r.idReserva !== this.reservaAeditar?.idReserva,
      );

      return this.todasLasMesas.some((m) => {
        const ubUsuario = (this.ubicacionEdit || "").toLowerCase();
        const ubMesa = (m.ubicacion || "").toLowerCase();

        if (
          !m.disponible ||
          Number(m.capacidad) !== this.capacidadMesaRequeridaEdit ||
          (ubUsuario && ubMesa !== ubUsuario)
        ) {
          return false;
        }

        return this.horasDisponiblesEdit.some(
          (h) =>
            !reservasActivas.some(
              (r) =>
                r.idMesa === m.idMesa &&
                String(r.hora).substring(0, 5) === h,
            ),
        );
      });
    },

    selectFechaEdit(day) {
      this.fechaEditSeleccionada = day;
    },

    isHoraAvailableEdit(hora) {
      if (!this.fechaEditSeleccionada) return false;

      const reservasEsaHora = this.reservasDelDiaEdit.filter(
        (r) =>
          (r.estado === "confirmada" || r.estado === "pendiente") &&
          r.idReserva !== this.reservaAeditar?.idReserva &&
          String(r.hora).substring(0, 5) === hora,
      );

      const mesasOcupadasIds = reservasEsaHora.map((r) => r.idMesa);

      return this.todasLasMesas.some((m) => {
        const ubUsuario = (this.ubicacionEdit || "").toLowerCase();
        const ubMesa = (m.ubicacion || "").toLowerCase();

        return (
          !!m.disponible &&
          Number(m.capacidad) === this.capacidadMesaRequeridaEdit &&
          (!ubUsuario || ubMesa === ubUsuario) &&
          !mesasOcupadasIds.includes(m.idMesa)
        );
      });
    },

    seleccionarHoraEdit(hora) {
      if (!this.isHoraAvailableEdit(hora)) return;
      this.horaEditSeleccionada = hora;
    },

    seleccionarUbicacionEdit(ubicacion) {
      this.ubicacionEdit = ubicacion;
      this.mesaEditSeleccionada = null;

      if (this.horaEditSeleccionada && !this.isHoraAvailableEdit(this.horaEditSeleccionada)) {
        this.horaEditSeleccionada = null;
      }
    },

    mesaTieneCapacidadCorrectaEdit(mesa) {
      return Number(mesa.capacidad) === this.capacidadMesaRequeridaEdit;
    },

    cambiarPersonasEdit(cambio) {
      const siguiente = this.personasEdit + cambio;

      if (siguiente < this.personasOriginalEdit || siguiente > 12) return;

      this.personasEdit = siguiente;
    },

    seleccionarMesaEdit(mesa) {
      if (!mesa.disponible) return;
      if (!this.mesaTieneCapacidadCorrectaEdit(mesa)) return;
      this.mesaEditSeleccionada = mesa.idMesa;
    },

    prevMesEdit() {
      const d = new Date(this.mesVistaEdit);
      d.setMonth(d.getMonth() - 1);
      this.mesVistaEdit = d;
      this.cargarReservasMesEdit();
    },

    nextMesEdit() {
      const d = new Date(this.mesVistaEdit);
      d.setMonth(d.getMonth() + 1);
      this.mesVistaEdit = d;
      this.cargarReservasMesEdit();
    },

    async cargarReservasMesEdit() {
      try {
        const res = await fetch(`${DAB}/Reserva`);
        const json = await res.json();
        const cache = {};
        (json.value || []).forEach((r) => {
          if (!r.fecha) return;
          const fecha = String(r.fecha).substring(0, 10);
          if (!cache[fecha]) cache[fecha] = [];
          cache[fecha].push(r);
        });
        this.reservasPorFechaEdit = cache;
      } catch (e) {
        console.error(e);
      }
    },

    async cargarReservasDelDiaEdit() {
      if (!this.fechaEditISO) return;
      this.cargandoReservasEdit = true;
      try {
        const res = await fetch(`${DAB}/Reserva`);
        const json = await res.json();
        this.reservasDelDiaEdit = (json.value || []).filter((r) => {
          if (!r.fecha) return false;
          return String(r.fecha).substring(0, 10) === this.fechaEditISO;
        });
      } catch (e) {
        console.error(e);
        this.reservasDelDiaEdit = [];
      } finally {
        this.cargandoReservasEdit = false;
      }
    },

    // ── GUARDAR EDICIÓN ─────────────────────────────────────────

    async guardarEdicion() {
      if (!this.puedeGuardarEdit || !this.reservaAeditar) return;

      if (this.personasEdit > this.personasOriginalEdit && this.pasoEdit === 1) {
        this.pasoEdit = 2;
        return;
      }

      if (this.personasEdit > this.personasOriginalEdit && this.pasoEdit === 2) {
        this.guardando = true;
        this.pagandoEdit = true;
        try {
          await this.guardarEdicionConPago();
        } catch (e) {
          alert(e.message || "No se pudo procesar el pago.");
        } finally {
          this.guardando = false;
          this.pagandoEdit = false;
        }
        return;
      }

      this.guardando = true;
      try {
        const mesaElegida = this.mesasDisponiblesEdit.find(
          (m) => m.idMesa === this.mesaEditSeleccionada,
        );

        if (!mesaElegida || !this.mesaTieneCapacidadCorrectaEdit(mesaElegida)) {
          throw new Error("Mesa bloqueada para este número de personas");
        }

        const body = {
          fecha: this.fechaEditISO,
          hora: `${this.horaEditSeleccionada}:00`,
          idMesa: this.mesaEditSeleccionada,
          numPersonas: this.personasEdit,
        };

        const res = await fetch(
          `${DAB}/Reserva/idReserva/${this.reservaAeditar.idReserva}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          },
        );
        if (!res.ok) throw new Error(await res.text());

        const idx = this.reservas.findIndex(
          (r) => r.idReserva === this.reservaAeditar.idReserva,
        );
        if (idx !== -1) {
          this.reservas[idx].fecha = this.fechaEditISO;
          this.reservas[idx].hora = `${this.horaEditSeleccionada}:00`;
          this.reservas[idx].idMesa = this.mesaEditSeleccionada;
          this.reservas[idx].numPersonas = this.personasEdit;
        }

        this.cerrarEdicion();
        this.mostrarToast("¡Reserva actualizada correctamente!");
      } catch (e) {
        console.error(e);
        alert("No se pudo guardar la edición.");
      } finally {
        this.guardando = false;
      }
    },

    async guardarEdicionConPago() {
      const mesaElegida = this.mesasDisponiblesEdit.find(
        (m) => m.idMesa === this.mesaEditSeleccionada,
      );

      if (!mesaElegida || !this.mesaTieneCapacidadCorrectaEdit(mesaElegida)) {
        throw new Error("Mesa bloqueada para este número de personas");
      }

      const ahora = new Date();
      const anio = ahora.getFullYear();
      const mes = String(ahora.getMonth() + 1).padStart(2, "0");
      const dia = String(ahora.getDate()).padStart(2, "0");
      const horas = String(ahora.getHours()).padStart(2, "0");
      const minutos = String(ahora.getMinutes()).padStart(2, "0");
      const segundos = String(ahora.getSeconds()).padStart(2, "0");
      const fechaPagoISO = `${anio}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;

      const nuevaFianza = this.personasEdit * 2.5;
      const metodoGuardado =
        this.metodoPagoEdit === "bizum"
          ? "transferencia"
          : "tarjeta";

      const body = {
        fecha: this.fechaEditISO,
        hora: `${this.horaEditSeleccionada}:00`,
        idMesa: this.mesaEditSeleccionada,
        numPersonas: this.personasEdit,
        fianza: nuevaFianza,
        estado: "confirmada",
        estadoPago: "pagado",
        fechaPago: fechaPagoISO,
        metodoPago: metodoGuardado,
        fechaLimitePago: null,
      };

      const res = await fetch(
        `${DAB}/Reserva/idReserva/${this.reservaAeditar.idReserva}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      if (!res.ok) throw new Error(await res.text());

      const idx = this.reservas.findIndex(
        (r) => r.idReserva === this.reservaAeditar.idReserva,
      );
      if (idx !== -1) {
        this.reservas[idx].fecha = this.fechaEditISO;
        this.reservas[idx].hora = `${this.horaEditSeleccionada}:00`;
        this.reservas[idx].idMesa = this.mesaEditSeleccionada;
        this.reservas[idx].numPersonas = this.personasEdit;
        this.reservas[idx].fianza = nuevaFianza;
        this.reservas[idx].estado = "confirmada";
        this.reservas[idx].estadoPago = "pagado";
        this.reservas[idx].fechaPago = fechaPagoISO;
        this.reservas[idx].metodoPago = metodoGuardado;
      }

      this.cerrarEdicion();
      this.mostrarToast("¡Reserva modificada y fianza adicional abonada con éxito!");
    },

    formatCardEdit(e) {
      let v = e.target.value.replace(/\D/g, "").substring(0, 16);
      this.pagoEdit.numero = v.replace(/(.{4})/g, "$1 ").trim();
    },

    formatExpiryEdit(e) {
      let v = e.target.value.replace(/\D/g, "").substring(0, 4);
      if (v.length > 2) {
        v = v.substring(0, 2) + "/" + v.substring(2);
      }
      this.pagoEdit.expiry = v;
    },

    checkAndInitPayPalEdit() {
      if (this.pasoEdit !== 2 || this.metodoPagoEdit !== "paypal") return;

      if (window.paypal) {
        this.$nextTick(() => {
          this.renderPayPalButtonsEdit();
        });
        return;
      }

      const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || "sb";
      const scriptId = "paypal-sdk-script";

      let script = document.getElementById(scriptId);
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=EUR`;
        script.async = true;
        script.onload = () => {
          this.renderPayPalButtonsEdit();
        };
        script.onerror = (err) => {
          console.error("Error al cargar el SDK de PayPal en edición:", err);
          alert("No se pudo cargar el SDK de PayPal. Por favor, inténtelo de nuevo.");
        };
        document.head.appendChild(script);
      } else {
        script.addEventListener("load", () => {
          this.renderPayPalButtonsEdit();
        });
      }
    },

    renderPayPalButtonsEdit() {
      const container = document.getElementById("paypal-button-container-edit");
      if (!container) return;

      container.innerHTML = "";

      window.paypal
        .Buttons({
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    currency_code: "EUR",
                    value: this.fianzaAdicional.toFixed(2),
                  },
                  description: `Fianza adicional por aumento de comensales - Reserva #LB${String(
                    this.reservaAeditar.idReserva
                  )
                    .slice(-6)
                    .toUpperCase()}`,
                },
              ],
            });
          },
          onApprove: async (data, actions) => {
            this.guardando = true;
            this.pagandoEdit = true;
            try {
              await actions.order.capture();
              await this.guardarEdicionConPago();
            } catch (error) {
              console.error("Error al capturar el pago adicional:", error);
              alert("Ocurrió un error al procesar el pago con PayPal.");
            } finally {
              this.guardando = false;
              this.pagandoEdit = false;
            }
          },
          onError: (err) => {
            console.error("PayPal Edit Error:", err);
            alert("El pago con PayPal ha fallado o ha sido cancelado.");
          },
        })
        .render("#paypal-button-container-edit");
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap");

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ─── PAYPAL EN MODAL EDICIÓN ─── */
.paypal-form {
  margin-top: 1rem;
  margin-bottom: 1.5rem;
}

/* RESUMEN DE PAGO EN EDICIÓN */
.resumen-pago-edit {
  background: var(--dark, #1a1410);
  border-radius: 4px;
  padding: 1.4rem;
  margin-bottom: 1.6rem;
  color: var(--cream, #f5f0e8);
}
.fianza-desglose {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.fianza-desglose-line {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  color: rgba(245, 240, 232, 0.6);
}
.fianza-desglose-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.88rem;
  font-weight: 500;
  margin-top: 0.8rem;
  padding-top: 0.8rem;
  border-top: 1px solid rgba(245, 240, 232, 0.15);
}
.fianza-amount-edit {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.4rem;
  color: var(--gold, #c9963a);
}

.metodos-pago {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 1.6rem;
}
.metodo-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: white;
  border: 1.5px solid rgba(45, 37, 32, 0.12);
  border-radius: 4px;
  cursor: pointer;
  font-family: "Jost", sans-serif;
  font-size: 0.78rem;
  color: var(--text);
  transition: all 0.2s;
  text-align: left;
}
.metodo-btn:hover {
  border-color: var(--gold);
}
.metodo-btn.selected {
  border-color: var(--dark);
  background: rgba(26, 20, 16, 0.02);
}
.metodo-icon {
  font-size: 1.2rem;
}
.metodo-check {
  position: absolute;
  top: 6px;
  right: 8px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--dark);
  color: var(--cream);
  font-size: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}
.metodo-btn.selected .metodo-check {
  opacity: 1;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem;
  margin-bottom: 1.6rem;
}
.form-group.full-width {
  grid-column: 1 / -1;
}

.seguridad-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(74, 181, 100, 0.06);
  border: 1px solid rgba(74, 181, 100, 0.2);
  border-radius: 4px;
  font-size: 0.72rem;
  color: rgba(45, 37, 32, 0.55);
  margin: 1.4rem 0;
}

.bizum-logo {
  font-family: "Cormorant Garamond", serif;
  font-size: 2rem;
  color: #004b9b;
  font-weight: 400;
  margin-bottom: 1.2rem;
  letter-spacing: 0.05em;
}

.loading-dots span {
  animation: blink 1.4s ease infinite;
}
.loading-dots span:nth-child(2) {
  animation-delay: 0.2s;
}
.loading-dots span:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes blink {
  0%, 80%, 100% { opacity: 0.2; }
  40% { opacity: 1; }
}

:root {
  --cream: #f5f0e8;
  --dark: #1a1410;
  --brown: #6b3a2a;
  --gold: #c9963a;
  --text: #2d2520;
}

/* HERO */
.hero {
  position: relative;
  height: 48vh;
  min-height: 390px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.hero-bg {
  position: absolute;
  inset: 0;
  background: url("https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80")
    center/cover no-repeat;
  transform: scale(1.05);
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    160deg,
    rgba(26, 20, 16, 0.78) 0%,
    rgba(26, 20, 16, 0.5) 100%
  );
}
.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: var(--cream);
  padding: 96px 1.5rem 0;
}
.hero-eyebrow {
  font-size: 0.68rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 1rem;
  font-family: "Montserrat", sans-serif;
  font-weight: 500;
}
.hero-title {
  font-family: "Cormorant Garamond", serif;
  font-size: clamp(3.25rem, 7vw, 6rem);
  font-weight: 300;
  color: var(--cream);
  line-height: 1;
  margin-bottom: 1.2rem;
}
.hero-title em {
  color: var(--gold);
  font-style: italic;
}
.hero-sub {
  font-size: 0.9rem;
  color: rgba(245, 240, 232, 0.82);
  font-family: "Montserrat", sans-serif;
  font-weight: 300;
  letter-spacing: 0.08em;
  max-width: 460px;
  margin: 0 auto;
  line-height: 1.8;
}

/* MAIN */
.main-section {
  background: var(--cream);
  min-height: 60vh;
}
.main-wrapper {
  max-width: 860px;
  margin: 0 auto;
  padding: 4rem 5vw 3rem;
}

/* LOADING / EMPTY */
.estado-vacio {
  text-align: center;
  padding: 5rem 2rem;
}
.spinner {
  width: 36px;
  height: 36px;
  border: 2.5px solid rgba(45, 37, 32, 0.12);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1.5rem;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.vacio-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  opacity: 0.4;
}
.vacio-titulo {
  font-family: "Cormorant Garamond", serif;
  font-size: 2rem;
  font-weight: 300;
  color: var(--dark);
  margin-bottom: 0.6rem;
}
.vacio-sub {
  font-size: 0.9rem;
  color: rgba(45, 37, 32, 0.55);
  margin-bottom: 2rem;
}

/* HEADER */
.reservas-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}
.reservas-titulo {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.7rem;
  font-weight: 300;
  color: var(--dark);
}
.reservas-info {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: rgba(201, 150, 58, 0.1);
  border: 1px solid rgba(201, 150, 58, 0.28);
  border-radius: 4px;
  padding: 1rem 1.1rem;
  margin-bottom: 1.5rem;
}
.reservas-info-icon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--gold);
  color: var(--dark);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-weight: 600;
  font-size: 0.8rem;
}
.reservas-info p {
  font-size: 0.8rem;
  color: rgba(45, 37, 32, 0.68);
  line-height: 1.55;
}

/* TOAST */
.toast-success {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--dark);
  color: var(--cream);
  padding: 12px 20px;
  border-radius: 4px;
  font-family: "Jost", sans-serif;
  font-size: 0.82rem;
  margin-bottom: 1.5rem;
  border-left: 3px solid var(--gold);
}
.toast-icon {
  color: var(--gold);
  font-weight: 600;
  font-size: 1rem;
}
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s ease;
}
.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* CARDS */
.reservas-lista {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.reserva-card {
  display: flex;
  background: white;
  border-radius: 4px;
  overflow: hidden;
  box-shadow:
    0 1px 3px rgba(45, 37, 32, 0.06),
    0 4px 12px rgba(45, 37, 32, 0.04);
  transition: box-shadow 0.25s;
}
.reserva-card:hover {
  box-shadow:
    0 2px 6px rgba(45, 37, 32, 0.1),
    0 8px 24px rgba(45, 37, 32, 0.07);
}
.reserva-estado-bar {
  width: 4px;
  flex-shrink: 0;
}
.estado-confirmada .reserva-estado-bar {
  background: var(--gold);
}
.estado-pendiente .reserva-estado-bar {
  background: rgba(201, 150, 58, 0.4);
}
.estado-cancelada .reserva-estado-bar {
  background: rgba(45, 37, 32, 0.15);
}
.estado-completada .reserva-estado-bar {
  background: rgba(107, 158, 207, 0.5);
}
.reserva-body {
  flex: 1;
  padding: 1.4rem 1.6rem;
}
.reserva-top {
  display: grid;
  grid-template-columns: 64px 1fr auto;
  gap: 1.2rem;
  align-items: start;
}
.reserva-fecha-bloque {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(45, 37, 32, 0.04);
  border-radius: 3px;
  padding: 10px 8px;
}
.reserva-dia {
  font-family: "Cormorant Garamond", serif;
  font-size: 2rem;
  font-weight: 400;
  color: var(--dark);
  line-height: 1;
}
.reserva-mes {
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--gold);
  font-weight: 500;
  margin-top: 2px;
}
.reserva-anio {
  font-size: 0.65rem;
  color: rgba(45, 37, 32, 0.4);
  margin-top: 2px;
}
.reserva-ref {
  font-size: 0.62rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 0.5rem;
  font-weight: 500;
}
.reserva-detalles {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
}
.detalle-item {
  font-size: 0.8rem;
  color: rgba(45, 37, 32, 0.65);
  display: flex;
  align-items: center;
  gap: 4px;
}
.detalle-icon {
  font-size: 0.9rem;
}
.reserva-badge-wrap {
  padding-top: 2px;
}
.estado-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 500;
}
.badge-confirmada {
  background: rgba(201, 150, 58, 0.12);
  color: var(--brown);
}
.badge-pendiente {
  background: rgba(201, 150, 58, 0.08);
  color: rgba(107, 58, 42, 0.7);
}
.badge-cancelada {
  background: rgba(45, 37, 32, 0.08);
  color: rgba(45, 37, 32, 0.45);
}
.badge-completada {
  background: rgba(107, 158, 207, 0.12);
  color: #3a6fa0;
}
.reserva-peticiones {
  font-size: 0.78rem;
  color: rgba(45, 37, 32, 0.5);
  margin-top: 1rem;
  padding-top: 0.8rem;
  border-top: 1px solid rgba(45, 37, 32, 0.07);
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 6px;
}
.reserva-acciones {
  display: flex;
  gap: 10px;
  margin-top: 1.2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(45, 37, 32, 0.07);
}
.reserva-cancelada-msg {
  font-size: 0.72rem;
  color: rgba(45, 37, 32, 0.35);
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(45, 37, 32, 0.07);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* BOTONES ACCIÓN */
.btn-accion {
  padding: 8px 18px;
  border-radius: 2px;
  font-family: "Jost", sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
}
.btn-accion:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.btn-editar {
  background: none;
  border-color: rgba(45, 37, 32, 0.2);
  color: var(--text);
}
.btn-editar:hover:not(:disabled) {
  border-color: var(--dark);
  background: rgba(26, 20, 16, 0.04);
}
.btn-cancelar {
  background: none;
  border-color: rgba(200, 80, 80, 0.25);
  color: #a33;
}
.btn-cancelar:hover:not(:disabled) {
  background: rgba(200, 80, 80, 0.06);
  border-color: rgba(200, 80, 80, 0.5);
}

/* BOTONES GLOBALES */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 13px 32px;
  background: var(--dark);
  color: var(--cream);
  border: none;
  cursor: pointer;
  font-family: "Jost", sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-weight: 500;
  transition: background 0.25s;
  border-radius: 2px;
  text-decoration: none;
}
.btn-primary:hover:not(:disabled) {
  background: var(--brown);
}
.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 24px;
  background: transparent;
  color: var(--text);
  border: 1px solid rgba(45, 37, 32, 0.2);
  cursor: pointer;
  font-family: "Jost", sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-weight: 400;
  transition: border-color 0.2s;
  text-decoration: none;
  border-radius: 2px;
}
.btn-secondary:hover {
  border-color: var(--text);
}
.btn-outline {
  display: inline-flex;
  align-items: center;
  padding: 10px 22px;
  background: none;
  color: var(--text);
  border: 1.5px solid rgba(45, 37, 32, 0.2);
  font-family: "Jost", sans-serif;
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  border-radius: 2px;
  transition:
    border-color 0.2s,
    color 0.2s;
}
.btn-outline:hover {
  border-color: var(--gold);
  color: var(--brown);
}
.btn-danger {
  display: inline-flex;
  align-items: center;
  padding: 13px 28px;
  background: #c23;
  color: white;
  border: none;
  cursor: pointer;
  font-family: "Jost", sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-weight: 500;
  transition: background 0.2s;
  border-radius: 2px;
}
.btn-danger:hover:not(:disabled) {
  background: #a11;
}
.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* MODALES */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 20, 16, 0.65);
  backdrop-filter: blur(4px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}
.modal-box {
  background: var(--cream);
  border-radius: 6px;
  padding: 2.4rem;
  max-width: 480px;
  width: 100%;
  position: relative;
  animation: fadeUp 0.3s ease both;
}
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.modal-edicion {
  max-width: 680px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2rem;
}
.modal-close {
  position: absolute;
  top: 1.2rem;
  right: 1.2rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: rgba(45, 37, 32, 0.4);
  transition: color 0.2s;
  line-height: 1;
}
.modal-close:hover {
  color: var(--text);
}
.modal-icon-warn {
  font-size: 2.8rem;
  text-align: center;
  margin-bottom: 1rem;
}
.modal-title {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.8rem;
  font-weight: 300;
  color: var(--dark);
  margin-bottom: 0.8rem;
  text-align: center;
}
.modal-title-left {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.8rem;
  font-weight: 300;
  color: var(--dark);
  margin-bottom: 1.6rem;
  line-height: 1.2;
}
.modal-title-left em {
  font-style: italic;
  color: var(--brown);
}
.modal-text {
  font-size: 0.88rem;
  color: rgba(45, 37, 32, 0.65);
  text-align: center;
  margin-bottom: 1.6rem;
  line-height: 1.6;
}
.modal-acciones {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  flex-wrap: wrap;
}

/* FIANZA AVISO */
.fianza-aviso {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  background: rgba(200, 40, 40, 0.07);
  border: 1px solid rgba(200, 40, 40, 0.25);
  border-radius: 4px;
  padding: 1.2rem;
  margin-bottom: 1.6rem;
}
.fianza-aviso.reembolsable {
  background: rgba(74, 181, 100, 0.08);
  border-color: rgba(74, 181, 100, 0.28);
}
.fianza-aviso-icon {
  font-size: 1.6rem;
  flex-shrink: 0;
}
.fianza-aviso strong {
  display: block;
  font-size: 0.9rem;
  color: #a22;
  margin-bottom: 4px;
}
.fianza-aviso.reembolsable strong {
  color: #2d7a45;
}
.fianza-aviso p {
  font-size: 0.8rem;
  color: rgba(45, 37, 32, 0.6);
  line-height: 1.5;
}

/* EDIT MODAL */
.modal-edit-header {
  margin-bottom: 1.8rem;
}
.section-label {
  font-size: 0.62rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 0.6rem;
  display: block;
}
.edit-seccion {
  margin-bottom: 2rem;
}
.form-label {
  display: block;
  font-size: 0.68rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-weight: 500;
  color: rgba(45, 37, 32, 0.6);
  margin-bottom: 0.6rem;
}
.optional {
  font-size: 0.62rem;
  letter-spacing: 0.05em;
  text-transform: none;
  color: rgba(45, 37, 32, 0.4);
  font-weight: 400;
}
.form-input {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid rgba(45, 37, 32, 0.18);
  border-radius: 3px;
  background: white;
  font-family: "Jost", sans-serif;
  font-size: 0.88rem;
  color: var(--text);
  transition: border-color 0.2s;
  outline: none;
}
.form-input:focus {
  border-color: var(--gold);
}
.form-textarea {
  resize: vertical;
  min-height: 80px;
  font-family: "Jost", sans-serif;
  line-height: 1.5;
}

/* CALENDARIO */
.calendar-wrapper {
  background: white;
  border: 1px solid rgba(45, 37, 32, 0.12);
  border-radius: 4px;
  padding: 1.2rem;
}
.calendar-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.cal-nav-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: none;
  border: 1px solid rgba(45, 37, 32, 0.2);
  cursor: pointer;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: var(--text);
}
.cal-nav-btn:hover {
  background: var(--gold);
  border-color: var(--gold);
  color: var(--dark);
}
.cal-month-title {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.1rem;
  font-weight: 400;
  color: var(--dark);
}
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}
.cal-dow {
  text-align: center;
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(45, 37, 32, 0.4);
  padding: 4px 0 6px;
  font-weight: 500;
}
.cal-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.82rem;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.15s;
  font-weight: 300;
  color: var(--text);
  border: 1px solid transparent;
}
.cal-day:not(.empty):not(.past):not(.unavailable):hover {
  background: rgba(201, 150, 58, 0.15);
  border-color: rgba(201, 150, 58, 0.4);
}
.cal-day.today {
  font-weight: 600;
  border-color: rgba(201, 150, 58, 0.5);
}
.cal-day.selected {
  background: var(--dark) !important;
  color: var(--cream) !important;
  border-color: var(--dark) !important;
}
.cal-day.past {
  opacity: 0.25;
  cursor: not-allowed;
}
.cal-day.unavailable {
  opacity: 0.4;
  cursor: not-allowed;
  text-decoration: line-through;
}
.cal-day.empty {
  cursor: default;
}
.calendar-legend {
  display: flex;
  gap: 1.2rem;
  margin-top: 1rem;
  padding-top: 0.8rem;
  border-top: 1px solid rgba(45, 37, 32, 0.08);
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.7rem;
  color: rgba(45, 37, 32, 0.55);
}
.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.legend-dot.available {
  background: var(--gold);
  opacity: 0.7;
}
.legend-dot.unavailable {
  background: rgba(45, 37, 32, 0.2);
}
.legend-dot.selected-dot {
  background: var(--dark);
}

/* UBICACIÓN */
.ubicacion-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.ubicacion-card {
  position: relative;
  padding: 1.2rem;
  background: white;
  border: 1.5px solid rgba(45, 37, 32, 0.12);
  border-radius: 4px;
  cursor: pointer;
  text-align: left;
  font-family: "Jost", sans-serif;
  color: var(--text);
  transition:
    border-color 0.2s,
    background 0.2s;
}
.ubicacion-card:hover {
  border-color: var(--gold);
  background: rgba(201, 150, 58, 0.04);
}
.ubicacion-card.selected {
  border-color: var(--dark);
  background: rgba(26, 20, 16, 0.03);
}
.ubicacion-icon {
  font-size: 1.4rem;
  margin-bottom: 0.5rem;
}
.ubicacion-card h3 {
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--dark);
  margin-bottom: 4px;
}
.ubicacion-card p {
  font-size: 0.72rem;
  color: rgba(45, 37, 32, 0.5);
  line-height: 1.4;
}
.ubicacion-check {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--dark);
  color: var(--cream);
  font-size: 0.65rem;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}
.ubicacion-card.selected .ubicacion-check {
  opacity: 1;
}

/* HORAS */
.horas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
}
.hora-btn {
  padding: 10px 6px;
  background: white;
  border: 1.5px solid rgba(45, 37, 32, 0.15);
  border-radius: 3px;
  font-family: "Jost", sans-serif;
  font-size: 0.82rem;
  color: var(--text);
  cursor: pointer;
  transition: all 0.18s;
  text-align: center;
}
.hora-btn:hover {
  border-color: var(--gold);
  background: rgba(201, 150, 58, 0.07);
}
.hora-btn.selected {
  background: var(--dark);
  color: var(--cream);
  border-color: var(--dark);
}
.hora-btn.unavailable {
  opacity: 0.4;
  cursor: not-allowed;
  text-decoration: line-through;
}

/* PERSONAS */
.personas-selector {
  display: inline-flex;
  align-items: center;
  gap: 0;
  border: 1px solid rgba(45, 37, 32, 0.18);
  border-radius: 3px;
  background: white;
  overflow: hidden;
}
.personas-btn {
  width: 40px;
  height: 44px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: var(--text);
  transition: background 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.personas-btn:hover {
  background: rgba(45, 37, 32, 0.06);
}
.personas-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.personas-btn:disabled:hover {
  background: none;
}
.personas-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 18px;
  border-left: 1px solid rgba(45, 37, 32, 0.1);
  border-right: 1px solid rgba(45, 37, 32, 0.1);
}
.personas-num {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.4rem;
  font-weight: 400;
  color: var(--dark);
  line-height: 1;
}
.personas-label {
  font-size: 0.62rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(45, 37, 32, 0.45);
}
.form-hint {
  font-size: 0.75rem;
  color: rgba(45, 37, 32, 0.5);
  margin-top: 0.6rem;
}

/* DISPONIBILIDAD */
.disponibilidad-info {
  margin-bottom: 0.8rem;
}
.disp-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  font-family: "Jost", sans-serif;
}
.disp-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 1.5s ease infinite;
}
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.7;
  }
}
.disp-verde {
  background: rgba(74, 181, 100, 0.12);
  color: #2d7a45;
}
.disp-verde .disp-dot {
  background: #4ab564;
}
.disp-amarillo {
  background: rgba(201, 150, 58, 0.12);
  color: var(--brown);
}
.disp-amarillo .disp-dot {
  background: var(--gold);
}
.disp-rojo {
  background: rgba(220, 80, 80, 0.1);
  color: #a33;
}
.disp-rojo .disp-dot {
  background: #dc5050;
}
.disp-gris {
  background: rgba(45, 37, 32, 0.06);
  color: rgba(45, 37, 32, 0.5);
}
.disp-gris .disp-dot {
  background: rgba(45, 37, 32, 0.3);
  animation: none;
}

/* MESAS */
.mesas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 8px;
  margin-top: 0.6rem;
}
.mesa-card {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 4px 8px;
  min-height: 70px;
  padding: 12px;
  background: white;
  border: 1.5px solid rgba(45, 37, 32, 0.12);
  border-radius: 4px;
  cursor: pointer;
  font-family: "Jost", sans-serif;
  color: var(--text);
  text-align: left;
  transition:
    border-color 0.2s,
    background 0.2s;
}
.mesa-card:hover:not(:disabled) {
  border-color: var(--gold);
  background: rgba(201, 150, 58, 0.06);
}
.mesa-card.selected {
  border-color: var(--dark);
  background: rgba(26, 20, 16, 0.04);
}
.mesa-card.ocupada,
.mesa-card.insuficiente {
  opacity: 0.4;
  cursor: not-allowed;
}
.mesa-card .mesa-icon {
  grid-row: span 2;
  font-size: 1.1rem;
}
.mesa-num {
  font-size: 0.84rem;
  font-weight: 500;
  color: var(--dark);
}
.mesa-capacidad {
  font-size: 0.7rem;
  color: rgba(45, 37, 32, 0.55);
}
.mesa-tag {
  position: absolute;
  right: 8px;
  bottom: 6px;
  font-size: 0.54rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(45, 37, 32, 0.45);
}

/* TRANSITIONS */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* FOOTER */
.footer {
  background: var(--dark);
  padding: 2rem 5vw;
}
.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.footer-logo {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.3rem;
  color: var(--cream);
}
.footer-logo span {
  color: var(--gold);
}
.footer-copy {
  font-size: 0.7rem;
  color: rgba(245, 240, 232, 0.3);
  letter-spacing: 0.1em;
}

/* RESPONSIVE */
@media (max-width: 650px) {
  .reserva-top {
    grid-template-columns: 60px 1fr;
  }
  .reserva-badge-wrap {
    grid-column: 1 / -1;
  }
  .modal-acciones {
    flex-direction: column;
  }
  .footer-inner {
    flex-direction: column;
    gap: 0.8rem;
    text-align: center;
  }
  .horas-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
