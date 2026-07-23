import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['OWNER', 'WORKER']).default('OWNER'),
  shopName: z.string().optional(),
  shopId: z.string().optional(),
}).refine(data => {
  if (data.role === 'OWNER' && (!data.shopName || data.shopName.length < 2)) {
    return false;
  }
  if (data.role === 'WORKER' && !data.shopId) {
    return false;
  }
  return true;
}, {
  message: "Invalid shop information for the selected role",
  path: ["shopId"], // path of error
});
