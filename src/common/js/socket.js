const ShowLog = true;

let logger = msg => {
  if (!ShowLog) {
    return;
  }
  console.log(msg);
};

export default class WS {
  state = 'WAITING';
  funcDic = {};
  closeManually = true;

  AddFunc({ fName, f }) {
    this.funcDic[fName] = f;
  }

  RemoveFunc(fName) {
    delete this.funcDic[fName];
  }

  RemoveAllFUnc() {
    this.funcDic = {};
  }

  RunFunc({ retrieve, ...args }) {
    if (this.funcDic[retrieve]) {
      this.funcDic[retrieve].call(this, { retrieve, ...args });
    }
  }

  Open() {
    try {
      this.state = 'CONNECTING';
      this.ws = new WebSocket(
        'wss://3x9r4af6h6.execute-api.ap-east-1.amazonaws.com/dev'
      );
      this.ws.onopen = e => {
        this.closeManually = false;
        logger('WS: on open', e);
        this.state = 'CONNECTED';
        this.RunFunc({ fName: 'onConnect' });
      };
      this.ws.onmessage = e => {
        logger('WS: on msg');
        this.RunFunc.call(this, JSON.parse(e.data));
      };
      this.ws.onerror = e => {
        logger('WS: connect error');
        this.RunFunc({ fName: 'onErr', msg: e });
      };
      this.ws.onclose = e => {
        this.ws = null;
        logger('WS: on close');
        this.state = 'CLOSED';
        this.RunFunc({ fName: 'onDisConnect', msg: e });
      };
    } catch (err) {
      throw new Error('connect websocket fail!');
    }
  }

  Close() {
    this.closeManually = true;
    this.ws && typeof this.ws.close === 'undefined' ? this.ws.close() : null;
    this.ws = undefined;
  }

  Call(actName, params) {
    if (!this.ws) {
      logger(`Call: Websocket is not connect!`);
      this.ws.open();
      return;
    }
    if (!params) {
      this.RunFunc({ fName: 'Error', msg: `args length invalid` });
      return;
    }
    if (this.ws.readyState !== 1) {
      this.RunFunc({
        fName: 'Bad NetWork',
        msg: `Call: Bad Network, connect slowly`
      });
      return;
    }
    let str = JSON.stringify(params);
    this.ws.send(str);
    logger(`WS: ${actName} requesting...`);
  }

}
