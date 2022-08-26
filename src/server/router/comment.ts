import { Reactions } from "@prisma/client";
import { Points } from "data/points";
import { z } from "zod";
import { createRouter } from "./context";

export const commentRouter = createRouter()
  .query("all", {
    input: z.object({
      postId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const comments = await ctx.prisma.comment.findMany({
        where: { postId: input.postId },
        include: {
          User: true,
        },
      });
      return comments;
    },
  })
  .mutation("new", {
    input: z.object({
      reaction: z.nativeEnum(Reactions),
      content: z.string(),
      postId: z.string(),
    }),
    async resolve({ ctx, input }) {
      await ctx.prisma.comment.create({
        data: { ...input, userId: ctx.user?.id as string },
      });
      await ctx.prisma.user.update({
        where: { id: ctx.user?.id as string },
        data: { confidencePoint: { increment: Points.Supporting } },
      });
    },
  });
