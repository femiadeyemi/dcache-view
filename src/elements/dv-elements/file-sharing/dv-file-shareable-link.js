class ShareableLink
{
    constructor(opt)
    {
        this.options = opt;
    }

    generate()
    {
        const url =
            `${window.CONFIG["dcache-view.endpoints.webdav"].slice(0, -1)}${this.options.fullPath}`;
        const data =
            {
                "caveats":[`path:${this.options.fullPath}`, `activity: ${this.options.restriction}`],
                "validity":`${this.options.validity}`
            };
        fetch(url, {
            method: 'POST',
            body: data,
            credentials: 'omit',
            headers: {
                'authorization': app.getAuthValue(),
                'content-type': 'application/macaroon-request'
            }
        }).then(function(response) {
            if(response.ok) {
                return response.json();
            }
            throw new Error('Network response was not ok.');
        }).then(resp => {
            const m = resp.macaroon, s =
                `${window.location.href}#!/shared-file?filePath=${encodeURIComponent(this.options.fullPath)}&m=${m}`;
            window.dispatchEvent(new CustomEvent('dv-namespace-file-shareable-link-generated', {
                detail: {link: s.trim()}, bubbles: true, composed: true
            }));
        }).catch((err) =>{throw new Error(err.message)})
    }
}