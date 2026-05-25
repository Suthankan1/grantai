"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/auth-store";
import { getProfile, saveProfile } from "@/lib/api";

import {
  onboardingSchema,
  defaultValues,
  stepTitle,
  type OnboardingValues,
} from "@/lib/onboarding-constants";
import { StepPersonalInfo } from "@/components/onboarding/StepPersonalInfo";
import { StepAcademicBackground } from "@/components/onboarding/StepAcademicBackground";
import { StepResearchInterests } from "@/components/onboarding/StepResearchInterests";
import { StepGrantPreferences } from "@/components/onboarding/StepGrantPreferences";
import { StepReview } from "@/components/onboarding/StepReview";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated, updateProfileComplete, setUser } = useAuthStore();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const profileLoadedRef = useRef(false);

  const {
    register,
    watch,
    reset,
    setValue,
    trigger,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues,
  });

  const values = watch();

  useEffect(() => {
    register("country");
    register("profilePhotoUrl");
    register("fieldOfStudy");
    register("researchInterests");
    register("grantTypes");
    register("preferredCountries");
  }, [register]);

  useEffect(() => {
    if (!isAuthenticated && !user) {
      router.replace("/auth/login");
    }
  }, [isAuthenticated, router, user]);

  useEffect(() => {
    if (profileLoadedRef.current) return;

    const loadProfile = async () => {
      profileLoadedRef.current = true;
      try {
        const profile = await getProfile();
        reset({
          fullName: profile.fullName ?? user?.fullName ?? "",
          email: profile.email ?? user?.email ?? "",
          country: profile.country ?? "",
          profilePhotoUrl: profile.profilePhotoUrl ?? "",
          university: profile.university ?? "",
          degreeLevel: profile.degreeLevel ?? "",
          fieldOfStudy: profile.fieldOfStudy ?? "",
          graduationYear: profile.graduationYear ?? new Date().getFullYear(),
          gpa: Number(profile.gpa ?? 3.2),
          researchInterests: profile.researchInterests ?? [],
          grantTypes: profile.grantTypes ?? [],
          preferredCountries: profile.preferredCountries ?? [],
          minGrantAmount: profile.minGrantAmount ?? 25000,
          deadlinePreference: profile.deadlinePreference ?? "ANY",
        });
        if (profile.fullName || profile.email || profile.profileComplete) {
          setUser({
            id: profile.userId,
            email: profile.email,
            fullName: profile.fullName,
            role: user?.role ?? "USER",
            profileComplete: profile.profileComplete,
          });
        }
      } catch {
        // Fresh profile or unauthorized request; populate with current auth user info if available
        reset({
          ...defaultValues,
          fullName: user?.fullName ?? "",
          email: user?.email ?? "",
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (user?.email || isAuthenticated) {
      loadProfile();
    } else {
      setIsLoadingProfile(false);
    }
  }, [isAuthenticated, reset, setUser, user]);

  const goToStep = (nextStep: number) => {
    setDirection(nextStep > step ? 1 : -1);
    setStep(nextStep);
  };

  const fieldsByStep: Record<number, (keyof OnboardingValues)[]> = {
    1: ["fullName", "email", "country", "profilePhotoUrl"],
    2: ["university", "degreeLevel", "fieldOfStudy", "graduationYear", "gpa"],
    3: ["researchInterests"],
    4: ["grantTypes", "preferredCountries", "minGrantAmount", "deadlinePreference"],
    5: [],
  };

  const handleNextStep = async () => {
    const valid = await trigger(fieldsByStep[step]);
    if (valid) {
      goToStep(Math.min(5, step + 1));
    }
  };

  const onSubmit = async (data: OnboardingValues) => {
    setSubmitError(null);

    try {
      await saveProfile(data);
      updateProfileComplete(true);
      confetti({ particleCount: 140, spread: 72, origin: { y: 0.68 } });
      window.setTimeout(() => router.push("/dashboard"), 650);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to save your profile.");
    }
  };

  const stepVariants = {
    enter: (currentDirection: 1 | -1) => ({
      x: currentDirection > 0 ? 64 : -64,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (currentDirection: 1 | -1) => ({
      x: currentDirection > 0 ? -64 : 64,
      opacity: 0,
    }),
  };

  const currentStepContent = (() => {
    switch (step) {
      case 1:
        return (
          <StepPersonalInfo
            register={register}
            errors={errors}
            values={values}
            setValue={setValue}
          />
        );
      case 2:
        return (
          <StepAcademicBackground
            register={register}
            errors={errors}
            values={values}
            setValue={setValue}
          />
        );
      case 3:
        return (
          <StepResearchInterests
            values={values}
            setValue={setValue}
            errors={errors}
          />
        );
      case 4:
        return (
          <StepGrantPreferences
            register={register}
            errors={errors}
            values={values}
            setValue={setValue}
          />
        );
      case 5:
        return (
          <StepReview
            values={values}
            submitError={submitError}
          />
        );
      default:
        return null;
    }
  })();

  if (isLoadingProfile) {
    return (
      <div className="flex min-h-[calc(100svh-4rem)] items-center justify-center px-4 text-[var(--color-muted)]">
        Loading onboarding profile...
      </div>
    );
  }

  return (
    <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(108,71,255,0.22),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(0,212,170,0.14),_transparent_30%),linear-gradient(180deg,_#05050c_0%,_#080810_100%)]" />
      <div className="absolute inset-0 bg-grid opacity-40" aria-hidden="true" />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <Card variant="glass-strong" padding="none" className="overflow-hidden">
          <div className="border-b border-[var(--border-default)] px-6 py-5 sm:px-8 sm:py-6">
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Badge variant="accent" className="mb-3 gap-1.5 px-3 py-1">
                    <Sparkles className="h-3 w-3" />
                    5-step onboarding
                  </Badge>
                  <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--color-text)] sm:text-4xl">
                    Build your grant profile
                  </h1>
                  <p className="mt-2 text-sm text-[var(--color-muted)] sm:text-base">
                    We’ll use this profile to match opportunities and personalize your grant recommendations.
                  </p>
                </div>
                <div className="hidden rounded-2xl border border-[var(--border-default)] bg-[rgba(240,240,255,0.04)] px-4 py-3 text-right text-xs text-[var(--color-muted)] md:block">
                  <div className="font-medium text-[var(--color-text)]">{stepTitle(step)}</div>
                  <div>{step} of 5</div>
                </div>
              </div>

              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="h-2 flex-1 rounded-full bg-[rgba(240,240,255,0.08)]">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${item <= step ? "bg-gradient-to-r from-[#6C47FF] to-[#00D4AA]" : "bg-transparent"}`}
                      style={{ width: item < step ? "100%" : item === step ? "100%" : "0%" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <CardContent className="px-6 py-6 sm:px-8 sm:py-8">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                {currentStepContent}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                variant="outline"
                size="lg"
                onClick={() => goToStep(Math.max(1, step - 1))}
                disabled={step === 1 || isSubmitting}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>

              {step < 5 ? (
                <Button variant="default" size="lg" onClick={handleNextStep}>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="glow"
                  size="lg"
                  onClick={handleSubmit(onSubmit)}
                  loading={isSubmitting}
                >
                  Submit profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}