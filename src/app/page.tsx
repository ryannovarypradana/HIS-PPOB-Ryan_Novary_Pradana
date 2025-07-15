'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchUserProfile, fetchBalance, fetchServices, fetchBanners } from '../store/dashboardSlice';
import { logout } from '../store/authSlice';


import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';


import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();

  const { userProfile, balance, services, banners, loading, error } = useSelector(
    (state: RootState) => state.dashboard
  );
  const authLoading = useSelector((state: RootState) => state.auth.isLoading);
  const authToken = useSelector((state: RootState) => state.auth.token);

  const [showBalance, setShowBalance] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!authToken && !authLoading) {
      router.push('/login');
      return;
    }

    if (authToken) {
      if (!userProfile && !loading.profile && !error.profile) {
        dispatch(fetchUserProfile());
      }
      if (!balance && !loading.balance && !error.balance) {
        dispatch(fetchBalance());
      }
      if (services.length === 0 && !loading.services && !error.services) {
        dispatch(fetchServices());
      }
      if (banners.length === 0 && !loading.banners && !error.banners) {
        dispatch(fetchBanners());
      }
    }
  }, [authToken, authLoading, userProfile, balance, services, banners, loading, error, dispatch, router]);

  const handleToggleBalance = () => {
    setShowBalance(!showBalance);
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  if (!isClient || authLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-100"><p>Memuat...</p></div>;
  }

  if (!authToken) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-100">Redirecting to login...</div>;
  }

  if (loading.profile || loading.balance || loading.services || loading.banners) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-100"><p>Memuat data dashboard...</p></div>;
  }

  if (error.profile || error.balance || error.services || error.banners) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <p className="text-red-500 text-center mb-4">Terjadi kesalahan saat memuat data:</p>
        {error.profile && <p className="text-red-500 text-sm">{error.profile}</p>}
        {error.balance && <p className="text-red-500 text-sm">{error.balance}</p>}
        {error.services && <p className="text-red-500 text-sm">{error.services}</p>}
        {error.banners && <p className="text-red-500 text-sm">{error.banners}</p>}
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
          Coba Lagi
        </button>
        <button onClick={handleLogout} className="mt-2 px-4 py-2 text-red-500 border border-red-500 rounded hover:bg-red-50 text-red-600 transition-colors">Logout</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-8">
      {/* Top Bar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
        <Link href="/" passHref>
        <div className="flex items-center cursor-pointer"> {/* Tambahkan cursor-pointer untuk indikasi visual */}
          <Image src="/images/Logo.png" alt="SIMS PPOB Logo" width={24} height={24} className="mr-2"/>
          <span className="text-red-500 font-bold text-lg">SIMS PPOB</span>
        </div>
      </Link>
        <div className="flex space-x-6 text-gray-700 font-semibold text-sm">
          <button onClick={() => router.push('/topup')} className="hover:text-red-500 transition-colors">Top Up</button>
          <button onClick={() => router.push('/transaction')} className="hover:text-red-500 transition-colors">Transaction</button>
          <button onClick={() => router.push('/profile')} className="hover:text-red-500 transition-colors">Akun</button>
        </div>
      </nav>

      <div className="container mx-auto px-8 mt-10">
        
        <div className="flex items-start mb-10 gap-8">
          
          <div className="w-7/12 min-w-0">
            <Image
              src={userProfile?.profile_image || "/images/Profile Photo.png"}
              alt="User Avatar"
              width={72}
              height={72}
              className="rounded-full mb-3 object-cover"
            />
            <div>
              <p className="text-lg text-gray-600">Selamat datang,</p>
              
              <h2 className="text-3xl font-extrabold text-gray-900 mt-0.5 break-words">
                {userProfile?.first_name} {userProfile?.last_name}
              </h2>
            </div>
          </div>

          
          <div className="w-5/12 bg-red-500 text-white rounded-xl p-6 shadow-lg relative overflow-hidden">
            
            <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-400 opacity-20 transform -skew-y-3 scale-110"></div>
            <div className="relative z-10">
              <p className="text-sm opacity-90 mb-2">Saldo anda</p>
              <p className="text-4xl font-extrabold h-12">
                Rp {showBalance ? (balance?.balance || 0).toLocaleString('id-ID') : '••••••••'}
              </p>
              <button
                onClick={handleToggleBalance}
                className="flex items-center gap-1.5 text-xs opacity-90 mt-2 hover:opacity-100 transition-opacity focus:outline-none"
                aria-label={showBalance ? "Sembunyikan saldo" : "Tampilkan saldo"}
              >
                <span>{showBalance ? 'Sembunyikan' : 'Lihat'} Saldo</span>
                {showBalance ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.879 9.879l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Service Grid */}
        <div className="mb-10">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
            {services.map((service) => (
              <button
                key={service.service_code}
                
                onClick={() => router.push(`/payment?service_code=${service.service_code}`)}
                className="flex flex-col items-center justify-start text-center group"
              >
                <Image
                  src={service.service_icon}
                  alt={service.service_name}
                  width={36}
                  height={36}
                  className="mb-2"
                />
                <span className="text-xs font-medium text-gray-700 group-hover:text-red-500 transition-colors leading-tight">{service.service_name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Promotional Banners */}
        <h3 className="text-xl font-bold text-gray-800 mb-5">Temukan promo menarik</h3>
        {banners.length > 0 ? (
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              
              640: {
                slidesPerView: 2,
              },
              
              1024: {
                slidesPerView: 3,
              },
            }}
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            loop={true}
            className="pb-10" 
          >
            {banners.map((banner) => (
              <SwiperSlide key={banner.banner_name}>
                <div className="w-full h-[10rem] rounded-lg shadow-md overflow-hidden relative">
                  <Image src={`/images/${banner.banner_name}.png`}  alt={banner.banner_name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <p className="text-center text-gray-500 w-full py-10">Tidak ada promo menarik.</p>
        )}
      </div>
    </div>
  );
}