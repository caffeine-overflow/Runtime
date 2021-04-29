import { Notification } from 'rsuite';

const ADDRESS = 'http://localhost:5000/';

const FETCH_DATA = async (api) => {
    let token = sessionStorage.getItem('sprintCompassToken');
    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await fetch(`${ADDRESS}${api}`, requestOptions);

    let data = null;
    if (response.ok) {
        data = await response.json();
    }
    else {
        Notification.error({
            title: 'Server error, Try again later',
            description: <div style={{ width: 220 }} rows={3} />,
            placement: 'topEnd'
        });
    }

    return { status: response.status, data }
}

export default (FETCH_DATA);