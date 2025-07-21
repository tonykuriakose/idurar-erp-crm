'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

// Add interface
interface Project {
  _id: string;
  projectId: string;
  name: string;
  description: string;
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold';
  startDate: string;
  endDate?: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProjects = async () => {
    const res = await fetch(`/api/projects?page=${page}&limit=2`);
    const data = await res.json();
    setProjects(data.projects);
     setTotalPages(data.totalPages);
  };

  useEffect(() => { fetchProjects(); }, [page]);

  const filteredProjects = projects.filter(p => 
    filter === 'all' || p.status === filter
  );

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Link href="/projects/new">
          <Button>Add Project</Button>
        </Link>
      </div>

      <div className="mb-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Planning">Planning</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="On Hold">On Hold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredProjects.map(project => (
          <Card key={project._id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{project.name}</h3>
                <p className="text-sm text-gray-600">{project.description}</p>
                <p className="text-xs text-gray-500">{project.projectId}</p>
              </div>
              <div className="flex gap-2">
                <Badge>{project.status}</Badge>
                <Link href={`/projects/${project._id}`}>
                  <Button variant="outline" size="sm">View</Button>
                </Link>
                <Link href={`/projects/${project._id}/edit`}>
                  <Button variant="outline" size="sm">Edit</Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-center gap-2 mt-4">
  <Button 
    disabled={page === 1} 
    onClick={() => setPage(page - 1)}
  >
    Previous
  </Button>
  <span className="py-2 px-4">{page} / {totalPages}</span>
  <Button 
    disabled={page === totalPages} 
    onClick={() => setPage(page + 1)}
  >
    Next
  </Button>
</div>
    </div>
  );
}