/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { ImagePlus, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CountryPicker } from "./CountryPicker";

interface StepPersonalInfoProps {
  register: any;
  errors: any;
  values: any;
  setValue: any;
  photoPreview: string;
  setPhotoPreview: (url: string) => void;
}

export function StepPersonalInfo({
  register,
  errors,
  values,
  setValue,
  photoPreview,
  setPhotoPreview,
}: StepPersonalInfoProps) {
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
        <Label htmlFor="photo">Profile photo</Label>
        <div
          onClick={() => document.getElementById("photo")?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-[var(--border-default)] bg-[rgba(240,240,255,0.04)] px-6 py-8 text-center hover:border-[var(--border-strong)]"
        >
          {photoPreview ? (
            <Image
              src={photoPreview}
              alt="Profile preview"
              width={96}
              height={96}
              className="h-24 w-24 rounded-full object-cover ring-4 ring-[rgba(108,71,255,0.2)]"
              unoptimized
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[rgba(108,71,255,0.12)] text-[#9B73FF]">
              <ImagePlus className="h-10 w-10" />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-[var(--color-text)]">Upload a profile photo</p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              PNG or JPG. The upload is stored as a profile photo URL preview for now.
            </p>
          </div>
          <input
            id="photo"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => handlePhotoUpload(event.target.files?.[0])}
          />
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] px-3 py-1 text-xs text-[var(--color-muted)]">
            <Upload className="h-3.5 w-3.5" /> Choose file
          </span>
        </div>
      </div>
    </div>
  );
}
