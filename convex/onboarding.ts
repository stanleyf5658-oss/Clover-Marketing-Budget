import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const submitProfile = mutation({
  args: {
    firstName: v.string(),
    companyName: v.string(),
    revenueGoal: v.number(),
    revenueMonths: v.optional(v.array(v.number())),
    splitType: v.string(),
    marketingPercentage: v.number(),
    customPercentage: v.optional(v.number()),
    channels: v.array(v.string()),
    allocations: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // 1. Create the Contractor Profile
    const contractorId = await ctx.db.insert("contractors", {
      firstName: args.firstName,
      companyName: args.companyName,
      revenueGoal: args.revenueGoal,
      revenueMonths: args.revenueMonths,
      splitType: args.splitType,
      marketingPercentage: args.marketingPercentage,
      customPercentage: args.customPercentage,
      channels: args.channels
    });

    // 2. Set up their Default Categories
    const drCategoryId = await ctx.db.insert("categories", {
      name: "Direct Response Channels",
      orderIndex: 0
    });
    
    const brandCategoryId = await ctx.db.insert("categories", {
      name: "Branding Channels",
      orderIndex: 1
    });

    const parsedAllocations = args.allocations ? JSON.parse(args.allocations) : {};
    
    const drChannels = ["SEO / Organic Search", "Google Ads (PPC)", "Local Services Ads (LSA)", "Email Marketing"];

    // 3. Create Channels and Allocations based on Explicit User Inputs
    let orderCounter = 0;
    for (const channelName of args.channels) {
      const isDr = drChannels.includes(channelName);
      const catId = isDr ? drCategoryId : brandCategoryId;
      
      const allocData = parsedAllocations[channelName];
      let amount = 0;
      let months = Array(12).fill(0);
      
      if (allocData) {
        if (allocData.isFlat) {
          amount = allocData.flatAmount * 12;
          months = Array(12).fill(allocData.flatAmount);
        } else {
          months = allocData.customMonths || Array(12).fill(0);
          amount = months.reduce((a: number, b: number) => a + b, 0);
        }
      }

      const channelId = await ctx.db.insert("channels", {
        categoryId: catId,
        name: channelName,
        orderIndex: orderCounter++,
        baseAnnualTotal: amount
      });

      // 4. Create the Allocation Row
      await ctx.db.insert("budget_allocations", {
        contractorId,
        categoryId: catId,
        channelId,
        jan: months[0], feb: months[1], mar: months[2],
        apr: months[3], may: months[4], jun: months[5],
        jul: months[6], aug: months[7], sep: months[8],
        oct: months[9], nov: months[10], dec: months[11],
        year: amount
      });
    }

    // Return the inserted contractor ID so the client can redirect
    return contractorId;
  }
});
