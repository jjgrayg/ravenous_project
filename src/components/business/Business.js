/* eslint-disable react/prop-types */
import React  from 'react';
import './Business.css';

export const Business = (props) => {
	const handleClick = () => {
		window.open(props.link);
	};

	return (
		<div className="Business" onClick={handleClick}>
			<div className="image-container">
				<img src={props.imageSrc} alt=''/>
			</div>
			<h2>{props.name}</h2>
			<div className="Business-information">
				<div className="Business-address">
					<p>{props.address}</p>
					<p>{props.city}</p>
					<p>{props.state + ' ' + props.zipCode}</p>
				</div>
				<div className="Business-reviews">
					<h3>{props.category}</h3>
					<h3 className="rating">{props.rating} stars</h3>
					<p>{props.reviewCount} reviews</p>
				</div>
			</div>
		</div>
	);
};