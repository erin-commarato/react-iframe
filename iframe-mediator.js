/**
 * Simplifies two-way communication between parent and iframe
 */

const iframe = {
    baseUrl: 'https://www.domain.com',
    origin: 'https://www.domain.com'
  }

class iframeMediator {
  constructor(iframeRef) {
    this.isParent = false;
    if (iframeRef) {
      this.iframeRef = iframeRef;
      this.isParent = true;
    }
    this.isIframeLoaded = false;
    this.messageHandler = null;
    this.messages = [];
  }

  _setIframeLoaded = () => {
    this.isIframeLoaded = true;
  };

  _emptyMessageQueue = () => {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      this.sendMessage(this.messages[i]);
      this.messages.pop();
    }
  };

  _sendMessageToIframe = message => {
    this.iframeRef.current.contentWindow.postMessage(JSON.stringify(message), iframe.origin);
  };

  _sendMessageFromIframe = message => {
    if (window) {
      window.parent.postMessage(JSON.stringify(message), iframe.origin);
    }
  };

  handleIframeLoad = () => {
    this._setIframeLoaded();
    this._emptyMessageQueue();
  };

  sendMessage = message => {
    if (this.isParent) {
      if (this.isIframeLoaded) {
        this._sendMessageToIframe(message);
      } else {
        this.messages.push(message);
      }
    } else {
      this._sendMessageFromIframe(message);
    }
  };

  receiveMessage = message => {
    try {
      const messageData = JSON.parse(message.data);
      this.messageHandler(messageData);
    } catch (e) {
      // do nothing
      // console.warn(e);
    }
  };

  addListener = messageHandler => {
    this.messageHandler = messageHandler;
    if (window) {
      window.addEventListener('message', this.receiveMessage);
    }
  };

  removeListener = () => {
    if (window) {
      if (this.isParent) {
        window.removeEventListener('message', this.receiveMessage);
      }
    }
  };
}

export default iframeMediator;
