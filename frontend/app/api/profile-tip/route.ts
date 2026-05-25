import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { tip: null, error: "Anthropic API key not configured." },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const { fieldOfStudy, researchInterests = [] } = body as {
    fieldOfStudy?: string;
    researchInterests?: string[];
  };

  const field = fieldOfStudy?.trim() || "your field";
  const interests = (researchInterests as string[])
    .filter(Boolean)
    .slice(0, 4)
    .join(", ");

  const userPrompt = interests
    ? `Based on my profile (field: ${field}, research interests: ${interests}), give me ONE concise sentence (≤25 words) advising me to add more specific research interests to unlock better scholarship matches.`
    : `Based on my profile (field: ${field}), give me ONE concise sentence (≤25 words) telling me I'd benefit from adding research interests to unlock scholarship matches in ${field}.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-5",
      max_tokens: 80,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return NextResponse.json({ tip: null, error: err }, { status: 502 });
  }

  const data = (await response.json()) as {
    content?: { type: string; text: string }[];
  };

  const tip =
    data.content?.find((c) => c.type === "text")?.text?.trim() ?? null;

  return NextResponse.json({ tip });
}
