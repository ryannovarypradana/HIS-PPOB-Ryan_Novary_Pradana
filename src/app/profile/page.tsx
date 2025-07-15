'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchBalance } from '../../store/dashboardSlice';
import {
  fetchUserProfile,
  updateUserProfile,
  updateProfileImage,
  resetProfileState,
  clearUpdateProfileError,
  clearUpdateProfileImageError 
} from '../../store/profileSlice';
import { logout } from '../../store/authSlice';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch: AppDispatch = useDispatch();

  const [hasMounted, setHasMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const tokenErrorNotified = useRef(false);

  const { userProfile, loading: profileLoading, error: profileError } = useSelector(
    (state: RootState) => state.profile
  );
  const { balance, loading: dashboardLoading, error: dashboardError } = useSelector(
    (state: RootState) => state.dashboard
  );
  const { token: authToken, isLoading: authLoading } = useSelector((state: RootState) => state.auth);

  // Fix hydration
  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (authToken) {
      if (!userProfile && !profileLoading.profile && !profileError.profile) {
        dispatch(fetchUserProfile());
      }
      if (!balance && !dashboardLoading.balance && !dashboardError.balance) {
        dispatch(fetchBalance());
      }
    }
  }, [authToken, userProfile, balance, profileLoading.profile, profileError.profile, dashboardLoading.balance, dashboardError.balance, dispatch]);

  useEffect(() => {
    if (userProfile) {
      setEmail(userProfile.email);
      setFirstName(userProfile.first_name);
      setLastName(userProfile.last_name);
    }
  }, [userProfile]);

  useEffect(() => {
    dispatch(clearUpdateProfileError());
    dispatch(clearUpdateProfileImageError());

    if (!isEditing) {
      toast.dismiss();
    }
  }, [isEditing, dispatch]);

  useEffect(() => {
    const tokenInvalidError = 'Token tidak tidak valid atau kadaluwarsa';
    if (
      (profileError.profile && profileError.profile.includes(tokenInvalidError)) ||
      (dashboardError.balance && dashboardError.balance.includes(tokenInvalidError))
    ) {
      if (!tokenErrorNotified.current) {
        toast.error('Sesi Anda telah berakhir. Silakan masuk kembali.');
        tokenErrorNotified.current = true;
        handleLogout();
      }
    } else {
      tokenErrorNotified.current = false;
    }
  }, [profileError.profile, dashboardError.balance]);

  useEffect(() => {
    if (!authToken && !authLoading) {
      router.push('/login');
    }
  }, [authToken, authLoading, router]);

  const handleEditProfile = () => setIsEditing(true);

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (userProfile) {
      setEmail(userProfile.email);
      setFirstName(userProfile.first_name);
      setLastName(userProfile.last_name);
    }
  };

  const handleSaveProfile = async () => {
    if (!firstName || !lastName) {
      toast.error('Nama Depan dan Nama Belakang tidak boleh kosong.');
      return;
    }

    if (userProfile?.first_name === firstName && userProfile?.last_name === lastName) {
      toast.success('Tidak ada perubahan pada profil.');
      setIsEditing(false);
      return;
    }

    try {
      await toast.promise(
        dispatch(updateUserProfile({ first_name: firstName, last_name: lastName })).unwrap(),
        {
          loading: 'Menyimpan profil...',
          success: 'Profil berhasil diperbarui!',
          error: (err) => {
            const errorMessage = err?.message || 'Terjadi kesalahan saat memperbarui profil.';
            return `Gagal: ${errorMessage}`;
          },
        }
      );
      setIsEditing(false);
    } catch {}
  };

  const handleProfileImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024) {
      toast.error('Ukuran gambar maksimum adalah 100 KB.');
      fileInputRef.current!.value = '';
      return;
    }

    const acceptedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!acceptedTypes.includes(file.type)) {
      toast.error('Hanya file JPEG, JPG, atau PNG yang diizinkan.');
      fileInputRef.current!.value = '';
      return;
    }

    try {
      await toast.promise(
        dispatch(updateProfileImage(file)).unwrap(),
        {
          loading: 'Mengunggah gambar...',
          success: 'Gambar profil berhasil diperbarui!',
          error: (err) => {
            const errorMessage = err?.message || 'Terjadi kesalahan saat mengunggah gambar.';
            return `Gagal: ${errorMessage}`;
          },
        }
      );
    } catch {} finally {
      fileInputRef.current!.value = '';
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetProfileState());
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userToken');
    }
    router.push('/login');
  };

  // ❗ Pastikan halaman hanya dirender setelah mount
  if (!hasMounted || !authToken) return null;

  if (authLoading || profileLoading.profile || dashboardLoading.balance) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p>Memuat data profil...</p>
      </div>
    );
  }

  if (profileError.profile || dashboardError.balance) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <p className="text-red-500">Terjadi kesalahan saat memuat data:</p>
        {profileError.profile && <p className="text-red-500 text-sm">{profileError.profile}</p>}
        {dashboardError.balance && <p className="text-red-500 text-sm">{dashboardError.balance}</p>}
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Coba Lagi
        </button>
        <button onClick={handleLogout} className="mt-2 px-4 py-2 text-red-500">Logout</button>
        <Toaster position="top-center" reverseOrder={false} />
      </div>
    );
  }

  
  return (
    <div className="min-h-screen bg-white font-sans pb-8">
      

      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
        <Link href="/" passHref>
                <div className="flex items-center cursor-pointer"> {/* Tambahkan cursor-pointer untuk indikasi visual */}
                  <Image src="/images/Logo.png" alt="SIMS PPOB Logo" width={24} height={24} className="mr-2"/>
                  <span className="text-red-500 font-bold text-lg">SIMS PPOB</span>
                </div>
              </Link>
        <div className="flex space-x-6 text-gray-700 font-semibold">
          <button
            onClick={() => router.push('/topup')}
            className={`transition-colors ${
              pathname === '/topup' ? 'text-red-500' : 'hover:text-red-500'
            }`}
          >
            Top Up
          </button>
          <button
            onClick={() => router.push('/transaction')}
            className={`transition-colors ${
              pathname === '/transaction' ? 'text-red-500' : 'hover:text-red-500'
            }`}
          >
            Transaction
          </button>
          <button
            onClick={() => router.push('/profile')}
            className={`transition-colors ${
              pathname === '/profile' ? 'text-red-500' : 'hover:text-red-500'
            }`}
          >
            Akun
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 mt-8">
        <div className="bg-white rounded-lg p-6 text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <Image
              src={userProfile?.profile_image || "/images/Profile Photo.png"}
              alt="Profile Picture"
              fill={true}
              style={{ objectFit: 'cover' }}
              className="rounded-full border-2 border-gray-300 cursor-pointer"
              onClick={handleProfileImageClick}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={true}
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/png, image/jpeg, image/jpg"
            />
            <div className="absolute bottom-0 right-0 bg-gray-800 rounded-full p-1 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14.25v4.5m-2.25-2.25h4.5" />
              </svg>
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-800 mb-6">{userProfile?.first_name} {userProfile?.last_name}</h3>

          <div className="space-y-4 mb-6">
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="email anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly={true}
              className="bg-gray-50 cursor-not-allowed"
              icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H4.5a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5H4.5a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.25 8.916A2.25 2.25 0 0 1 2.25 6.993V6.75" /></svg>}
            />
            <Input
              id="firstName"
              label="Nama Depan"
              type="text"
              placeholder="nama depan anda"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              readOnly={!isEditing}
              className={!isEditing ? "bg-gray-50 cursor-not-allowed" : ""}
              icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM12 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM4.505 8.76A3.497 3.497 0 0 0 7.5 7.5h.75a2.25 2.25 0 0 1 2.25 2.25v2.25a2.25 2.25 0 0 1-2.25 2.25H7.5a3.497 3.497 0 0 0-2.995 1.5ZM17.25 15.75h-.75a2.25 2.25 0 0 1-2.25-2.25V11.25a2.25 2.25 0 0 1 2.25-2.25h.75a3.497 3.497 0 0 1 2.995 1.5A3.497 3.497 0 0 1 21 12c0 1.57-.655 3.018-1.71 4.093l-.79.791ZM12 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-4.243-2.432-1.768-1.768A10.474 10.474 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395m-4.243-2.432-1.768-1.768A10.474 10.474 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395" /></svg>}
            />
            <Input
              id="lastName"
              label="Nama Belakang"
              type="text"
              placeholder="nama belakang anda"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              readOnly={!isEditing}
              className={!isEditing ? "bg-gray-50 cursor-not-allowed" : ""}
              icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 6.75 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14.25v4.5m-2.25-2.25h4.5" /></svg>}
            />
          </div>

          {isEditing ? (
            <div className="flex space-x-4">
              <Button
                onClick={handleSaveProfile}
                disabled={profileLoading.updateProfile}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                {profileLoading.updateProfile ? 'Menyimpan...' : 'Simpan'}
              </Button>
              <Button
                onClick={handleCancelEdit}
                disabled={profileLoading.updateProfile}
                className="flex-1 bg-gray-300 text-gray-800 hover:bg-gray-400"
              >
                Batalkan
              </Button>
            </div>
          ) : (
            <>
              <Button
                onClick={handleEditProfile}
                className="bg-red-500 hover:bg-red-600"
              >
                Edit Profile
              </Button>
              <Button
                onClick={handleLogout}
                className="mt-4 bg-gray-700 hover:bg-gray-800 text-white"
              >
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}