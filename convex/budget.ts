import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** Read the full budget structure for the authenticated user */
export const getBudget = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const myContractor = await ctx.db
      .query("contractors")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (!myContractor) return [];

    const allAllocations = await ctx.db
      .query("budget_allocations")
      .filter((q) => q.eq(q.field("contractorId"), myContractor._id))
      .collect();

    const categoryIds = Array.from(new Set(allAllocations.map((a) => a.categoryId)));
    const channelIds = Array.from(new Set(allAllocations.map((a) => a.channelId)));

    const categoriesRaw = await Promise.all(categoryIds.map((id) => ctx.db.get(id)));
    const allChannelsRaw = await Promise.all(channelIds.map((id) => ctx.db.get(id)));

    const categories = categoriesRaw.filter((c): c is NonNullable<typeof c> => c !== null);
    const allChannels = allChannelsRaw.filter((c): c is NonNullable<typeof c> => c !== null);

    const sortedCategories = categories.sort((a, b) => a.orderIndex - b.orderIndex);

    const rawResult = sortedCategories.map((cat) => {
      const myCategoryChannels = allChannels
        .filter((c) => c.categoryId === cat._id)
        .sort((a, b) => a.orderIndex - b.orderIndex);

      const hydratedChannels = myCategoryChannels
        .filter((ch) => myContractor.channels.includes(ch.name))
        .map((ch) => {
          const rawAlloc = allAllocations.find(
            (a) => a.channelId === ch._id && !a.subchannelId
          );
          const alloc = rawAlloc || {
            jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
            jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0, year: 0,
          };
          return {
            id: ch._id,
            name: ch.name,
            jan: alloc.jan,
            feb: alloc.feb,
            mar: alloc.mar,
            apr: alloc.apr,
            may: alloc.may,
            jun: alloc.jun,
            jul: alloc.jul,
            aug: alloc.aug,
            sep: alloc.sep,
            oct: alloc.oct,
            nov: alloc.nov,
            dec: alloc.dec,
            restOfYear: alloc.year - (alloc.jan + alloc.feb + alloc.mar),
            isExpanded: false,
            subRows: [] as any[],
          };
        });

      return { id: cat._id, name: cat.name, channels: hydratedChannels };
    });

    return rawResult.filter((res) => res.channels.length > 0);
  },
});

/** Update a specific month's budget value for a channel */
export const updateBudgetValue = mutation({
  args: {
    channelId: v.id("channels"),
    subId: v.optional(v.id("subchannels")),
    month: v.string(),
    value: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const myContractor = await ctx.db
      .query("contractors")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (!myContractor) throw new Error("No contractor profile found");

    const allocation = await ctx.db
      .query("budget_allocations")
      .filter((q) =>
        q.and(
          q.eq(q.field("contractorId"), myContractor._id),
          q.eq(q.field("channelId"), args.channelId)
        )
      )
      .first();

    if (!allocation) {
      console.warn(`No allocation found for channel ${args.channelId}, month ${args.month}`);
      return;
    }

    const validMonths = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
    if (!validMonths.includes(args.month)) {
      throw new Error(`Invalid month: ${args.month}`);
    }

    await ctx.db.patch(allocation._id, { [args.month]: args.value });
  },
});

/** Read the current contractor context for the authenticated user */
export const getContractor = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("contractors")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();
  },
});

/** Save UI profile fields back to the authenticated contractor */
export const updateContractor = mutation({
  args: {
    firstName: v.string(),
    companyName: v.string(),
    revenueGoal: v.number(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    industry: v.optional(v.string()),
    address: v.optional(v.string()),
    lastName: v.optional(v.string()),
    website: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const myContractor = await ctx.db
      .query("contractors")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (!myContractor) throw new Error("No active contractor found to update");

    await ctx.db.patch(myContractor._id, {
      firstName: args.firstName,
      companyName: args.companyName,
      revenueGoal: args.revenueGoal,
      email: args.email,
      phone: args.phone,
      industry: args.industry,
      address: args.address,
      lastName: args.lastName,
      website: args.website,
      avatarUrl: args.avatarUrl,
    });
  },
});
