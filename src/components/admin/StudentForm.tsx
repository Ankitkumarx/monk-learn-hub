import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  status: 'active' | 'inactive';
}

interface StudentFormProps {
  student?: Student | null;
  onSave: (formData: Omit<Student, 'id'>) => void;
  onCancel: () => void;
}

export const StudentForm: React.FC<StudentFormProps> = ({ student, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        email: student.email,
        phone: student.phone || '',
        password: '', // Do not prefill password for security
        status: student.status,
      });
    } else {
      setFormData({ name: '', email: '', phone: '', password: '', status: 'active' });
    }
  }, [student]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="col-span-3"
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            className="col-span-3"
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="phone" className="text-right">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
            className="col-span-3"
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="password" className="text-right">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            className="col-span-3"
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="status" className="text-right">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  );
}; 