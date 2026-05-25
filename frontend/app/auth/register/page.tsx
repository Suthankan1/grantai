"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/auth-shell";
import { authRegister, authGoogleLogin } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Enter your full name."),
    email: z.string().email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { login, isAuthenticated, user } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(user.profileComplete ? "/dashboard" : "/onboarding");
    }
  }, [isAuthenticated, router, user]);

  const onSubmit = async (values: RegisterValues) => {
    setErrorMessage(null);

    try {
      const response = await authRegister({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      });
      login(response.user, response.token);
      router.push("/onboarding");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to create the account.");
    }
  };

  // Google sign-up: same flow as sign-in — backend finds-or-creates the user.
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setErrorMessage("Google did not return a credential. Please try again.");
      return;
    }
    setIsGoogleLoading(true);
    setErrorMessage(null);
    try {
      const response = await authGoogleLogin(credentialResponse.credential);
      login(response.user, response.token);
      // New Google users will have profileComplete=false → go to onboarding
      router.push(response.user.profileComplete ? "/dashboard" : "/onboarding");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Google sign-up failed.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <AuthShell
      badge="Create your account"
      title="Start your GrantAI journey"
      description="Register once, complete the onboarding wizard, and your grant profile will be saved to PostgreSQL behind secure auth cookies."
      footer={
        <p className="text-sm text-[var(--color-muted)]">
          Already have an account? <Link href="/auth/login" className="text-[var(--color-accent)] hover:underline">Sign in</Link>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        {errorMessage && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="register-full-name" required>Full name</Label>
          <Input
            id="register-full-name"
            variant="glass"
            leftIcon={<User className="h-4 w-4" />}
            placeholder="Amina Okafor"
            error={!!errors.fullName}
            errorMessage={errors.fullName?.message}
            {...register("fullName")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-email" required>Email</Label>
          <Input
            id="register-email"
            type="email"
            variant="glass"
            leftIcon={<Mail className="h-4 w-4" />}
            placeholder="you@example.com"
            error={!!errors.email}
            errorMessage={errors.email?.message}
            {...register("email")}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="register-password" required>Password</Label>
            <Input
              id="register-password"
              type={showPassword ? "text" : "password"}
              variant="glass"
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="text-[var(--color-muted)] hover:text-[var(--color-text)]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              placeholder="••••••••"
              error={!!errors.password}
              errorMessage={errors.password?.message}
              {...register("password")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-confirm-password" required>Confirm password</Label>
            <Input
              id="register-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              variant="glass"
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="text-[var(--color-muted)] hover:text-[var(--color-text)]"
                  aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              placeholder="••••••••"
              error={!!errors.confirmPassword}
              errorMessage={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Create account
        </Button>

        <div className="relative py-2 text-center text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">
          <span className="relative z-10 bg-[var(--bg-surface-raised)] px-3">or sign up with</span>
          <span className="absolute left-0 top-1/2 h-px w-full bg-[var(--border-default)]" aria-hidden="true" />
        </div>

        {/* Google Sign-Up — same backend endpoint as sign-in (find-or-create) */}
        <div className="flex justify-center">
          {isGoogleLoading ? (
            <Button type="button" variant="outline" size="lg" className="w-full" loading>
              Signing up with Google…
            </Button>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setErrorMessage("Google sign-up was cancelled or failed.")}
              theme="filled_black"
              shape="rectangular"
              size="large"
              text="signup_with"
              width="100%"
              logo_alignment="left"
            />
          )}
        </div>
      </form>
    </AuthShell>
  );
}