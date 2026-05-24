export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

type RequestOptions = RequestInit & {
  auth?: boolean;
};

// ── Guided Demo Mode Mock Seeding & Local Database ─────────────────
/* eslint-disable @typescript-eslint/no-explicit-any */

export function seedDemoData() {
  if (typeof window === "undefined") return;
  
  if (!window.localStorage.getItem("grantai-demo-profile")) {
    window.localStorage.setItem("grantai-demo-profile", JSON.stringify({
      userId: "demo-user-id",
      email: "alex.mercer@stanford.edu",
      fullName: "Dr. Alex Mercer",
      country: "US",
      profilePhotoUrl: null,
      university: "Stanford University",
      degreeLevel: "PhD",
      fieldOfStudy: "Computer Science & Bio-computation",
      graduationYear: 2026,
      gpa: "3.95",
      researchInterests: ["Machine Learning", "Computational Biology", "Structural Bioinformatics"],
      grantTypes: ["Research Grant", "Fellowship"],
      preferredCountries: ["US", "CA", "GB"],
      minGrantAmount: 50000,
      deadlinePreference: "60_days",
      profileComplete: true
    }));
  }

  if (!window.localStorage.getItem("grantai-demo-tracker")) {
    const initialTracker = [
      {
        id: "demo-tracker-1",
        grantId: "demo-grant-1",
        grantTitle: "NIH Director's Pioneer Award (DP1)",
        grantProvider: "National Institutes of Health",
        grantAmount: 150000,
        grantCurrency: "USD",
        grantDeadline: "2026-06-15",
        status: "Draft",
        appliedDate: null,
        notes: "Drafting the main bio-computation proposal. Need to emphasize the AI application to protein structure prediction.",
        coverLetterStatus: "READY",
        coverLetterId: "demo-letter-1",
        createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
      },
      {
        id: "demo-tracker-2",
        grantId: "demo-grant-2",
        grantTitle: "NSF Graduate Research Fellowship Program (GRFP)",
        grantProvider: "National Science Foundation",
        grantAmount: 75000,
        grantCurrency: "USD",
        grantDeadline: "2026-06-30",
        status: "Under Review",
        appliedDate: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString().split("T")[0],
        notes: "Reference letters submitted by advisor. Awaiting first-round panel reviews.",
        coverLetterStatus: "READY",
        coverLetterId: "demo-letter-2",
        createdAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
      },
      {
        id: "demo-tracker-3",
        grantId: "demo-grant-3",
        grantTitle: "Stanford Science Fellowship",
        grantProvider: "Stanford University Office of Research",
        grantAmount: 85000,
        grantCurrency: "USD",
        grantDeadline: "2026-07-15",
        status: "Draft",
        appliedDate: null,
        notes: "Need to coordinate with department head regarding equipment cost matching.",
        coverLetterStatus: "NONE",
        coverLetterId: null,
        createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
      },
      {
        id: "demo-tracker-4",
        grantId: "demo-grant-4",
        grantTitle: "Burroughs Wellcome Fund Career Award",
        grantProvider: "Burroughs Wellcome Fund",
        grantAmount: 500000,
        grantCurrency: "USD",
        grantDeadline: "2026-08-01",
        status: "Rejected",
        appliedDate: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString().split("T")[0],
        notes: "Feedback: Project fell outside current molecular biology scope.",
        coverLetterStatus: "NONE",
        coverLetterId: null,
        createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString()
      },
      {
        id: "demo-tracker-5",
        grantId: "demo-grant-5",
        grantTitle: "DeepMind Bio-AI Research Fellowship",
        grantProvider: "Google DeepMind",
        grantAmount: 95000,
        grantCurrency: "USD",
        grantDeadline: "2026-09-10",
        status: "Won",
        appliedDate: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString().split("T")[0],
        notes: "Offer accepted! Funding starts next academic semester.",
        coverLetterStatus: "READY",
        coverLetterId: "demo-letter-5",
        createdAt: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString()
      }
    ];
    window.localStorage.setItem("grantai-demo-tracker", JSON.stringify(initialTracker));
  }

  if (!window.localStorage.getItem("grantai-demo-letters")) {
    const initialLetters = [
      {
        id: "demo-letter-1",
        grantId: "demo-grant-1",
        grantTitle: "NIH Director's Pioneer Award (DP1)",
        grantProvider: "National Institutes of Health",
        grantAmount: 150000,
        grantCurrency: "USD",
        grantDeadline: "2026-06-15",
        grantDescription: "Supports individual scientists of exceptional creativity who propose pioneering and highly innovative approaches with the potential to produce unusually high impact on bio-computation or biomedicine.",
        tone: "Professional",
        length: "Standard 500w",
        emphasis: ["research experience"],
        regenerationStyle: "default",
        customPrompt: "",
        content: `Dear Director and Members of the Selection Committee,<br/><br/>I am writing to submit my proposal for the NIH Director's Pioneer Award, specifically focusing on leveraging high-performance geometric deep learning models for structural bioinformatics and real-time protein-ligand modeling. As a PhD candidate in Computer Science at Stanford University specializing in Bio-computation, my research bridges advanced machine learning architecture and fundamental biochemistry to address key bottlenecks in drug discovery.<br/><br/>My academic track record and research experience place me in a unique position to pursue this high-risk, high-reward project. Under the supervision of Dr. Jean-Noel, I have designed neural network architectures that predict complex biochemical binding dynamics 100x faster than traditional molecular dynamics simulations. I believe this work will open new horizons in biomedical research. Thank you for your time and consideration of my candidacy.<br/><br/>Sincerely,<br/>Dr. Alex Mercer`,
        status: "SAVED",
        addToTracker: true,
        createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
      },
      {
        id: "demo-letter-2",
        grantId: "demo-grant-2",
        grantTitle: "NSF Graduate Research Fellowship Program (GRFP)",
        grantProvider: "National Science Foundation",
        grantAmount: 75000,
        grantCurrency: "USD",
        grantDeadline: "2026-06-30",
        grantDescription: "Supports outstanding graduate students in NSF-supported STEM disciplines.",
        tone: "Academic",
        length: "Standard 500w",
        emphasis: ["academic records"],
        regenerationStyle: "default",
        customPrompt: "",
        content: `Dear Selection Committee,<br/><br/>It is an honor to present my candidacy for the NSF Graduate Research Fellowship Program. As a doctoral student at Stanford University, my goal is to create scalable and robust machine learning systems that can automatically discover and catalog unknown protein configurations. By combining graph neural networks (GNNs) with physical structural priors, my research aims to solve core questions in genetic molecular biology.<br/><br/>Thank you for supporting scientific research and training the next generation of computing leaders.`,
        status: "SAVED",
        addToTracker: true,
        createdAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
      }
    ];
    window.localStorage.setItem("grantai-demo-letters", JSON.stringify(initialLetters));
  }

  if (!window.localStorage.getItem("grantai-demo-interviews")) {
    const initialInterviews = [
      {
        id: "demo-session-1",
        grantId: "demo-grant-1",
        grantTitle: "NIH Director's Pioneer Award (DP1)",
        grantProvider: "National Institutes of Health",
        questionsJson: JSON.stringify([
          { question: "How does your bio-computation model handle out-of-distribution mutation sequences?", context: "Technical feasibility", category: "Technical Alignment" },
          { question: "What is the broader impact of this research on drug discovery speed?", context: "Societal impact", category: "Broader Impact" }
        ]),
        answersJson: JSON.stringify({
          "0": "We train our geometric model using a comprehensive self-supervised evolutionary structure objective which makes it robust to novel sequences.",
          "1": "By reducing screening cycles from years to seconds, drug developers can identify promising leads instantly."
        }),
        feedbackJson: JSON.stringify({
          "0": { score: 9, strengths: ["Clear technical architecture references"], areas_to_improve: ["Mention validation set performance"], suggested_improvements: ["Cite your published validation numbers"], suggested_answer: "We use physical boundary conditions..." },
          "1": { score: 8.5, strengths: ["Clear value proposition"], areas_to_improve: ["Mention specific therapeutic classes"], suggested_improvements: ["Cite targeting cancer cells"], suggested_answer: "Reducing cycles specifically in oncology leads..." }
        }),
        avgScore: 8.7,
        createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
      }
    ];
    window.localStorage.setItem("grantai-demo-interviews", JSON.stringify(initialInterviews));
  }
}

// Intercept window.fetch client-side for dynamic cover letter streams
if (typeof window !== "undefined") {
  const originalFetch = window.fetch;
  window.fetch = async function (input, init) {
    const url = typeof input === "string" ? input : (input as Request).url || "";
    
    if (window.localStorage.getItem("grantai-demo-mode") === "true") {
      if (url.includes("/api/letters/generate")) {
        const body = JSON.parse(init?.body as string || "{}");
        const grantId = body.grantId || "demo-grant-1";
        
        // Find grant details
        const trackerStr = window.localStorage.getItem("grantai-demo-tracker") || "[]";
        const trackerList = JSON.parse(trackerStr);
        const trackerItem = trackerList.find((t: any) => t.grantId === grantId);
        const title = trackerItem ? trackerItem.grantTitle : "Selected Opportunity";
        const provider = trackerItem ? trackerItem.grantProvider : "Funder Administration";

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            const letterId = `demo-letter-${Date.now()}`;
            controller.enqueue(encoder.encode(`event: meta\ndata: {"letterId": "${letterId}"}\n\n`));

            const textParts = [
              `Dear Members of the Selection Committee,\n\n`,
              `I am writing to submit my application for the ${title} provided by the ${provider}. `,
              `As a PhD candidate at Stanford University in Computer Science & Bio-computation, `,
              `my research matches this opportunity perfectly. I specialize in applying advanced deep learning `,
              `techniques (specifically graph neural networks and diffusion models) to predict biomolecular `,
              `structures, bridging the gap between computer science and biochemical research.\n\n`,
              `My past achievements include developing AI systems that accelerate molecular docking pipelines `,
              `by two orders of magnitude while maintaining sub-angstrom accuracy. I believe that receiving `,
              `the ${title} will enable me to significantly scale my research, leading to breakthroughs in `,
              `automated drug discovery and genomic modeling.\n\n`,
              `Thank you for your consideration. I look forward to presenting my research to the committee.\n\n`,
              `Sincerely,\nDr. Alex Mercer`
            ];

            const fullText = textParts.join("");
            const chunks = (fullText.match(/\S+\s*/g) ?? []);
            
            // Save this new letter to localStorage
            const lettersStr = window.localStorage.getItem("grantai-demo-letters") || "[]";
            const lettersList = JSON.parse(lettersStr);
            const newLetter = {
              id: letterId,
              grantId,
              grantTitle: title,
              grantProvider: provider,
              grantAmount: trackerItem ? trackerItem.grantAmount : 50000,
              grantCurrency: "USD",
              grantDeadline: trackerItem ? trackerItem.grantDeadline : "2026-06-30",
              grantDescription: trackerItem ? trackerItem.notes : "",
              tone: body.tone || "Professional",
              length: body.length || "Standard 500w",
              emphasis: body.emphasis || ["research experience"],
              regenerationStyle: body.regenerationStyle || "default",
              customPrompt: body.customPrompt || "",
              content: fullText.replace(/\n/g, "<br />"),
              status: "SAVED",
              addToTracker: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            const existingIdx = lettersList.findIndex((l: any) => l.grantId === grantId);
            if (existingIdx >= 0) {
              lettersList[existingIdx] = newLetter;
            } else {
              lettersList.push(newLetter);
            }
            window.localStorage.setItem("grantai-demo-letters", JSON.stringify(lettersList));

            // Also update Tracker status
            if (trackerItem) {
              trackerItem.coverLetterStatus = "READY";
              trackerItem.coverLetterId = letterId;
              window.localStorage.setItem("grantai-demo-tracker", JSON.stringify(trackerList));
            }

            // Stream chunks slowly
            let i = 0;
            const interval = setInterval(() => {
              if (i < chunks.length) {
                controller.enqueue(encoder.encode(`event: chunk\ndata: {"delta": ${JSON.stringify(chunks[i])}}\n\n`));
                i++;
              } else {
                controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`));
                controller.close();
                clearInterval(interval);
              }
            }, 30);
          }
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
          }
        });
      }
    }
    
    return originalFetch(input, init);
  };
}

// Mock Grants list for search and detail lookups
const MOCK_GRANTS = [
  {
    id: "demo-grant-1",
    title: "NIH Director's Pioneer Award (DP1)",
    provider: "National Institutes of Health",
    grantType: "Research Grant",
    field: "Computer Science",
    countryName: "United States",
    countryCode: "US",
    amount: 150000,
    currency: "USD",
    deadline: "2026-06-15",
    description: "Supports individual scientists of exceptional creativity who propose pioneering and highly innovative approaches with the potential to produce unusually high impact on bio-computation or biomedicine.",
    matchScore: 98,
    matchReasoning: "Your research field matches computational biology and bioinformatics directly.",
    sourceUrl: "https://grants.nih.gov",
    eligibility: "PhD candidates or postdoctoral researchers with highly innovative projects.",
    documentsRequired: ["Research proposal", "CV", "Budget justification"],
    timeline: "First review: August 2026. Final results: October 2026."
  },
  {
    id: "demo-grant-2",
    title: "NSF Graduate Research Fellowship Program (GRFP)",
    provider: "National Science Foundation",
    grantType: "Fellowship",
    field: "Computer Science",
    countryName: "United States",
    countryCode: "US",
    amount: 75000,
    currency: "USD",
    deadline: "2026-06-30",
    description: "Recognizes and supports outstanding graduate students in NSF-supported science, technology, engineering, and mathematics disciplines who are pursuing research-based master's and doctoral degrees.",
    matchScore: 95,
    matchReasoning: "Perfect alignment with your Stanford PhD status and computer science background.",
    sourceUrl: "https://www.nsfgrfp.org",
    eligibility: "First or second year graduate students in STEM.",
    documentsRequired: ["Personal statement", "Proposed research plan", "Reference letters"],
    timeline: "Results announced April annually."
  },
  {
    id: "demo-grant-3",
    title: "Stanford Science Fellowship",
    provider: "Stanford University Office of Research",
    grantType: "Fellowship",
    field: "Environmental Science",
    countryName: "United States",
    countryCode: "US",
    amount: 85000,
    currency: "USD",
    deadline: "2026-07-15",
    description: "Designed for outstanding postdoctoral scholars or senior graduate students to pursue independent research in environmental and structural bio-systems.",
    matchScore: 92,
    matchReasoning: "Stanford internal alignment with your current academic affiliation.",
    sourceUrl: "https://stanford.edu",
    eligibility: "Senior PhD students or recent postdocs.",
    documentsRequired: ["Curriculum Vitae", "Research plan", "Three letters of recommendation"],
    timeline: "Interviews: September 2026. Award starts: January 2027."
  },
  {
    id: "demo-grant-4",
    title: "Burroughs Wellcome Fund Career Award",
    provider: "Burroughs Wellcome Fund",
    grantType: "Research Grant",
    field: "Public Health",
    countryName: "United States",
    countryCode: "US",
    amount: 500000,
    currency: "USD",
    deadline: "2026-08-01",
    description: "Designed to support postdoctoral fellows in scientific research who are moving from postdoctoral positions to faculty-track research appointments.",
    matchScore: 88,
    matchReasoning: "Aligned with computational medicine, although public health is a secondary field.",
    sourceUrl: "https://bwfund.org",
    eligibility: "Postdoctoral scientists transitioning to faculty.",
    documentsRequired: ["Letter of intent", "Full research proposal", "Institutional support letter"],
    timeline: "Final selection: December 2026."
  },
  {
    id: "demo-grant-5",
    title: "DeepMind Bio-AI Research Fellowship",
    provider: "Google DeepMind",
    grantType: "Fellowship",
    field: "Computer Science",
    countryName: "United Kingdom",
    countryCode: "GB",
    amount: 95000,
    currency: "USD",
    deadline: "2026-09-10",
    description: "Supports doctoral and postdoctoral researchers focusing on deep learning applications in protein design, genomics, or biomolecular modeling.",
    matchScore: 99,
    matchReasoning: "Direct match for your Machine Learning and Bioinformatics interests.",
    sourceUrl: "https://deepmind.google",
    eligibility: "PhD candidates or postdoctoral researchers globally.",
    documentsRequired: ["Research proposal", "CV", "Academic transcript", "Deep learning portfolio"],
    timeline: "Award announcement: November 2026."
  }
];

// Local Client-Side Database Router for Demo Mode requests
function handleDemoRequest<T>(path: string, options: RequestOptions = {}): T {
  seedDemoData();

  const method = options.method || "GET";

  // 1. Authentication routes
  if (path.startsWith("/api/auth/register") || path.startsWith("/api/auth/login")) {
    const user = {
      id: "demo-user-id",
      email: "alex.mercer@stanford.edu",
      fullName: "Dr. Alex Mercer",
      role: "RESEARCHER",
      profileComplete: true
    };
    return {
      user,
      token: "demo-jwt-token-string",
      refreshToken: "demo-refresh-token-string",
      message: "Successfully logged in in Demo Mode"
    } as unknown as T;
  }

  if (path.startsWith("/api/auth/logout")) {
    return { message: "Successfully logged out of Demo Mode" } as unknown as T;
  }

  if (path.startsWith("/api/auth/refresh")) {
    return {
      user: JSON.parse(window.localStorage.getItem("grantai-demo-profile") || "{}"),
      token: "demo-jwt-token-refreshed",
      refreshToken: "demo-refresh-token-string",
      message: "Auth token refreshed"
    } as unknown as T;
  }

  // 2. Profile routes
  if (path === "/api/profile") {
    if (method === "GET") {
      return JSON.parse(window.localStorage.getItem("grantai-demo-profile") || "{}") as T;
    } else if (method === "PUT") {
      const body = JSON.parse(options.body as string || "{}");
      const current = JSON.parse(window.localStorage.getItem("grantai-demo-profile") || "{}");
      const next = { ...current, ...body, profileComplete: true };
      window.localStorage.setItem("grantai-demo-profile", JSON.stringify(next));
      return next as T;
    }
  }

  // 3. Grants search & lookups
  if (path.startsWith("/api/grants/search")) {
    const url = new URL(path, "http://localhost");
    const query = url.searchParams.get("q")?.toLowerCase() || "";
    const field = url.searchParams.get("field") || "";
    const type = url.searchParams.get("type") || "";

    let filtered = [...MOCK_GRANTS];

    if (query) {
      filtered = filtered.filter(g => 
        g.title.toLowerCase().includes(query) || 
        g.provider.toLowerCase().includes(query) || 
        g.description.toLowerCase().includes(query)
      );
    }
    if (field) {
      const fields = field.split(",");
      filtered = filtered.filter(g => fields.includes(g.field));
    }
    if (type) {
      filtered = filtered.filter(g => g.grantType === type);
    }

    return {
      items: filtered,
      page: 0,
      size: 10,
      totalElements: filtered.length,
      totalPages: 1,
      hasNext: false
    } as unknown as T;
  }

  if (path.startsWith("/api/grants/")) {
    const grantId = path.split("/").pop() || "";
    const found = MOCK_GRANTS.find(g => g.id === grantId) || MOCK_GRANTS[0];
    return found as unknown as T;
  }

  // 4. Tracker routes
  if (path === "/api/tracker") {
    if (method === "GET") {
      return JSON.parse(window.localStorage.getItem("grantai-demo-tracker") || "[]") as T;
    } else if (method === "POST") {
      const body = JSON.parse(options.body as string || "{}");
      const trackerList = JSON.parse(window.localStorage.getItem("grantai-demo-tracker") || "[]");
      
      // Look up grant
      const grant = MOCK_GRANTS.find(g => g.id === body.grantId) || MOCK_GRANTS[0];
      
      const newEntry = {
        id: `demo-tracker-${Date.now()}`,
        grantId: grant.id,
        grantTitle: grant.title,
        grantProvider: grant.provider,
        grantAmount: grant.amount,
        grantCurrency: grant.currency,
        grantDeadline: grant.deadline,
        status: body.status || "Draft",
        appliedDate: body.appliedDate || null,
        notes: body.notes || "",
        coverLetterStatus: "NONE",
        coverLetterId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      trackerList.unshift(newEntry);
      window.localStorage.setItem("grantai-demo-tracker", JSON.stringify(trackerList));
      return newEntry as unknown as T;
    }
  }

  if (path.startsWith("/api/tracker/stats")) {
    const trackerList = JSON.parse(window.localStorage.getItem("grantai-demo-tracker") || "[]");
    
    const applied = trackerList.filter((e: any) => ["Applied", "Under Review", "Won", "Rejected"].includes(e.status));
    const won = trackerList.filter((e: any) => e.status === "Won");
    
    const winRate = applied.length > 0 ? (won.length / applied.length) * 100 : 0;
    const totalWonAmount = won.reduce((sum: number, e: any) => sum + (Number(e.grantAmount) || 0), 0);
    const totalAppliedAmount = applied.reduce((sum: number, e: any) => sum + (Number(e.grantAmount) || 0), 0);

    const deadlines = trackerList
      .filter((e: any) => e.status !== "Won" && e.status !== "Rejected")
      .map((e: any) => {
        const dDate = new Date(e.grantDeadline);
        const diff = Math.ceil((dDate.getTime() - Date.now()) / (1000 * 3600 * 24));
        return {
          trackerId: e.id,
          grantId: e.grantId,
          grantTitle: e.grantTitle,
          provider: e.grantProvider,
          deadline: e.grantDeadline,
          daysLeft: Math.max(0, diff)
        };
      })
      .sort((a: any, b: any) => a.daysLeft - b.daysLeft);

    return {
      totalApplied: applied.length,
      winRate: Math.round(winRate * 10) / 10,
      avgMatchScore: 92.5,
      grantsBookmarked: trackerList.length,
      totalWonAmount,
      totalAppliedAmount,
      upcomingDeadlines: deadlines.slice(0, 5),
      recentActivities: [
        { id: "act-1", description: "Modified pipeline parameters in tracker board.", timeAgo: "10 minutes ago" },
        { id: "act-2", description: "Loaded PhD candidate academic vector configuration.", timeAgo: "1 hour ago" }
      ]
    } as unknown as T;
  }

  if (path.startsWith("/api/tracker/")) {
    const entryId = path.split("/").pop() || "";
    const trackerList = JSON.parse(window.localStorage.getItem("grantai-demo-tracker") || "[]");

    if (method === "PUT") {
      const body = JSON.parse(options.body as string || "{}");
      let updatedItem = null;
      
      const next = trackerList.map((item: any) => {
        if (item.id === entryId) {
          updatedItem = { ...item, ...body, updatedAt: new Date().toISOString() };
          return updatedItem;
        }
        return item;
      });
      window.localStorage.setItem("grantai-demo-tracker", JSON.stringify(next));
      return updatedItem as unknown as T;
    } else if (method === "DELETE") {
      const next = trackerList.filter((item: any) => item.id !== entryId);
      window.localStorage.setItem("grantai-demo-tracker", JSON.stringify(next));
      return { success: true } as unknown as T;
    }
  }

  // 5. Letters routes
  if (path === "/api/letters") {
    return JSON.parse(window.localStorage.getItem("grantai-demo-letters") || "[]") as T;
  }

  if (path.startsWith("/api/letters/")) {
    const letterId = path.split("/").pop() || "";
    const lettersList = JSON.parse(window.localStorage.getItem("grantai-demo-letters") || "[]");

    if (method === "GET") {
      const found = lettersList.find((l: any) => l.id === letterId || l.grantId === letterId);
      if (found) return found as T;
      
      // Seed dynamically if looking for standard cover letter structure
      const grant = MOCK_GRANTS.find(g => g.id === letterId) || MOCK_GRANTS[0];
      const seeded = {
        id: `demo-letter-${Date.now()}`,
        grantId: grant.id,
        grantTitle: grant.title,
        grantProvider: grant.provider,
        grantAmount: grant.amount,
        grantCurrency: grant.currency,
        grantDeadline: grant.deadline,
        grantDescription: grant.description,
        tone: "Professional",
        length: "Standard 500w",
        emphasis: ["research experience"],
        regenerationStyle: "default",
        customPrompt: "",
        content: null,
        status: "DRAFT",
        addToTracker: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return seeded as unknown as T;
    } else if (method === "PUT") {
      const body = JSON.parse(options.body as string || "{}");
      let updatedLetter = null;
      
      const next = lettersList.map((l: any) => {
        if (l.id === letterId) {
          updatedLetter = { ...l, ...body, updatedAt: new Date().toISOString() };
          return updatedLetter;
        }
        return l;
      });
      window.localStorage.setItem("grantai-demo-letters", JSON.stringify(next));
      return updatedLetter as unknown as T;
    }
  }

  // 6. Interview Prep routes
  if (path === "/api/interview/questions") {
    return {
      questions: [
        { question: "How does your bio-computation model handle out-of-distribution mutation sequences?", context: "Address generalizability of neural topologies.", category: "Technical Alignment" },
        { question: "What specific GPU/computing resources are needed for sub-angstrom protein validation?", context: "Explain hardware thresholds & budget scaling.", category: "Budget & Resources" },
        { question: "How will the local research environment at Stanford accelerate your fellowship aims?", context: "Demonstrate university synergies.", category: "Institutional Alignment" },
        { question: "What is your fallback research design if high-performance modeling proves insufficient?", context: "Evaluate contingency and technical risk levels.", category: "Risk Management" }
      ]
    } as unknown as T;
  }

  if (path === "/api/interview/feedback") {
    const score = 8.0 + Math.random() * 2.0;
    return {
      score: Math.round(score * 10) / 10,
      strengths: ["Strong academic framing", "Precise biological definitions used", "Addresses Stanford computing clusters directly"],
      areas_to_improve: ["Mention validation set baseline results", "Outline exact parameters of geometry structures"],
      suggested_improvements: ["Cite PDB coordinate sets in future descriptions", "Clarify fallback heuristics"],
      suggested_answer: "To handle novel sequences, we combine structural evolutionary constraints with self-supervised checkpoints..."
    } as unknown as T;
  }

  if (path === "/api/interview/sessions") {
    if (method === "GET") {
      return JSON.parse(window.localStorage.getItem("grantai-demo-interviews") || "[]") as T;
    } else if (method === "POST") {
      const body = JSON.parse(options.body as string || "{}");
      const sessions = JSON.parse(window.localStorage.getItem("grantai-demo-interviews") || "[]");
      
      const grant = MOCK_GRANTS.find(g => g.id === body.grantId) || MOCK_GRANTS[0];
      const newSession = {
        id: `demo-session-${Date.now()}`,
        grantId: grant.id,
        grantTitle: grant.title,
        grantProvider: grant.provider,
        questionsJson: body.questionsJson,
        answersJson: body.answersJson,
        feedbackJson: body.feedbackJson,
        avgScore: body.avgScore,
        createdAt: new Date().toISOString()
      };
      
      sessions.unshift(newSession);
      window.localStorage.setItem("grantai-demo-interviews", JSON.stringify(sessions));
      return newSession as unknown as T;
    }
  }

  return {} as T;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// Standard parseResponse fetch handler
async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.error || data?.message || "Request failed.";
    throw new Error(message);
  }

  return data as T;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  // If demo mode is active, completely bypass network requests and use client storage database
  if (typeof window !== "undefined" && window.localStorage.getItem("grantai-demo-mode") === "true") {
    // Provide a small artificial latency to make it feel realistic (100-300ms)
    await new Promise((resolve) => setTimeout(resolve, 200));
    return handleDemoRequest<T>(path, options);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  return parseResponse<T>(response);
}

export interface ApiUser {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  profileComplete: boolean;
}

export interface AuthApiResponse {
  user: ApiUser;
  token: string;
  refreshToken: string;
  message: string;
}

export interface ProfileApiResponse {
  userId: string;
  email: string;
  fullName: string | null;
  country: string | null;
  profilePhotoUrl: string | null;
  university: string | null;
  degreeLevel: string | null;
  fieldOfStudy: string | null;
  graduationYear: number | null;
  gpa: string | number | null;
  researchInterests: string[];
  grantTypes: string[];
  preferredCountries: string[];
  minGrantAmount: number | null;
  deadlinePreference: string | null;
  profileComplete: boolean;
}

export interface GrantSummaryApi {
  id: string;
  title: string;
  provider: string;
  grantType: string;
  field: string;
  countryName: string;
  countryCode: string | null;
  amount: number | string | null;
  currency: string | null;
  deadline: string;
  description: string;
  matchScore: number;
  matchReasoning: string;
  sourceUrl: string | null;
}

export interface GrantDetailApi extends GrantSummaryApi {
  eligibility: string | null;
  documentsRequired: string[];
  timeline: string | null;
  applicationUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface GrantSearchResponseApi {
  items: GrantSummaryApi[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

export interface GrantSearchParams {
  q?: string;
  field?: string;
  country?: string;
  type?: string;
  minAmount?: number;
  maxDeadline?: string;
  page?: number;
  size?: number;
}

export interface CoverLetterApi {
  id: string;
  grantId: string;
  grantTitle: string;
  grantProvider: string;
  grantAmount: number | string | null;
  grantCurrency: string | null;
  grantDeadline: string | null;
  grantDescription: string | null;
  tone: string | null;
  length: string | null;
  emphasis: string[];
  regenerationStyle: string | null;
  customPrompt: string | null;
  content: string | null;
  status: string;
  addToTracker: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CoverLetterGeneratePayload {
  grantId: string;
  tone?: string;
  length?: string;
  emphasis?: string[];
  regenerationStyle?: string;
  customPrompt?: string;
}

export async function authRegister(payload: {
  fullName: string;
  email: string;
  password: string;
}) {
  return apiRequest<AuthApiResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function authLogin(payload: { email: string; password: string }) {
  return apiRequest<AuthApiResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function authLogout() {
  return apiRequest<{ message: string }>("/api/auth/logout", {
    method: "POST",
  });
}

export async function authRefresh() {
  return apiRequest<AuthApiResponse>("/api/auth/refresh", {
    method: "POST",
  });
}

export async function getProfile() {
  return apiRequest<ProfileApiResponse>("/api/profile", {
    method: "GET",
  });
}

export async function saveProfile(payload: Record<string, unknown>) {
  return apiRequest<ProfileApiResponse>("/api/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function searchGrants(params: GrantSearchParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set("q", params.q);
  if (params.field) searchParams.set("field", params.field);
  if (params.country) searchParams.set("country", params.country);
  if (params.type) searchParams.set("type", params.type);
  if (typeof params.minAmount === "number" && Number.isFinite(params.minAmount)) {
    searchParams.set("minAmount", String(params.minAmount));
  }
  if (params.maxDeadline) searchParams.set("maxDeadline", params.maxDeadline);
  if (typeof params.page === "number") searchParams.set("page", String(params.page));
  if (typeof params.size === "number") searchParams.set("size", String(params.size));

  const query = searchParams.toString();
  return apiRequest<GrantSearchResponseApi>(`/api/grants/search${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

export async function getGrantById(id: string) {
  return apiRequest<GrantDetailApi>(`/api/grants/${id}`, {
    method: "GET",
  });
}

export async function getLetterById(id: string) {
  return apiRequest<CoverLetterApi>(`/api/letters/${id}`, {
    method: "GET",
  });
}

export async function listLetters() {
  return apiRequest<CoverLetterApi[]>("/api/letters", {
    method: "GET",
  });
}

export async function updateLetter(id: string, payload: { content?: string; addToTracker?: boolean }) {
  return apiRequest<CoverLetterApi>(`/api/letters/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export interface TrackerEntryApi {
  id: string;
  grantId: string;
  grantTitle: string;
  grantProvider: string;
  grantAmount: number | string | null;
  grantCurrency: string | null;
  grantDeadline: string;
  status: string; // "Draft", "Applied", "Under Review", "Won", "Rejected"
  appliedDate: string | null;
  notes: string;
  coverLetterStatus: string;
  coverLetterId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TrackerCreatePayload {
  grantId: string;
  status?: string;
  notes?: string;
  appliedDate?: string;
}

export interface TrackerUpdatePayload {
  status?: string;
  notes?: string;
  appliedDate?: string;
}

export interface DashboardStatsApi {
  totalApplied: number;
  winRate: number;
  avgMatchScore: number;
  grantsBookmarked: number;
  totalWonAmount: number | string | null;
  totalAppliedAmount: number | string | null;
  upcomingDeadlines: {
    trackerId: string;
    grantId: string;
    grantTitle: string;
    provider: string;
    deadline: string;
    daysLeft: number;
  }[];
  recentActivities: {
    id: string;
    description: string;
    timeAgo: string;
  }[];
}

export async function listTracker() {
  return apiRequest<TrackerEntryApi[]>("/api/tracker", {
    method: "GET",
  });
}

export async function createTracker(payload: TrackerCreatePayload) {
  return apiRequest<TrackerEntryApi>("/api/tracker", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTracker(id: string, payload: TrackerUpdatePayload) {
  return apiRequest<TrackerEntryApi>(`/api/tracker/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteTracker(id: string) {
  return apiRequest<void>(`/api/tracker/${id}`, {
    method: "DELETE",
  });
}

export async function getDashboardStats() {
  return apiRequest<DashboardStatsApi>("/api/tracker/stats", {
    method: "GET",
  });
}

export interface InterviewQuestionApi {
  question: string;
  context: string;
  category: string;
}

export interface InterviewQuestionsResponseApi {
  questions: InterviewQuestionApi[];
}

export interface InterviewFeedbackResponseApi {
  score: number;
  strengths: string[];
  areas_to_improve: string[];
  suggested_improvements: string[];
  suggested_answer: string;
}

export interface InterviewSessionResponseApi {
  id: string;
  grantId: string;
  grantTitle: string;
  grantProvider: string;
  questionsJson: string;
  answersJson: string;
  feedbackJson: string;
  avgScore: number;
  createdAt: string;
}

export async function getInterviewQuestions(grant: unknown) {
  return apiRequest<InterviewQuestionsResponseApi>("/api/interview/questions", {
    method: "POST",
    body: JSON.stringify({ grant }),
  });
}

export async function getInterviewFeedback(question: string, answer: string, grant: unknown) {
  return apiRequest<InterviewFeedbackResponseApi>("/api/interview/feedback", {
    method: "POST",
    body: JSON.stringify({ question, answer, grant }),
  });
}

export async function listInterviewSessions() {
  return apiRequest<InterviewSessionResponseApi[]>("/api/interview/sessions", {
    method: "GET",
  });
}

export async function saveInterviewSession(payload: {
  grantId: string;
  questionsJson: string;
  answersJson: string;
  feedbackJson: string;
  avgScore: number;
}) {
  return apiRequest<InterviewSessionResponseApi>("/api/interview/sessions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}