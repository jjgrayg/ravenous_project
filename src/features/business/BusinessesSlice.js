import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
 
// Test business for intial state

const apiKey = 'QwEpzyJtBph-tIhKuXuiBwIeqCR_REoM4s8-xMN3GQTmCQKpbxP9hIelCaiGWnTXZITkArdUq3Ii_Gbn6RW3YNexLGDTHpc3_7EDasJR55FlQWrIi08j6FVo_PjGYnYx';

function isEmptyObject(obj){
	return JSON.stringify(obj) === '{}';
}

export const fetchBusinessesWithSearch = createAsyncThunk(
	'businesses/getBusinesses',
	async (searchObj) => {
		let url = `/businesses/search?term=${searchObj.term}`;
		if (searchObj.location === '') {
			url += `&latitude=${encodeURI(searchObj.computerLocation.lat)}&longitude=${encodeURI(searchObj.computerLocation.lng)}`;
		}
		else {
			url += `&location=${searchObj.location}`;
		}
		url += `&sort_by=${searchObj.sortBy}`;
		const response = await fetch(
			url,
			{
				headers: {
					Authorization: `Bearer ${apiKey}` 
				}
			});
		const json = await response.json();
		if (json.businesses) {
			const businessArray = json.businesses.map(business => {
				return {
					imageSrc: business.image_url,
					address: business.location.address1,
					city: business.location.city,
					state: business.location.state,
					zipCode: business.location.zip_code,
					category: business.categories[0].title,
					rating: business.rating,
					reviewCount: business.review_count,
					id: business.id,
					url: business.url,
					name: business.name
				};
			});
			return businessArray;
		}
		return [];
	}
);

export const fetchAutofillRecommendations = createAsyncThunk(
	'businesses/autofillRecommendations',
	async ({term, location}) => {
		if (term) {
			let url = `/autocomplete?text=${term}`;
			if (location.lat !== undefined && location.lng !== undefined) {
				url += `&latitude=${encodeURI(location.lat)}&longitude=${encodeURI(location.lng)}`;
			}
			const response = await fetch(
				url,
				{
					headers: {
						Authorization: `Bearer ${apiKey}`
					}
				});
			const json = await response.json();
			return json;
		}
		return {};
	}
);

export const BusinessesSlice = createSlice({
	name: 'businesses',
	initialState: {
		loading: false,
		error: false,
		businessArray: [],
		autofillRecommendations: [],
		beenModified: false
	},
	reducers: {
		addBusiness: (state, action) => {
			action.payload.id = uuidv4();
			state.businessArray.push(action.payload);
			state.beenModified = true;
		},
		removeBusiness: (state, action) => {
			state.businessArray = state.businessArray.filter(business => business.id !== action.payload);
			state.beenModified = true;
		},
		replaceBusinesses: (state, action) => {
			state.businessArray = action.payload;
			state.beenModified = true;
		}
	},
	extraReducers: {
		[fetchBusinessesWithSearch.pending]: state => {
			state.loading = true;
			state.error = false;
			state.beenModified = true;
		},
		[fetchBusinessesWithSearch.rejected]: state => {
			state.loading = false;
			state.error = true;
			state.beenModified = true;
		},
		[fetchBusinessesWithSearch.fulfilled]: (state, action) => {
			state.loading = false;
			state.error = false;
			state.businessArray = action.payload;
			state.beenModified = true;
		},
		[fetchAutofillRecommendations.fulfilled]: (state, action) => {
			let recommendations = [];
			if (!isEmptyObject(action.payload)) {
				for (let i = 0; i < action.payload.categories?.length; i++) {
					recommendations.push(action.payload.categories[i].alias);
				}
				for (let i = 0; i < action.payload.businesses?.length; i++) {
					recommendations.push(action.payload.businesses[i].name);
				}
				for (let i = 0; i < action.payload.terms?.length; i++) {
					recommendations.push(action.payload.terms[i].text);
				}
			}
			state.autofillRecommendations = recommendations;
		}
	}
});

export default BusinessesSlice.reducer;
export const { addBusiness, removeBusiness, replaceBusinesses } = BusinessesSlice.actions;
export const selectBusinesses = state => state.businesses.businessArray;
export const selectLoading = state => state.businesses.loading;
export const selectError = state => state.businesses.error;
export const selectRecommendations = state => state.businesses.autofillRecommendations;
export const selectModified = state => state.businesses.beenModified;