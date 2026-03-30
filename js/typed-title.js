(function() {
  const initTypedTitle = async () => {
    // 1. 获取主标题元素
    const titleElement = document.getElementById('site-title');
    
    // 2. 防止 Pjax 导致的重复执行
    if (!titleElement || titleElement.hasAttribute('data-typed')) return;

    // 获取你原本在后台设置的博客标题
    const originalText = titleElement.textContent.trim();
    if (!originalText) return;

    titleElement.setAttribute('data-typed', 'true');

    // --- 核心配置区 ---
    const config = {
      speed: 150,       // 打印一个字的速度 (毫秒)
      deleteSpeed: 80,  // 删除一个字的速度 (毫秒)
      pause: 1500,      // 整句话打印完后，停留展示的时间 (毫秒)
      emptyPause: 500,  // 全部删完后，准备打印下一轮前的空白停顿时间 (毫秒)
      
      // 你可以在这里放多句话，它会轮流打印和删除。
      // 如果只放 originalText，那就是一直重复打印和删除你的博客标题。
      strings: [originalText] 
      // 例如你想多句循环，可以改成: strings: ['Hello World', originalText, '欢迎来到我的博客']
    };

    // 3. 重构 DOM 结构：文字容器 + 闪烁光标
    titleElement.innerHTML = '<span id="typed-title-text"></span><span class="typed-cursor">|</span>';
    const textContainer = document.getElementById('typed-title-text');

    // 延迟函数，让异步逻辑看起来像同步一样简单
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    let stringIndex = 0;

    // 4. 无限循环核心逻辑
    while (true) {
      let currentString = config.strings[stringIndex];
      
      // 【阶段一】：逐字打印
      for (let i = 1; i <= currentString.length; i++) {
        textContainer.textContent = currentString.substring(0, i);
        await sleep(config.speed);
      }

      // 打印完毕，停顿一会儿让访客看清文字
      await sleep(config.pause);

      // 【阶段二】：逐字删除
      for (let i = currentString.length; i >= 0; i--) {
        textContainer.textContent = currentString.substring(0, i);
        await sleep(config.deleteSpeed);
      }

      // 删完之后的短暂空白停顿
      await sleep(config.emptyPause);

      // 准备打印数组里的下一句话（如果数组里只有一句，就继续打印这一句）
      stringIndex = (stringIndex + 1) % config.strings.length;
    }
  };

  // 监听 Pjax 和页面加载事件
  document.addEventListener('pjax:complete', initTypedTitle);
  document.addEventListener('DOMContentLoaded', initTypedTitle);
  initTypedTitle(); // 兜底执行
})();