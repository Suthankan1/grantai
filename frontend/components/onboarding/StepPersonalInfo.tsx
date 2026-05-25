/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CountryPicker } from "./CountryPicker";
import { uploadProfilePhoto, API_BASE_URL } from "@/lib/api";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    // 1. Convert to base64 for instant preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLocalPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      // 2. Call backend endpoint
      const response = await uploadProfilePhoto(file);
      // 3. Set returned URL into profilePhotoUrl
      setValue("profilePhotoUrl", response.url, { shouldValidate: true });
    } catch (err) {
      console.error("Profile photo upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const getImageUrl = () => {
    if (localPreview) return localPreview;
    const url = values.profilePhotoUrl;
    if (!url) return "/default-avatar.png";
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    return `${API_BASE_URL}${url}`;
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
        <Label htmlFor="profilePhotoUrl">Profile photo</Label>
        <div className="flex flex-col items-center gap-5 rounded-3xl border border-[var(--border-default)] bg-[rgba(240,240,255,0.02)] p-6 sm:flex-row">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: "none" }}
          />
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative h-16 w-16 flex-shrink-0 cursor-pointer overflow-hidden rounded-full ring-4 ring-[rgba(108,71,255,0.2)] bg-[rgba(108,71,255,0.12)] hover:ring-[rgba(108,71,255,0.4)] transition-all flex items-center justify-center"
          >
            {uploading ? (
              <div className="flex items-center justify-center w-full h-full bg-black/60">
                <span className="text-[10px] text-white font-medium animate-pulse">Saving...</span>
              </div>
            ) : (
              <>
                <img
                  src={getImageUrl()}
                  alt="Profile"
                  className="h-16 w-16 rounded-full object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/default-avatar.png";
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-medium text-white">Upload</span>
                </div>
              </>
            )}
          </div>
          <div className="w-full flex-1 space-y-2">
            <div className="flex gap-2">
              <Input
                id="profilePhotoUrl"
                variant="glass"
                placeholder="Paste your avatar URL or upload (optional)"
                value={values.profilePhotoUrl || ""}
                onChange={(e) => setValue("profilePhotoUrl", e.target.value, { shouldValidate: true })}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="shrink-0"
              >
                {uploading ? "Uploading..." : "Upload Photo"}
              </Button>
            </div>
            <p className="text-xs text-[var(--color-muted)]">
              Upload a file, paste a photo URL (e.g. GitHub avatar), or leave blank for a default gradient.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

