import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index.js";
import { initializeApp } from "firebase/app";
 
const firebaseConfig = {
  apiKey: "AIzaSyDQMuMbd-L33zJnhF6zcMAwSAWe508QDm4",
  authDomain: "restarurante-la-brasa.firebaseapp.com",
  projectId: "restarurante-la-brasa",
  storageBucket: "restarurante-la-brasa.firebasestorage.app",
  messagingSenderId: "942336675654",
  appId: "1:942336675654:web:485640e7191bad5e1d1f47",
};
 
initializeApp(firebaseConfig);
 
createApp(App).use(router).mount("#app");