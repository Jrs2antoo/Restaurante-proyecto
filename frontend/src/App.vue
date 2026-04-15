<script setup></script>

<template>
  <div id="app">
    <nav class="navbar">
      <h1>Mi Restaurante</h1>
      <ul>
        <li @click="view = 'home'">Inicio</li>
        <li @click="view = 'menu'">Menú</li>
        <li @click="view = 'reservas'">Reservas</li>
        <li @click="view = 'login'">Login</li>
      </ul>
    </nav>

    <section v-if="view === 'home'">
      <h2>Página de Inicio</h2>
      <p>Bienvenido a nuestro restaurante</p>
    </section>

    <section v-if="view === 'menu'">
      <h2>Nuestro Menú</h2>
      <ul>
        <li v-for="item in menu" :key="item.id">
          {{ item.nombre }} - {{ item.precio }}€
        </li>
      </ul>
    </section>

    <section v-if="view === 'reservas'">
      <h2>Reservas</h2>

      <div>
        <h3>Nueva Reserva</h3>
        <input v-model="nuevaReserva.nombre" placeholder="Nombre" />
        <input v-model="nuevaReserva.fecha" type="date" />
        <button @click="crearReserva">Reservar</button>
      </div>

      <div>
        <h3>Mis Reservas</h3>
        <ul>
          <li v-for="reserva in reservas" :key="reserva.id">
            {{ reserva.nombre }} - {{ reserva.fecha }}
          </li>
        </ul>
      </div>
    </section>

    <section v-if="view === 'login'">
      <h2>Inicio de Sesión</h2>
      <input v-model="login.email" placeholder="Email" />
      <input
        v-model="login.password"
        type="password"
        placeholder="Contraseña"
      />
      <button @click="iniciarSesion">Entrar</button>

      <h3>Crear Cuenta</h3>
      <input v-model="registro.email" placeholder="Email" />
      <input
        v-model="registro.password"
        type="password"
        placeholder="Contraseña"
      />
      <button @click="crearCuenta">Registrarse</button>
    </section>
  </div>
</template>

<script>
export default {
  data() {
    return {
      view: "home",
      menu: [
        { id: 1, nombre: "Pizza", precio: 10 },
        { id: 2, nombre: "Pasta", precio: 8 },
      ],
      reservas: [],
      nuevaReserva: {
        nombre: "",
        fecha: "",
      },
      login: {
        email: "",
        password: "",
      },
      registro: {
        email: "",
        password: "",
      },
    };
  },
  methods: {
    crearReserva() {
      this.reservas.push({
        ...this.nuevaReserva,
        id: Date.now(),
      });
      this.nuevaReserva.nombre = "";
      this.nuevaReserva.fecha = "";
    },
    iniciarSesion() {
      alert("Login con " + this.login.email);
    },
    crearCuenta() {
      alert("Cuenta creada para " + this.registro.email);
    },
  },
};
</script>

<style>
body {
  font-family: Arial;
}
.navbar {
  display: flex;
  justify-content: space-between;
  background: #333;
  color: white;
  padding: 10px;
}
.navbar ul {
  display: flex;
  gap: 10px;
  list-style: none;
}
.navbar li {
  cursor: pointer;
}
section {
  padding: 20px;
}
</style>

<style scoped></style>
