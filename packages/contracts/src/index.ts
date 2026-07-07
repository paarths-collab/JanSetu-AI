import { z } from "zod";

export const LanguageSchema = z.enum([
  "en",
  "hi",
  "mr",
  "gu",
  "ta",
  "kn",
  "te",
  "bn",
  "pa",
  "ur"
]);

export const ServiceIdSchema = z.enum([
  "schemes",
  "documents",
  "complaints",
  "tracking",
  "ask"
]);

export const IncomeRangeSchema = z.enum([
  "below_1_lakh",
  "1_to_3_lakh",
  "3_to_6_lakh",
  "above_6_lakh",
  "unknown"
]);

export const ProfileSchema = z.object({
  id: z.string().min(1),
  full_name: z.string().min(1).max(120),
  email: z.string().email(),
  preferred_language: LanguageSchema.default("en"),
  state: z.string().min(1).max(80),
  district: z.string().min(1).max(80),
  age: z.number().int().min(0).max(125),
  occupation: z.string().min(1).max(80),
  income_range: IncomeRangeSchema.default("unknown"),
  family_details: z.record(z.unknown()).default({}),
  created_at: z.string().datetime()
});

export const UpsertProfileInputSchema = ProfileSchema.omit({
  created_at: true
}).extend({
  family_details: z.record(z.unknown()).optional()
});

export const ComplaintStatusSchema = z.enum([
  "submitted",
  "under_review",
  "assigned",
  "in_progress",
  "resolved",
  "rejected"
]);

export const ComplaintSeveritySchema = z.enum(["low", "medium", "high"]);

export const IssueTypeSchema = z.enum([
  "garbage",
  "pothole",
  "streetlight",
  "water_supply",
  "drainage",
  "noise",
  "other"
]);

export const LocationSchema = z.object({
  address: z.string().min(1).max(240),
  ward: z.string().min(1).max(80).optional(),
  city: z.string().min(1).max(80).optional(),
  state: z.string().min(1).max(80).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional()
});

export const CreateComplaintInputSchema = z.object({
  imageUrl: z.string().url().optional(),
  text: z.string().min(10).max(4000),
  location: LocationSchema
});

export const ComplaintSchema = z.object({
  id: z.string().regex(/^SB-\d{4}-\d{4}$/),
  user_id: z.string().min(1),
  issue_type: IssueTypeSchema,
  description: z.string().min(1),
  image_url: z.string().url().optional(),
  location: LocationSchema,
  department: z.string().min(1),
  severity: ComplaintSeveritySchema,
  status: ComplaintStatusSchema,
  created_at: z.string().datetime(),
  resolved_at: z.string().datetime().optional()
});

export const ComplaintUpdateSchema = z.object({
  id: z.string().min(1),
  complaint_id: z.string().regex(/^SB-\d{4}-\d{4}$/),
  status: ComplaintStatusSchema,
  note: z.string().min(1).max(1000),
  created_at: z.string().datetime()
});

export const TrackComplaintResponseSchema = z.object({
  complaint: ComplaintSchema,
  updates: z.array(ComplaintUpdateSchema).min(1)
});

export const DashboardBucketSchema = z.object({
  key: z.string(),
  count: z.number().int().nonnegative()
});

export const DepartmentBucketSchema = DashboardBucketSchema.extend({
  department: z.string()
});

export const DashboardResponseSchema = z.object({
  totals: z.object({
    complaints: z.number().int().nonnegative(),
    resolved: z.number().int().nonnegative(),
    open: z.number().int().nonnegative()
  }),
  byDepartment: z.array(DepartmentBucketSchema),
  byStatus: z.array(DashboardBucketSchema),
  byWard: z.array(DashboardBucketSchema),
  avgResolutionDays: z.number().nonnegative()
});

export type Language = z.infer<typeof LanguageSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type UpsertProfileInput = z.infer<typeof UpsertProfileInputSchema>;
export type CreateComplaintInput = z.infer<typeof CreateComplaintInputSchema>;
export type Complaint = z.infer<typeof ComplaintSchema>;
export type ComplaintUpdate = z.infer<typeof ComplaintUpdateSchema>;
export type ComplaintStatus = z.infer<typeof ComplaintStatusSchema>;
export type ComplaintSeverity = z.infer<typeof ComplaintSeveritySchema>;
export type IssueType = z.infer<typeof IssueTypeSchema>;
export type DashboardResponse = z.infer<typeof DashboardResponseSchema>;
