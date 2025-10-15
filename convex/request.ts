import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { getUserByClerkId } from "./_utils";
export const create = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }
    if (args.email === identity.email) {
      throw new ConvexError("You cannot refer yourself");
    }

    const currentUser = await getUserByClerkId({
      ctx,
      clerkId: identity.subject,
    });

    if (!currentUser) {
      throw new ConvexError("Current user not found");
    }
    const recieverUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!recieverUser) {
      throw new ConvexError("User with this email not found");
    }

    const requestAlreadySent = await ctx.db
      .query("requests")
      .withIndex("by_reciever_sender", (q) =>
        q.eq("reciever", recieverUser._id).eq("sender", currentUser._id)
      )
      .unique();

    if (requestAlreadySent) {
      throw new ConvexError("Request already sent to this user");
    }

    const requestAlreadyRecieved = await ctx.db
      .query("requests")
      .withIndex("by_reciever_sender", (q) =>
        q.eq("reciever", currentUser._id).eq("sender", recieverUser._id)
      )
      .unique();
    if (requestAlreadyRecieved) {
      throw new ConvexError("This user has already sent you a request");
    }
    const request = await ctx.db.insert("requests", {
      sender: currentUser._id,
      reciever: recieverUser._id,
    });
    return request;
}
});

export const deny = mutation({
  args: { id: v.id("requests") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const currentUser = await getUserByClerkId({
      ctx,
      clerkId: identity.subject,
    });

    if (!currentUser) {
      throw new ConvexError("Current user not found");
    }

    const request = await ctx.db.get(args.id);
    if (!request || request.reciever !== currentUser._id) {
      throw new ConvexError("There was an error denying the request");
    }

    // ✅ The sender of this request is the "reciever" from the current user's perspective
    const recieverId = request.sender;

    const friends1 = await ctx.db
      .query("friends")
      .withIndex("by_user", (q) => q.eq("user1", currentUser._id))
      .collect();

    const friends2 = await ctx.db
      .query("friends")
      .withIndex("by_user2", (q) => q.eq("user2", currentUser._id))
      .collect();

    if (
      friends1.some((friend) => friend.user2 === recieverId) ||
      friends2.some((friend) => friend.user1 === recieverId)
    ) {
      throw new ConvexError("You are already friends with this user");
    }

    await ctx.db.delete(request._id);
  },
});

export const accept = mutation({
  args: { id: v.id("requests") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const currentUser = await getUserByClerkId({
      ctx,
      clerkId: identity.subject,
    });

    if (!currentUser) {
      throw new ConvexError("Current user not found");
    }
    const request = await ctx.db.get(args.id);
    if (!request || request.reciever !== currentUser._id) {
      throw new ConvexError("There was an error accepting the request");
    }

    const conversationId = await ctx.db.insert("conversations", {
      isGroup: false,
    }); // 1-on-1 conversation

    await ctx.db.insert("friends", {
      conversationId,
      user1: currentUser._id,
      user2: request.sender,
    });
    await ctx.db.insert("conversationMembers", {
      conversationId, memberId: currentUser._id,
    });
    await ctx.db.insert("conversationMembers", {
      conversationId, memberId: request.sender,
    });
    await ctx.db.delete(request._id);
  },
});

