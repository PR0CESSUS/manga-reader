import { createApp } from "vue";
import App from "./App.vue";
import "./styles/core.css";

const app = createApp(App);

window.vue = app;

app.mount("#app");
