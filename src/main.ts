// src/main.ts
import { GameApp } from "./app/gameApp";

function setupGlobalErrorHandlers() {
  window.addEventListener("error", (event) => {
    console.error("Unexpected error:", event.error ?? event.message);
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason);
  });
}

function startGameApp() {
  const app = new GameApp();
  app.start();
  return app;
}

try {
  setupGlobalErrorHandlers();
  startGameApp();
} catch (error) {
  console.error("Failed to start the game app:", error);
}
