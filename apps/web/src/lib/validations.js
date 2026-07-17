import { z } from "zod";

/**
 * Shared Zod schemas for validating incoming data in API routes and Server Actions.
 * Centralizing these prevents SQL injection and ensures data integrity before it reaches Prisma.
 */

// User Authentication
export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }).trim().toLowerCase(),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }).trim(),
  email: z.string().email({ message: "Invalid email address" }).trim().toLowerCase(),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  shopName: z.string().min(2, { message: "Shop name must be at least 2 characters" }).trim(),
});

// Transactions
export const createTransactionSchema = z.object({
  contactId: z.string().cuid({ message: "Invalid contact ID" }),
  type: z.enum(["YOU_GAVE", "YOU_GOT"]),
  amount: z.coerce
    .number()
    .positive({ message: "Amount must be a positive number" })
    .max(999999999.99, { message: "Amount exceeds maximum allowed limit" }),
  note: z.string().max(500, { message: "Note cannot exceed 500 characters" }).optional().nullable(),
});

// Contacts
export const createContactSchema = z.object({
  name: z.string().min(1, { message: "Contact name is required" }).max(100).trim(),
  phone: z.string().regex(/^\+?[0-9\s-]{7,15}$/, { message: "Invalid phone number" }).optional().nullable(),
  email: z.string().email({ message: "Invalid email address" }).optional().nullable(),
  openingBalance: z.coerce.number().optional().default(0),
});

// Products / Inventory
export const createProductSchema = z.object({
  name: z.string().min(1, { message: "Product name is required" }).max(150).trim(),
  sku: z.string().max(50).optional().nullable(),
  category: z.string().max(50).optional().nullable(),
  unit: z.string().min(1).max(20),
  purchasePrice: z.coerce.number().nonnegative(),
  sellingPrice: z.coerce.number().nonnegative(),
  reorderLevel: z.coerce.number().int().nonnegative().optional().nullable(),
});
