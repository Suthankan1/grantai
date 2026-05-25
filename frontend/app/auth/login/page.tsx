"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/auth-shell";
import { authLogin, authGoogleLogin } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(user.profileComplete ? "/dashboard" : "/onboarding");
    }
  }, [isAuthenticated, router, user]);

  const onSubmit = async (values: LoginValues) => {
    setErrorMessage(null);

    try {
      const response = await authLogin(values);
      login(response.user, response.token);
      router.push(response.user.profileComplete ? "/dashboard" : "/onboarding");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to sign in.");
    }
  };

  // Called by GoogleLogin component on successful Google sign-in.
  // `credential` is the raw Google ID token (JWT) we send to our backend.
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
      router.push(response.user.profileComplete ? "/dashboard" : "/onboarding");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Google sign-in failed.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <AuthShell
      badge="Welcome back"
      title="Sign in to GrantAI"
      description="Continue where you left off. Your session is kept in secure httpOnly cookies while the client store tracks the active user state."
      footer={
        <p className="text-sm text-[var(--color-muted)]">
          New here? <Link href="/auth/register" className="text-[var(--color-accent)] hover:underline">Create an account</Link>
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
          <Label htmlFor="login-email" required>Email</Label>
          <Input
            id="login-email"
            type="email"
            variant="glass"
            leftIcon={<Mail className="h-4 w-4" />}
            placeholder="you@example.com"
            error={!!errors.email}
            errorMessage={errors.email?.message}
            {...register("email")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="login-password" required>Password</Label>
          <Input
            id="login-password"
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

        <div className="flex items-center justify-between gap-3 text-sm text-[var(--color-muted)]">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="h-4 w-4 rounded border-[var(--border-default)] bg-transparent" />
            Remember me
          </label>
          <button type="button" className="text-[var(--color-accent)] hover:underline">
            Forgot password?
          </button>
        </div>

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Sign in
        </Button>

        <div className="relative py-2 text-center text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">
          <span className="relative z-10 bg-[var(--bg-surface-raised)] px-3">or continue with</span>
          <span className="absolute left-0 top-1/2 h-px w-full bg-[var(--border-default)]" aria-hidden="true" />
        </div>

        {/* Google Sign-In — uses @react-oauth/google which gives us an ID token */}
        <div className="flex justify-center">
          {isGoogleLoading ? (
            <Button type="button" variant="outline" size="lg" className="w-full" loading>
              Signing in with Google…
            </Button>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setErrorMessage("Google sign-in was cancelled or failed.")}
              theme="filled_black"
              shape="rectangular"
              size="large"
              text="signin_with"
              logo_alignment="left"
            />
          )}
        </div>
      </form>
    </AuthShell>
  );
}