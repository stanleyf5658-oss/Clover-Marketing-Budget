import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/** Read the fully populated budget object hierarchy */
export const getBudget = query({
  args: {},
  handler: async (ctx) => {
    // 1. Fetch the CURRENT contractor (latest one since there is no auth yet)
    const latestContractors = await ctx.db.query("contractors").order("desc").take(1);
    if (latestContractors.length === 0) return []; // No profile exists
    const myContractor = latestContractors[0];

    // 2. Fetch all root categories and deduplicate them by name (in case seed script ran multiple times)
    const rawCategories = await ctx.db.query("categories").collect();
    const categoriesMap = new Map();
    rawCategories.forEach(cat => {
      if (!categoriesMap.has(cat.name)) {
         categoriesMap.set(cat.name, cat);
      }
    });
    const categories = Array.from(categoriesMap.values());
    
    // Sort logic
    const sortedCategories = categories.sort((a, b) => a.orderIndex - b.orderIndex);

    // 3. Fetch all channels
    const allChannels = await ctx.db.query("channels").collect();
    
    // 4. Fetch budget allocations JUST for the active contractor
    const allAllocations = await ctx.db.query("budget_allocations")
       .filter(q => q.eq(q.field("contractorId"), myContractor._id))
       .collect();

    // 5. Build Planner UI structure
    const rawResult = sortedCategories.map(cat => {
      // Find channels belonging to this category
      const myCategoryChannels = allChannels.filter(c => c.categoryId === cat._id).sort((a,b) => a.orderIndex - b.orderIndex);
      
      const hydratedChannels = myCategoryChannels
        // EXPLICIT FILTER: Only include channels that the user selected in onboarding
        .filter(ch => myContractor.channels.includes(ch.name))
        .map(ch => {
          // Find allocation for this exact channel (ignoring subchannels for now)
          const rawAlloc = allAllocations.find(a => a.channelId === ch._id && !a.subchannelId);
          const alloc = rawAlloc || {
            jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
            jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0, year: 0
          };

          // In the future you'd map subchannels here.
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
            restOfYear: alloc.year - (alloc.jan + alloc.feb + alloc.mar), // Helper for UI
            isExpanded: false,
            subRows: [] as any[]
          };
      });

      return {
        id: cat._id,
        name: cat.name,
        channels: hydratedChannels
      };
    });

    // 6. Filter out any categories that have absolutely 0 channels after our filter
    return rawResult.filter(res => res.channels.length > 0);
  }
});

/** Generic update mutation placeholder */
export const updateBudgetValue = mutation({
  args: {
    channelId: v.string(),
    subId: v.optional(v.string()),
    month: v.string(),
    value: v.number()
  },
  handler: async (ctx, args) => {
    console.log(`Updating ${args.channelId} ${args.subId || ""} ${args.month} to ${args.value}`);
    // Once schema is populated, we would run: 
    // ctx.db.patch(recordId, { [args.month]: args.value });
  }
});

/** Read the current contractor context */
export const getContractor = query({
  args: {},
  handler: async (ctx) => {
    const latestContractors = await ctx.db.query("contractors").order("desc").take(1);
    if (latestContractors.length === 0) return null;
    return latestContractors[0];
  }
});

/** Save UI profile fields back to the contractor */
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
    avatarUrl: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const latestContractors = await ctx.db.query("contractors").order("desc").take(1);
    if (latestContractors.length === 0) throw new Error("No active contractor found to update");
    
    await ctx.db.patch(latestContractors[0]._id, {
      firstName: args.firstName,
      companyName: args.companyName,
      revenueGoal: args.revenueGoal,
      email: args.email,
      phone: args.phone,
      industry: args.industry,
      address: args.address,
      lastName: args.lastName,
      website: args.website,
      avatarUrl: args.avatarUrl
    });
  }
});
