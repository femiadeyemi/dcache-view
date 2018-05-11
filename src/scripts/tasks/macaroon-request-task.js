"use strict";
self.addEventListener('message', function(e) {
    const body = JSON.stringify(e.data.body);
    const headers = new Headers({
        "Suppress-WWW-Authenticate": "Suppress",
        "Content-Type": "application/macaroon-request"
    });
    if (!e.data.usesCert) {
        headers.append("Authorization", `${e.data.upauth}`);
    }
    fetch(e.data.url, {
        method: 'POST',
        mode: "cors",
        body: body,
        headers: headers
    }).then((response) => {
        if(response.ok) {
            return response.json();
        }
        throw new Error('Network response was not ok.');
    }).then((rep) => {
        self.postMessage(rep);
    }).catch(function(err) {
        //WORKAROUND: https://stackoverflow.com/questions/30715367/why-can-i-not-throw-inside-a-promise-catch-handler
        setTimeout(function() { throw err; });
    });
}, false);