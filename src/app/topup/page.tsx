'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation'; 
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchUserProfile, fetchBalance, performTopUp } from '../../store/dashboardSlice';
import { logout } from '../../store/authSlice';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AlertDialog from '../../components/ui/AlertDialog'; 
import Link from 'next/link';

export default function TopUpPage() {
  const router = useRouter();
  const pathname = usePathname(); 
  const dispatch: AppDispatch = useDispatch();

  const { userProfile, balance, loading, error } = useSelector(
    (state: RootState) => state.dashboard
  );
  const { token: authToken, isLoading: authLoading } = useSelector((state: RootState) => state.auth);

  const [nominalInput, setNominalInput] = useState<string>('');
  const [showBalance, setShowBalance] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null); 
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null); 

  
  const [showConfirmationPopup, setShowConfirmationPopup] = useState<boolean>(false);
  const [showAlertDialog, setShowAlertDialog] = useState<boolean>(false); 
  const [alertDialogType, setAlertDialogType] = useState<'success' | 'error' | 'info'>('info'); 
  const [alertDialogTitle, setAlertDialogTitle] = useState<string>('');
  const [alertDialogMessage, setAlertDialogMessage] = useState<string>('');
  const [alertDialogButtonText, setAlertDialogButtonText] = useState<string>('');
  const [topUpAmount, setTopUpAmount] = useState<number | null>(null); 


  const presetNominals = [10000, 20000, 50000, 100000, 250000, 500000];

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
    }
  }, [authToken, authLoading, userProfile, balance, loading, error, dispatch, router]);

  const handleToggleBalance = () => {
    setShowBalance(!showBalance);
  };

  const handleNominalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setNominalInput(value);
    setSelectedPreset(null);
    setMessage(null); 
    setMessageType(null);
  };

  const handlePresetClick = (nominal: number) => {
    setSelectedPreset(nominal);
    setNominalInput(nominal.toString());
    setMessage(null); 
    setMessageType(null);
  };

  const validateTopUpAmount = (): number | null => {
    const amount = parseInt(nominalInput, 10);
    if (isNaN(amount)) {
      setMessage('Nominal harus berupa angka.');
      setMessageType('error');
      return null;
    }
    if (amount < 10000) {
      setMessage('Minimum nominal top up adalah Rp 10.000.');
      setMessageType('error');
      return null;
    }
    if (amount > 1000000) {
      setMessage('Maksimum nominal top up adalah Rp 1.000.000.');
      setMessageType('error');
      return null;
    }
    setMessage(null);
    setMessageType(null);
    return amount;
  };

  const handleInitiateTopUp = () => {
    const amount = validateTopUpAmount();
    if (amount === null) {
      return;
    }
    setTopUpAmount(amount);
    setShowConfirmationPopup(true); 
  };

  const confirmTopUp = async () => {
    if (topUpAmount === null) return;

    setShowConfirmationPopup(false); 

    try {
      await dispatch(performTopUp(topUpAmount)).unwrap();
      setAlertDialogType('success');
      setAlertDialogTitle('Berhasil!');
      setAlertDialogMessage(`Top up sebesar Rp ${topUpAmount.toLocaleString('id-ID')} berhasil dilakukan.`); 
      setAlertDialogButtonText('Kembali ke Beranda');
      setShowAlertDialog(true); 
      setNominalInput('');
      setSelectedPreset(null);
      dispatch(fetchBalance()); 
    } catch (err: any) {
      setAlertDialogType('error');
      setAlertDialogTitle('Top Up Gagal');
      setAlertDialogMessage(`Terjadi kesalahan: ${err.message || 'Silakan coba lagi.'}`);
      setAlertDialogButtonText('Coba Lagi');
      setShowAlertDialog(true); 
    } finally {
      
    }
  };

  const cancelTopUp = () => {
    setShowConfirmationPopup(false); 
    setTopUpAmount(null); 
  };

  const handleAlertDialogButtonClick = () => {
    setShowAlertDialog(false); 
    if (alertDialogType === 'success') {
      setTopUpAmount(null); 
      router.push('/'); 
    } else if (alertDialogType === 'error') {
      
      
    }
  };

  const isTopUpButtonDisabled = loading.topup || (!nominalInput && selectedPreset === null);

  if (!authToken && !authLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-100">Redirecting to login...</div>;
  }

  const overallLoading = loading.profile || loading.balance;
  if (overallLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-100"><p>Memuat data...</p></div>;
  }

  if (error.profile || error.balance) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <p className="text-red-500">Terjadi kesalahan saat memuat data:</p>
        {error.profile && <p className="text-red-500 text-sm">{error.profile}</p>}
        {error.balance && <p className="text-red-500 text-sm">{error.balance}</p>}
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Coba Lagi
        </button>
        <button onClick={() => { dispatch(logout()); router.push('/login'); }} className="mt-2 px-4 py-2 text-red-500">Logout</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans pb-8">
      {/* Top Bar */}
      <nav className="flex justify-between items-center p-4 bg-white shadow-sm">
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
        {/* Welcome and Balance Section */}
        <div className="flex items-start mb-10 gap-8">
          {/* Welcome Section (kiri) */}
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

          {/* Balance Card (kanan) */}
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

        {/* Top Up Form */}
        <div className="bg-white rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Title Section (now inside the form box) */}
          <div className="md:col-span-2">
            <p className="text-base text-gray-600">Silahkan masukan</p>
            <h3 className="text-3xl font-bold text-gray-900">Nominal Top Up</h3>
          </div>

          {/* Left Column: Input and Button */}
          <div className="flex flex-col justify-between">
            <div>
              <Input
                id="topupNominal"
                type="text"
                placeholder="masukan nominal top up"
                value={nominalInput}
                onChange={handleNominalInputChange}
                className="mb-4"
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
                    {/* Bentuk utama dompet, y dikurangi untuk geser ke atas */}
                    <rect x="3" y="3" width="18" height="12" rx="2" ry="2" />

                    {/* Garis lipatan dompet atau detail lainnya, y dikurangi */}
                    <path d="M12 3v12" />
                    <circle cx="12" cy="7" r="2" /> {/* Kancing atau logo kecil, y dikurangi */}
                  </svg>
                }
              />
              {/* Pesan Sukses/Error untuk input */}
              {message && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  messageType === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  {message}
                </div>
              )}
            </div>
            <Button
              onClick={handleInitiateTopUp} 
              disabled={isTopUpButtonDisabled}
            >
              {loading.topup ? 'Memproses...' : 'Top Up'}
            </Button>
          </div>

          {/* Right Column: Preset Nominal Buttons */}
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {presetNominals.map((nominal) => (
                <button
                  key={nominal}
                  onClick={() => handlePresetClick(nominal)}
                  className={`px-4 py-3 rounded-lg border text-lg font-semibold ${selectedPreset === nominal ? 'bg-red-500 text-white border-red-500 shadow-md' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'} transition-colors duration-200`}
                >
                  Rp {nominal.toLocaleString('id-ID')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pop-up Konfirmasi */}
      {showConfirmationPopup && topUpAmount !== null && (
        <div 
  className="fixed inset-0 flex items-center justify-center z-50 p-4"
  style={{ 
    backgroundColor: 'rgba(0, 0, 0, 0.2', 
    
    
  }}
>
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 0020 10V8m-1.447 7.447A8.003 8.003 0 0112 21a8 8 0 01-5.657-2.343M12 3v7m6.657-6.657L12 12m-6.657 6.657L12 12" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Anda yakin untuk Top Up sebesar</h3>
            <p className="text-2xl font-extrabold text-red-500 mb-6">Rp {topUpAmount.toLocaleString('id-ID')} ?</p>
            <div className="flex flex-col space-y-3">
              <p
                onClick={confirmTopUp}
                className="text-red-500 font-semibold cursor-pointer hover:text-red-600 transition-colors py-2"
              >
                Ya, lanjutkan Top Up
              </p>
              <p
                onClick={cancelTopUp}
                className="text-red-500 font-semibold cursor-pointer hover:text-red-600 transition-colors py-2"
              >
                Batalkan
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Universal AlertDialog */}
      <AlertDialog
        show={showAlertDialog}
        type={alertDialogType}
        title={alertDialogTitle}
        message={alertDialogMessage}
        buttonText={alertDialogButtonText}
        onButtonClick={handleAlertDialogButtonClick}
        amount={topUpAmount} 
        showAmount={alertDialogType === 'success'} 
      />
    </div>
  );
}