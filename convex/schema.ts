import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users or contractors who own the dashboard
  contractors: defineTable({
    firstName: v.string(),
    companyName: v.string(),
    revenueGoal: v.number(),
    revenueMonths: v.optional(v.array(v.number())),
    splitType: v.string(),
    marketingPercentage: v.number(),
    customPercentage: v.optional(v.number()),
    channels: v.array(v.string()),
    avatarUrl: v.optional(v.string())
  }),

  // Categories like "Direct Response" or "Branding"
  categories: defineTable({
    name: v.string(),
    orderIndex: v.number()
  }),

  // Channels under specific Categories (e.g. "Digital Media")
  channels: defineTable({
    categoryId: v.id("categories"),
    name: v.string(),
    orderIndex: v.number(),
    // Base estimated annual if no monthly breakdowns exist
    baseAnnualTotal: v.optional(v.number())
  }),

  // Subchannels under specific Channels (e.g. "PPC" or "LSA" under Digital Media)
  subchannels: defineTable({
    channelId: v.id("channels"),
    name: v.string(),
    orderIndex: v.number()
  }),

  // The actual allocated budget rows per month
  // If subchannelId is null, it's a top-level channel spend
  budget_allocations: defineTable({
    contractorId: v.id("contractors"),
    categoryId: v.id("categories"),
    channelId: v.id("channels"),
    subchannelId: v.optional(v.id("subchannels")),
    jan: v.number(),
    feb: v.number(),
    mar: v.number(),
    apr: v.number(),
    may: v.number(),
    jun: v.number(),
    jul: v.number(),
    aug: v.number(),
    sep: v.number(),
    oct: v.number(),
    nov: v.number(),
    dec: v.number(),
    year: v.number()
  }),

  // The actuals tracked per month/channel for performance ROI
  performance_metrics: defineTable({
    contractorId: v.id("contractors"),
    channelId: v.id("channels"),
    subchannelId: v.optional(v.id("subchannels")),
    month: v.string(),
    year: v.number(),
    actualSpend: v.number(),
    actualLeads: v.number(),
    actualRevenue: v.number()
  }).index("by_month_channel", ["contractorId", "year", "month", "channelId", "subchannelId"])
});
