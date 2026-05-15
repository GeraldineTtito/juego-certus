// @ts-check

/**
 * Registra todas las escenas disponibles en el SceneManager de la aplicación.
 * Utiliza importaciones dinámicas para optimizar la carga inicial (Code Splitting).
 *
 * @param {import("../core/SceneManager.js").SceneManager} sceneManager
 * @param {import("./GameApp.js").GameApp} app
 */
export function registerAppScenes(sceneManager, app) {
  sceneManager.register("menu", async () => {
    const { MenuScene } = await import("../scenes/MenuScene.js");
    return new MenuScene(app);
  });

  sceneManager.register("trailer", async (payload = {}) => {
    const { TrailerScene } = await import("../scenes/TrailerScene.js");
    return new TrailerScene(app, payload);
  });

  sceneManager.register("story", async (payload = {}) => {
    const { StoryScene } = await import("../scenes/StoryScene.js");
    return new StoryScene(app, payload);
  });

  sceneManager.register("gameplay", async (payload = {}) => {
    const { GameplayScene } = await import("../scenes/GameplayScene.js");
    return new GameplayScene(app, payload);
  });

  sceneManager.register("result", async (payload = {}) => {
    const { ResultScene } = await import("../scenes/ResultScene.js");
    return new ResultScene(app, payload);
  });

  sceneManager.register("settings", async () => {
    const { SettingsScene } = await import("../scenes/SettingsScene.js");
    return new SettingsScene(app);
  });
}
