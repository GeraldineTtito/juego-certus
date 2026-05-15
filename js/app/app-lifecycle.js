// @ts-check

/**
 * Gestiona el ciclo de vida de la aplicación (inicialización y destrucción).
 * Centraliza la vinculación de eventos globales y limpieza de recursos.
 */
export class AppLifecycle {
  /**
   * @param {import("./GameApp.js").GameApp} app
   */
  constructor(app) {
    this.app = app;
  }

  /**
   * Vincula eventos de redimensionamiento y cambio de pantalla completa.
   */
  attach() {
    const app = this.app;
    const supportsResizeObserver = typeof ResizeObserver === "function";

    if (supportsResizeObserver) {
      app.resizeObserver = new ResizeObserver(() => {
        app.renderIfViewportChanged();
      });
      app.resizeObserver.observe(app.shellElement);
    } else {
      globalThis.window.addEventListener("resize", app.handleResize);
    }

    document.addEventListener("fullscreenchange", app.handleFullscreenChange);
  }

  /**
   * Limpia todos los listeners y observadores para evitar fugas de memoria.
   */
  detach() {
    const app = this.app;

    if (app.resizeObserver) {
      app.resizeObserver.disconnect();
      app.resizeObserver = null;
    } else {
      globalThis.window.removeEventListener("resize", app.handleResize);
    }

    document.removeEventListener(
      "fullscreenchange",
      app.handleFullscreenChange,
    );

    app.loop.destroy();

    // Desvincular input
    app.input.detach();
  }
}
