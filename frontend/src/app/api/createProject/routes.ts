import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  // TODO: store file, parse it, etc.

  const projectId = uuidv4(); // or from DB
  return NextResponse.json({ projectId });
}
