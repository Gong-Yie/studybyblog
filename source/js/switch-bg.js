(function() {
  // 1. 你的专属背景图库 (支持本地路径或图床链接)
  const backgrounds = [
    '/img/banner.png',                // 默认背景（对应你 config 里的初始设置）
    '/img/天依p1.jpg',   
    '/img/天依p2.jpg',        
    '/img/天依p3.jpg'
  ];

  // 2. 初始化背景并附加平滑过渡动画
  function initBackground() {
    const webBg = document.getElementById('web_bg');
    if (!webBg) return;

    // 从本地存储读取上次选中的背景，没有则默认显示第 0 张
    const savedIndex = localStorage.getItem('blog_bg_index') || 0;
    webBg.style.backgroundImage = `url(${backgrounds[savedIndex]})`;
    
    // 让背景切换时有一个平滑的淡入淡出感
    webBg.style.transition = 'background-image 0.6s ease-in-out';
  }

  // 3. 在右下角工具栏动态添加“切换背景”按钮
  function addBgSwitchIcon() {
    // 防止 Pjax 导致的重复渲染
    const oldBtn = document.getElementById('bg-switch-item');
    if (oldBtn) oldBtn.remove();

    const rightside = document.getElementById('rightside');
    if (!rightside) return;

    const configShow = rightside.querySelector('#rightside-config-show');
    if (!configShow) return;

    const switchBtn = document.createElement('button');
    switchBtn.id = 'bg-switch-item';
    switchBtn.type = 'button';
    switchBtn.title = '切换主题背景';
    switchBtn.innerHTML = '<i class="fas fa-image"></i>'; // 使用图片 Icon

    // 核心切换逻辑
    switchBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const webBg = document.getElementById('web_bg');
      if (!webBg) return;

      // 计算下一张图片的索引
      let currentIndex = parseInt(localStorage.getItem('blog_bg_index') || 0);
      let nextIndex = (currentIndex + 1) % backgrounds.length;

      // 切换图片并保存偏好
      webBg.style.backgroundImage = `url(${backgrounds[nextIndex]})`;
      localStorage.setItem('blog_bg_index', nextIndex);
    });

    // 插入到设置面板中（和你的音乐图标排排坐）
    if (configShow.firstChild) {
      configShow.insertBefore(switchBtn, configShow.firstChild);
    } else {
      configShow.appendChild(switchBtn);
    }
  }

  // 4. 启动与 Pjax 兼容处理
  function start() {
    initBackground();
    addBgSwitchIcon();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  // Pjax 跳转后重新挂载按钮，但不需要重新初始化背景（因为 web_bg 是全局层）
  document.addEventListener('pjax:complete', function() {
    addBgSwitchIcon();
  });
})();