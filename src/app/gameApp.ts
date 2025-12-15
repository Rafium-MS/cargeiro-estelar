// src/app/gameApp.ts
import { gameServices } from "../core/services";
import { addLog } from "../core/services/log";
import { renderAll } from "../ui";
import { initUIBindings } from "../ui/bindings";
import { renderLog } from "../ui/log";
import { evaluateMilestones } from "../systems/progression";

export type GameContext = {
  services: typeof gameServices;
};

export type GameMiddleware = {
  onBeforeStart?(context: GameContext): void;
  onAfterStart?(context: GameContext): void;
  onBeforeTurnLoop?(context: GameContext): void;
};

export class GameApp {
  private readonly middlewares: GameMiddleware[] = [];
  private readonly context: GameContext;

  constructor() {
    this.context = {
      services: gameServices,
    };
  }

  addMiddleware(middleware: GameMiddleware) {
    this.middlewares.push(middleware);
    return this;
  }

  start() {
    this.runMiddleware("onBeforeStart");
    this.initGame();
    this.runMiddleware("onAfterStart");

    // Future turn loop hooks (autosave, analytics, difficulty adjustments)
    this.runMiddleware("onBeforeTurnLoop");
  }

  private initGame() {
    this.context.services.subscribe(() => {
      renderAll();
      renderLog();
    });

    evaluateMilestones();

    addLog(
      "Bem-vindo ao comando do Cargueiro LV-01. Sua fama no setor vai destravar missões especiais com história própria.",
      "good"
    );

    renderAll();
    renderLog();
    this.context.services.actions.generateJobs();
    initUIBindings();
  }

  private runMiddleware(hook: keyof GameMiddleware) {
    this.middlewares.forEach((middleware) => {
      const handler = middleware[hook];

      if (typeof handler === "function") {
        handler(this.context);
      }
    });
  }
}
