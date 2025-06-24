
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '../auth/AuthProvider';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Users, BookOpen, Settings, Plus, Edit, Trash2, UserCheck } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  enrolledCourses: string[];
  joinDate: string;
  status: 'active' | 'inactive';
}

interface Course {
  id: string;
  title: string;
  description: string;
  totalLessons: number;
  enrolledStudents: number;
  status: 'active' | 'draft';
}

const mockStudents: Student[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'student@monk.edu',
    enrolledCourses: ['1', '3'],
    joinDate: '2024-01-15',
    status: 'active',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@email.com',
    enrolledCourses: ['1'],
    joinDate: '2024-02-20',
    status: 'active',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.j@email.com',
    enrolledCourses: [],
    joinDate: '2024-03-10',
    status: 'inactive',
  },
];

const mockCourses: Course[] = [
  {
    id: '1',
    title: 'React Fundamentals',
    description: 'Learn the basics of React development',
    totalLessons: 12,
    enrolledStudents: 2,
    status: 'active',
  },
  {
    id: '2',
    title: 'Advanced JavaScript',
    description: 'Deep dive into advanced JavaScript concepts',
    totalLessons: 15,
    enrolledStudents: 0,
    status: 'draft',
  },
  {
    id: '3',
    title: 'Node.js Backend Development',
    description: 'Build scalable backend applications',
    totalLessons: 18,
    enrolledStudents: 1,
    status: 'active',
  },
];

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [students] = useState<Student[]>(mockStudents);
  const [courses] = useState<Course[]>(mockCourses);

  const stats = {
    totalStudents: students.length,
    activeStudents: students.filter(s => s.status === 'active').length,
    totalCourses: courses.length,
    activeCourses: courses.filter(c => c.status === 'active').length,
  };

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
              <Button variant="outline" onClick={logout}>Logout</Button>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Enrollments</CardTitle>
                <UserCheck className="w-4 h-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">
                {students.reduce((acc, student) => acc + student.enrolledCourses.length, 0)}
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
          <TabsList className="grid w-full grid-cols-2 lg:w-96">
            <TabsTrigger value="students">Student Management</TabsTrigger>
            <TabsTrigger value="courses">Course Management</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">Students</h3>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </div>

            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50/80">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolled Courses</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-500">{student.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="secondary">{student.enrolledCourses.length} courses</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                              {student.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(student.joinDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline">
                              <UserCheck className="w-3 h-3 mr-1" />
                              Assign
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
              <h3 className="text-xl font-semibold text-gray-800">Courses</h3>
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Course
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="border-0 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                        {course.status}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{course.totalLessons} lessons</span>
                        <span>{course.enrolledStudents} students</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Users className="w-3 h-3 mr-1" />
                          Manage
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
