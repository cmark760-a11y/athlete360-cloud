import type { Config } from "@netlify/functions";
import { getUser } from "@netlify/identity";
import { gte } from "drizzle-orm";
import { db } from "../../db/index.js";
import { athletes, workouts } from "../../db/schema.js";

export default async (req: Request) => {
  const user = await getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  const since = weekAgo.toISOString().slice(0, 10);

  const allAthletes = await db.select().from(athletes);
  const recentWorkouts = await db.select().from(workouts).where(gte(workouts.date, since));

  const rpeValues = recentWorkouts.map((w) => w.rpe).filter((v): v is number => v !== null);
  const avgRpe = rpeValues.length ? rpeValues.reduce((sum, v) => sum + v, 0) / rpeValues.length : null;

  return Response.json({
    totalAthletes: allAthletes.length,
    sessionsThisWeek: recentWorkouts.length,
    avgRpeThisWeek: avgRpe !== null ? Math.round(avgRpe * 10) / 10 : null,
  });
};

export const config: Config = {
  path: "/api/stats",
};
