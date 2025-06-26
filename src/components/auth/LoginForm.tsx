import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from './AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { RegisterForm } from './RegisterForm';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetForm, setResetForm] = useState({ email: '', phone: '', newPassword: '' });
  const [resetLoading, setResetLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  if (showRegister) {
    return <RegisterForm onBackToLogin={() => setShowRegister(false)} />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (email === 'admin@monk.edu') {
      toast({
        title: 'Admin Login Not Allowed',
        description: 'Please use the admin login page for admin access.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    const success = await login(email, password);
    
    if (success) {
      toast({
        title: 'Login Successful',
        description: 'Welcome to Monk Technologies Education Platform',
      });
    } else {
      toast({
        title: 'Login Failed',
        description: 'Invalid email or password. Try: admin@monk.edu/admin123 or student@monk.edu/student123',
        variant: 'destructive',
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-white">MT</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">Welcome Back</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Sign in to your Monk Technologies account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
              <button
                type="button"
                className="text-xs text-blue-600 hover:underline mt-1"
                onClick={() => setShowForgotPassword(true)}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                Forgot Password?
              </button>
            </div>
            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Button 
              variant="link" 
              onClick={() => setShowRegister(true)}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              Don't have an account? Create one
            </Button>
          </div>
        </CardContent>
      </Card>
      {showForgotPassword && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">Reset Password</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setResetLoading(true);
                const res = await fetch('http://localhost:4000/api/reset-password', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(resetForm),
                });
                if (res.ok) {
                  toast({ title: 'Password Reset', description: 'Your password has been reset. Please login.' });
                  setShowForgotPassword(false);
                  setResetForm({ email: '', phone: '', newPassword: '' });
                } else {
                  const data = await res.json();
                  toast({ title: 'Reset Failed', description: data.error || 'Could not reset password.', variant: 'destructive' });
                }
                setResetLoading(false);
              }}
              className="space-y-3"
            >
              <div>
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={resetForm.email}
                  onChange={e => setResetForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="reset-phone">Phone Number</Label>
                <Input
                  id="reset-phone"
                  type="tel"
                  value={resetForm.phone}
                  onChange={e => setResetForm(f => ({ ...f, phone: e.target.value }))}
                  required
                  pattern="\d{10}"
                  maxLength={10}
                />
              </div>
              <div>
                <Label htmlFor="reset-password">New Password</Label>
                <Input
                  id="reset-password"
                  type="password"
                  value={resetForm.newPassword}
                  onChange={e => setResetForm(f => ({ ...f, newPassword: e.target.value }))}
                  required
                  minLength={6}
                />
              </div>
              <Button className="w-full" type="submit" disabled={resetLoading}>
                {resetLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
              <Button className="w-full mt-2" variant="outline" type="button" onClick={() => setShowForgotPassword(false)}>
                Cancel
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
