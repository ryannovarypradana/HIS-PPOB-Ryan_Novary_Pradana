'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useRouter,usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchTransactionHistory, resetHistoryState } from '../../store/transactionHistorySlice';
import { fetchUserProfile, fetchBalance, fetchServices, fetchBanners } from '../../store/dashboardSlice';
import { logout } from '../../store/authSlice';


import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';


import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Link from 'next/link';

interface Transaction {
  invoice_number: string;
  transaction_type: string;
  total_amount: number;
  description: string;
  created_on: string;
}

export default function TransactionHistoryPage() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch: AppDispatch = useDispatch();

  const { transactions, offset, limit, hasMore, isLoading, error: transactionError } = useSelector(
    (state: RootState) => state.transactionHistory
  );
  const { userProfile, balance, services, banners, loading: dashboardLoading, error: dashboardError } = useSelector(
    (state: RootState) => state.dashboard
  );
  const { token: authToken, isLoading: authLoading } = useSelector((state: RootState) => state.auth);

  const [selectedMonth, setSelectedMonth] = useState<string>('Semua');
  const [showBalance, setShowBalance] = useState(false);
  const [isClient, setIsClient] = useState(false);

  
  
  const isInitialTransactionFetchTriggered = useRef(false);

  const monthMap: { [key: string]: number } = {
    'Maret': 2,
    'Mei': 4,
    'Juni': 5,
    'Juli': 6,
    'Agustus': 7,
    'September': 8,
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  
  
  
  const fetchTransactions = useCallback((reset: boolean = false) => {
    if (!authToken) {
      console.log("Fetch Transactions: No auth token, skipping.");
      return;
    }
    
    
    if (isLoading && !reset) {
        console.log("Fetch Transactions: Already loading, skipping.");
        return;
    }

    
    const currentOffset = reset ? 0 : offset;
    let params: { offset: number; limit: number; month?: number } = {
      offset: currentOffset,
      limit, 
    };

    if (selectedMonth !== 'Semua') {
      params.month = monthMap[selectedMonth];
    }

    console.log(`[Fetch Call] Dispatching fetchTransactionHistory with offset: ${params.offset}, limit: ${params.limit}, month: ${params.month}, reset: ${reset}`);
    dispatch(fetchTransactionHistory(params));
  }, [authToken, offset, limit, selectedMonth, dispatch, isLoading]); 


  
  useEffect(() => {
    if (!authToken && !authLoading) {
      console.log("[Auth Effect] No auth token or auth loading done, redirecting to login.");
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
      if (services.length === 0 && !dashboardLoading.services && !dashboardError.services) {
        dispatch(fetchServices());
      }
      if (banners.length === 0 && !dashboardLoading.banners && !dashboardError.banners) {
        dispatch(fetchBanners());
      }
      
      
      
      
      if (!isInitialTransactionFetchTriggered.current && authToken) {
          console.log("[Auth Effect] Initial transaction fetch triggered.");
          fetchTransactions(true); 
          isInitialTransactionFetchTriggered.current = true; 
      }
    }
  }, [authToken, authLoading, dispatch, router, userProfile, balance, services, banners, dashboardLoading, dashboardError, fetchTransactions]);

  
  
  
  useEffect(() => {
    
    
    if (!isClient || !authToken) {
        return;
    }

   
  }, [selectedMonth, authToken, fetchTransactions, isClient]); 

  
  const handleShowMore = () => {
    
    if (!isLoading && hasMore) {
      console.log("[Show More] Showing more transactions.");
      fetchTransactions(false); 
    } else if (isLoading) {
      console.log("[Show More] Already loading, cannot show more.");
    } else if (!hasMore) {
      console.log("[Show More] No more transactions to show.");
    }
  };

  
  const handleMonthClick = (month: string) => {
    if (selectedMonth !== month) {
      console.log(`[Handle Month Click] Changing month from ${selectedMonth} to ${month}.`);
      
      
      dispatch(resetHistoryState());
      setSelectedMonth(month);
      
      
      fetchTransactions(true); 
    } else {
        console.log(`[Handle Month Click] Month is already ${month}, no change.`);
    }
  };

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

  const isDashboardDataLoading = dashboardLoading.profile || dashboardLoading.balance || dashboardLoading.services || dashboardLoading.banners;
  
  
  const isInitialTransactionLoading = isLoading && transactions.length === 0;

  if (isDashboardDataLoading || isInitialTransactionLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-100"><p>Memuat data...</p></div>;
  }

  const hasDashboardError = dashboardError.profile || dashboardError.balance || dashboardError.services || dashboardError.banners;
  const hasTransactionError = transactionError;

  if (hasDashboardError || hasTransactionError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <p className="text-red-500 text-center mb-4">Terjadi kesalahan saat memuat data:</p>
        {dashboardError.profile && <p className="text-red-500 text-sm">{dashboardError.profile}</p>}
        {dashboardError.balance && <p className="text-red-500 text-sm">{dashboardError.balance}</p>}
        {dashboardError.services && <p className="text-red-500 text-sm">{dashboardError.services}</p>}
        {dashboardError.banners && <p className="text-red-500 text-sm">{dashboardError.banners}</p>}
        {transactionError && <p className="text-red-500 text-sm">{transactionError}</p>}
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

      <div className="container mx-auto px-8 mt-10">
        {/* Welcome Section */}
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

          {/* Balance Card */}
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

        {/* Transaction History List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">History Transaksi</h3>
          
          {/* Month Filters */}
          <div className="flex space-x-4 mb-6 text-gray-600 font-semibold text-lg overflow-x-auto pb-2 -mx-6 px-6">
            {['Semua', 'Maret', 'Mei', 'Juni', 'Juli', 'Agustus', 'September'].map((month) => (
              <button
                key={month}
                onClick={() => handleMonthClick(month)}
                className={`whitespace-nowrap px-3 py-1 rounded-full transition-colors duration-200 ${
                  selectedMonth === month ? 'bg-red-500 text-white' : 'hover:text-red-500'
                }`}
              >
                {month}
              </button>
            ))}
          </div>

          {transactionError && <p className="text-red-500 text-center mb-4">Error: {transactionError}</p>}

          {transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((transaction: Transaction) => (
                <div key={transaction.invoice_number} className="flex justify-between items-center border-b pb-3 last:border-b-0 last:pb-0">
                  <div>
                    <p className={`font-semibold ${transaction.transaction_type === 'TOPUP' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.transaction_type === 'TOPUP' ? '+' : '-'} Rp {transaction.total_amount.toLocaleString('id-ID')}
                    </p>
                    <p className="text-sm text-gray-500">{transaction.description}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(transaction.created_on).toLocaleString('id-ID', {
                        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className="text-sm text-gray-600">{transaction.transaction_type === 'TOPUP' ? 'Top Up Saldo' : 'Pembayaran'}</span>
                </div>
              ))}
            </div>
          ) : (
            
            !isLoading && !transactionError && <p className="text-center text-gray-500">Tidak ada riwayat transaksi.</p>
          )}

          {/* Indikator loading lebih banyak */}
          {isLoading && transactions.length > 0 && (
            <p className="text-center text-blue-500 mt-4">Memuat lebih banyak...</p>
          )}

          {/* Tombol Show More */}
          {hasMore && !isLoading && (
            <div className="text-center mt-6">
              <button
                onClick={handleShowMore}
                className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                Show more
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}