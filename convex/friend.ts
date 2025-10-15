import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { getUserByClerkId } from "./_utils";

export const remove = mutation({
  args: {
    conversationId: v.id("conversations"),
    type: v.optional(v.string()),
    content: v.optional(v.array(v.string())), // ✅ made optional to avoid validation errors
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const currentUser = await getUserByClerkId({
      ctx,
      clerkId: identity.subject,
    });

    if (!currentUser) {
      throw new Error("Current user not found");
    }

    const conversation = await ctx.db.get(args.conversationId);

    if (!conversation) {
      throw new ConvexError("Conversation not found");
    }

    const memberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    if (!memberships || memberships.length !== 2) {
      throw new ConvexError("This conversation does not have any members");
    }

    const friendship = await ctx.db
      .query("friends")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .unique();

    if (!friendship) {
      throw new ConvexError("Friend could not be found");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    // ✅ Delete the conversation itself
    await ctx.db.delete(args.conversationId);

    // ✅ Delete the friendship link
    await ctx.db.delete(friendship._id);

    // ✅ Delete all memberships
    await Promise.all(
      memberships.map((membership) => ctx.db.delete(membership._id))
    );

    // ✅ Delete all messages
    await Promise.all(messages.map((message) => ctx.db.delete(message._id)));

    // Optionally: log or use args.content if provided
    if (args.content) {
      console.log("Optional content received:", args.content);
    }
  },
});
