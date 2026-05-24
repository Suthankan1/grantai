"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ImagePlus,
  Sparkles,
  Tag,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/auth-store";
import { getProfile, saveProfile } from "@/lib/api";

const countries = [
  { name: "United States", code: "US", flag: "🇺🇸" },
  { name: "United Kingdom", code: "GB", flag: "🇬🇧" },
  { name: "Canada", code: "CA", flag: "🇨🇦" },
  { name: "Germany", code: "DE", flag: "🇩🇪" },
  { name: "France", code: "FR", flag: "🇫🇷" },
  { name: "Netherlands", code: "NL", flag: "🇳🇱" },
  { name: "Kenya", code: "KE", flag: "🇰🇪" },
  { name: "Nigeria", code: "NG", flag: "🇳🇬" },
  { name: "South Africa", code: "ZA", flag: "🇿🇦" },
  { name: "India", code: "IN", flag: "🇮🇳" },
  { name: "Brazil", code: "BR", flag: "🇧🇷" },
  { name: "Australia", code: "AU", flag: "🇦🇺" },
  { name: "Singapore", code: "SG", flag: "🇸🇬" },
  { name: "New Zealand", code: "NZ", flag: "🇳🇿" },
  { name: "Japan", code: "JP", flag: "🇯🇵" },
  { name: "Spain", code: "ES", flag: "🇪🇸" },
  { name: "Italy", code: "IT", flag: "🇮🇹" },
  { name: "Mexico", code: "MX", flag: "🇲🇽" },
  { name: "Sweden", code: "SE", flag: "🇸🇪" },
  { name: "Norway", code: "NO", flag: "🇳🇴" },
  { name: "Switzerland", code: "CH", flag: "🇨🇭" },
  { name: "Ireland", code: "IE", flag: "🇮🇪" },
  { name: "Ghana", code: "GH", flag: "🇬🇭" },
  { name: "Egypt", code: "EG", flag: "🇪🇬" },
  { name: "Pakistan", code: "PK", flag: "🇵🇰" },
  { name: "Bangladesh", code: "BD", flag: "🇧🇩" },
  { name: "China", code: "CN", flag: "🇨🇳" },
  { name: "Argentina", code: "AR", flag: "🇦🇷" },
  { name: "Colombia", code: "CO", flag: "🇨🇴" },
  { name: "Chile", code: "CL", flag: "🇨🇱" },
  { name: "Belgium", code: "BE", flag: "🇧🇪" },
  { name: "Austria", code: "AT", flag: "🇦🇹" },
  { name: "Denmark", code: "DK", flag: "🇩🇰" },
  { name: "Finland", code: "FI", flag: "🇫🇮" },
  { name: "Portugal", code: "PT", flag: "🇵🇹" },
  { name: "Greece", code: "GR", flag: "🇬🇷" },
  { name: "Turkey", code: "TR", flag: "🇹🇷" },
  { name: "Saudi Arabia", code: "SA", flag: "🇸🇦" },
  { name: "United Arab Emirates", code: "AE", flag: "🇦🇪" },
  { name: "South Korea", code: "KR", flag: "🇰🇷" },
  { name: "Malaysia", code: "MY", flag: "🇲🇾" },
  { name: "Indonesia", code: "ID", flag: "🇮🇩" },
  { name: "Philippines", code: "PH", flag: "🇵🇭" },
  { name: "Thailand", code: "TH", flag: "🇹🇭" },
  { name: "Vietnam", code: "VN", flag: "🇻🇳" },
] as const;

const fieldsOfStudy = [
  "Computer Science",
  "Data Science",
  "Public Health",
  "Education",
  "Environmental Science",
  "Biomedical Engineering",
  "Social Work",
  "Agriculture",
  "Economics",
  "Policy Studies",
];

const degreeLevels = ["Bachelor", "Master", "PhD", "Postdoc", "Other"] as const;

const grantTypes = [
  "Research Grant",
  "Travel Grant",
  "Fellowship",
  "Equipment Grant",
  "Pilot Study Grant",
  "Community Impact Grant",
];

const deadlinePreferences = [
  { label: "Any time", value: "ANY" },
  { label: "Within 1 month", value: "ONE_MONTH" },
  { label: "Within 3 months", value: "THREE_MONTHS" },
  { label: "Within 6 months", value: "SIX_MONTHS" },
  { label: "Within 1 year", value: "ONE_YEAR" },
];

const onboardingSchema = z.object({
  fullName: z.string().min(2, "Enter your full name."),
  email: z.string().email("Enter a valid email address."),
  country: z.string().min(1, "Select a country."),
  profilePhotoUrl: z.string().optional(),
  university: z.string().min(2, "Enter your university."),
  degreeLevel: z.string().min(1, "Select a degree level."),
  fieldOfStudy: z.string().min(2, "Enter your field of study."),
  graduationYear: z.number().int().min(1950).max(2100),
  gpa: z.number().min(0).max(4),
  researchInterests: z.array(z.string().min(1)).min(3, "Add at least 3 research interests."),
  grantTypes: z.array(z.string().min(1)).min(1, "Select at least one grant type."),
  preferredCountries: z.array(z.string().min(1)).min(1, "Select at least one country."),
  minGrantAmount: z.number().min(0),
  deadlinePreference: z.string().min(1, "Select a deadline preference."),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

const defaultValues: OnboardingValues = {
  fullName: "",
  email: "",
  country: "",
  profilePhotoUrl: "",
  university: "",
  degreeLevel: "",
  fieldOfStudy: "",
  graduationYear: new Date().getFullYear(),
  gpa: 3.2,
  researchInterests: [],
  grantTypes: [],
  preferredCountries: [],
  minGrantAmount: 25000,
  deadlinePreference: "ANY",
};

function stepTitle(step: number) {
  return ["Personal Info", "Academic Background", "Research Interests", "Grant Preferences", "Review & Submit"][step - 1];
}

function CountryPicker({
  value,
  onChange,
  label,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  error?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const search = query.trim().toLowerCase();
    return countries.filter((country) =>
      `${country.name} ${country.code}`.toLowerCase().includes(search)
    );
  }, [query]);

  const selected = countries.find((country) => country.name === value);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-xl border border-[var(--border-default)] bg-[rgba(240,240,255,0.04)] px-4 py-3 text-left text-sm text-[var(--color-text)] hover:border-[var(--border-strong)]"
          onClick={() => setOpen((state) => !state)}
        >
          <span className="flex items-center gap-2">
            <span>{selected ? selected.flag : "🌍"}</span>
            {selected ? selected.name : value || "Search and select a country"}
          </span>
          <ChevronDown className="h-4 w-4 text-[var(--color-muted)]" />
        </button>

        {open && (
          <div className="absolute z-20 mt-2 w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface-raised)] p-3 shadow-card-hover">
            <Input
              autoFocus
              variant="filled"
              placeholder="Search countries"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="mb-3"
            />
            <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
              {matches.length > 0 ? (
                matches.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => {
                      onChange(country.name);
                      setOpen(false);
                      setQuery("");
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-[var(--color-text)] hover:bg-[rgba(108,71,255,0.08)]"
                  >
                    <span className="flex items-center gap-2">
                      <span>{country.flag}</span>
                      {country.name}
                    </span>
                    <span className="text-xs text-[var(--color-muted)]">{country.code}</span>
                  </button>
                ))
              ) : query.trim() ? (
                <button
                  type="button"
                  onClick={() => {
                    onChange(query.trim());
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-[#00D4AA] hover:bg-[rgba(0,212,170,0.08)]"
                >
                  <span>🌍</span>
                  <span>Use &quot;{query.trim()}&quot; as custom country</span>
                </button>
              ) : (
                <p className="px-3 py-2 text-sm text-[var(--color-muted)]">No matching countries.</p>
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function SearchableFieldSelect({
  value,
  onChange,
  label,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  error?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const matches = useMemo(() => {
    const search = query.trim().toLowerCase();
    return fieldsOfStudy.filter((field) => field.toLowerCase().includes(search));
  }, [query]);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-xl border border-[var(--border-default)] bg-[rgba(240,240,255,0.04)] px-4 py-3 text-left text-sm text-[var(--color-text)] hover:border-[var(--border-strong)]"
          onClick={() => setOpen((state) => !state)}
        >
          <span className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-[var(--color-muted)]" />
            {value || "Search field of study"}
          </span>
          <ChevronDown className="h-4 w-4 text-[var(--color-muted)]" />
        </button>

        {open && (
          <div className="absolute z-20 mt-2 w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface-raised)] p-3 shadow-card-hover">
            <Input
              autoFocus
              variant="filled"
              placeholder="Search field of study"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="mb-3"
            />
            <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
              {matches.length > 0 ? (
                matches.map((field) => (
                  <button
                    key={field}
                    type="button"
                    onClick={() => {
                      onChange(field);
                      setOpen(false);
                      setQuery("");
                    }}
                    className="w-full rounded-xl px-3 py-2 text-left text-sm text-[var(--color-text)] hover:bg-[rgba(108,71,255,0.08)]"
                  >
                    {field}
                  </button>
                ))
              ) : query.trim() ? (
                <button
                  type="button"
                  onClick={() => {
                    onChange(query.trim());
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-[#00D4AA] hover:bg-[rgba(0,212,170,0.08)]"
                >
                  <span>Use &quot;{query.trim()}&quot; as custom field</span>
                </button>
              ) : (
                <p className="px-3 py-2 text-sm text-[var(--color-muted)]">No matching fields.</p>
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function TagInput({
  tags,
  onChange,
  label,
  description,
  error,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  label: string;
  description: string;
  error?: string;
}) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const value = input.trim();
    if (!value || tags.some((tag) => tag.toLowerCase() === value.toLowerCase())) {
      return;
    }
    onChange([...tags, value]);
    setInput("");
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="rounded-2xl border border-[var(--border-default)] bg-[rgba(240,240,255,0.04)] p-3">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="primary" className="gap-1 pr-1.5">
              {tag}
              <button
                type="button"
                className="rounded-full p-0.5 text-white/80 hover:bg-white/10 hover:text-white"
                onClick={() => onChange(tags.filter((value) => value !== tag))}
                aria-label={`Remove ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addTag();
              }
              if (event.key === "Backspace" && !input && tags.length > 0) {
                onChange(tags.slice(0, -1));
              }
            }}
            placeholder="Type an interest and press Enter"
            className="min-w-56 flex-1 border-0 bg-transparent px-1 py-2 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)]"
          />
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-[var(--color-muted)]">
        <span>{description}</span>
        <span>{tags.length} / 3 required</span>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string | number | ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--border-default)] py-3 last:border-0">
      <span className="text-sm text-[var(--color-muted)]">{label}</span>
      <span className="max-w-[65%] text-right text-sm text-[var(--color-text)]">{value}</span>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated, updateProfileComplete, setUser } = useAuthStore();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

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
    if (!isAuthenticated && !user) {
      router.replace("/auth/login");
    }
  }, [isAuthenticated, router, user]);

  useEffect(() => {
    const loadProfile = async () => {
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
        setPhotoPreview(profile.profilePhotoUrl ?? "");
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
        // Fresh profile or unauthorized request; keep defaults.
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

  const handlePhotoUpload = async (file?: File | null) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      setPhotoPreview(result);
      setValue("profilePhotoUrl", result, { shouldValidate: true });
    };
    reader.readAsDataURL(file);
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
    if (step === 1) {
      return (
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName" required>Full name</Label>
            <Input id="fullName" variant="glass" placeholder="Amina Okafor" error={!!errors.fullName} errorMessage={errors.fullName?.message} {...register("fullName")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" required>Email</Label>
            <Input id="email" variant="glass" readOnly {...register("email")} className="cursor-not-allowed opacity-80" />
          </div>
          <div className="md:col-span-2">
            <CountryPicker
              label="Country"
              value={values.country}
              onChange={(value) => setValue("country", value, { shouldValidate: true })}
              error={errors.country?.message}
            />
            <input type="hidden" {...register("country")} />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="photo">Profile photo</Label>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-[var(--border-default)] bg-[rgba(240,240,255,0.04)] px-6 py-8 text-center hover:border-[var(--border-strong)]">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile preview" className="h-24 w-24 rounded-full object-cover ring-4 ring-[rgba(108,71,255,0.2)]" />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[rgba(108,71,255,0.12)] text-[#9B73FF]">
                  <ImagePlus className="h-10 w-10" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">Upload a profile photo</p>
                <p className="mt-1 text-xs text-[var(--color-muted)]">PNG or JPG. The upload is stored as a profile photo URL preview for now.</p>
              </div>
              <input id="photo" type="file" accept="image/*" className="hidden" onChange={(event) => handlePhotoUpload(event.target.files?.[0])} />
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] px-3 py-1 text-xs text-[var(--color-muted)]">
                <Upload className="h-3.5 w-3.5" /> Choose file
              </span>
            </label>
            <input type="hidden" {...register("profilePhotoUrl")} />
          </div>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="university" required>University</Label>
            <Input id="university" variant="glass" placeholder="University of Nairobi" error={!!errors.university} errorMessage={errors.university?.message} {...register("university")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="degreeLevel" required>Degree level</Label>
            <select id="degreeLevel" className="h-12 w-full rounded-xl border border-[var(--border-default)] bg-[rgba(240,240,255,0.04)] px-4 text-sm text-[var(--color-text)] outline-none" {...register("degreeLevel")}>
              <option value="">Select degree level</option>
              {degreeLevels.map((level) => (
                <option key={level} value={level.toUpperCase()}>{level}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <SearchableFieldSelect
              label="Field of study"
              value={values.fieldOfStudy}
              onChange={(value) => setValue("fieldOfStudy", value, { shouldValidate: true })}
              error={errors.fieldOfStudy?.message}
            />
            <input type="hidden" {...register("fieldOfStudy")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="graduationYear" required>Graduation year</Label>
            <Input id="graduationYear" variant="glass" type="number" placeholder="2026" error={!!errors.graduationYear} errorMessage={errors.graduationYear?.message} {...register("graduationYear", { valueAsNumber: true })} />
          </div>
          <div className="space-y-3">
            <Label htmlFor="gpa">GPA: {Number(values.gpa).toFixed(1)} / 4.0</Label>
            <input
              id="gpa"
              type="range"
              min="0"
              max="4"
              step="0.1"
              value={values.gpa}
              onChange={(event) => setValue("gpa", Number(event.target.value), { shouldValidate: true })}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[rgba(240,240,255,0.08)] accent-[var(--color-primary)]"
            />
          </div>
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="space-y-4">
          <TagInput
            label="Research interests"
            description="Press Enter to add each interest. Minimum 3 required."
            tags={values.researchInterests}
            onChange={(tags) => setValue("researchInterests", tags, { shouldValidate: true })}
            error={errors.researchInterests?.message}
          />
          <input type="hidden" {...register("researchInterests")} />
        </div>
      );
    }

    if (step === 4) {
      return (
        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Grant types</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {grantTypes.map((type) => {
                const selected = values.grantTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      const next = selected
                        ? values.grantTypes.filter((value) => value !== type)
                        : [...values.grantTypes, type];
                      setValue("grantTypes", next, { shouldValidate: true });
                    }}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition ${selected ? "border-[rgba(108,71,255,0.45)] bg-[rgba(108,71,255,0.12)] text-white" : "border-[var(--border-default)] bg-[rgba(240,240,255,0.04)] text-[var(--color-text)] hover:border-[var(--border-strong)]"}`}
                  >
                    <span>{type}</span>
                    {selected && <Check className="h-4 w-4 text-[#00D4AA]" />}
                  </button>
                );
              })}
            </div>
            <input type="hidden" {...register("grantTypes")} />
            {errors.grantTypes && <p className="text-xs text-red-400">{errors.grantTypes.message}</p>}
          </div>

          <div className="space-y-3">
            <Label>Preferred countries</Label>
            <div className="grid gap-3 sm:grid-cols-2 max-h-72 overflow-y-auto pr-1 py-1">
              {countries.map((country) => {
                const selected = values.preferredCountries.includes(country.name);
                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => {
                      const next = selected
                        ? values.preferredCountries.filter((value) => value !== country.name)
                        : [...values.preferredCountries, country.name];
                      setValue("preferredCountries", next, { shouldValidate: true });
                    }}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition ${selected ? "border-[rgba(0,212,170,0.4)] bg-[rgba(0,212,170,0.12)] text-white" : "border-[var(--border-default)] bg-[rgba(240,240,255,0.04)] text-[var(--color-text)] hover:border-[var(--border-strong)]"}`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{country.flag}</span>
                      {country.name}
                    </span>
                    {selected && <Check className="h-4 w-4 text-[#00D4AA]" />}
                  </button>
                );
              })}
            </div>
            <input type="hidden" {...register("preferredCountries")} />
            {errors.preferredCountries && <p className="text-xs text-red-400">{errors.preferredCountries.message}</p>}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="minGrantAmount">Minimum grant amount: ${Number(values.minGrantAmount).toLocaleString()}</Label>
              <input
                id="minGrantAmount"
                type="range"
                min="0"
                max="250000"
                step="5000"
                value={values.minGrantAmount}
                onChange={(event) => setValue("minGrantAmount", Number(event.target.value), { shouldValidate: true })}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[rgba(240,240,255,0.08)] accent-[var(--color-accent)]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadlinePreference" required>Deadline preference</Label>
              <select id="deadlinePreference" className="h-12 w-full rounded-xl border border-[var(--border-default)] bg-[rgba(240,240,255,0.04)] px-4 text-sm text-[var(--color-text)] outline-none" {...register("deadlinePreference")}>
                {deadlinePreferences.map((deadline) => (
                  <option key={deadline.value} value={deadline.value}>{deadline.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <Card variant="glass" padding="none" className="overflow-hidden">
          <CardHeader className="border-b border-[var(--border-default)]">
            <CardTitle>Profile summary</CardTitle>
            <CardDescription>Review everything before saving the profile to PostgreSQL.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 px-6 py-2">
            <SummaryRow label="Full name" value={values.fullName} />
            <SummaryRow label="Email" value={values.email} />
            <SummaryRow label="Country" value={values.country} />
            <SummaryRow label="University" value={values.university} />
            <SummaryRow label="Degree level" value={values.degreeLevel} />
            <SummaryRow label="Field of study" value={values.fieldOfStudy} />
            <SummaryRow label="Graduation year" value={values.graduationYear} />
            <SummaryRow label="GPA" value={Number(values.gpa).toFixed(1)} />
            <SummaryRow label="Research interests" value={values.researchInterests.join(", ")} />
            <SummaryRow label="Grant types" value={values.grantTypes.join(", ")} />
            <SummaryRow label="Preferred countries" value={values.preferredCountries.join(", ")} />
            <SummaryRow label="Minimum amount" value={`$${Number(values.minGrantAmount).toLocaleString()}`} />
            <SummaryRow label="Deadline preference" value={deadlinePreferences.find((item) => item.value === values.deadlinePreference)?.label ?? values.deadlinePreference} />
          </CardContent>
        </Card>

        {submitError && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {submitError}
          </div>
        )}
      </div>
    );
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
              <Button variant="outline" size="lg" onClick={() => goToStep(Math.max(1, step - 1))} disabled={step === 1 || isSubmitting}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>

              {step < 5 ? (
                <Button variant="default" size="lg" onClick={handleNextStep}>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="glow" size="lg" onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
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