
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../auth/AuthProvider';
import { Lock, Play, Clock, BookOpen } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  isAssigned: boolean;
  progress: number;
  totalLessons: number;
  completedLessons: number;
}

const mockCourses: Course[] = [
  {
    id: '1',
    title: 'React Fundamentals',
    description: 'Learn the basics of React development including components, props, and state management.',
    thumbnail: '/placeholder.svg',
    isAssigned: true,
    progress: 60,
    totalLessons: 12,
    completedLessons: 7,
  },
  {
    id: '2',
    title: 'Advanced JavaScript',
    description: 'Deep dive into advanced JavaScript concepts including closures, prototypes, and async programming.',
    thumbnail: '/placeholder.svg',
    isAssigned: false,
    progress: 0,
    totalLessons: 15,
    completedLessons: 0,
  },
  {
    id: '3',
    title: 'Node.js Backend Development',
    description: 'Build scalable backend applications with Node.js, Express, and MongoDB.',
    thumbnail: '/placeholder.svg',
    isAssigned: true,
    progress: 25,
    totalLessons: 18,
    completedLessons: 4,
  },
  {
    id: '4',
    title: 'Database Design',
    description: 'Master database design principles and learn SQL and NoSQL databases.',
    thumbnail: '/placeholder.svg',
    isAssigned: false,
    progress: 0,
    totalLessons: 10,
    completedLessons: 0,
  },
];

export const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const assignedCourses = mockCourses.filter(course => course.isAssigned);
  const lockedCourses = mockCourses.filter(course => !course.isAssigned);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-white">MT</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Student Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <Button variant="outline" onClick={logout}>Logout</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">My Learning Journey</h2>
          <p className="text-gray-600">Continue your education with assigned courses</p>
        </div>

        {/* Assigned Courses */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <BookOpen className="mr-2 text-green-600" />
            <h3 className="text-2xl font-semibold text-gray-800">My Courses</h3>
            <Badge className="ml-3 bg-green-100 text-green-800">{assignedCourses.length} Active</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignedCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow duration-200 border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mb-4 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                      <span>{course.progress}% complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Continue Learning
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Locked Courses */}
        <section>
          <div className="flex items-center mb-6">
            <Lock className="mr-2 text-gray-400" />
            <h3 className="text-2xl font-semibold text-gray-800">Available Courses</h3>
            <Badge className="ml-3 bg-gray-100 text-gray-600">{lockedCourses.length} Locked</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lockedCourses.map((course) => (
              <Card key={course.id} className="opacity-60 border-0 bg-white/60 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="w-full h-48 bg-gray-300 rounded-lg mb-4 flex items-center justify-center relative">
                    <Lock className="w-12 h-12 text-gray-500" />
                  </div>
                  <CardTitle className="text-lg text-gray-600">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2 text-gray-500">{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{course.totalLessons} lessons</span>
                      <span>Locked</span>
                    </div>
                    <Button disabled className="w-full">
                      <Lock className="w-4 h-4 mr-2" />
                      Request Access
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
