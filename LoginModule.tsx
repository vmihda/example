import React, { FC, useEffect, useState } from 'react';

import { Alert, Button, Checkbox, Col, Form, Input, Row, message } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import Cookies from 'js-cookie';
import AuthCode from 'react-auth-code-input';
import useCountDown from 'react-countdown-hook';
import { NavLink } from 'react-router-dom';
import { useToggle } from 'react-use';

import AuthConsumer from '../../../common/auth.guard';
import expiresDate from '../../../common/exporesDate';
import { login, resendCode, sendCode } from '../../../services/auth.service';
import LocalUserInfoService from '../../../services/local-user-info.service';
import TokenService from '../../../services/token.service';
import '../Auth.scss';

import './LoginModule.scss';

type TProps = {
	setShowCode: (initialValue?: boolean) => void;
};

type TFormData = {
	email: string;
	password: string;
};

const LoginForm: FC<TProps> = (props): JSX.Element => {
	const { setShowCode } = props;
	const [form] = Form.useForm<TFormData>();

	const { mutateAsync, isLoading, error } = login();

	const onFinish = async (values: TFormData): Promise<void> => {
		const { serviceToken, expiresIn } = await mutateAsync(values);
		LocalUserInfoService.setEmail(values.email);
		Cookies.set('serviceToken', serviceToken, {
			expires: expiresDate(expiresIn),
		});
		if (localStorage.getItem('rememberMe') === null) {
			localStorage.setItem('rememberMe', 'false');
		}
		setShowCode(true);
	};

	const setRememberMe = (value: CheckboxChangeEvent): void => {
		localStorage.setItem('rememberMe', String(value.target.checked));
	};

	return (
		<div className="auth-form">
			<strong className="auth-form__title">Log in</strong>
			{error?.response?.data?.message && (
				<Form.Item>
					<Alert message={error?.response?.data?.message} type="error" />
				</Form.Item>
			)}
			<Form
				form={form}
				name="login"
				layout="vertical"
				validateTrigger="onSubmit"
				onFinish={onFinish}
				className="login"
			>
				<Form.Item
					name="email"
					label="Email"
					rules={[{ required: true, type: 'email', message: 'Invalid email address' }]}
				>
					<Input id="email" type="email" name="email" placeholder="Enter email" />
				</Form.Item>
				<Form.Item
					label="Password"
					name="password"
					rules={[{ required: true, message: 'Invalid password' }]}
				>
					<Input.Password id="password" type="password" name="password" placeholder="Password" />
				</Form.Item>
				<Row justify="space-between" className="login__footer">
					<Col>
						<Checkbox onChange={setRememberMe}>Remember me</Checkbox>
					</Col>
					<Col>
						<NavLink to="/login">Forgot password?</NavLink>
					</Col>
				</Row>
				<Button block type="primary" htmlType="submit" loading={isLoading}>
					Log in
				</Button>
			</Form>
		</div>
	);
};

const CodeForm: FC<TProps> = (props): JSX.Element => {
	const { setShowCode } = props;
	const auth = AuthConsumer();
	const tokenService = new TokenService();
	const [code, setCode] = useState<string>('');
	const [timeLeft, { start }] = useCountDown(30000, 1000);

	const { mutateAsync, isLoading, error } = sendCode();

	const handleOnChange = (res: string): void => {
		setCode(res);
	};

	const isDisable = !(code.length === 6);

	const submitCode = async (): Promise<void> => {
		try {
			const { accessToken, refreshToken } = await mutateAsync({ totpCode: code });
			Cookies.remove('serviceToken');
			LocalUserInfoService.deleteEmail();
			tokenService.updateLocalAccessToken(accessToken);
			tokenService.updateLocalRefreshToken(refreshToken);
			auth.setAuthed(true);
		} catch (e) {
			console.log('e', e);
		}
	};

	const backToLogin = (): void => {
		Cookies.remove('serviceToken');
		LocalUserInfoService.deleteEmail();
		setShowCode(false);
	};

	const sendAgainCallback = async (): Promise<void> => {
		try {
			if (!timeLeft) {
				start();
				await resendCode().mutateAsync({});
			}
		} catch (e) {
			console.log('e', e);
		}
	};

	const email = LocalUserInfoService.getEmail();

	return (
		<div className="auth-form code">
			<strong className="auth-form__title">Verify it&apos;s you</strong>
			<p>
				Please confirm your account by entering the authorization code sent to{' '}
				<a href={`mailto:${email}`}>{email}</a>
			</p>
			{error?.response?.data?.message && (
				<Form.Item>
					<Alert message={error?.response?.data?.message} type="error" />
				</Form.Item>
			)}
			<AuthCode containerClassName="auth-code" onChange={handleOnChange} />
			<p>
				It may take a minute to receive your code. Haven&apos;t received it?{' '}
				{timeLeft ? (
					`Resend after ${timeLeft / 1000} seconds`
				) : (
					<button type="button" className="link" onClick={sendAgainCallback}>
						Resend a new code
					</button>
				)}
			</p>
			<Button block type="primary" disabled={isDisable} onClick={submitCode} loading={isLoading}>
				Submit
			</Button>
			<Button block type="link" onClick={backToLogin}>
				Back to login
			</Button>
		</div>
	);
};

const LoginModule: FC = (): JSX.Element => {
	const [showCode, setShowCode] = useToggle(false);

	useEffect(() => {
		if (Cookies.get('serviceToken')) {
			setShowCode(true);
		}
	}, []);

	if (showCode) {
		return <CodeForm setShowCode={setShowCode} />;
	}
	return <LoginForm setShowCode={setShowCode} />;
};

export default LoginModule;
