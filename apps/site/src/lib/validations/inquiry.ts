import { z } from "zod";

const phPhoneRegex = /^(09\d{9}|\+639\d{9})$/;

export const inquirySchema = z.object({
  contactName: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(phPhoneRegex, "Enter a valid PH mobile number (e.g. 09123456789 or +639123456789)"),
  email: z.union([z.string().email("Enter a valid email address"), z.literal("")]).optional(),
  message: z
    .string()
    .min(10, "Please describe the issue in at least 10 characters")
    .max(2000, "Message is too long"),
});

export type InquiryFormData = z.infer<typeof inquirySchema>;
