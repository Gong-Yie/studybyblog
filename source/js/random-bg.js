(function() {
  // 你的专属图库（建议多放几张，刷新起来更有盲盒感）
  const backgrounds = [
    '/img/banner.png',                // 默认背景（对应你 config 里的初始设置）
    '/img/天依p1.jpg',   
    '/img/天依p2.jpg',        
    '/img/天依p3.jpg'
  ];

  function changeBackground() {
    const webBg = document.getElementById('web_bg');
    if (!webBg) return;

    // 每次执行直接抽取随机数，不做任何存储
    const randomIndex = Math.floor(Math.random() * backgrounds.length);
    
    // 替换背景并加上平滑过渡效果
    webBg.style.backgroundImage = `url(${backgrounds[randomIndex]})`;
    webBg.style.transition = 'background-image 0.8s ease-in-out';
  }

  // 1. 页面初次打开或按 F5 刷新时，立刻随机一张
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', changeBackground);
  } else {
    changeBackground();
  }

  // 2. 【细节控制】：关于 Pjax 无刷新跳转
  // document.addEventListener('pjax:complete', changeBackground);
})();