import { type Express } from "express";
import { storage } from "./storage";
import { z } from "zod";
import bcrypt from "bcrypt";
import { sendVerificationEmail, sendPasswordResetOTP, generateOTP, generateToken } from "./email-service";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export function registerAuthRoutes(app: Express) {
  // Sign up / Register
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, firstName } = signupSchema.parse(req.body);

      // Check if user already exists by email
      const existingUser = await (storage as any).getUserByEmail?.(email);
      if (existingUser) {
        return res.status(409).json({ 
          error: "This email is already registered. Please log in." 
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Generate verification token
      const verificationToken = generateToken();
      const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create new user with MongoDB storage
      const newUser = await storage.createUser({
        email,
        username: email,
        firstName,
        lastName: "",
        phone: "",
        company: "",
        photo: "",
        password: hashedPassword,
        emailVerified: false,
        verificationToken,
        verificationTokenExpiry,
      } as any);

      // Send verification email
      try {
        await sendVerificationEmail(email, verificationToken);
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
      }

      res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        emailVerified: false,
        message: "Account created. Please verify your email to continue.",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0]?.message || "Validation error" });
      }
      console.error("Signup error:", error);
      res.status(500).json({ error: "Signup failed" });
    }
  });

  // Verify email token
  app.post("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ error: "Verification token is required" });
      }

      const user = await (storage as any).getUserByVerificationToken?.(token);
      if (!user) {
        return res.status(400).json({ error: "Invalid or expired verification token" });
      }

      if (new Date() > (user as any).verificationTokenExpiry) {
        return res.status(400).json({ error: "Verification token has expired" });
      }

      // Update user to mark email as verified
      await (storage as any).updateUser?.(user.id, {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      });

      res.json({ message: "Email verified successfully. You can now log in." });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ error: "Email verification failed" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      // Find user by email only
      const user = await (storage as any).getUserByEmail?.(email);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Check if email is verified
      if (!(user as any).emailVerified) {
        return res.status(403).json({ 
          error: "Please verify your email before logging in",
          requiresEmailVerification: true,
          email: user.email
        });
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, (user as any).password || "");
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Update and fetch metrics
      const userWithMetrics = await (storage as any).updateUserMetrics?.(user.id);
      const responseUser = userWithMetrics || user;

      res.json({
        id: responseUser.id,
        email: responseUser.email,
        firstName: responseUser.firstName,
        lastName: responseUser.lastName,
        phone: responseUser.phone,
        company: responseUser.company,
        photo: responseUser.photo,
        status: responseUser.status,
        totalForms: responseUser.totalForms || 0,
        totalResponses: responseUser.totalResponses || 0,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0]?.message || "Validation error" });
      }
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Forgot password - Request OTP
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const user = await (storage as any).getUserByEmail?.(email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Save OTP to user
      await (storage as any).updateUser?.(user.id, {
        resetOTP: otp,
        resetOTPExpiry: otpExpiry,
      });

      // Send OTP email
      try {
        await sendPasswordResetOTP(email, otp);
      } catch (emailError) {
        console.error("Failed to send reset OTP:", emailError);
      }

      res.json({ 
        message: "OTP sent to your email",
        userId: user.id
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Failed to process forgot password" });
    }
  });

  // Verify OTP
  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { userId, otp } = req.body;
      if (!userId || !otp) {
        return res.status(400).json({ error: "User ID and OTP are required" });
      }

      const user = await (storage as any).getUser?.(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if ((user as any).resetOTP !== otp) {
        return res.status(400).json({ error: "Invalid OTP" });
      }

      if (new Date() > (user as any).resetOTPExpiry) {
        return res.status(400).json({ error: "OTP has expired" });
      }

      // Generate reset token
      const resetToken = generateToken();
      const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      await (storage as any).updateUser?.(userId, {
        resetToken,
        resetTokenExpiry,
        resetOTP: null,
        resetOTPExpiry: null,
      });

      res.json({ 
        message: "OTP verified",
        resetToken
      });
    } catch (error) {
      console.error("OTP verification error:", error);
      res.status(500).json({ error: "OTP verification failed" });
    }
  });

  // Reset password
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { userId, resetToken, newPassword } = req.body;
      if (!userId || !resetToken || !newPassword) {
        return res.status(400).json({ error: "User ID, reset token, and new password are required" });
      }

      const user = await (storage as any).getUser?.(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if ((user as any).resetToken !== resetToken) {
        return res.status(400).json({ error: "Invalid reset token" });
      }

      if (new Date() > (user as any).resetTokenExpiry) {
        return res.status(400).json({ error: "Reset token has expired" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await (storage as any).updateUser?.(userId, {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      });

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ error: "Password reset failed" });
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

  // Delete user account
  app.delete("/api/auth/account", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      await (storage as any).deleteUser?.(userId);
      res.json({ message: "Account deleted successfully" });
    } catch (error) {
      console.error("Account deletion error:", error);
      res.status(500).json({ error: "Failed to delete account" });
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
