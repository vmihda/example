import get from 'lodash/get';
import set from 'lodash/set';

import { BasicModel } from './basic-model';

interface PropertyResolver {
	property: string;
	path?: string;
	deserialize?: (data: any) => any;
}

const propertyResolvers: PropertyResolver[] = [
	{ property: 'grantedAuthorities', path: 'grantedAuthorities' },
	{ property: 'address.address', path: 'address.address' },
	{ property: 'address.city', path: 'address.city' },
	{ property: 'address.country', path: 'address.country' },
	{ property: 'address.usaStateType', path: 'address.usaStateType' },
	{ property: 'address.zipCode', path: 'address.zipCode' },
	{ property: 'email', path: 'email' },
	{ property: 'firstName', path: 'firstName' },
	{ property: 'functionalRoles', path: 'functionalRoles' },
	{ property: 'id', path: 'id' },
	{ property: 'isActive', path: 'isActive' },
	{ property: 'jobTitle', path: 'jobTitle' },
	{ property: 'lastName', path: 'lastName' },
	{ property: 'onboardedAt', path: 'onboardedAt' },
	{ property: 'systemRole', path: 'systemRole' },
];

class UserModel implements BasicModel {
	grantedAuthorities: string[];
	address: {
		address: string;
		city: string;
		country: string;
		usaStateType: string;
		zipCode: string;
	};
	email: string;
	firstName: string;
	functionalRoles: string[];
	id: string;
	isActive: boolean;
	jobTitle: string;
	lastName: string;
	onboardedAt: string;
	systemRole: string;

	constructor(values: any) {
		if (values) {
			this.deserialize(values);
		}
	}

	get fullName(): string {
		if (this.firstName && this.lastName) {
			return `${this.firstName} ${this.lastName}`;
		}
	}

	get initials(): string {
		if (this.firstName && this.lastName) {
			return `${this.firstName.at(0)}${this.lastName.at(0)}`.toUpperCase();
		}
	}

	deserialize(values: any): void {
		propertyResolvers.forEach(({ property, deserialize, path }) => {
			if (typeof deserialize === 'function') {
				set(this, property, deserialize(values));
			} else if (typeof path !== 'undefined') {
				set(this, property, get(values, path));
			}
		});
	}
}

export default UserModel;
