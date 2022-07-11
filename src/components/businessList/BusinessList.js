import React from 'react';
import './BusinessList.css';

import { useSelector } from 'react-redux';

import { Business } from '../business/Business';

// Selector for businesses
import { selectBusinesses, selectLoading, selectModified } from '../../features/business/BusinessesSlice';

export const BusinessList = () => {
	const businesses = useSelector(selectBusinesses);
	const loading = useSelector(selectLoading);
	const modified = useSelector(selectModified);

	if (businesses.length > 0 || loading || !modified) {
		return (
			<div className="BusinessList">
				{businesses.map(business => {
					return (
						<Business
							imageSrc={business.imageSrc}
							name={business.name}
							address={business.address}
							city={business.city}
							state={business.state}
							zipCode={business.zipCode}
							category={business.category}
							rating={business.rating}
							reviewCount={business.reviewCount}
							id={business.id}
							key={business.id}
							link={business.url}
						/>
					);
				})}
			</div>
		);
	}
	return (
		<div className="BusinessList">
			<h2>No results found!</h2>
		</div>
	);
	
};