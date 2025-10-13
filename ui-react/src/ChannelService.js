/**
 * Channel.io Service for React SPA
 * 채널톡 서비스 관리 클래스
 */

class ChannelService {
  constructor() {
    this.isLoaded = false;
  }

  /**
   * 채널톡 스크립트 로드
   */
  loadScript() {
    if (this.isLoaded) {
      return;
    }

    (function(){
      var w = window;
      if(w.ChannelIO){
        return w.console.error("ChannelIO script included twice.");
      }
      var ch = function(){
        ch.c(arguments);
      };
      ch.q = [];
      ch.c = function(args){
        ch.q.push(args);
      };
      w.ChannelIO = ch;
      function l(){
        if(w.ChannelIOInitialized){
          return;
        }
        w.ChannelIOInitialized = true;
        var s = document.createElement("script");
        s.type = "text/javascript";
        s.async = true;
        s.src = "https://cdn.channel.io/plugin/ch-plugin-web.js";
        var x = document.getElementsByTagName("script")[0];
        if(x.parentNode){
          x.parentNode.insertBefore(s,x);
        }
      }
      if(document.readyState === "complete"){
        l();
      }else{
        w.addEventListener("DOMContentLoaded", l);
        w.addEventListener("load", l);
      }
    })();

    this.isLoaded = true;
  }

  /**
   * 채널톡 부트 (초기화)
   * @param {Object} settings - 부트 설정 객체
   */
  boot(settings) {
    if (!this.isLoaded) {
      this.loadScript();
    }
    
    // ChannelIO가 로드될 때까지 대기 후 boot 실행
    const bootChannel = () => {
      if (window.ChannelIO) {
        window.ChannelIO('boot', settings);
      } else {
        setTimeout(bootChannel, 100);
      }
    };
    
    bootChannel();
  }

  /**
   * 채널톡 종료
   */
  shutdown() {
    window.ChannelIO?.('shutdown');
  }

  /**
   * 채널 버튼 표시
   */
  showChannelButton() {
    window.ChannelIO?.('showChannelButton');
  }

  /**
   * 채널 버튼 숨김
   */
  hideChannelButton() {
    window.ChannelIO?.('hideChannelButton');
  }

  /**
   * 채널 열기
   */
  openChat() {
    window.ChannelIO?.('openChat');
  }

  /**
   * 페이지 리셋 (SPA에서 페이지 전환 시 사용)
   */
  resetPage() {
    window.ChannelIO?.('resetPage');
  }

  /**
   * 외형 설정 (light/dark 모드)
   * @param {string} appearance - 'light' 또는 'dark'
   */
  setAppearance(appearance) {
    window.ChannelIO?.('setAppearance', appearance);
  }
}

export default new ChannelService();

