import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import { registerPrivateUserRoutes } from "../server/private-user-routes";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let routesRegistered = false;

async function initializeApp() {
  if (routesRegistered) return;
  // We don't need the return value from registerRoutes for the Vercel function
  await registerRoutes(httpServer, app);
  registerPrivateUserRoutes(app);
  
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });
  
  routesRegistered = true;
}

export default async (req: Request, res: Response) => {
  await initializeApp();
  // Vercel's express support handles the req/res routing automatically when passing to app
  return app(req, res);
};
