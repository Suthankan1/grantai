import { z } from "zod";

export const countries = [
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

export const fieldsOfStudy = [
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
] as const;

export const degreeLevels = ["Bachelor", "Master", "PhD", "Postdoc", "Other"] as const;

export const grantTypes = [
  "Research Grant",
  "Travel Grant",
  "Fellowship",
  "Equipment Grant",
  "Pilot Study Grant",
  "Community Impact Grant",
] as const;

export const deadlinePreferences = [
  { label: "Any time", value: "ANY" },
  { label: "Within 1 month", value: "ONE_MONTH" },
  { label: "Within 3 months", value: "THREE_MONTHS" },
  { label: "Within 6 months", value: "SIX_MONTHS" },
  { label: "Within 1 year", value: "ONE_YEAR" },
] as const;

export const onboardingSchema = z.object({
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

export type OnboardingValues = z.infer<typeof onboardingSchema>;

export const defaultValues: OnboardingValues = {
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

export function stepTitle(step: number) {
  return [
    "Personal Info",
    "Academic Background",
    "Research Interests",
    "Grant Preferences",
    "Review & Submit",
  ][step - 1];
}
