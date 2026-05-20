export function importBookmarks<T = any>(): Promise<T | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";

    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const result = JSON.parse(event.target?.result as string);
          resolve(result as T);
          //app.toast.add("Import parsing");
        } catch (err) {
          app.toast.add("Import parsing error");
          resolve(null);
        }
      };

      reader.onerror = () => {
        console.error("❌ Błąd odczytu pliku");
        resolve(null);
      };

      reader.readAsText(file);
    };

    input.click();
  });
}
