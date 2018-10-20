const webdavWorker = new Worker('scripts/tasks/request-webdav-endpoints.js');

webdavWorker.addEventListener('message', function(e) {
    window.CONFIG["webdav"] = e.data;
    webdavWorker.terminate();
}, false);

webdavWorker.addEventListener('error', function(e) {
    console.info(e);
    webdavWorker.terminate()
}, false);

webdavWorker.postMessage({"apiEndpoint": "/api/v1/", "protocol": `${window.location.protocol}`});