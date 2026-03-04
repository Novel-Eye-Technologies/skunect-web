'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Send } from 'lucide-react';
import { useCreateBroadcast } from '@/lib/hooks/use-broadcast';

export function BroadcastDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetType, setTargetType] = useState('ALL');
  const [targetValue, setTargetValue] = useState('');

  const createBroadcast = useCreateBroadcast();

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    createBroadcast.mutate(
      {
        title,
        content,
        targetType,
        targetValue: targetValue || undefined,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setTitle('');
          setContent('');
          setTargetType('ALL');
          setTargetValue('');
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Send className="mr-2 h-4 w-4" />
          New Broadcast
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send Broadcast</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Broadcast title" />
          </div>
          <div>
            <Label>Message</Label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your message..." rows={4} />
          </div>
          <div>
            <Label>Target Audience</Label>
            <Select value={targetType} onValueChange={setTargetType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Everyone</SelectItem>
                <SelectItem value="ROLE">By Role</SelectItem>
                <SelectItem value="CLASS">By Class</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {targetType === 'ROLE' && (
            <div>
              <Label>Role</Label>
              <Select value={targetValue} onValueChange={setTargetValue}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PARENT">Parents</SelectItem>
                  <SelectItem value="TEACHER">Teachers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {targetType === 'CLASS' && (
            <div>
              <Label>Class ID</Label>
              <Input value={targetValue} onChange={(e) => setTargetValue(e.target.value)} placeholder="Enter class ID" />
            </div>
          )}
          <Button onClick={handleSubmit} disabled={createBroadcast.isPending} className="w-full">
            {createBroadcast.isPending ? 'Sending...' : 'Send Broadcast'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
