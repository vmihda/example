import React, {Component, Fragment, useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {Editor, EditorState, RichUtils} from 'draft-js';
import _ from 'lodash';
import 'draft-js/dist/Draft.css';

import FontStyleControls from './FontStyleControls';
import HeaderStyleControl from './HeaderStyleControl/HeaderStyleControl';
import ListStyleControl from './ListStyleControl';

import './TextareaEditor.scss';
import {stateFromHTML} from 'draft-js-import-html';

const TextareaEditor = (props) => {
	const {content, callback, error} = props;
	const editor = useRef();

	const [editorState, setEditorState] = useState(EditorState.createEmpty());

	useEffect(() => {
		let contentState = stateFromHTML(content);
		const state = content
				? EditorState.createWithContent(contentState)
				: EditorState.createEmpty();
		setEditorState(state);
	}, [content]);

	useEffect(() => {
		if (callback) {
			callback(editorState);
		}

	}, [callback, editorState]);

	const handleKeyCommand = (command) => {
		const newState = RichUtils.handleKeyCommand(editorState, command);
		if (newState) {
			setEditorState(newState);
			return true;
		}
		return false;
	};

	const onTab = (e) => setEditorState(RichUtils.onTab(e, editorState, 4));

	const toggleBlockType = (blockType) => setEditorState(RichUtils.toggleBlockType(editorState, blockType));

	const toggleInlineStyle = (inlineStyle) => setEditorState(RichUtils.toggleInlineStyle(editorState, inlineStyle));

	const onChange = (editorState) => setEditorState(editorState);

	const focus = () => editor.current?.focus();

	let className = 'RichEditor-editor';
	const contentState = editorState.getCurrentContent();
	if (!contentState.hasText()) {
		if (contentState.getBlockMap().first().getType() !== 'unstyled') {
			className += ' RichEditor-hidePlaceholder';
		}
	}


	return (
			<Fragment>
				<div className="textEditor">
					<div className="textEditor__header">
						<HeaderStyleControl
								onToggle={toggleBlockType}
								editorState={editorState}
						/>
						<FontStyleControls
								editorState={editorState}
								onToggle={toggleInlineStyle}
						/>
						<ListStyleControl
								onToggle={toggleBlockType}
								editorState={editorState}
						/>
					</div>
					<div className={`${className} textEditor__textarea`} onClick={focus}>
						<Editor
								editorState={editorState}
								handleKeyCommand={handleKeyCommand}
								onChange={onChange}
								onTab={onTab}
								placeholder="Text"
								ref={editor}
						/>
					</div>
				</div>
				{error && (
						<span className="formControl__error">
					{_.capitalize(error)}
				</span>
				)}
			</Fragment>
	);
};

class TextareaEditorOld extends Component {
	constructor(props) {
		super(props);
		this.state = {
			editorState: EditorState.createEmpty(),
			message: '',
		};
		this.editor = React.createRef();
		this.focus = () => this.editor.focus();
		this.onChange = (editorState) => this.setState({editorState});

		this.handleKeyCommand = (command) => this._handleKeyCommand(command);
		this.onTab = (e) => this._onTab(e);
		this.toggleBlockType = (type) => this._toggleBlockType(type);
		this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
	}

	_handleKeyCommand(command) {
		const {editorState} = this.state;
		const newState = RichUtils.handleKeyCommand(editorState, command);
		if (newState) {
			this.onChange(newState);
			return true;
		}
		return false;
	}

	_onTab(e) {
		const maxDepth = 4;
		this.onChange(RichUtils.onTab(e, this.state.editorState, maxDepth));
	}

	_toggleBlockType(blockType) {
		this.onChange(
				RichUtils.toggleBlockType(this.state.editorState, blockType)
		);
	}

	_toggleInlineStyle(inlineStyle) {
		this.onChange(
				RichUtils.toggleInlineStyle(this.state.editorState, inlineStyle)
		);
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		if (prevState.editorState !== this.state.editorState) {
			if (this.props.callback) {
				this.props.callback(this.state.editorState);
			}
		}
	}

	render() {
		const {editorState} = this.state;
		let className = 'RichEditor-editor';
		const contentState = editorState.getCurrentContent();
		if (!contentState.hasText()) {
			if (contentState.getBlockMap().first().getType() !== 'unstyled') {
				className += ' RichEditor-hidePlaceholder';
			}
		}

		return (
				<Fragment>
					<div className="textEditor">
						<div className="textEditor__header">
							<HeaderStyleControl
									onToggle={this.toggleBlockType}
									editorState={editorState}
							/>
							<FontStyleControls
									editorState={editorState}
									onToggle={this.toggleInlineStyle}
							/>
							<ListStyleControl
									onToggle={this.toggleBlockType}
									editorState={editorState}
							/>
						</div>
						<div className={`${className} textEditor__textarea`}>
							<Editor
									editorState={editorState}
									handleKeyCommand={this.handleKeyCommand}
									onChange={this.onChange}
									onTab={this.onTab}
									placeholder="Text"
									ref={this.editor}
							/>
						</div>
					</div>
					{this.props?.error && (
							<span className="formControl__error">
						{_.capitalize(this.props.error)}
					</span>
					)}
				</Fragment>
		);
	}
}

TextareaEditor.propTypes = {
	callback: PropTypes.func,
	error: PropTypes.string,
	content: PropTypes.string,
};

export default TextareaEditor;
