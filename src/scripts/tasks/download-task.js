self.addEventListener('message', function(e) {

    const request = new Request(e.data.url, {
        method: 'GET',
        headers: e.data.headers,
        mode: 'cors'
    });

    fetch(request).then((file) => {
        if (e.data.return === 'json') {
            return file.json();
        } else if (e.data.return === 'blob') {
            return file.blob();
        }
        return file.arrayBuffer();
    }).then((data)=>{
        if (e.data.return === 'json') {
            self.postMessage(data);
        } else {
            self.postMessage(data, [data])
        }
    }).catch((err)=>{throw new Error(err)})
}, false);