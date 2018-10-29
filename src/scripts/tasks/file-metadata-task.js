self.addEventListener('message', function(e) {
    const endpoint = e.data.endpoint ? e.data.endpoint : "./api/v1/";
    const detail = !e.data.preference || !e.data.preference.scope || e.data.preference.scope === "full";
    const headers = new Headers({
        "Suppress-WWW-Authenticate": "Suppress",
        "Accept": "application/json",
        "Content-Type": "application/json"
    });
    let partialFileMetadata;

    /*if (e.data.preference && e.data.preference.authentication.type) {
        switch (e.data.preference.authentication.type) {
            case "username-password":
                headers.append("Authorization", `${e.data.preference.authentication.value}`);
                break;
            case "macaroon":
                headers.append("Authorization", `Bearer ${e.data.preference.authentication.value}`);
                break;
            default:
        }
    }*/
    if (e.data.upauth && e.data.upauth !== "") {
        headers.append("Authorization", `${e.data.upauth}`);
    }
    if (e.data.file) {
        if (!e.data.file.pnfsId && e.data.file.filePath) {
            partial(e.data.file.filePath).then((response) => {
                partialFileMetadata = response;
                if (detail !== full) {
                    self.postMessage(response);
                } else {
                    full(response.pnfsId).then((response) => {
                        self.postMessage(response);
                    });
                }
            }).catch((err) => {
                // throw new Error(err);
                //WORKAROUND: https://stackoverflow.com/questions/30715367/why-can-i-not-throw-inside-a-promise-catch-handler

                setTimeout(function() { throw err; });
            })
        } else if (e.data.file.pnfsId) {
            full(e.data.file.pnfsId).then((response) => {
                self.postMessage(response);
            });
        }
    } else {
        throw new TypeError("The file object parameter is not set. Provide either file.pnfsId or file.path.");
    }

    function full(pnfsId) {
        const request = new Request(`${endpoint}id/${pnfsId}`, {
            headers: headers
        });
        return fetch(request).then((response) => {
            if (!(response.status >= 200 && response.status < 300)) {
                throw new Error(`Looks like there was a problem. Status Code: ${response.status}`);
            }
            return response.json();
        }).catch((err) => {
            if (partialFileMetadata) {
                return partialFileMetadata;
            }
            //WORKAROUND: https://stackoverflow.com/questions/30715367/why-can-i-not-throw-inside-a-promise-catch-handler
            setTimeout(function() { throw err; });
        });
    }
    function partial(path) {
        //FIXME: add limit to the children size
        const request = new Request(`${endpoint}namespace${path}?children=true&qos=true`, {
            headers: headers
        });
        return fetch(request).then((response) => {
            if (!(response.status >= 200 && response.status < 300)) {
                throw new Error(`Looks like there was a problem. Status Code: ${response.status}`);
            }
            return response.json();
        });
    }
}, false);