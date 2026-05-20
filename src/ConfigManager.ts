import { reactive, watch } from "vue";
import { ConfigType } from "./types/config";

export class ConfigManager {
  private data: ConfigType;
  private dataDefault: ConfigType = {
    version: 1,
    updateInterval: 43200000,
    viewSize: "normal",
    showTitle: true,
  };

  constructor() {
    this.load();

    window.vue.config.globalProperties.$config = this;
    watch(this.data, () => {
      console.log("[config] save");

      this.save();
    });
  }

  private save() {
    localStorage.setItem("config", JSON.stringify(this.data));
  }
  private migrate(oldConfig: any) {
    console.log(`Migrowanie konfiguracji z v${oldConfig.version} → v${this.dataDefault.version}`);

    let config = { ...oldConfig };

    // === Migracje ===
    switch (config.version) {
      case 1:
        config.version = 2;
        console.log("migracja do werjsi 2");
      case 2:
        config.version = 3;
        console.log("migracja do werjsi 3");
      default:
        console.log("migracja default");
        break;
    }

    // Dodawaj kolejne migracje tutaj...

    // Na końcu nadpisz brakujące pola nowymi domyślnymi
    return { ...this.dataDefault, ...config };
  }
  private load() {
    const loadedConfig = localStorage.getItem("config");

    if (!loadedConfig) {
      this.data = { ...this.dataDefault };
      this.save();
      return;
    }

    try {
      const parsed = JSON.parse(loadedConfig);

      if (parsed.version !== this.dataDefault.version) {
        this.data = this.migrate(parsed);
      } else {
        this.data = reactive({ ...this.dataDefault, ...parsed });
      }
    } catch (e) {
      console.warn("Błąd wczytywania configu, używam domyślnych");
      this.data = { ...this.data };
    }
  }

  set<K extends keyof ConfigType>(key: K, value: any) {
    this.data[key] = value;
    this.save();
  }

  get<K extends keyof ConfigType>(key: K) {
    return this.data[key];
  }

  get value() {
    return this.data;
  }
}
