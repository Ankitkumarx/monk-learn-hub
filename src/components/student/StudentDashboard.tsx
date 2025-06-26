import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../auth/AuthProvider';
import { useSearch } from '../../hooks/useSearch';
import { SearchBar } from '../ui/SearchBar';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Lock, Play, BookOpen, Clock, AlertCircle } from 'lucide-react';
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
import { useToast } from '../ui/use-toast';

interface Chapter {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  chapters: Chapter[];
  status: 'active' | 'draft' | 'pending';
  isAssigned?: boolean;
  requested?: boolean;
  progress?: number;
  completedLessons?: number;
}

export const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await fetch('http://localhost:4000/api/courses');
      if (!res.ok) throw new Error('Failed to fetch courses');
      return res.json();
    },
  });
  const courses: Course[] = Array.isArray(data) ? data : [];
  const [showAlertDialog, setShowAlertDialog] = React.useState(false);
  const [alertInfo, setAlertInfo] = React.useState({ title: '', description: '', buttonText: '' });
  const { toast } = useToast();

  const { searchQuery, setSearchQuery, filteredItems } = useSearch<Course>(
    courses,
    ['title', 'description']
  );

  // Filter courses based on status - only show active courses to students
  const availableCourses = filteredItems.filter(course => course.status === 'active');
  const pendingCourses = filteredItems.filter(course => course.status === 'pending');
  const draftCourses = filteredItems.filter(course => course.status === 'draft');

  // Fetch user enrollments to show progress
  const { data: userEnrollments = [] } = useQuery<string[]>({
    queryKey: ['enrollments', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await fetch(`http://localhost:4000/api/enrollments/${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch enrollments');
      return res.json();
    },
    enabled: !!user?.id,
  });

  // Fetch progress for each course
  const { data: courseProgress = {} } = useQuery<Record<string, string[]>>({
    queryKey: ['progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return {};
      const progressData: Record<string, string[]> = {};
      
      // Fetch progress for each enrolled course
      for (const courseId of userEnrollments) {
        try {
          const res = await fetch(`http://localhost:4000/api/progress/${user.id}/${courseId}`);
          if (res.ok) {
            const data = await res.json();
            progressData[courseId] = data.watched || [];
          }
        } catch (error) {
          console.error(`Failed to fetch progress for course ${courseId}:`, error);
        }
      }
      
      return progressData;
    },
    enabled: !!user?.id && userEnrollments.length > 0,
  });

  const requestAccessMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const res = await fetch('http://localhost:4000/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: user?.id, courseId }),
      });
      if (!res.ok) throw new Error('Failed to request access');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments', user?.id] });
    },
  });

  // Fetch requests to know which courses are pending
  const { data: requests = [] } = useQuery<{ studentId: string; courseId: string }[]>({
    queryKey: ['requests'],
    queryFn: async () => {
      const res = await fetch('http://localhost:4000/api/requests');
      if (!res.ok) throw new Error('Failed to fetch requests');
      return res.json();
    },
  });

  const handleRequestAccess = (courseId: string) => {
    requestAccessMutation.mutate(courseId, {
      onSuccess: () => {
        setAlertInfo({
          title: 'Request Sent!',
          description: 'Your request for this course is pending admin approval.',
          buttonText: 'OK'
        });
        setShowAlertDialog(true);
        toast({ title: 'Request Sent', description: 'Your access request has been sent to the admin.' });
      },
      onError: () => {
        toast({ title: 'Error', description: 'Failed to send request.', variant: 'destructive' });
      }
    });
  };

  const handleContinueLearning = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  // Only show courses the student is enrolled in for 'Continue Learning'
  const enrolledCourses = availableCourses.filter(course => userEnrollments.includes(course.id));
  // Show available courses that are not enrolled and not requested
  const notEnrolledCourses = availableCourses.filter(course => !userEnrollments.includes(course.id));

  React.useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['enrollments', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['requests'] });
  }, [user?.id, queryClient]);

  if (isLoading) {
    return <div className="p-8 text-center">Loading courses...</div>;
  }
  if (isError) {
    return <div className="p-8 text-center text-red-600">Failed to load courses.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-white">MT</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Student Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <SearchBar
                placeholder="Search courses..."
                value={searchQuery}
                onChange={setSearchQuery}
                className="w-64"
              />
              <ThemeToggle />
              <span className="text-sm text-gray-600 dark:text-gray-300">Welcome, {user?.name}</span>
              <Button variant="outline" onClick={logout}>Logout</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">My Learning Journey</h2>
          <p className="text-gray-600 dark:text-gray-300">Continue your education with assigned courses</p>
        </div>

        {/* Available Courses */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <BookOpen className="mr-2 text-green-600" />
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">Available Courses</h3>
            <Badge className="ml-3 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">{enrolledCourses.length} Enrolled</Badge>
          </div>

          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow duration-200 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    {course.thumbnail ? (
                      <div className="w-full h-48 rounded-lg mb-4 overflow-hidden">
                        <img 
                          src={course.thumbnail} 
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mb-4 flex items-center justify-center">
                        <Play className="w-12 h-12 text-white" />
                      </div>
                    )}
                    <CardTitle className="text-lg dark:text-white">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2 dark:text-gray-300">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                        <span>
                          {Math.min(courseProgress[course.id]?.length || 0, course.chapters?.length || 0)}/{course.chapters?.length || 0} chapters
                        </span>
                        <span>
                          {course.chapters?.length ?
                            Math.min(100, Math.round(((courseProgress[course.id]?.length || 0) / course.chapters.length) * 100)) : 0
                          }% complete
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${course.chapters?.length ?
                              Math.min(100, Math.round(((courseProgress[course.id]?.length || 0) / course.chapters.length) * 100)) : 0
                            }%`
                          }}
                        ></div>
                      </div>
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        onClick={() => handleContinueLearning(course.id)}
                      >
                        Continue Learning
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">No Enrolled Courses</h4>
                <p className="text-gray-500 dark:text-gray-400">You are not enrolled in any courses yet.</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Not Enrolled Courses (Request Access) */}
        {notEnrolledCourses.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <BookOpen className="mr-2 text-blue-600" />
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">Request Access</h3>
              <Badge className="ml-3 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">{notEnrolledCourses.length} Available</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notEnrolledCourses.map((course) => {
                const isRequested = requests.some(req => req.studentId === user?.id && req.courseId === course.id);
                return (
                  <Card key={course.id} className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      {course.thumbnail ? (
                        <div className="w-full h-48 rounded-lg mb-4 overflow-hidden">
                          <img 
                            src={course.thumbnail} 
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mb-4 flex items-center justify-center">
                          <Play className="w-12 h-12 text-white" />
                        </div>
                      )}
                      <CardTitle className="text-lg dark:text-white">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2 dark:text-gray-300">{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleRequestAccess(course.id)}
                          disabled={isRequested || requestAccessMutation.isPending}
                        >
                          {isRequested ? 'Request Pending' : 'Request Access'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Pending Course Requests */}
        {pendingCourses.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <Clock className="mr-2 text-yellow-600" />
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">Pending Course Requests</h3>
              <Badge className="ml-3 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">{pendingCourses.length} Pending</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingCourses.map((course) => {
                const isRequested = requests.some(req => req.studentId === user?.id && req.courseId === course.id);
                return (
                  <Card key={course.id} className="opacity-75 border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      {course.thumbnail ? (
                        <div className="w-full h-48 rounded-lg mb-4 overflow-hidden relative">
                          <img 
                            src={course.thumbnail} 
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <Clock className="w-12 h-12 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-gray-300 dark:bg-gray-600 rounded-lg mb-4 flex items-center justify-center relative">
                          <Clock className="w-12 h-12 text-gray-500" />
                        </div>
                      )}
                      <CardTitle className="text-lg text-gray-600 dark:text-gray-400">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2 text-gray-500 dark:text-gray-500">{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                          <span>{course.chapters?.length ?? 0} chapters</span>
                          <span>Pending Approval</span>
                        </div>
                        {isRequested ? (
                          <Button 
                            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                            disabled
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            Request Pending
                          </Button>
                        ) : (
                          <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => handleRequestAccess(course.id)}
                            disabled={requestAccessMutation.isPending}
                          >
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Request Access
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Draft Courses (Hidden from students) */}
        {draftCourses.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <Lock className="mr-2 text-gray-400" />
              <h3 className="text-2xl font-semibold text-gray-600 dark:text-gray-400">Draft Courses</h3>
              <Badge className="ml-3 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">{draftCourses.length} Draft</Badge>
            </div>
            <Card className="border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">Draft Courses</h4>
                <p className="text-gray-500 dark:text-gray-400">These courses are currently in development and not available for enrollment.</p>
              </CardContent>
            </Card>
          </section>
        )}

        <AlertDialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{alertInfo.title}</AlertDialogTitle>
              <AlertDialogDescription>{alertInfo.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowAlertDialog(false)}>
                {alertInfo.buttonText}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};
