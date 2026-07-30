import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { parseProjectExcel } from "@/lib/projects/excel-import";
import { applyProjectImport } from "@/lib/projects/apply-import";

export const runtime = "nodejs";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing \"file\" field in form data." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const parsed = await parseProjectExcel(buffer);
  if (!parsed.ok) {
    return NextResponse.json({ error: "The sheet could not be imported.", errors: parsed.errors }, { status: 400 });
  }

  const result = await applyProjectImport(prisma, projectId, parsed.data);
  return NextResponse.json(result);
}
