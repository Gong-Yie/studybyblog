(function() {
  function addMusicIcon() {
    // 如果已经存在，先移除旧的（防止 Pjax 导致事件堆叠或重复）
    const oldBtn = document.getElementById('music-icon-item');
    if (oldBtn) oldBtn.remove();

    const rightside = document.getElementById('rightside');
    if (!rightside) return;

    // 找到设置图标的父容器（通常是 #rightside-config-hide 展开后的内容）
    const configShow = rightside.querySelector('#rightside-config-show');
    if (!configShow) return;

    const musicBtn = document.createElement('button');
    musicBtn.id = 'music-icon-item';
    musicBtn.type = 'button';
    musicBtn.title = '来点音乐，放松一下';
    musicBtn.innerHTML = '<i class="fas fa-music"></i>';

    // 唤出逻辑
    musicBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const panel = document.getElementById('global-player-panel');
      const toggleBtn = document.getElementById('panel-toggle');
      
      if (panel) {
        panel.style.display = 'block'; // 强制显示
        panel.classList.remove('minimized'); // 展开面板
        
        // 修正 toggle 按钮的图标为向左（已展开状态）
        if (toggleBtn) {
            toggleBtn.querySelector('i').className = 'fas fa-chevron-left';
            toggleBtn.title = '收起面板';
        }
      }
    });

    // 插入到设置面板的第一个位置
    if (configShow.firstChild) {
      configShow.insertBefore(musicBtn, configShow.firstChild);
    } else {
      configShow.appendChild(musicBtn);
    }
  }

  // 初始加载
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addMusicIcon);
  } else {
    addMusicIcon();
  }

  // 监听 Pjax 完成事件，重新挂载按钮
  document.addEventListener('pjax:complete', addMusicIcon);
})();