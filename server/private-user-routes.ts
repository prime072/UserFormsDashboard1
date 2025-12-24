import { type Express } from "express";
import { storage } from "./storage";
import bcrypt from "bcrypt";

function isAuthenticated(req: any, res: any, next: any) {
  const userId = req.headers["x-user-id"];
  if (userId) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

function getUserId(req: any): string {
  return req.headers["x-user-id"] || "";
}

export function registerPrivateUserRoutes(app: Express) {
  // Create private user
  app.post("/api/private-users", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password are required" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const privateUser = await (storage as any).createPrivateUser?.(userId, name, email, hashedPassword);
      res.status(201).json(privateUser);
    } catch (error) {
      console.error("Error creating private user:", error);
      res.status(500).json({ error: "Failed to create private user" });
    }
  });

  // Get private users for current user
  app.get("/api/private-users", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const privateUsers = await (storage as any).getPrivateUsersByUserId?.(userId);
      res.json(privateUsers || []);
    } catch (error) {
      console.error("Error fetching private users:", error);
      res.status(500).json({ error: "Failed to fetch private users" });
    }
  });

  // Update private user access
  app.patch("/api/private-users/:id/access", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const { formIds } = req.body;
      const privateUserId = req.params.id;

      const privateUser = await (storage as any).getPrivateUser?.(privateUserId);
      if (!privateUser || privateUser.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const updated = await (storage as any).updatePrivateUserAccess?.(privateUserId, formIds || []);
      res.json(updated);
    } catch (error) {
      console.error("Error updating private user access:", error);
      res.status(500).json({ error: "Failed to update access" });
    }
  });

  // Delete private user
  app.delete("/api/private-users/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const privateUserId = req.params.id;

      const privateUser = await (storage as any).getPrivateUser?.(privateUserId);
      if (!privateUser || privateUser.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      await (storage as any).deletePrivateUser?.(privateUserId);
      res.json({ message: "Private user deleted" });
    } catch (error) {
      console.error("Error deleting private user:", error);
      res.status(500).json({ error: "Failed to delete private user" });
    }
  });

  // Private user login
  app.post("/api/auth/private-login", async (req, res) => {
    try {
      const { userId, password } = req.body;

      if (!userId || !password) {
        return res.status(400).json({ error: "User ID and password are required" });
      }

      // Look up by the login name (userId is actually the login name)
      const privateUser = await (storage as any).getPrivateUserByName?.(userId);
      if (!privateUser) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const passwordMatch = await bcrypt.compare(password, privateUser.password || "");
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      res.json({
        id: privateUser.id,
        name: privateUser.name,
        email: privateUser.email,
        accessibleForms: privateUser.accessibleForms,
      });
    } catch (error) {
      console.error("Private login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
}
