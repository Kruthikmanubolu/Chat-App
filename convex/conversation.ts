import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserByClerkId } from "./_utils";

export const get = query({
  args: {
    id: v.id("conversations"),
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

    const conversation = await ctx.db.get(args.id);

    if (!conversation) {
      throw new ConvexError("Conversation not found");
    }

    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_memberId_conversation", (q) =>
        q.eq("memberId", currentUser._id).eq("conversationId", conversation._id)
      )
      .unique();

    if (!membership) {
      throw new ConvexError("You are not a member of this conversation");
    }

    const allConversationMemberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.id))
      .collect();

    if (!conversation.isGroup) {
      const otherMembership = allConversationMemberships.filter(
        (membership) => membership.memberId !== currentUser._id
      )[0];

      const otherMemberDetails = await ctx.db.get(otherMembership.memberId);

      return {
        ...conversation,
        otherMember: {
          ...otherMemberDetails,
          lastSeenMessageId: otherMembership.lastSeenMessage,
        },

        otherMembers: null,
      };
    } else {
      const otherMembers = await Promise.all(
        allConversationMemberships
          .filter((membership) => membership.memberId !== currentUser._id)
          .map(async (membership) => {
            const member = await ctx.db.get(membership.memberId);

            if (!member) {
              throw new ConvexError("Member could not be found");
            }
            return {
              _id: member._id,
              username: member.username,
            };
          })
      );

      return {
        ...conversation,
        otherMembers,
        otherMember: null,
      };
    }
  },
});

export const createGroup = mutation({
    args: {
        members: v.array(v.id('users')),
        name: v.string()
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
    const conversationId = await ctx.db.insert('conversations', {
        isGroup: true,
        name: args.name
    })

    await Promise.all([...args.members, currentUser._id].map(async (memberId) => {
        await ctx.db.insert('conversationMembers', {
            memberId, conversationId
        })
    }))
    }
})


export const deleteGroup = mutation({
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

    if (!memberships || memberships.length <= 1) {
      throw new ConvexError("This conversation does not have any members");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    // ✅ Delete the conversation itself
    await ctx.db.delete(args.conversationId);

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

export const leaveGroup = mutation({
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

    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_memberId_conversation", (q) =>
        q.eq("memberId", currentUser._id).eq('conversationId', args.conversationId)
      )
      .unique();

    if (!membership) {
      throw new ConvexError("You are not a member of this group");
    }

    await ctx.db.delete(membership._id)
  },
});

export const markRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    messageId: v.id('messages'),
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


    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_memberId_conversation", (q) =>
        q.eq("memberId", currentUser._id).eq('conversationId', args.conversationId)
      )
      .unique();

    if (!membership) {
      throw new ConvexError("You are not a member of this group");
    }

    const lastMessage = await ctx.db.get(args.messageId);

    await ctx.db.patch(membership._id, {
      lastSeenMessage: lastMessage ? 
      lastMessage._id : undefined
    })
  },
});
