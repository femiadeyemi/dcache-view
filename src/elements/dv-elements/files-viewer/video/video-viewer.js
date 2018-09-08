class VideoViewer extends Polymer.Element
{
    constructor(src)
    {
        super();
        if (src) this.src = src;
        this._stopListener = this._stop.bind(this);
    }
    static get is()
    {
        return 'video-viewer';
    }
    static get properties()
    {
        return {
            src: {
                type: String,
                notify: true
            }
        }
    }
    connectedCallback()
    {
        super.connectedCallback();
        window.addEventListener('dv-namespace-close-files-viewer-appliance', this._stopListener);
    }
    disconnectedCallback()
    {
        super.disconnectedCallback();
        window.removeEventListener('dv-namespace-close-files-viewer-appliance', this._stopListener);
    }
    static get observers()
    {
        return ['_load(src)'];
    }
    _load(src)
    {
        this.$.video.src = src;
        this.dispatchEvent(
            new CustomEvent('dv-namespace-files-viewer-finished-loading', {bubbles:true, composed:true}));
        this.$.video.play();
    }
    _stop()
    {
        this.$.video.pause();
    }
}
window.customElements.define(VideoViewer.is, VideoViewer);