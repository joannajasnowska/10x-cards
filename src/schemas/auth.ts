import { z } from "zod";

// Schema for login request
export const loginSchema = z.object({
  email: z.string().min(1, "Adres email jest wymagany").email("Nieprawidłowy format adresu email"),
  password: z.string().min(1, "Hasło jest wymagane").min(6, "Hasło musi mieć co najmniej 6 znaków"),
});

// Schema for register request
export const registerSchema = z
  .object({
    email: z.string().min(1, "Adres email jest wymagany").email("Nieprawidłowy format adresu email"),
    password: z
      .string()
      .min(6, "Hasło musi mieć co najmniej 6 znaków")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Hasło musi zawierać co najmniej jedną małą literę, jedną wielką literę i jedną cyfrę"
      ),
    passwordConfirm: z.string().min(1, "Potwierdzenie hasła jest wymagane"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Hasła nie są identyczne",
    path: ["passwordConfirm"],
  });

// Types derived from schemas
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
