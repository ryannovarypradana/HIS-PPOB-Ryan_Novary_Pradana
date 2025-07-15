
'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { postData } from '../../lib/api';
import { ApiResponse, AuthSuccessData } from '../../types/api';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setAuthSuccess, setAuthError } from '../../store/authSlice';
import { RootState } from '../../store';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isLoading, error: authError } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const validateForm = (): boolean => {
    return email.length > 0 && password.length > 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    dispatch(setAuthError(null));

    if (!validateForm()) {
      toast.error('Email dan Password harus diisi.');
      return;
    }

    dispatch(setLoading(true));
    try {
      const data: ApiResponse<AuthSuccessData> = await postData<AuthSuccessData>('/login', { email, password });

      if (data.status === 0 && data.data?.token) {
        dispatch(setAuthSuccess(data.data.token));
        toast.success('Login Berhasil!');
        router.push('/'); 
      } else {
        const errorMessage = data.message || 'Email atau password salah.';
        dispatch(setAuthError(errorMessage));
        toast.error(`Login Gagal: ${errorMessage}`);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Gagal terhubung ke server.';
      dispatch(setAuthError(errorMessage));
      toast.error(`${errorMessage}`);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const isButtonDisabled: boolean = !validateForm() || isLoading;

  return (
  <div className="flex flex-col md:flex-row min-h-screen font-sans">
    {/* Kiri - Form Login */}
    <section className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-white">
      <div className="w-full max-w-md">
        <h1 className="text-red-500 text-3xl font-bold text-center mb-2">SIMS PPOB</h1>
        <h2 className="text-gray-800 text-xl text-center mb-6">Masuk atau buat akun untuk memulai</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="email"
            type="email"
            placeholder="Email"
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H4.5a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5H4.5a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.25 8.916A2.25 2.25 0 0 1 2.25 6.993V6.75" /></svg>}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="password"
            type="password"
            placeholder="Password"
             icon={
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      <rect x="5" y="10" width="14" height="10" rx="2" ry="2" />
      <path d="M8 10V7a4 4 0 1 1 8 0v3" />
      <path d="M12 14v2" />
    </svg>
  }
            isPasswordToggle={true}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" disabled={isButtonDisabled} className="w-full">
            {isLoading ? 'Memuat...' : 'Masuk'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Belum punya akun?{' '}
          <a href="/register" className="text-red-500 font-semibold hover:underline">
            registrasi di sini
          </a>
        </p>
      </div>
    </section>

    {/* Kanan - Ilustrasi */}
    <section className="hidden md:flex flex-1 bg-[#FFF5F5] relative">
      <Image
        src="/images/Illustrasi Login.png"
        alt="Ilustrasi Login"
        fill
        className="object-cover"
        priority
      />
    </section>
  </div>
);

}
