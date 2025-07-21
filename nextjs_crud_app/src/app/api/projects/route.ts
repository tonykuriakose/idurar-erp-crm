import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';

export async function GET(request: NextRequest) {
  await dbConnect();
  
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = (page - 1) * limit;

  const projects = await Project.find().skip(skip).limit(limit);
  const total = await Project.countDocuments();

  return NextResponse.json({ projects, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(request: NextRequest) {
  await dbConnect();
  
  const data = await request.json();
  const count = await Project.countDocuments();
  const projectId = `PRJ-${String(count + 1).padStart(6, '0')}`;
  
  const project = await Project.create({ ...data, projectId });
  return NextResponse.json(project, { status: 201 });
}