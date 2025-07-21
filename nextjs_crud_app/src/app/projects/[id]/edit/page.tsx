'use client';
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
 const [formData, setFormData] = useState<{
  name: string;
  description: string;
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold';
  startDate: string;
  endDate: string;
}>({
  name: '',
  description: '',
  status: 'Planning',
  startDate: '',
  endDate: ''
});

  useEffect(() => {
    const fetchProject = async () => {
      const res = await fetch(`/api/projects/${params.id}`);
      const project = await res.json();
      setFormData({
        name: project.name,
        description: project.description,
        status: project.status,
        startDate: project.startDate.split('T')[0],
        endDate: project.endDate ? project.endDate.split('T')[0] : ''
      });
    };
    fetchProject();
  }, [params.id]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await fetch(`/api/projects/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) router.push(`/projects/${params.id}`);
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Edit Project</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Project Name"
              value={formData.name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}
              required
            />
            <Textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, description: e.target.value})}
              required
            />
            <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as 'Planning' | 'In Progress' | 'Completed' | 'On Hold'})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Planning">Planning</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={formData.startDate}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, startDate: e.target.value})}
              required
            />
            <Input
              type="date"
              value={formData.endDate}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, endDate: e.target.value})}
            />
            <div className="flex gap-2">
              <Button type="submit">Update Project</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}