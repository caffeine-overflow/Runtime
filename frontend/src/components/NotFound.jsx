import React from 'react';
import { FlexboxGrid } from 'rsuite';

export default function NotFound(props) {
    return (
        <div>
            <div className="show-grid">
                <FlexboxGrid style={{ background: '#f5f5f5', height: 'calc(100vh - 97px)' }}>
                    <FlexboxGrid.Item
                        style={{ margin: 'auto' }}
                        colspan={12}
                    >
                        <img
                            style={{ width: '80%', display: 'block', margin: 'auto' }}
                            src={props.image}
                            alt=""
                        />
                    </FlexboxGrid.Item>
                    <FlexboxGrid.Item
                        colspan={12}
                        style={{ margin: 'auto', textAlign: 'center', fontSize: '22px' }}
                    >
                        {props.msg}
                    </FlexboxGrid.Item>
                </FlexboxGrid>
            </div>
        </div>
    )
};
