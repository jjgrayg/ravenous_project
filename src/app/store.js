import { configureStore } from '@reduxjs/toolkit';
import BusinessesReducer from '../features/business/BusinessesSlice';

const store = configureStore({
	reducer: {
		businesses: BusinessesReducer
	}
});

export default store;