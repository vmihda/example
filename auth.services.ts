export const getMe = async (): Promise<TMe> => {
	const { data } = await axios.get<TMe>(`${API_PREFIX}/users/me`);
	return data;
};

export const getMeAuthorities = async (): Promise<TMeAuthorities> => {
	const { data } = await axios.get<TMeAuthorities>(`${API_PREFIX}/users/me/authorities`);
	return data;
};

export const loginUser = async (values: TInputLogin): Promise<TOutputLogin> => {
	const { data } = await axios.post<TOutputLogin>(`/auth/login`, values);
	return data;
};

export const getCodeUser = async (values: TInputCode): Promise<TOutputCode> => {
	const serviceToken = Cookies.get('serviceToken');
	const { data } = await axios.post<TOutputCode>(`/auth/login/code`, values, {
		headers: {
			Authorization: 'Bearer ' + serviceToken,
		},
	});
	return data;
};
