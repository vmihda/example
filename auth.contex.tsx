const AuthContext = React.createContext<ReturnUseAuth>(undefined!);

export const useAuth = (): ReturnUseAuth => {
	const tokenService = new TokenService();
	const isLogin = tokenService.getLocalAccessToken() && tokenService.getLocalRefreshToken();

	const [authed, setAuthed] = useToggle(!!isLogin);
	const [user, setUser] = useState<UserModel>(null);
	const [userLoading, setUserLoading] = useState<boolean>(undefined);

	const logout = (): void => {
		tokenService.removeToken();
		setAuthed(false);
		setUser(null);
	};

	return {
		authed,
		logout,
		setAuthed,
		user,
		setUser,
		userLoading,
		setUserLoading,
	};
};

export const AuthProvider: FunctionComponent<{ children: ReactElement }> = ({children}) => {
	const auth = useAuth();

	useEffect(() => {
		(async (): Promise<void> => {
			if (auth.authed && !auth.user) {
				const meAuthorities = await getMeAuthorities();
				const me = await getMe();
				const user = new UserModel({
					...me,
					grantedAuthorities: meAuthorities,
				});
				auth.setUser(user);
			}
		})();
	}, [auth.authed]);

	return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export default function AuthConsumer(): ReturnUseAuth {
	const context = React.useContext(AuthContext);
	if (context === undefined) {
		throw new Error('AuthConsumer must be used within a AuthProvider');
	}
	return context;
}

export const NoRequireAuth: FC<{ children: ReactElement }> = ({children}) => {
	const {authed} = AuthConsumer();
	const location = useLocation();

	return !authed ? (
		children
	) : (
		<Navigate to={RoutersEnum.users_management} state={{path: location.pathname}} replace/>
	);
};

export const RequireAuth: FC<{ children: ReactElement }> = ({children}) => {
	const {authed} = AuthConsumer();
	const location = useLocation();

	return authed ? (
		children
	) : (
		<Navigate to={RoutersEnum.login} state={{path: location.pathname}} replace/>
	);
};
