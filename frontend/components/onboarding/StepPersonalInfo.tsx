/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CountryPicker } from "./CountryPicker";

interface StepPersonalInfoProps {
  register: any;
  errors: any;
  values: any;
  setValue: any;
  photoPreview?: string;
  setPhotoPreview?: (url: string) => void;
}

export function StepPersonalInfo({
  register,
  errors,
  values,
  setValue,
}: StepPersonalInfoProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="fullName" required>Full name</Label>
        <Input
          id="fullName"
          variant="glass"
          placeholder="Amina Okafor"
          error={!!errors.fullName}
          errorMessage={errors.fullName?.message}
          {...register("fullName")}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" required>Email</Label>
        <Input
          id="email"
          variant="glass"
          readOnly
          {...register("email")}
          className="cursor-not-allowed opacity-80"
        />
      </div>
      <div className="md:col-span-2">
        <CountryPicker
          label="Country"
          value={values.country}
          onChange={(value) => setValue("country", value, { shouldValidate: true })}
          error={errors.country?.message}
        />
      </div>
      <div className="md:col-span-2 space-y-2">
        <Label htmlFor="profilePhotoUrl">Profile photo</Label>
        <div className="flex flex-col items-center gap-5 rounded-3xl border border-[var(--border-default)] bg-[rgba(240,240,255,0.02)] p-6 sm:flex-row">
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full ring-4 ring-[rgba(108,71,255,0.2)] bg-[rgba(108,71,255,0.12)]">
            <img
              src={values.profilePhotoUrl || "/default-avatar.png"}
              alt="Profile"
              className="h-16 w-16 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/default-avatar.png";
              }}
            />
          </div>
          <div className="w-full flex-1 space-y-2">
            <Input
              id="profilePhotoUrl"
              variant="glass"
              placeholder="Paste your avatar URL (optional)"
              value={values.profilePhotoUrl || ""}
              onChange={(e) => setValue("profilePhotoUrl", e.target.value, { shouldValidate: true })}
            />
            <p className="text-xs text-[var(--color-muted)]">
              Provide a hosted photo URL (e.g. GitHub avatar) or leave blank for a default gradient.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

