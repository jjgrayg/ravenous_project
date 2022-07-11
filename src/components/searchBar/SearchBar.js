import React, { useState, useEffect } from 'react';
import './SearchBar.css';

import { useSelector, useDispatch } from 'react-redux';

import { fetchBusinessesWithSearch, fetchAutofillRecommendations, selectRecommendations, selectLoading } from '../../features/business/BusinessesSlice';

export const SearchBar = () => {
	const sortByOptions = {
		'Best Match': 'best_match',
		'Highest Rated': 'rating',
		'Most Reviewed': 'review_count',
		'Distance': 'distance'
	};

	const dispatch = useDispatch();

	const [compLocation, setCompLocation] = useState({});
	const [term, setTerm] = useState('');
	const [location, setLocation] = useState('');
	const [sortBy, setSortBy] = useState(sortByOptions['Best Match']);
	const [clickedAutocomplete, setClickedAutocomplete] = useState(false);
	const [active, setActive] = useState(false);
	const [locRequired, setLocRequired] = useState(true);

	const isLoading = useSelector(selectLoading);
	const autofillArray = useSelector(selectRecommendations);

	const checkSortByOption = sortByOption => {
		if (sortBy === sortByOption) {
			return 'active';
		}
		return '';
	};

	const renderSortByOptions = () => {
		return Object.keys(sortByOptions).map(sortByOption => {
			const sortByOptionValue = sortByOptions[sortByOption];
			return (
				<li 
					key={sortByOptionValue} 
					className={checkSortByOption(sortByOptionValue)}
					onClick={() => setSortBy(sortByOptionValue)}
				>
					<span>
						{sortByOption}
					</span>
				</li>
			);
		});
	};

	const handleSubmit = e => {
		e.preventDefault();
		const searchObj = {
			term,
			location,
			sortBy,
			computerLocation: compLocation,
		};
		dispatch(fetchBusinessesWithSearch(searchObj));
	};

	useEffect(() => {
		const watchID = navigator.geolocation.watchPosition(
			function(position) {
				setCompLocation({
					lat: position.coords.latitude.toFixed(10),
					lng: position.coords.longitude.toFixed(10),
					accuracy: position.coords.accuracy
				});
				setLocRequired(false);
			},
			function(error) {
				console.error('Error Code = ' + error.code + ' - ' + error.message);
				setLocRequired(true);
			},
			{enableHighAccuracy: true} 
		);
		return navigator.geolocation.clearWatch(watchID);
	}, []);

	const handleTermChange = e => {
		resetRedHighlight(e);
		setTerm(e.target.value);
		if (!clickedAutocomplete) {
			dispatch(fetchAutofillRecommendations({
				location: compLocation, 
				term: e.target.value
			}));
		}
		setClickedAutocomplete(false);
	};

	const handleClickAutocomplete = e => {
		if (e._reactName === 'onBlur') {
			setActive(false);
		}
		else {
			let newTerm = e.target.id;
			if (newTerm === '') {
				newTerm = e.target.parentElement.id;
			}
			setTerm(newTerm);
			setClickedAutocomplete(true);
		}
	};

	const renderAutofill = () => {
		if (autofillArray && term && !clickedAutocomplete && active) {
			let divArray = [];
			for (const i in autofillArray) {
				let wordArray =[];
				const wordSplit = autofillArray[i].split(' ');
				let key = 0;
				let foundSome = false;
				for (const k in wordSplit) {
					let matchedText = '';
					let remainingText = wordSplit[k];
					let l = 0;
					for (let j = 0; j < wordSplit[k].length; j++) {
						if (term[l]?.toUpperCase() === wordSplit[k][j]?.toUpperCase() && wordSplit[k]?.toUpperCase()?.search(term.toUpperCase()) >= 0) {
							matchedText += wordSplit[k][j];
							remainingText = wordSplit[k].substr(j+1);
							l++;
							foundSome = true;
						}
						else {
							break;
						}
					}
					if (foundSome) {
						wordArray.push(<strong key={key++}>{matchedText}</strong>);
						wordArray.push(<p key={key++} style={{color: 'grey'}}>{remainingText}&nbsp;</p>);
					}
				}
				if (!foundSome) {
					let matchedText = '';
					let remainingText = autofillArray[i];
					for (const letter in term) {
						if (term[letter]?.toUpperCase() === autofillArray[i][letter]?.toUpperCase()) {
							matchedText += autofillArray[i][letter];
							if (letter - autofillArray[i].length + 1 != 0)
								remainingText = autofillArray[i].slice(letter - autofillArray[i].length + 1);
							else
								remainingText = '';
						}
						else break;
					}
					wordArray.push(<p key={key++} >{matchedText}</p>);
					wordArray.push(<p key={key++} style={{color: 'grey'}}>{remainingText}</p>);
				}
				const item = (
					<div className="autofill-item" key={i} id={autofillArray[i]} onMouseDown={e => e.preventDefault()} onClick={handleClickAutocomplete} >{wordArray}</div>
				);
				divArray.push(item);
			}

			return (
				<div className="autofill-recommendations">
					{divArray}
				</div>
			);
		}
	};

	const resetRedHighlight = e => {
		e.target.style.boxShadow = '';
		e.target.style.border = '';
		e.target.style = {};
	};

	return (
		<div className="SearchBar">
			<div className="SearchBar-sort-options">
				<ul>
					{renderSortByOptions()}
				</ul>
			</div>
			<form onSubmit={handleSubmit}>
				<div className="SearchBar-fields">
					<div className="Autocomplete-container">
						<input 
							valign='bottom'
							placeholder="Search Businesses" 
							onChange={handleTermChange} 
							value={term} 
							disabled={isLoading} 
							onFocus={() => setActive(true)}
							//onBlur={() => setActive(false)}
							required 
							onInvalid={e => {
								e.preventDefault();
								e.target.style.boxShadow = 'inset 0px 0px 0px 1px red';
								e.target.style.border = '1px solid red';
							}}
						/>
						{renderAutofill()}
					</div>
					<div className="SearchBar-location-search" >
						<input 
							placeholder="Where?" 
							onChange={e => {
								setLocation(e.target.value);
								resetRedHighlight(e);
							}} 
							value={location} 
							disabled={isLoading} 
							required={locRequired}
							onInvalid={e => {
								e.preventDefault();
								e.target.style.boxShadow = 'inset 0px 0px 0px 1px red';
								e.target.style.border = '1px solid red';
							}}
						/>
						<p className="tiny-text" style={{display: locRequired ? 'none' : 'block'}}>Leave this box empty to automatically search for places near your location</p>
					</div>
				</div>
				<button className="SearchBar-submit" type='submit'>
					Let&apos;s Go
				</button>
			</form>
		</div>
	);
};