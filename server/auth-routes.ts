import { type Express } from "express";
import { storage } from "./storage";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().email(),
});

const loginSchema = z.object({
  email: z.string().email(),
});

export function registerAuthRoutes(app: Express) {
  // Sign up / Register
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email } = signupSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await (storage as any).getUserByEmail?.(email);
      if (existingUser) {
        return res.status(409).json({ 
          error: "This email is already registered. Please log in or use a different email." 
        });
      }

      // Create new user
      const user = await storage.createUser({
        email,
        username: email,
        password: "",
      } as any);

      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Signup error:", error);
      res.status(500).json({ error: "Signup failed" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email } = loginSchema.parse(req.body);

      // Find user by email
      const user = await (storage as any).getUserByEmail?.(email);
      if (!user) {
        return res.status(401).json({ 
          error: "User not found. Please sign up first." 
        });
      }

      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Update user profile
  app.patch("/api/auth/profile", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const updates = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone,
        company: req.body.company,
        photo: req.body.photo,
      };

      const user = await (storage as any).updateUser?.(userId, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Get current user
  app.get("/api/auth/me", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });
}
