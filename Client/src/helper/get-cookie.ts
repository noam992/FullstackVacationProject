export function getCookie(name) {
    const cookies = document.cookie.split(';');
    for(let i = 0 ; i < cookies.length ; ++i) {
        const pair = cookies[i].trim().split('=');
        if(pair[0] === name)
            return pair[1];
    }
    return null;
}