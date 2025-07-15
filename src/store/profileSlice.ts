import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { postData, getData, putData, putBinaryData } from '../lib/api';
import { ApiResponse } from '../types/api';

export interface UserProfile {
  email: string;
  first_name: string;
  last_name: string;
  profile_image?: string;
}

interface ThunkConfig {
  rejectValue: string;
}

interface ProfileState {
  userProfile: UserProfile | null | undefined;
  loading: {
    profile: boolean;
    updateProfile: boolean;
    updateProfileImage: boolean;
  };
  error: {
    profile: string | null;
    updateProfile: string | null;
    updateProfileImage: string | null;
  };
}

const initialState: ProfileState = {
  userProfile: null,
  loading: {
    profile: false,
    updateProfile: false,
    updateProfileImage: false,
  },
  error: {
    profile: null,
    updateProfile: null,
    updateProfileImage: null,
  },
};

export const fetchUserProfile = createAsyncThunk(
  'profile/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getData<UserProfile>('/profile');
      if (response.data === undefined) {
        return rejectWithValue('API response data is undefined');
      }
      return response.data;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch user profile.';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'profile/updateUserProfile',
  async (profileData: { first_name: string; last_name: string }, { rejectWithValue }) => {
    try {
      const response = await putData<UserProfile>('/profile/update', profileData);
       if (response.data === undefined) {
        return rejectWithValue('API response data is undefined');
      }
      return response.data;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update user profile.';
      return rejectWithValue(errorMessage);
    }
  }
);



export const updateProfileImage = createAsyncThunk<UserProfile, File, ThunkConfig>(
  'profile/updateProfileImage',
  async (file, { rejectWithValue }) => {
    try {
      
      const response = await putBinaryData<UserProfile>('/profile/image', file);

      if (!response.data) {
        return rejectWithValue('No user data returned from server.');
      }

      return response.data;
    } catch (err: any) {
      const errorMessage = err?.message || 'Gagal mengunggah gambar profil.';
      return rejectWithValue(errorMessage);
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setUserProfile(state, action: PayloadAction<UserProfile | null>) {
      state.userProfile = action.payload;
    },
    resetProfileState(state) {
      state.userProfile = null;
      state.loading = { profile: false, updateProfile: false, updateProfileImage: false };
      state.error = { profile: null, updateProfile: null, updateProfileImage: null };
    },
    clearUpdateProfileError(state) {
      state.error.updateProfile = null;
    },
    clearUpdateProfileImageError(state) {
      state.error.updateProfileImage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading.profile = true;
        state.error.profile = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<UserProfile | undefined>) => {
        state.loading.profile = false;
        state.userProfile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading.profile = false;
        state.error.profile = action.payload as string;
        state.userProfile = null;
      })
      
      .addCase(updateUserProfile.pending, (state) => {
        state.loading.updateProfile = true;
        state.error.updateProfile = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action: PayloadAction<UserProfile | undefined>) => {
        state.loading.updateProfile = false;
        state.userProfile = action.payload;
        state.error.updateProfile = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading.updateProfile = false;
        state.error.updateProfile = action.payload as string;
      })
      
      .addCase(updateProfileImage.pending, (state) => {
        state.loading.updateProfileImage = true;
        state.error.updateProfileImage = null;
      })
      .addCase(updateProfileImage.fulfilled, (state, action: PayloadAction<UserProfile>) => {
       
        state.loading.updateProfileImage = false;
        state.userProfile = action.payload; 
      })
      .addCase(updateProfileImage.rejected, (state, action) => {
        state.loading.updateProfileImage = false;
        state.error.updateProfileImage = action.payload as string;
      });
  },
});

export const { setUserProfile, resetProfileState, clearUpdateProfileError, clearUpdateProfileImageError } = profileSlice.actions;
export default profileSlice.reducer;
