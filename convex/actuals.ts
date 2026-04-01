import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/** Fetch the actuals combined with the user's base Planned Spend for a given month */
export const getActiveMetrics = query({
  args: {
    month: v.string(), // "jan", "feb", etc.
    year: v.number()
  },
  handler: async (ctx, args) => {
    // 1. Fetch CURRENT contractor (mocking auth state)
    const latestContractors = await ctx.db.query("contractors").order("desc").take(1);
    if (latestContractors.length === 0) return [];
    const myContractor = latestContractors[0];

    // 2. Fetch categories and deduplicate safely
    const rawCategories = await ctx.db.query("categories").collect();
    const categoriesMap = new Map();
    rawCategories.forEach(cat => {
      if (!categoriesMap.has(cat.name)) categoriesMap.set(cat.name, cat);
    });
    const categories = Array.from(categoriesMap.values()).sort((a, b) => a.orderIndex - b.orderIndex);
    
    // 3. Fetch channels & mapped budget allocations for the year
    const allChannels = await ctx.db.query("channels").collect();
    const allBudgets = await ctx.db.query("budget_allocations")
       .filter(q => q.eq(q.field("contractorId"), myContractor._id))
       .collect();

    // 4. Fetch the real performance metrics for the requested month
    const allPerformanceMetrics = await ctx.db.query("performance_metrics")
       .filter(q => 
          q.and(
            q.eq(q.field("contractorId"), myContractor._id),
            q.eq(q.field("year"), args.year),
            q.eq(q.field("month"), args.month)
          )
       )
       .collect();

    // 5. Hydrate the Category -> Channel tree
    const rawResult = categories.map(cat => {
      const myCategoryChannels = allChannels.filter(c => c.categoryId === cat._id).sort((a,b) => a.orderIndex - b.orderIndex);
      
      const hydratedChannels = myCategoryChannels
        // Only include channels the user turned on in onboarding
        .filter(ch => myContractor.channels.includes(ch.name))
        .map(ch => {
          // Look up Planned Spend from budget allocations
          const mappedBudget = allBudgets.find(b => b.channelId === ch._id);
          // Safely pull the requested month from the budget object
          const plannedSpend = mappedBudget ? (mappedBudget as any)[args.month] || 0 : 0;

          // Look up tracked Actuals for this specific month
          const tracking = allPerformanceMetrics.find(m => m.channelId === ch._id);

          return {
            id: ch._id,
            name: ch.name,
            plannedSpend,
            actualSpend: tracking ? tracking.actualSpend : 0,
            leads: tracking ? tracking.actualLeads : 0,
            revenue: tracking ? tracking.actualRevenue : 0
          };
      });

      return {
        id: cat._id,
        name: cat.name,
        channels: hydratedChannels
      };
    });

    // Remove empty categories
    return rawResult.filter(res => res.channels.length > 0);
  }
});


/** Update or insert a performance metric for a specific channel/month */
export const updateMetric = mutation({
  args: {
    channelId: v.id("channels"),
    month: v.string(),
    year: v.number(),
    field: v.union(v.literal("actualSpend"), v.literal("actualLeads"), v.literal("actualRevenue")),
    value: v.number()
  },
  handler: async (ctx, args) => {
    // 1. Fetch CURRENT contractor (mocking auth state)
    const latestContractors = await ctx.db.query("contractors").order("desc").take(1);
    if (latestContractors.length === 0) throw new Error("No active contractor profile");
    const myContractor = latestContractors[0];

    // 2. Check if a document already exists for this Month + Channel
    const existingMetric = await ctx.db.query("performance_metrics")
       .withIndex("by_month_channel", q => 
          q.eq("contractorId", myContractor._id)
           .eq("year", args.year)
           .eq("month", args.month)
           .eq("channelId", args.channelId)
       ).first();

    if (existingMetric) {
       // Update existing row
       await ctx.db.patch(existingMetric._id, {
          [args.field]: args.value
       });
    } else {
       // Insert fresh tracking document for this month
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
  }
});
