import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface RegisterFormProps {
  onBackToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onBackToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Registration Failed',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Registration Failed',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid 10-digit phone number.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    // Register via backend API
    try {
      const res = await fetch('http://localhost:4000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        toast({
          title: 'Registration Failed',
          description: errorData.error || 'An error occurred during registration',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }
      toast({
        title: 'Registration Successful',
        description: 'Your account has been created. Please login.',
      });
      onBackToLogin();
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: 'An error occurred during registration',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-white">MT</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">Create Account</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Join Monk Technologies Education Platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
                className="h-11"
                pattern="\d{10}"
                maxLength={10}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required
                className="h-11"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Button 
              variant="link" 
              onClick={onBackToLogin}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              Already have an account? Sign in
            </Button>
          </div>
        </CardContent>
      </Card>
      {showForgotPassword && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">Reset Password</h2>
            <p className="mb-4 text-gray-600 dark:text-gray-300">Please contact the administrator to reset your password.</p>
            <Button className="w-full" onClick={() => setShowForgotPassword(false)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
};
