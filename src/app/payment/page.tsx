'use client';
import React, { useEffect, useState, Suspense } from 'react'; // Import Suspense
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchUserProfile, fetchBalance } from '../../store/dashboardSlice';
import { fetchServicesForPayment, setSelectedService, performPayment, resetPaymentState } from '../../store/paymentSlice';
import { logout } from '../../store/authSlice';
import { Service } from '../../store/paymentSlice';
import Button from '@/components/ui/Button';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';

// Create a separate component for the logic that uses useSearchParams
function PaymentPageContent() {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const searchParams = useSearchParams(); // This is now inside the Suspense boundary

  const { userProfile, balance, loading: dashboardLoading, error: dashboardError } = useSelector(
    (state: RootState) => state.dashboard
  );
  const { services, selectedService, loading: paymentLoading, error: paymentError } = useSelector(
    (state: RootState) => state.payment
  );
  const { token: authToken, isLoading: authLoading } = useSelector((state: RootState) => state.auth);

  const [mounted, setMounted] = useState(false);
  const [showBalance, setShowBalance] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (!authToken && !authLoading) {
        router.push('/login');
        return;
      }

      if (authToken) {
        if (!userProfile && !dashboardLoading.profile && !dashboardError.profile) {
          dispatch(fetchUserProfile());
        }
        if (!balance && !dashboardLoading.balance && !dashboardError.balance) {
          dispatch(fetchBalance());
        }
        if (services.length === 0 && !paymentLoading.fetchServices && !paymentError.fetchServices) {
          dispatch(fetchServicesForPayment());
        }
      }
    }
  }, [authToken, authLoading, userProfile, balance, services.length, dashboardLoading, dashboardError, paymentLoading, paymentError, router, mounted, dispatch]);

  useEffect(() => {
    if (mounted && services.length > 0) {
      const serviceCodeFromUrl = searchParams.get('service_code');
      if (serviceCodeFromUrl) {
        const foundService = services.find(
          (service) => service.service_code.toLowerCase() === serviceCodeFromUrl.toLowerCase()
        );
        if (foundService) {
          dispatch(setSelectedService(foundService));
        } else {
          toast.error('Layanan yang diminta tidak ditemukan.');
          dispatch(setSelectedService(null));
        }
      } else {
        dispatch(setSelectedService(null));
      }
    }
  }, [services, searchParams, dispatch, mounted]);

  useEffect(() => {
    return () => {
      dispatch(resetPaymentState());
    };
  }, [dispatch]);

  const handleToggleBalance = () => {
    setShowBalance(!showBalance);
  };

  const handlePayment = async () => {
    if (!selectedService) {
      toast.error('Silakan pilih layanan yang akan dibayar.');
      return;
    }

    if (balance && selectedService.service_tariff > balance.balance) {
        toast.error('Saldo tidak cukup untuk melakukan pembayaran ini.');
        return;
    }

    try {
      await dispatch(performPayment({
        service_code: selectedService.service_code,
        service_amount: selectedService.service_tariff,
      })).unwrap();

      const successMessage = `Pembayaran ${selectedService.service_name} sebesar Rp ${selectedService.service_tariff.toLocaleString('id-ID')} berhasil!`;
      toast.success(successMessage);

      dispatch(fetchBalance());
      dispatch(setSelectedService(null));
      router.push('/');
    } catch (err: any) {
      const errorMessage = `Pembayaran Gagal: ${err?.message || 'Terjadi kesalahan.'}`;
      toast.error(errorMessage);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  if (!mounted || (authLoading && !authToken)) {
    return <div className="flex items-center justify-center min-h-screen bg-white">Memuat...</div>;
  }

  if (!authToken) {
    return <div className="flex items-center justify-center min-h-screen bg-white">Redirecting to login...</div>;
  }

  const overallLoading = dashboardLoading.profile || dashboardLoading.balance || paymentLoading.fetchServices;
  if (overallLoading && !userProfile && !balance && services.length === 0) {
    return <div className="flex items-center justify-center min-h-screen bg-white"><p>Memuat data pembayaran...</p></div>;
  }

  const overallError = dashboardError.profile || dashboardError.balance || paymentError.fetchServices;
  if (overallError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <p className="text-red-500">Terjadi kesalahan saat memuat data:</p>
        {dashboardError.profile && <p className="text-red-500 text-sm">{dashboardError.profile}</p>}
        {dashboardError.balance && <p className="text-red-500 text-sm">{dashboardError.balance}</p>}
        {paymentError.fetchServices && <p className="text-red-500 text-sm">{paymentError.fetchServices}</p>}
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Coba Lagi
        </button>
        <button onClick={handleLogout} className="mt-2 px-4 py-2 text-red-500">Logout</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans pb-8">
      <Toaster />

      {/* Top Bar - Disamakan dengan Dashboard */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
        <Link href="/" passHref>
                <div className="flex items-center cursor-pointer">
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
              src={userProfile?.profile_image || "/images/profile-placeholder.png"}
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

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 uppercase">PEMBAYARAN</h3>

          {paymentLoading.fetchServices && <p className="text-center text-gray-500">Memuat layanan...</p>}
          {paymentError.fetchServices && <p className="text-red-500 text-center">Error memuat layanan: {paymentError.fetchServices}</p>}
          {!selectedService && !paymentLoading.fetchServices && (
            <p className="text-center text-gray-500">Silakan pilih layanan dari halaman utama atau masukkan kode layanan di URL.</p>
          )}

          {selectedService && (
            <div className="mb-6">
              <button
                key={selectedService.service_code}
                className={`
                  flex items-center p-3 rounded-lg
                  shadow-md
                  transition-colors duration-200
                `}
              >
                <Image src={selectedService.service_icon} alt={selectedService.service_name} width={40} height={40} className="mr-4"/>
                <span className="text-sm font-semibold">{selectedService.service_name}</span>
              </button>
            </div>
          )}

          {selectedService && (
            <div className="mb-6">
              <div className="relative border border-gray-300 rounded-lg p-4 flex items-center">
                <span className="text-gray-500 mr-2">Rp</span>
                <input
                  type="text"
                  value={selectedService.service_tariff.toLocaleString('id-ID')}
                  readOnly
                  className="flex-grow bg-white outline-none text-gray-800 font-semibold"
                />
              </div>
            </div>
          )}

          <Button
            onClick={handlePayment}
            disabled={!selectedService || paymentLoading.performPayment}
          >
            {paymentLoading.performPayment ? 'Memproses Pembayaran...' : 'BAYAR'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    // Wrap the component that uses useSearchParams with Suspense
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-white">Memuat halaman pembayaran...</div>}>
      <PaymentPageContent />
    </Suspense>
  );
}