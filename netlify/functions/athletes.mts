import type { Config, Context } from "@netlify/functions";
import { getUser } from "@netlify/identity";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { athletes } from "../../db/schema.js";

export default async (req: Request, context: Context) => {
  const user = await getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const id = context.params.id ? Number(context.params.id) : undefined;

  if (req.method === "GET" && id === undefined) {
    const all = await db.select().from(athletes).orderBy(athletes.name);
    return Response.json(all);
  }

  if (req.method === "GET" && id !== undefined) {
    const [athlete] = await db.select().from(athletes).where(eq(athletes.id, id));
    if (!athlete) return new Response("Not found", { status: 404 });
    return Response.json(athlete);
  }

  if (req.method === "POST") {
    const body = await req.json();
    if (!body.name || !body.sport) {
      return new Response("name and sport are required", { status: 400 });
    }
    const [created] = await db
      .insert(athletes)
      .values({
        name: body.name,
        sport: body.sport,
        position: body.position ?? null,
        team: body.team ?? null,
        birthDate: body.birthDate ?? null,
        notes: body.notes ?? null,
      })
      .returning();
    return Response.json(created, { status: 201 });
  }

  if (req.method === "PATCH" && id !== undefined) {
    const body = await req.json();
    const [updated] = await db
      .update(athletes)
      .set({
        name: body.name,
        sport: body.sport,
        position: body.position ?? null,
        team: body.team ?? null,
        birthDate: body.birthDate ?? null,
        notes: body.notes ?? null,
      })
      .where(eq(athletes.id, id))
      .returning();
    if (!updated) return new Response("Not found", { status: 404 });
    return Response.json(updated);
  }

  if (req.method === "DELETE" && id !== undefined) {
    await db.delete(athletes).where(eq(athletes.id, id));
    return new Response(null, { status: 204 });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: ["/api/athletes", "/api/athletes/:id"],
};
