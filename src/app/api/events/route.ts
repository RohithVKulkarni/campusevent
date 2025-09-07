// src/app/api/events/route.ts
import { NextResponse } from "next/server";

let events = [] as any[];

export async function GET() {
  return NextResponse.json(events);
}

export async function POST(request: Request) {
  const event = await request.json();
  event.id = Date.now().toString();
  events.push(event);
  return NextResponse.json(event, { status: 201 });
}

export async function PUT(request: Request) {
  const { id, ...updateData } = await request.json();
  events = events.map((e) => (e.id === id ? { ...e, ...updateData } : e));
  return NextResponse.json({ message: "Updated" });
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  events = events.filter((e) => e.id !== id);
  return NextResponse.json({ message: "Deleted" });
}
