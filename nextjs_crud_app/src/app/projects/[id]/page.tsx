'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Project {
  _id: string;
  projectId: string;
  name: string;
  description: string;
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold';
  startDate: string;
  endDate?: string;
}

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      const res = await fetch(`/api/projects/${params.id}`);
      const data = await res.json();
      setProject(data);
    };
    fetchProject();
  }, [params.id]);

  const handleDelete = async () => {
    if (confirm('Delete this project?')) {
      const res = await fetch(`/api/projects/${params.id}`, { method: 'DELETE' });
      if (res.ok) router.push('/projects');
    }
  };

  if (!project) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{project.name}</CardTitle>
              <p className="text-sm text-gray-600">{project.projectId}</p>
            </div>
            <Badge>{project.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold">Description</h4>
            <p>{project.description}</p>
          </div>
          <div>
            <h4 className="font-semibold">Start Date</h4>
            <p>{new Date(project.startDate).toLocaleDateString()}</p>
          </div>
          {project.endDate && (
            <div>
              <h4 className="font-semibold">End Date</h4>
              <p>{new Date(project.endDate).toLocaleDateString()}</p>
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={() => router.push(`/projects/${project._id}/edit`)}>
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
            <Button variant="outline" onClick={() => router.push('/projects')}>
              Back to List
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}