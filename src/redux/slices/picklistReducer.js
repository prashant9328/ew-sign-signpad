import { createSlice, current } from "@reduxjs/toolkit";

export const picklistSlice = createSlice({
  name: "picklistSlice",
  initialState: {
    allPicklistData: {},
  },
  reducers: {
    setPicklistData: (state, action) => {
      const { allPicklistData } = action.payload;
      state.allPicklistData = allPicklistData || {};
    },
    changePicklistData: (state, action) => {
  const { elementIndex, currentPageNo, selectedValue } = action.payload;

  const pageData = state.allPicklistData[currentPageNo] || [];

  state.allPicklistData[currentPageNo] = pageData.map((item) => {
    if (item.index === elementIndex) {
      return {
        ...item,
        value: selectedValue,
      };
    }
    return item;
  });
}

  },
});

// Action creators are generated for each case reducer function
export const { setPicklistData, changePicklistData } = picklistSlice.actions;

export default picklistSlice.reducer;
