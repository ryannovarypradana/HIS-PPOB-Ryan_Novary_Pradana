
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

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isLoading, error: authError } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordMismatchError, setPasswordMismatchError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    setPasswordMismatchError(null); 

    if (email.length === 0 || firstName.length === 0 || lastName.length === 0 || password.length === 0 || confirmPassword.length === 0) {
      toast.error('Semua field wajib diisi.');
      return false;
    }
    if (password !== confirmPassword) {
      setPasswordMismatchError('Password tidak sama.'); 
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    dispatch(setAuthError(null)); 
    setPasswordMismatchError(null); 

    
    
    if (!validateForm()) {
      return;
    }

    dispatch(setLoading(true));
    try {
      
      const data: ApiResponse<any> = await postData<any>('/registration', {
        email,
        first_name: firstName,
        last_name: lastName,
        password,
      });

      if (data.status === 0) {
        
        toast.success('Registrasi Berhasil! Anda akan diarahkan ke halaman login.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        const errorMessage = data.message || 'Terjadi kesalahan saat registrasi.';
        dispatch(setAuthError(errorMessage)); 
        toast.error(`Registrasi Gagal: ${errorMessage}`);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Gagal terhubung ke server.';
      dispatch(setAuthError(errorMessage)); 
      toast.error(`Terjadi kesalahan: ${errorMessage}`);
    } finally {
      dispatch(setLoading(false));
    }
  };

  
  const isButtonDisabled: boolean = isLoading;

  return (
    <div className="flex flex-col md:flex-row min-h-screen font-sans">
      {/* Kiri - Form Registrasi */}
      <section className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-md">
          <h2 className="text-red-500 text-2xl font-bold text-center mb-4">SIMS PPOB</h2>
          <h1 className="text-gray-800 text-3xl text-center mb-8">
            Lengkapi data untuk <br /> membuat akun
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="email"
              type="email"
              placeholder="masukkan email anda"
              icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H4.5a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5H4.5a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.25 8.916A2.25 2.25 0 0 1 2.25 6.993V6.75" /></svg>} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              id="firstName"
              type="text"
              placeholder="Nama Depan"
              icon={<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                      <path d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 10c-4.42 0-8 3.58-8 8v1h16v-1c0-4.42-3.58-8-8-8z"/>
                    </svg>}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <Input
              id="lastName"
              type="text"
              placeholder="Nama Belakang"
              icon={<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                      <path d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 10c-4.42 0-8 3.58-8 8v1h16v-1c0-4.42-3.58-8-8-8z"/>
                    </svg>}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
            <Input
              id="password"
              type="password"
              placeholder="Buat Password"
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
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Konfirmasi Password"
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
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {passwordMismatchError && (
              <div className="mt-2 text-red-500 text-sm text-right">
                {passwordMismatchError}
              </div>
            )}
            
            <Button type="submit" disabled={isButtonDisabled} className="mt-6">
              {isLoading ? 'Memuat...' : 'Registrasi'}
            </Button>
          </form>

          <p className="mt-6 text-gray-600 text-sm">
            Sudah punya akun?{' '}
            <a href="/login" className="text-red-500 hover:underline font-bold">
              Login disini
            </a>
          </p>
        </div>
      </section>

      {/* Kanan - Ilustrasi */}
      <section className="hidden md:flex flex-1 bg-[#FFF5F5] relative">
        <Image
          src="/images/Illustrasi Login.png" 
          alt="Ilustrasi Registrasi"
          fill
          className="object-cover"
          priority
        />
      </section>
    </div>
  );
}
