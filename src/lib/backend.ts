import { ComplaintService } from "../../services/complaint-service/src/complaintService";
import { ProfileService } from "../../services/profile-service/src/profileService";
import { DashboardService } from "../../services/dashboard-service/src/dashboardService";

// Single demo citizen for the MVP (no real auth yet — designed to swap for
// Supabase/Google auth later).
export const DEMO_USER = "demo-user";

type Store = {
  complaint: ComplaintService;
  profile: ProfileService;
  dashboard: DashboardService;
};

// Persist across dev hot-reloads so seeded + live-created complaints survive.
const g = globalThis as typeof globalThis & { __jansetu?: Store };

function seed(complaint: ComplaintService, profile: ProfileService) {
  profile.upsert({
    id: DEMO_USER,
    full_name: "Demo Citizen",
    email: "demo@jansetu.ai",
    preferred_language: "en",
    state: "Maharashtra",
    district: "Pune",
    age: 34,
    occupation: "teacher",
    income_range: "1_to_3_lakh",
  });

  const seeds: { text: string; ward: string }[] = [
    { text: "Garbage dump overflowing near the main road in Kothrud, not collected for a week.", ward: "Kothrud" },
    { text: "Large pothole on FC Road causing accidents to two-wheelers.", ward: "Shivajinagar" },
    { text: "Streetlight not working in our lane in Aundh, unsafe for women at night.", ward: "Aundh" },
    { text: "Water pipeline leaking and contaminated water supply in Hadapsar.", ward: "Hadapsar" },
    { text: "Drain overflowing with sewage during rain, flooding the street in Kothrud.", ward: "Kothrud" },
    { text: "Loud construction noise late at night near the hospital in Shivajinagar.", ward: "Shivajinagar" },
  ];

  const created = seeds.map((s) =>
    complaint.createForUser(DEMO_USER, {
      text: s.text,
      location: {
        address: `${s.ward}, Pune, Maharashtra`,
        ward: s.ward,
        city: "Pune",
        state: "Maharashtra",
      },
    })
  );

  // Vary statuses so the dashboard + tracking timeline look realistic.
  complaint.transition(created[0].id, "in_progress", "Assigned to sanitation team; pickup scheduled.");
  complaint.transition(created[2].id, "assigned", "Forwarded to the electrical department.");
  complaint.transition(created[2].id, "resolved", "Streetlight repaired and verified by ward officer.");
  complaint.transition(created[3].id, "under_review", "Water sample sent for quality testing.");
}

function init(): Store {
  if (g.__jansetu) return g.__jansetu;
  const complaint = new ComplaintService();
  const profile = new ProfileService();
  const dashboard = new DashboardService();
  seed(complaint, profile);
  g.__jansetu = { complaint, profile, dashboard };
  return g.__jansetu;
}

const store = init();
export const complaintService = store.complaint;
export const profileService = store.profile;
export const dashboardService = store.dashboard;
