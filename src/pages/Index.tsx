import React from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { LoginForm } from '../components/auth/LoginForm';
import { StudentDashboard } from '../components/student/StudentDashboard';
import { AdminDashboard } from '../components/admin/AdminDashboard';

const Index: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
            <span className="text-2xl font-bold text-white">MT</span>
          </div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  return <StudentDashboard />;
};

export default Index;
