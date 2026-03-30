// 鼠标点击水波纹特效
(function() {
  // 配置参数
  const config = {
    rippleColor: '#409EFF',  // 水波纹主色（蓝色）
    enableMultiColor: false,  // 是否启用多色效果
    enableTrail: true,        // 是否启用鼠标移动轨迹
    maxRipples: 5,            // 同时显示的最大波纹数量
    trailColor: '#409EFF',    // 轨迹颜色
    trailSize: 12,            // 轨迹大小
    trailDuration: 600,       // 轨迹持续时间（ms）
    enableSound: false,       // 是否启用音效（需要音效文件）
    soundVolume: 0.1,         // 音效音量
    disableOnMobile: true     // 在移动设备上禁用
  };
  
  // 检测移动设备
  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  // 移动设备上禁用
  if (config.disableOnMobile && isMobileDevice()) {
    return;
  }
  
  // 创建样式元素
  const style = document.createElement('style');
  style.textContent = `
    .click-ripple {
      border-color: ${config.rippleColor} !important;
      box-shadow: 0 0 10px ${config.rippleColor} !important;
    }
    .mouse-trail {
      background: ${config.trailColor} !important;
    }
  `;
  document.head.appendChild(style);
  
  // 存储波纹元素
  let ripples = [];
  let trails = [];
  
  // 鼠标点击事件
  document.addEventListener('click', function(e) {
    // 限制同时显示的波纹数量
    if (ripples.length >= config.maxRipples) {
      const oldRipple = ripples.shift();
      if (oldRipple && oldRipple.parentNode) {
        oldRipple.parentNode.removeChild(oldRipple);
      }
    }
    
    // 创建波纹元素
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    if (config.enableMultiColor) {
      ripple.classList.add('multi-color');
    }
    
    // 设置位置
    ripple.style.left = e.clientX + 'px';
    ripple.style.top = e.clientY + 'px';
    
    // 添加到页面
    document.body.appendChild(ripple);
    ripples.push(ripple);
    
    // 播放音效（可选）
    if (config.enableSound) {
      playClickSound();
    }
    
    // 动画结束后移除元素
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
        ripples = ripples.filter(r => r !== ripple);
      }
    }, 1200);
  });
  
  // 鼠标移动轨迹效果
  if (config.enableTrail) {
    let lastTime = 0;
    const trailInterval = 50; // 轨迹间隔（ms）
    
    document.addEventListener('mousemove', function(e) {
      const currentTime = Date.now();
      
      // 限制轨迹生成频率
      if (currentTime - lastTime < trailInterval) {
        return;
      }
      lastTime = currentTime;
      
      // 限制同时显示的轨迹数量
      if (trails.length >= 8) {
        const oldTrail = trails.shift();
        if (oldTrail && oldTrail.parentNode) {
          oldTrail.parentNode.removeChild(oldTrail);
        }
      }
      
      // 创建轨迹元素
      const trail = document.createElement('div');
      trail.className = 'mouse-trail';
      trail.style.left = e.clientX + 'px';
      trail.style.top = e.clientY + 'px';
      trail.style.width = config.trailSize + 'px';
      trail.style.height = config.trailSize + 'px';
      
      // 添加到页面
      document.body.appendChild(trail);
      trails.push(trail);
      
      // 动画结束后移除元素
      setTimeout(() => {
        if (trail.parentNode) {
          trail.parentNode.removeChild(trail);
          trails = trails.filter(t => t !== trail);
        }
      }, config.trailDuration);
    });
  }
  
  // 播放点击音效（可选）
  function playClickSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 523.25; // C5 音符
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(config.soundVolume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
      console.log('音效播放失败:', e);
    }
  }
  
  // 添加控制台提示
  console.log('%c✨ 鼠标特效已加载 ✨', 'color: #409EFF; font-size: 14px; font-weight: bold;');
  console.log('%c📱 移动设备支持: ' + (!config.disableOnMobile || !isMobileDevice()), 'color: #67C23A;');
  
  // 添加到全局对象以便调试
  window.mouseEffect = {
    config: config,
    disable: function() {
      document.body.classList.add('no-mouse-effect');
      console.log('鼠标特效已禁用');
    },
    enable: function() {
      document.body.classList.remove('no-mouse-effect');
      console.log('鼠标特效已启用');
    },
    changeColor: function(color) {
      config.rippleColor = color;
      style.textContent = style.textContent.replace(/#[0-9a-fA-F]{6}/g, color);
      console.log('水波纹颜色已更改为: ' + color);
    }
  };
})();