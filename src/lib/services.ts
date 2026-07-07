import {
  Landmark,
  FileText,
  AlertTriangle,
  ListChecks,
  MessagesSquare,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export type ServiceId =
  | "schemes"
  | "documents"
  | "complaints"
  | "tracking"
  | "ask"
  | "dashboard";

export type ServiceDef = {
  id: ServiceId;
  href: string;
  icon: LucideIcon;
  accent: "saffron" | "green" | "navy";
  titleKey: string;
  descKey: string;
  defaultTitle: string;
  defaultDesc: string;
};

export const SERVICES: ServiceDef[] = [
  {
    id: "schemes",
    href: "/schemes",
    icon: Landmark,
    accent: "saffron",
    titleKey: "svc.schemes.title",
    descKey: "svc.schemes.desc",
    defaultTitle: "Find a Scheme",
    defaultDesc:
      "Discover government schemes you are eligible for, with documents and next steps.",
  },
  {
    id: "documents",
    href: "/chat?service=documents",
    icon: FileText,
    accent: "green",
    titleKey: "svc.documents.title",
    descKey: "svc.documents.desc",
    defaultTitle: "Document Requirements",
    defaultDesc:
      "Know exactly which documents you need — or upload a notice and we'll decode it.",
  },
  {
    id: "complaints",
    href: "/report",
    icon: AlertTriangle,
    accent: "navy",
    titleKey: "svc.complaints.title",
    descKey: "svc.complaints.desc",
    defaultTitle: "Report a Public Issue",
    defaultDesc:
      "Garbage, potholes, streetlights — photograph it and we file the complaint.",
  },
  {
    id: "tracking",
    href: "/track",
    icon: ListChecks,
    accent: "saffron",
    titleKey: "svc.tracking.title",
    descKey: "svc.tracking.desc",
    defaultTitle: "Track a Complaint",
    defaultDesc: "Follow your complaint status with a clear timeline and next action.",
  },
  {
    id: "ask",
    href: "/chat?service=ask",
    icon: MessagesSquare,
    accent: "green",
    titleKey: "svc.ask.title",
    descKey: "svc.ask.desc",
    defaultTitle: "Ask Anything",
    defaultDesc: "Any civic or government question, answered simply in your language.",
  },
  {
    id: "dashboard",
    href: "/dashboard",
    icon: BarChart3,
    accent: "navy",
    titleKey: "svc.dashboard.title",
    descKey: "svc.dashboard.desc",
    defaultTitle: "Transparency Dashboard",
    defaultDesc: "See civic complaints and resolution stats for your area.",
  },
];

/** Human-readable scope description injected into the chat system prompt. */
export const SERVICE_SCOPE: Record<string, string> = {
  schemes:
    "The citizen wants to find government schemes / welfare programs they are eligible for. Gather state, age, occupation, income if missing, then recommend specific schemes with eligibility reasons, required documents, and next steps.",
  documents:
    "The citizen wants to know which documents are required for a government service, OR has uploaded a government notice/PDF to decode. Explain in plain language, list required documents with why each is needed, and extract any deadlines.",
  complaints:
    "The citizen wants to report a public civic issue (garbage, pothole, streetlight, water, drainage, noise). Help them describe it clearly and guide them to file it.",
  tracking:
    "The citizen wants to check the status of an existing complaint. Ask for the complaint ID if not provided.",
  ask: "The citizen has a general civic or government question. Answer simply and accurately in their language.",
};
