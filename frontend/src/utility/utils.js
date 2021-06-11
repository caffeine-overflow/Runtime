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

    let data = await response.json();

    if (!response.ok) {
        Notification.error({
            title: data.msg ?? 'Server error, Try again later',
            description: <div style={{ width: 220 }} rows={3} />,
            placement: 'topEnd'
        });
    }

    return { status: response.status, data }
}

const POST_DATA = async (api, body, message) => {
    let token = sessionStorage.getItem('sprintCompassToken');
    const requestOptions = {
        method: 'POST',
        headers: {
            'Access-Control-Expose-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body)
    };

    const response = await fetch(`${ADDRESS}${api}`, requestOptions);

    let data = await response.json();

    if (!response.ok) {
        Notification.error({
            title: data.msg ?? 'Server error, Try again later',
            description: <div style={{ width: 220 }} rows={3} />,
            placement: 'topEnd'
        });
    }
    else {
        Notification.success({
            title: data.msg ?? message,
            description: <div style={{ width: 220 }} rows={3} />,
            placement: 'topEnd'
        })
    }

    return {
        status: response.status
    }
}

const PUT_DATA = async (api, body, message) => {
    let token = sessionStorage.getItem('sprintCompassToken');
    const requestOptions = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body)
    };
    const response = await fetch(`${ADDRESS}${api}`, requestOptions);

    let data = await response.json();

    if (!response.ok) {
        Notification.error({
            title: data.msg ?? 'Server error, Try again later',
            description: <div style={{ width: 220 }} rows={3} />,
            placement: 'topEnd'
        });
    } else {
        Notification.success({
            title: data.msg ?? message,
            description: <div style={{ width: 220 }} rows={3} />,
            placement: 'topEnd'
        })
    }
    return {
        status: response.status
    }
}

const DELETE_DATA = async (api, message) => {
    let token = sessionStorage.getItem('sprintCompassToken');
    const requestOptions = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    };
    const response = await fetch(`${ADDRESS}${api}`, requestOptions);

    if (!response.ok) {
        Notification.error({
            title: 'Server error, Try again later',
            description: <div style={{ width: 220 }} rows={3} />,
            placement: 'topEnd'
        });
    }
    else {
        Notification.success({
            title: message,
            description: <div style={{ width: 220 }} rows={3} />,
            placement: 'topEnd'
        })
    }
    return {
        status: response.status
    }
}


const getQueryVariable = (variable) => {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] === variable) {
            return pair[1];
        }
    }
    return false;
};

// eslint-disable-next-line import/no-anonymous-default-export
export default { FETCH_DATA, POST_DATA, PUT_DATA, DELETE_DATA, getQueryVariable, ADDRESS };