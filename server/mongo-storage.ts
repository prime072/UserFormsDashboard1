import { type User, type InsertUser, type Form, type InsertForm, type Response, type InsertResponse } from "@shared/schema";
import mongoose from "mongoose";
import { type IStorage } from "./storage";

// MongoDB Schemas
const userSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  firstName: String,
  lastName: String,
  phone: String,
  company: String,
  photo: String,
  password: String,
  username: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const formSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  userId: String,
  title: String,
  status: { type: String, default: "Active" },
  fields: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const responseSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  formId: String,
  data: mongoose.Schema.Types.Mixed,
  submittedAt: { type: Date, default: Date.now },
});

const UserModel = mongoose.model("User", userSchema, "users");
const FormModel = mongoose.model("Form", formSchema, "forms");
const ResponseModel = mongoose.model("Response", responseSchema, "responses");

export class MongoDBStorage implements IStorage {
  private connected = false;

  async connect() {
    if (this.connected) return;
    
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI environment variable is not set");
    }

    try {
      await mongoose.connect(mongoUri);
      this.connected = true;
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw error;
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    await this.connect();
    const doc = await UserModel.findOne({ id }).lean();
    if (!doc) return undefined;
    const { _id, ...rest } = doc as any;
    return rest as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    await this.connect();
    const doc = await UserModel.findOne({ $or: [{ username }, { email: username }] }).lean();
    if (!doc) return undefined;
    const { _id, ...rest } = doc as any;
    return rest as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    await this.connect();
    const doc = await UserModel.findOne({ email }).lean();
    if (!doc) return undefined;
    const { _id, ...rest } = doc as any;
    return rest as User;
  }

  async updateUser(id: string, updates: any): Promise<User | undefined> {
    await this.connect();
    const doc = await UserModel.findOneAndUpdate(
      { id },
      { ...updates, updatedAt: new Date() },
      { new: true }
    ).lean();
    if (!doc) return undefined;
    const { _id, ...rest } = doc as any;
    return rest as User;
  }

  async createUser(user: InsertUser): Promise<User> {
    await this.connect();
    const id = Math.random().toString(36).substr(2, 9);
    const email = (user as any).email || (user as any).username;
    const firstName = email?.split("@")[0] || "";
    const newUser = {
      id,
      email,
      firstName,
      lastName: "",
      phone: "",
      company: "",
      photo: "",
      ...user,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const doc = await UserModel.create(newUser);
    const { _id, ...rest } = doc.toObject() as any;
    return rest as User;
  }

  // Form methods
  async getForm(id: string): Promise<Form | undefined> {
    await this.connect();
    const doc = await FormModel.findOne({ id }).lean();
    if (!doc) return undefined;
    const { _id, ...rest } = doc as any;
    return rest as Form;
  }

  async getFormsByUserId(userId: string): Promise<Form[]> {
    await this.connect();
    const docs = await FormModel.find({ userId })
      .sort({ updatedAt: -1 })
      .lean();
    return docs.map((doc: any) => {
      const { _id, ...rest } = doc;
      return rest as Form;
    });
  }

  async createForm(form: InsertForm): Promise<Form> {
    await this.connect();
    const id = Math.random().toString(36).substr(2, 9);
    const newForm = {
      id,
      ...form,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const doc = await FormModel.create(newForm);
    const { _id, ...rest } = doc.toObject() as any;
    return rest as Form;
  }

  async updateForm(id: string, updates: Partial<InsertForm>): Promise<Form | undefined> {
    await this.connect();
    const doc = await FormModel.findOneAndUpdate(
      { id },
      { ...updates, updatedAt: new Date() },
      { new: true }
    ).lean();
    if (!doc) return undefined;
    const { _id, ...rest } = doc as any;
    return rest as Form;
  }

  async deleteForm(id: string): Promise<boolean> {
    await this.connect();
    const result = await FormModel.deleteOne({ id });
    return result.deletedCount > 0;
  }

  // Response methods
  async createResponse(response: InsertResponse): Promise<Response> {
    await this.connect();
    const id = Math.random().toString(36).substr(2, 9);
    const newResponse = {
      id,
      ...response,
      submittedAt: new Date(),
    };
    const doc = await ResponseModel.create(newResponse);
    const { _id, ...rest } = doc.toObject() as any;
    return rest as Response;
  }

  async getResponse(id: string): Promise<Response | undefined> {
    await this.connect();
    const doc = await ResponseModel.findOne({ id }).lean();
    if (!doc) return undefined;
    const { _id, ...rest } = doc as any;
    return rest as Response;
  }

  async getResponsesByFormId(formId: string): Promise<Response[]> {
    await this.connect();
    const docs = await ResponseModel.find({ formId })
      .sort({ submittedAt: -1 })
      .lean();
    return docs.map((doc: any) => {
      const { _id, ...rest } = doc;
      return rest as Response;
    });
  }

  async getResponseCount(formId: string): Promise<number> {
    await this.connect();
    return await ResponseModel.countDocuments({ formId });
  }
}

export const mongoStorage = new MongoDBStorage();
