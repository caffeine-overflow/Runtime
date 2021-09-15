import React, { useState, useEffect } from 'react'
import RichTextEditor from 'react-rte';

export default function Editor(props) {
    const [value, setvalue] = useState(RichTextEditor.createEmptyValue());

    useEffect(() => {
        setvalue(RichTextEditor.createValueFromString(props.value, 'html'))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onChange = (value) => {
        setvalue(value);
        props.setText(value.toString('html'));
    };

    return (
        <div style={{ width: '100%' }}>
            <RichTextEditor
                value={value}
                onChange={onChange}
                toolbarConfig={toolbarConfig}
                disabled={props.disabled}
                editorStyle={{ marginTop: props.disabled ? "-2%" : "" }}
            />
        </div>
    )
}

const toolbarConfig = {
    display: ['INLINE_STYLE_BUTTONS', 'BLOCK_TYPE_BUTTONS', 'BLOCK_TYPE_DROPDOWN', 'HISTORY_BUTTONS'],
    INLINE_STYLE_BUTTONS: [
        { label: 'Bold', style: 'BOLD', className: 'custom-css-class' },
        { label: 'Italic', style: 'ITALIC' },
        { label: 'Underline', style: 'UNDERLINE' }
    ],
    BLOCK_TYPE_DROPDOWN: [
        { label: 'Text', style: 'unstyled' },
        { label: 'Heading', style: 'header-four' },
        { label: 'Code', style: 'code-block' },
    ],
    BLOCK_TYPE_BUTTONS: [
        { label: 'UL', style: 'unordered-list-item' },
        { label: 'OL', style: 'ordered-list-item' }
    ]
};