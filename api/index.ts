import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import { registerPrivateUserRoutes } from "../server/private-user-routes";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let routesRegistered = false;
let initializationPromise: Promise<void> | null = null;

async function initializeApp() {
  if (routesRegistered) return;
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    try {
      await registerRoutes(httpServer, app);
      registerPrivateUserRoutes(app);
      
      app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        res.status(status).json({ message });
      });
      
      routesRegistered = true;
    } catch (error) {
      console.error("Initialization error:", error);
      initializationPromise = null;
      throw error;
    }
  })();

  return initializationPromise;
}

export default async (req: Request, res: Response) => {
  try {
    await initializeApp();
    return app(req, res);
  } catch (error) {
    console.error("Vercel Function Error:", error);
    res.status(500).json({ error: "Failed to initialize application" });
  }
};
