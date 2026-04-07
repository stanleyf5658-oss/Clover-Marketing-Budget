import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Admin-only: returns all contractors with their budget totals and actuals.
 * The frontend must verify the caller is a Clerk org admin before calling this.
 */
export const getAllClients = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Fetch all contractors
    const contractors = await ctx.db.query("contractors").collect();

    // For each contractor, compute total planned budget and total actuals
    const results = await Promise.all(
      contractors.map(async (contractor) => {
        // All budget allocations for this contractor
        const budgets = await ctx.db
          .query("budget_allocations")
          .filter((q) => q.eq(q.field("contractorId"), contractor._id))
          .collect();

        // Sum all monthly budget values across all channels
        const months = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"] as const;
        let totalPlannedBudget = 0;
        for (const budget of budgets) {
          for (const month of months) {
            totalPlannedBudget += (budget as any)[month] ?? 0;
          }
        }

        // All performance metrics for this contractor
        const metrics = await ctx.db
          .query("performance_metrics")
          .filter((q) => q.eq(q.field("contractorId"), contractor._id))
          .collect();

        const totalActualSpend = metrics.reduce((sum, m) => sum + (m.actualSpend ?? 0), 0);
        const totalActualRevenue = metrics.reduce((sum, m) => sum + (m.actualRevenue ?? 0), 0);
        const totalActualLeads = metrics.reduce((sum, m) => sum + (m.actualLeads ?? 0), 0);

        return {
          id: contractor._id,
          userId: contractor.userId ?? null,
          firstName: contractor.firstName,
          lastName: contractor.lastName ?? null,
          companyName: contractor.companyName,
          email: contractor.email ?? null,
          industry: contractor.industry ?? null,
          revenueGoal: contractor.revenueGoal,
          marketingPercentage: contractor.marketingPercentage,
          totalPlannedBudget,
          totalActualSpend,
          totalActualRevenue,
          totalActualLeads,
          channelCount: budgets.length,
        };
      })
    );

    return results;
  },
});

/**
 * Admin-only: returns full budget breakdown for a specific contractor.
 */
export const getClientBudgetDetail = query({
  args: { contractorId: v.id("contractors") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const contractor = await ctx.db.get(args.contractorId);
    if (!contractor) throw new Error("Contractor not found");

    const budgets = await ctx.db
      .query("budget_allocations")
      .filter((q) => q.eq(q.field("contractorId"), args.contractorId))
      .collect();

    const metrics = await ctx.db
      .query("performance_metrics")
      .filter((q) => q.eq(q.field("contractorId"), args.contractorId))
      .collect();

    // Hydrate channel names
    const channelIds = [...new Set(budgets.map((b) => b.channelId))];
    const channels = await Promise.all(channelIds.map((id) => ctx.db.get(id)));
    const channelMap = Object.fromEntries(
      channels.filter(Boolean).map((ch) => [ch!._id, ch!.name])
    );

    const categoryIds = [...new Set(budgets.map((b) => b.categoryId))];
    const categories = await Promise.all(categoryIds.map((id) => ctx.db.get(id)));
    const categoryMap = Object.fromEntries(
      categories.filter(Boolean).map((cat) => [cat!._id, cat!.name])
    );

    const months = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"] as const;

    const budgetRows = budgets.map((b) => {
      const monthlyData = Object.fromEntries(months.map((m) => [m, (b as any)[m] ?? 0]));
      const channelMetrics = metrics.filter((m) => m.channelId === b.channelId);
      const totalActualSpend = channelMetrics.reduce((s, m) => s + (m.actualSpend ?? 0), 0);
      return {
        channelId: b.channelId,
        channelName: channelMap[b.channelId] ?? "Unknown",
        categoryName: categoryMap[b.categoryId] ?? "Unknown",
        monthlyData,
        totalPlanned: months.reduce((s, m) => s + ((b as any)[m] ?? 0), 0),
        totalActualSpend,
      };
    });

    return {
      contractor: {
        id: contractor._id,
        firstName: contractor.firstName,
        lastName: contractor.lastName ?? null,
        companyName: contractor.companyName,
        email: contractor.email ?? null,
        revenueGoal: contractor.revenueGoal,
        marketingPercentage: contractor.marketingPercentage,
      },
      budgetRows,
    };
  },
});
