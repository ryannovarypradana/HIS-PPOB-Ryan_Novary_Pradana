import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';

// Gunakan di seluruh aplikasi Anda, bukan `useDispatch` biasa
export const useAppDispatch: () => AppDispatch = useDispatch;
