import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { callFetchAccount } from "@/config/api";

// First, create the thunk
export const fetchAccount = createAsyncThunk(
  "account/fetchAccount",
  async () => {
    const response = await callFetchAccount();
    return response.data;
  }
);

interface IState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isRefreshToken: boolean;
  errorRefreshToken: string;
  user: {
    _id: string;
    email: string;
    name: string;
    age?: number; // Thêm trường age
    gender?: string; // Thêm trường gender
    address?: string; // Thêm trường address
    role: {
      _id: string;
      name: string;
    };
    permissions: {
      _id: string;
      name: string;
      apiPath: string;
      method: string;
      module: string;
    }[];
  };
  activeMenu: string;
}

const initialState: IState = {
  isAuthenticated: false,
  isLoading: true,
  isRefreshToken: false,
  errorRefreshToken: "",
  user: {
    _id: "",
    email: "",
    name: "",
    age: undefined, // Khởi tạo giá trị mặc định
    gender: undefined, // Khởi tạo giá trị mặc định
    address: undefined, // Khởi tạo giá trị mặc định
    role: {
      _id: "",
      name: "",
    },
    permissions: [],
  },
  activeMenu: "home",
};

export const accountSlide = createSlice({
  name: "account",
  initialState,
  reducers: {
    setActiveMenu: (state, action) => {
      state.activeMenu = action.payload;
    },
    setUserLoginInfo: (state, action) => {
      state.isAuthenticated = true;
      state.isLoading = false;
      state.user._id = action?.payload?._id;
      state.user.email = action.payload.email;
      state.user.name = action.payload.name;
      state.user.role = action?.payload?.role;
      state.user.permissions = action?.payload?.permissions;
    },
    setLogoutAction: (state, action) => {
      localStorage.removeItem("access_token");
      state.isAuthenticated = false;
      state.user = {
        _id: "",
        email: "",
        name: "",
        age: undefined,
        gender: undefined,
        address: undefined,
        role: {
          _id: "",
          name: "",
        },
        permissions: [],
      };
    },
    setRefreshTokenAction: (state, action) => {
      state.isRefreshToken = action.payload?.status ?? false;
      state.errorRefreshToken = action.payload?.message ?? "";
    },
    setUserUpdateInfo: (state, action) => {
      state.user.name = action.payload.name;
      state.user.email = action.payload.email;
      state.user.age = action.payload.age; // Sẽ không còn lỗi nữa
      state.user.gender = action.payload.gender; // Sẽ không còn lỗi nữa
      state.user.address = action.payload.address; // Sẽ không còn lỗi nữa
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAccount.pending, (state, action) => {
      if (action.payload) {
        state.isAuthenticated = false;
        state.isLoading = true;
      }
    });

    builder.addCase(fetchAccount.fulfilled, (state, action) => {
      if (action.payload) {
        state.isAuthenticated = true;
        state.isLoading = false;
        state.user._id = action?.payload?.user?._id;
        state.user.email = action.payload.user?.email;
        state.user.name = action.payload.user?.name;
        state.user.role = action?.payload?.user?.role;
        state.user.permissions = action?.payload?.user?.permissions;
      }
    });

    builder.addCase(fetchAccount.rejected, (state, action) => {
      if (action.payload) {
        state.isAuthenticated = false;
        state.isLoading = false;
      }
    });
  },
});

export const {
  setActiveMenu,
  setUserLoginInfo,
  setLogoutAction,
  setRefreshTokenAction,
  setUserUpdateInfo,
} = accountSlide.actions;

export default accountSlide.reducer;
