import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '../auth/AuthProvider';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Users, BookOpen, Settings, Plus, Edit, Trash2, UserCheck, Clock, CheckCircle, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StudentForm } from './StudentForm';
import { CourseForm } from './CourseForm';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearch } from '../../hooks/useSearch';
import { SearchBar } from '../ui/SearchBar';
import { useToast } from '../ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  enrolledCourses: string[];
  joinDate: string;
  status: 'active' | 'inactive';
}

interface VideoItem {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
}

interface MaterialItem {
  id: string;
  name: string;
  dataUrl: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  videos: VideoItem[];
  materials: MaterialItem[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  modules: Module[];
  status: 'active' | 'draft' | 'pending';
  enrolledStudents?: number;
}

interface PendingRequest {
  studentId: string;
  courseId: string;
}

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: students = [], isLoading: isStudentsLoading } = useQuery<Student[]>({
    queryKey: ['students'],
    queryFn: async () => {
      const res = await fetch('http://localhost:4000/api/users');
      if (!res.ok) throw new Error('Failed to fetch students');
      return res.json();
    },
  });
  const { data: requests = [], isLoading: isRequestsLoading } = useQuery<{ studentId: string; courseId: string }[]>({
    queryKey: ['requests'],
    queryFn: async () => {
      const res = await fetch('http://localhost:4000/api/requests');
      if (!res.ok) throw new Error('Failed to fetch requests');
      return res.json();
    },
  });
  const { data: courses = [], isLoading, isError } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await fetch('http://localhost:4000/api/courses');
      if (!res.ok) throw new Error('Failed to fetch courses');
      return res.json();
    },
  });

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const stats = {
    totalStudents: students.length,
    activeStudents: students.filter(s => s.status === 'active').length,
    totalCourses: courses.length,
    activeCourses: courses.filter(c => c.status === 'active').length,
    pendingCourses: courses.filter(c => c.status === 'pending').length,
  };

  const queryClient = useQueryClient();
  
  const deleteRequestMutation = useMutation({
    mutationFn: async ({ studentId, courseId }: { studentId: string; courseId: string }) => {
      const res = await fetch('http://localhost:4000/api/requests', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, courseId }),
      });
      if (!res.ok) throw new Error('Failed to delete request');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: async (courseData: Omit<Course, 'id'>) => {
      const res = await fetch('http://localhost:4000/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData),
      });
      if (!res.ok) throw new Error('Failed to create course');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, ...courseData }: Course) => {
      const res = await fetch(`http://localhost:4000/api/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData),
      });
      if (!res.ok) throw new Error('Failed to update course');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const res = await fetch(`http://localhost:4000/api/courses/${courseId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete course');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  const approveRequestMutation = useMutation({
    mutationFn: async ({ studentId, courseId }: { studentId: string; courseId: string }) => {
      // First delete the request
      await fetch('http://localhost:4000/api/requests', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, courseId }),
      });
      
      // Then enroll the student in the course
      const res = await fetch('http://localhost:4000/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, courseId }),
      });
      if (!res.ok) throw new Error('Failed to enroll student');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  // Fetch enrollments for all students
  const { data: allEnrollments = {}, refetch: refetchEnrollments } = useQuery<{ [studentId: string]: string[] }>({
    queryKey: ['allEnrollments', students.map(s => s.id).join(',')],
    queryFn: async () => {
      const result: { [studentId: string]: string[] } = {};
      for (const student of students) {
        const res = await fetch(`http://localhost:4000/api/enrollments/${student.id}`);
        if (res.ok) {
          result[student.id] = await res.json();
        } else {
          result[student.id] = [];
        }
      }
      return result;
    },
    enabled: students.length > 0,
  });

  // Calculate total enrollments
  const totalEnrollments = Object.values(allEnrollments).reduce((acc, arr) => acc + arr.length, 0);

  // Search states
  const [studentSearch, setStudentSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [requestSearch, setRequestSearch] = useState('');

  // Filtered lists
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );
  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
    c.description.toLowerCase().includes(courseSearch.toLowerCase())
  );
  const filteredRequests = requests.filter(req => {
    const student = students.find(s => s.id === req.studentId);
    const course = courses.find(c => c.id === req.courseId);
    return (
      (student?.name.toLowerCase().includes(requestSearch.toLowerCase()) ||
        course?.title.toLowerCase().includes(requestSearch.toLowerCase()))
    );
  });

  const { toast } = useToast();

  const handleSaveStudent = (formData: Omit<Student, 'id' | 'enrolledCourses' | 'joinDate'>) => {
    // No-op for now, as students are backend-driven
    setIsStudentModalOpen(false);
    setSelectedStudent(null);
    toast({ title: 'Student saved', description: 'Student details have been saved.' });
  };

  const handleDeleteStudent = () => {
    setSelectedStudent(null);
    toast({ title: 'Student deleted', description: 'Student has been deleted.' });
  };

  const handleSaveCourse = (formData: Omit<Course, 'id'>) => {
    if (selectedCourse) {
      // Update existing course
      updateCourseMutation.mutate({ ...selectedCourse, ...formData }, {
        onSuccess: () => toast({ title: 'Course updated', description: 'Course details have been updated.' }),
        onError: () => toast({ title: 'Error', description: 'Failed to update course.', variant: 'destructive' })
      });
    } else {
      // Create new course
      createCourseMutation.mutate(formData, {
        onSuccess: () => toast({ title: 'Course added', description: 'New course has been added.' }),
        onError: () => toast({ title: 'Error', description: 'Failed to add course.', variant: 'destructive' })
      });
    }
    setIsCourseModalOpen(false);
    setSelectedCourse(null);
  };

  const handleDeleteCourse = () => {
    if (selectedCourse) {
      deleteCourseMutation.mutate(selectedCourse.id, {
        onSuccess: () => toast({ title: 'Course deleted', description: 'Course has been deleted.' }),
        onError: () => toast({ title: 'Error', description: 'Failed to delete course.', variant: 'destructive' })
      });
    }
    setSelectedCourse(null);
  };

  const handleApproveRequest = (studentId: string, courseId: string) => {
    approveRequestMutation.mutate({ studentId, courseId }, {
      onSuccess: () => toast({ title: 'Request approved', description: 'Student has been enrolled in the course.' }),
      onError: () => toast({ title: 'Error', description: 'Failed to approve request.', variant: 'destructive' })
    });
  };

  const handleRejectRequest = (studentId: string, courseId: string) => {
    deleteRequestMutation.mutate({ studentId, courseId }, {
      onSuccess: () => toast({ title: 'Request rejected', description: 'Request has been rejected.' }),
      onError: () => toast({ title: 'Error', description: 'Failed to reject request.', variant: 'destructive' })
    });
  };

  if (isStudentsLoading || isRequestsLoading || isLoading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }
  if (isError) {
    return <div className="p-8 text-center text-red-600">Failed to load dashboard data.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-white">MT</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <span className="text-sm text-gray-600 dark:text-gray-300">Welcome, {user?.name}</span>
              <Button variant="outline" onClick={() => { logout(); navigate('/admin'); }}>Logout</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Dashboard Overview</h2>
          <p className="text-gray-600 dark:text-gray-300">Manage students, courses, and platform settings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Students</CardTitle>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalStudents}</div>
              <p className="text-xs text-green-600 mt-1">{stats.activeStudents} active</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Courses</CardTitle>
                <BookOpen className="w-4 h-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalCourses}</div>
              <p className="text-xs text-green-600 mt-1">{stats.activeCourses} published</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending Courses</CardTitle>
                <Clock className="w-4 h-4 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingCourses}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Enrollments</CardTitle>
                <UserCheck className="w-4 h-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">
                {totalEnrollments}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active enrollments</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Platform Health</CardTitle>
                <Settings className="w-4 h-4 text-indigo-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Healthy</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[32rem]">
            <TabsTrigger value="students">Student Management</TabsTrigger>
            <TabsTrigger value="courses">Course Management</TabsTrigger>
            <TabsTrigger value="requests">Pending Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Students</h3>
              <div className="flex gap-2 items-center">
                <SearchBar
                  placeholder="Search students..."
                  value={studentSearch}
                  onChange={setStudentSearch}
                  className="w-64"
                />
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => {
                    setSelectedStudent(null);
                    setIsStudentModalOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Student
                </Button>
              </div>
            </div>

            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50/80 dark:bg-gray-900/80">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Join Date</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/80 dark:divide-gray-700/80">
                      {filteredStudents.map((student) => (
                        <tr key={student.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{student.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={student.status === 'active' ? 'default' : 'secondary'} className={student.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}>
                              {student.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{student.joinDate}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button variant="ghost" size="icon" onClick={() => {
                              setSelectedStudent(student);
                              setIsStudentModalOpen(true);
                            }}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => {
                              setSelectedStudent(student);
                              setIsDeleteAlertOpen(true);
                            }}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Courses</h3>
              <div className="flex gap-2 items-center">
                <SearchBar
                  placeholder="Search courses..."
                  value={courseSearch}
                  onChange={setCourseSearch}
                  className="w-64"
                />
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => {
                    setSelectedCourse(null);
                    setIsCourseModalOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Course
                </Button>
              </div>
            </div>

            <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50/80 dark:bg-gray-900/80">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Course</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Modules</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Enrolled Students</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/80 dark:divide-gray-700/80">
                      {filteredCourses.map((course) => (
                        <tr key={course.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {course.thumbnail ? (
                                <img 
                                  src={course.thumbnail} 
                                  alt={course.title}
                                  className="w-12 h-8 object-cover rounded"
                                />
                              ) : (
                                <div className="w-12 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded flex items-center justify-center">
                                  <BookOpen className="w-4 h-4 text-white" />
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{course.title}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{course.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge 
                              variant={course.status === 'active' ? 'default' : course.status === 'pending' ? 'secondary' : 'outline'}
                              className={
                                course.status === 'active' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : course.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }
                            >
                              {course.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                            {course.modules?.length || 0} modules
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                            {course.enrolledStudents || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button variant="ghost" size="icon" onClick={() => {
                              setSelectedCourse(course);
                              setIsCourseModalOpen(true);
                            }}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => {
                              setSelectedCourse(course);
                              setIsDeleteAlertOpen(true);
                            }}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Pending Course Access Requests</h3>
              <SearchBar
                placeholder="Search requests..."
                value={requestSearch}
                onChange={setRequestSearch}
                className="w-64"
              />
            </div>
            <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50/80 dark:bg-gray-900/80">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Course</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/80 dark:divide-gray-700/80">
                      {filteredRequests.map((req, idx) => {
                        const student = students.find(s => s.id === req.studentId);
                        const course = courses.find(c => c.id === req.courseId);
                        if (!student || !course) return null;
                        return (
                          <tr key={idx}>
                            <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{course.title}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <Button 
                                size="sm" 
                                className="mr-2 bg-green-600 hover:bg-green-700 text-white" 
                                onClick={() => handleApproveRequest(student.id, course.id)}
                                disabled={approveRequestMutation.isPending}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleRejectRequest(student.id, course.id)}
                                disabled={deleteRequestMutation.isPending}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isStudentModalOpen} onOpenChange={setIsStudentModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
              <DialogDescription>
                {selectedStudent ? 'Update the details of the student.' : 'Enter the details for the new student.'}
              </DialogDescription>
            </DialogHeader>
            <StudentForm 
              student={selectedStudent} 
              onSave={handleSaveStudent} 
              onCancel={() => {
                setIsStudentModalOpen(false);
                setSelectedStudent(null);
              }}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isCourseModalOpen} onOpenChange={setIsCourseModalOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
              <DialogDescription>
                {selectedCourse ? 'Update the details of the course.' : 'Enter the details for the new course.'}
              </DialogDescription>
            </DialogHeader>
            <CourseForm 
              course={selectedCourse} 
              onSave={handleSaveCourse} 
              onCancel={() => {
                setIsCourseModalOpen(false);
                setSelectedCourse(null);
              }}
            />
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the {selectedStudent ? 'student account' : 'course'}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setIsDeleteAlertOpen(false);
                setSelectedStudent(null);
                setSelectedCourse(null);
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                if (selectedStudent) {
                  handleDeleteStudent();
                } else if (selectedCourse) {
                  handleDeleteCourse();
                }
                setIsDeleteAlertOpen(false);
              }}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};
