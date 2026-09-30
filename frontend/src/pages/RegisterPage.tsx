import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/useAuthStore';
import { ApiError } from '../services/api/errors';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
  }>({});

  const validateForm = () => {
    const errors: { name?: string; email?: string; password?: string; phone?: string } = {};

    if (!name.trim()) {
      errors.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // 1. Register customer with backend
      await authService.register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
      });

      // 2. Automatically log in after registration
      const loginRes = await authService.login({ email: email.trim(), password });
      setAuth(loginRes.user, loginRes.accessToken, loginRes.refreshToken);
      navigate('/account', { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.errors && error.errors.length > 0) {
          setErrorMessage(error.errors.join('. '));
        } else {
          setErrorMessage(error.message);
        }
      } else {
        setErrorMessage('Registration failed. Please check your network connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 py-4">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black">
          <Shield className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight uppercase">Join JerseyHub</h1>
        <p className="text-xs text-slate-400">Create an account to start shopping authentic sportswear</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">Create Account</CardTitle>
          <CardDescription>Enter your details below to register.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3.5 text-xs text-red-300 flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={validationErrors.name}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={validationErrors.email}
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={validationErrors.password}
                helperText="Must be at least 8 characters long"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-slate-400 hover:text-white transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Input
              label="Phone Number (Optional)"
              type="tel"
              placeholder="+880 1712 345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={validationErrors.phone}
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full mt-2"
            >
              Create Account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0 text-xs text-slate-400 justify-between">
          <span>Already have an account?</span>
          <Link to="/login" className="font-bold text-amber-400 hover:underline">
            Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};
