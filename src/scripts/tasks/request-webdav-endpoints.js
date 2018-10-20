self.addEventListener('message', function(e) {
    const endpoint = e.data.apiEndpoint.endsWith("/") ? e.data.apiEndpoint : `${e.data.apiEndpoint}/`;
    fetch(`${endpoint}doors`, {headers: {"accept": "application/json",
            "suppress-www-authenticate": "Suppress"}})
        .then((response) => {
            if (!(response.status >= 200 && response.status < 300)) {
                throw new Error("Network problem.");
            }
            return response.json();
        })
        .then(doors => {
            const read = [];
            const write = [];
            const webdav = [];
            doors.forEach((door) => {
                if (door.tags && door.tags.includes("dcache-view")) {
                    webdav.push(door);
                }
            });
            webdav.sort(compare);

            webdav.forEach((door) => {
                door.readPaths.forEach((path) => {
                    read.push(`${door.protocol}://${door.addresses[0]}:${door.port}${path}`);
                });

                door.writePaths.forEach((path) => {
                    write.push(`${door.protocol}://${door.addresses[0]}:${door.port}${path}`);
                });
            });

            self.postMessage({"write": write, "read": read, "timestamp": new Date().getTime()})
        })
        .catch(e => {
            setTimeout(function(){throw e;});
        });
    function compare(door_1, door_2) {
        if (e.data.protocol === door_1.protocol && e.data.protocol === door_2.protocol) {
            if (door_1.load === door_2.load) {
                return 0;
            }
            if (door_1.load < door_2.load) {
                return -1;
            }
            if (door_1.load > door_2.load) {
                return 1;
            }
        }

        if (e.data.protocol === door_1.protocol && e.data.protocol !== door_2.protocol) {
            return -1
        }
        if (e.data.protocol !== door_1.protocol && e.data.protocol === door_2.protocol) {
            return 1
        }
        if (e.data.protocol !== door_1.protocol && e.data.protocol !== door_2.protocol) {
            if (door_1.load === door_2.load) {
                return 0;
            }
            if (door_1.load < door_2.load) {
                return -1;
            }
            if (door_1.load > door_2.load) {
                return 1;
            }
        }
    }
}, false);