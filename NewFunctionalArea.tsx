import React, { FC, ReactElement, useId } from 'react';

import { Button, Card, Col, Form, Input, Row, Select } from 'antd';
import { useForm } from 'antd/es/form/Form';
import TextArea from 'antd/es/input/TextArea';
import { useNavigate, useSearchParams } from 'react-router-dom';

import DynamicFormModal from '../../../components/DynamicInputsModal';
import InitializationConsumer from '../../../context/initialization';

import { FunctionalAreasDataType } from './Step5';

type TNewFunctionalArea = {
	setTableData: (value: (prev) => any[] | [any]) => void;
	setToggleForm: (value: boolean) => void;
	tableData: FunctionalAreasDataType[];
};

export const WrapperNewFunctionalArea: FC<{ children: ReactElement; title?: string }> = (props) => {
	const { children, title } = props;
	return (
		<div className="add-functional-area">
			<Card title={title} bordered={false}>
				{children}
			</Card>
		</div>
	);
};

const NewFunctionalArea: FC<TNewFunctionalArea> = (props) => {
	const { setTableData, setToggleForm, tableData } = props;
	const [form] = useForm();
	const { initialization, initializationLoading } = InitializationConsumer();
	const id = useId();
	const navigate = useNavigate();

	const [searchParams] = useSearchParams();
	const key = searchParams.get('id');

	const onFinish = (values): void => {
		const functionalArea = initialization.functionalAreas.find(
			(item) => item.value === values.functionalArea,
		);

		const newCell = {
			id: id,
			...values,
			functionalArea,
		};

		setTableData((prev = []) => {
			if (!prev) {
				return [newCell];
			}
			const index = prev.findIndex((item) => item.id === key);
			if (index !== -1) {
				const start = prev.slice(0, index);
				const end = prev.slice(index + 1);
				const editedCell = {
					...tableData[index],
					...values,
					functionalArea,
				};

				return [...start, editedCell, ...end];
			}
			return [...prev, newCell];
		});
		navigate('');
		setToggleForm(false);
	};

	const saveValue = (value: { [x: string]: any[] }): void => {
		const key = Object.keys(value)[0];

		form.setFieldsValue({
			[key]: value[key].map((item) => item.value),
		});
	};

	const initData: FunctionalAreasDataType | undefined = tableData?.find((item) => item.id == key);

	const cancelHandler = (): void => {
		setToggleForm(false);
		navigate('');
	};

	return (
		<Form
			form={form}
			onFinish={onFinish}
			name="add-functional-area"
			validateTrigger="onSubmit"
			layout="vertical"
		>
			<Form.Item
				name="functionalArea"
				label="Functional Areas"
				initialValue={initData?.functionalArea?.value}
				rules={[{ required: true, message: 'Required field' }]}
			>
				<Select placeholder="Select Functional Areas" loading={initializationLoading}>
					{initialization.functionalAreas?.map((item) => (
						<Select.Option key={item.value} value={item.value}>
							{item.label}
						</Select.Option>
					))}
				</Select>
			</Form.Item>

			<Form.Item
				name="name"
				label="Functional Area Name"
				initialValue={initData?.name}
				rules={[{ required: true, message: 'Required field' }]}
			>
				<Input id="organizationName" placeholder="Enter Functional Area Name" />
			</Form.Item>

			<Form.Item
				name="functionalDescription"
				label="Functional Description"
				initialValue={initData?.functionalDescription}
				rules={[{ required: true, message: 'Required field' }]}
			>
				<TextArea rows={4} placeholder="Enter Functional Description" />
			</Form.Item>

			<Form.Item
				name="subFunctions"
				label="Sub-Function"
				initialValue={initData?.subFunctions}
				rules={[{ required: true, message: 'Required field' }]}
			>
				<DynamicFormModal
					initialValues={initData?.subFunctions}
					titleModal="Sub-Functions"
					textBtnAdd="Add Sub-Function"
					placeholderInputs="Enter Sub-Function"
					name="subFunctions"
					submitCallback={saveValue}
				/>
			</Form.Item>

			<Row gutter={24}>
				<Col span={6}>
					<Button type="default" htmlType="button" onClick={cancelHandler} block>
						Cancel
					</Button>
				</Col>
				<Col span={6}>
					<Button type="primary" htmlType="submit" block>
						Save
					</Button>
				</Col>
			</Row>
		</Form>
	);
};

export default NewFunctionalArea;
