import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { callFetchJob, callFetchJobByHR } from "@/config/api";
import { IJob } from "@/types/backend";

interface IState {
  isFetching: boolean;
  meta: {
    current: number;
    pageSize: number;
    pages: number;
    total: number;
  };
  result: IJob[];
}
// First, create the thunk
// API cho User (Trang chủ)
export const fetchJob = createAsyncThunk(
  "job/fetchJob",
  async ({ query }: { query: string }) => {
    const response = await callFetchJob(query);
    return response;
  }
);
// API cho Admin (Trang quản lý)
export const fetchAdminJobs = createAsyncThunk(
  "job/fetchAdminJobs",
  async ({ query }: { query: string }, { rejectWithValue }) => {
    try {
      const response = await callFetchJobByHR(query);
      console.log("fetchAdminJobs response:", response); // Kiểm tra phản hồi API
      return response.data;
    } catch (error: any) {
      console.error("fetchAdminJobs error:", error); // Log lỗi chi tiết
      return rejectWithValue(error.response?.data || "Có lỗi xảy ra");
    }
  }
);

const initialState: IState = {
  isFetching: true,
  meta: {
    current: 1,
    pageSize: 10,
    pages: 0,
    total: 0,
  },
  result: [],
};

export const jobSlide = createSlice({
  name: "job",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    setActiveMenu: (state, action) => {
      // state.activeMenu = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(fetchJob.pending, (state, action) => {
      state.isFetching = true;
      // Add user to the state array
      // state.courseOrder = action.payload;
    });

    builder.addCase(fetchJob.rejected, (state, action) => {
      state.isFetching = false;
      // Add user to the state array
      // state.courseOrder = action.payload;
    });

    builder.addCase(fetchJob.fulfilled, (state, action) => {
      if (action.payload && action.payload.data) {
        state.isFetching = false;
        state.meta = action.payload.data.meta;
        state.result = action.payload.data.result;
      }
      // Add user to the state array

      // state.courseOrder = action.payload;
    });

    builder.addCase(fetchAdminJobs.fulfilled, (state, action) => {
      if (action.payload) {
        state.isFetching = false;
        state.meta = action.payload.meta;
        state.result = action.payload.result;
      }
    });
  },
});

export const { setActiveMenu } = jobSlide.actions;

export default jobSlide.reducer;
