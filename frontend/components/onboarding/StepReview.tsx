/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SummaryRow } from "./SummaryRow";
import { deadlinePreferences } from "@/lib/onboarding-constants";
import { API_BASE_URL } from "@/lib/api";

interface StepReviewProps {
  values: any;
  submitError: string | null;
}

export function StepReview({ values, submitError }: StepReviewProps) {
  const getImageUrl = () => {
    const url = values.profilePhotoUrl;
    if (!url) return "/default-avatar.png";
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    return `${API_BASE_URL}${url}`;
  };

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
          <SummaryRow
            label="Profile photo"
            value={
              <div className="flex justify-end">
                <img
                  src={getImageUrl()}
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-[rgba(108,71,255,0.2)] bg-[rgba(108,71,255,0.12)]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/default-avatar.png";
                  }}
                />
              </div>
            }
          />
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
          <SummaryRow
            label="Deadline preference"
            value={
              deadlinePreferences.find((item) => item.value === values.deadlinePreference)?.label ??
              values.deadlinePreference
            }
          />
        </CardContent>
      </Card>

      {submitError && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {submitError}
        </div>
      )}
    </div>
  );
}
