import type { Config, Context } from "@netlify/functions";
import { getUser } from "@netlify/identity";
import { eq, desc } from "drizzle-orm";
import { db } from "../../db/index.js";
import { workouts } from "../../db/schema.js";

export default async (req: Request, context: Context) => {
  const user = await getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const athleteId = context.params.athleteId ? Number(context.params.athleteId) : undefined;
  const id = context.params.id ? Number(context.params.id) : undefined;

  if (req.method === "GET" && athleteId !== undefined) {
    const rows = await db
      .select()
      .from(workouts)
      .where(eq(workouts.athleteId, athleteId))
      .orderBy(desc(workouts.date));
    return Response.json(rows);
  }

  if (req.method === "POST" && athleteId !== undefined) {
    const body = await req.json();
    if (!body.date || !body.type || !body.durationMinutes) {
      return new Response("date, type and durationMinutes are required", { status: 400 });
    }
    const [created] = await db
      .insert(workouts)
      .values({
        athleteId,
        date: body.date,
        type: body.type,
        durationMinutes: body.durationMinutes,
        rpe: body.rpe ?? null,
        distanceKm: body.distanceKm ?? null,
        notes: body.notes ?? null,
      })
      .returning();
    return Response.json(created, { status: 201 });
  }

  if (req.method === "PATCH" && id !== undefined) {
    const body = await req.json();
    const [updated] = await db
      .update(workouts)
      .set({
        date: body.date,
        type: body.type,
        durationMinutes: body.durationMinutes,
        rpe: body.rpe ?? null,
        distanceKm: body.distanceKm ?? null,
        notes: body.notes ?? null,
      })
      .where(eq(workouts.id, id))
      .returning();
    if (!updated) return new Response("Not found", { status: 404 });
    return Response.json(updated);
  }

  if (req.method === "DELETE" && id !== undefined) {
    await db.delete(workouts).where(eq(workouts.id, id));
    return new Response(null, { status: 204 });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: ["/api/athletes/:athleteId/workouts", "/api/workouts/:id"],
};
