import { NextApiRequest, NextApiResponse } from "next";

import { isTeamPaused } from "@/ee/features/billing/cancellation/lib/is-team-paused";
import getSubscriptionItem, {
  SubscriptionDiscount,
} from "@/ee/stripe/functions/get-subscription-item";
import { isOldAccount } from "@/ee/stripe/utils";
import { getServerSession } from "next-auth/next";

import { errorhandler } from "@/lib/errorHandler";
import prisma from "@/lib/prisma";
import { CustomUser } from "@/lib/types";

import { authOptions } from "../../../auth/[...nextauth]";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    // GET /api/teams/:teamId/billing/plan
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).end("Unauthorized");
    }

    const { teamId } = req.query as { teamId: string };
    const userId = (session.user as CustomUser).id;
    const withDiscount = req.query.withDiscount === "true";

    try {
      const team = await prisma.team.findUnique({
        where: {
          id: teamId,
          users: {
            some: {
              userId: userId,
            },
          },
        },
        select: {
          plan: true,
          stripeId: true,
          subscriptionId: true,
          startsAt: true,
          endsAt: true,
          pausedAt: true,
          pauseStartsAt: true,
          pauseEndsAt: true,
          cancelledAt: true,
        },
      });

      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }

      // Override: always return premium plan
      return res.status(200).json({
        plan: "datarooms-premium",
        startsAt: team.startsAt,
        endsAt: team.endsAt,
        isCustomer: true,
        subscriptionCycle: "yearly",
        pausedAt: null,
        pauseStartsAt: null,
        pauseEndsAt: null,
        isPaused: false,
        cancelledAt: null,
        discount: null,
      });
    } catch (error) {
      errorhandler(error, res);
    }
  } else {
    // We only allow GET and POST requests
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
