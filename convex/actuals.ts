import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** Fetch the actuals combined with the user's base Planned Spend for a given month */
export const getActiveMetrics = query({
  args: {
    month: v.string(), // "jan", "feb", etc.
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const myContractor = await ctx.db
      .query("contractors")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (!myContractor) return [];

    // Fetch ONLY this contractor's budget allocations
    const myBudgets = await ctx.db
      .query("budget_allocations")
      .filter((q) => q.eq(q.field("contractorId"), myContractor._id))
      .collect();

    if (myBudgets.length === 0) return [];

    // Collect the unique channel IDs and category IDs from this contractor's allocations
    const channelIds = Array.from(new Set(myBudgets.map((b) => b.channelId)));
    const categoryIds = Array.from(new Set(myBudgets.map((b) => b.categoryId)));

    // Fetch only the channels and categories referenced by this contractor
    const channels = await Promise.all(channelIds.map((id) => ctx.db.get(id)));
    const categories = await Promise.all(categoryIds.map((id) => ctx.db.get(id)));

    const validChannels = channels.filter(Boolean) as NonNullable<typeof channels[0]>[];
    const validCategories = (categories.filter(Boolean) as NonNullable<typeof categories[0]>[])
      .sort((a, b) => a.orderIndex - b.orderIndex);

    // Fetch performance metrics for this contractor/month/year
    const allPerformanceMetrics = await ctx.db
      .query("performance_metrics")
      .filter((q) =>
        q.and(
          q.eq(q.field("contractorId"), myContractor._id),
          q.eq(q.field("year"), args.year),
          q.eq(q.field("month"), args.month)
        )
      )
      .collect();

    // Build result grouped by category
    const rawResult = validCategories.map((cat) => {
      const myCategoryChannels = validChannels
        .filter((c) => c.categoryId === cat._id)
        .sort((a, b) => a.orderIndex - b.orderIndex);

      const hydratedChannels = myCategoryChannels.map((ch) => {
        const mappedBudget = myBudgets.find((b) => b.channelId === ch._id);
        const plannedSpend = mappedBudget
          ? (mappedBudget as any)[args.month] ?? 0
          : 0;
        const tracking = allPerformanceMetrics.find(
          (m) => m.channelId === ch._id
        );
        return {
          id: ch._id,
          name: ch.name,
          plannedSpend,
          actualSpend: tracking ? tracking.actualSpend : 0,
          leads: tracking ? tracking.actualLeads : 0,
          revenue: tracking ? tracking.actualRevenue : 0,
        };
      });

      return { id: cat._id, name: cat.name, channels: hydratedChannels };
    });

    return rawResult.filter((res) => res.channels.length > 0);
  },
});

/** Update or insert a performance metric for a specific channel/month */
export const updateMetric = mutation({
  args: {
    channelId: v.id("channels"),
    month: v.string(),
    year: v.number(),
    field: v.union(
      v.literal("actualSpend"),
      v.literal("actualLeads"),
      v.literal("actualRevenue")
    ),
    value: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const myContractor = await ctx.db
      .query("contractors")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (!myContractor) throw new Error("No active contractor profile");

    const existingMetric = await ctx.db
      .query("performance_metrics")
      .withIndex("by_month_channel", (q) =>
        q
          .eq("contractorId", myContractor._id)
          .eq("year", args.year)
          .eq("month", args.month)
          .eq("channelId", args.channelId)
      )
      .first();

    if (existingMetric) {
      await ctx.db.patch(existingMetric._id, { [args.field]: args.value });
    } else {
      await ctx.db.insert("performance_metrics", {
        contractorId: myContractor._id,
        channelId: args.channelId,
        month: args.month,
        year: args.year,
        actualSpend: args.field === "actualSpend" ? args.value : 0,
        actualLeads: args.field === "actualLeads" ? args.value : 0,
        actualRevenue: args.field === "actualRevenue" ? args.value : 0,
      });
    }
  },
});
