import WS from '@/common/js/socket.js';

export const WebSocketPlugin = {
  install(Vue, options) {
    let $ws;
    Vue.mixin({
      created() {
        if (!$ws) {
          $ws = new WS();
        }
        if ($ws.state === 'WAITING') {
          $ws.Open(options[0]);
        }
        this.$ws = $ws;
      }
    });
  }
};
