(function() {
  if (window.__globalPlayerLoaded) return;
  window.__globalPlayerLoaded = true;

  // 创建面板 DOM
  function createPlayerPanel() {
    // 默认添加 minimized 类，初始只显示一个小按钮，避免一进来就糊脸一大块
    const panelHTML = `
      <div id="global-player-panel" class="minimized">
        <div class="panel-header">
          <button id="panel-toggle" title="展开/收起音乐"><i class="fas fa-chevron-right"></i></button>
          <button id="panel-close" title="关闭面板"><i class="fas fa-times"></i></button>
        </div>
        
        <div class="panel-content">
          <div class="panel-message">
            <div class="welcome-message">🎵 Relaxing Time</div>
            <div class="hint-message">加载如果缓慢，请使用魔法</div>
          </div>
          <div id="aplayer-container"></div>
          <div class="next-info">
            <span style="opacity:0.7;">即将播放：</span>
            <span id="next-title">加载中...</span>
            <span id="next-artist"></span>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', panelHTML);
  }

  // 加载音乐列表
  async function loadAudioList() {
    try {
      const response = await fetch('https://gong-yie.github.io/musicforblog/list.json');
      if (!response.ok) throw new Error('加载音乐列表失败');
      let audioList = await response.json();

      const baseUrl = 'https://gong-yie.github.io/musicforblog/';
      return audioList.map(item => ({
        name: item.name,
        artist: item.artist,
        url: baseUrl + item.url,
        cover: item.cover ? (baseUrl + item.cover) : 'https://api.dicebear.com/7.x/shapes/svg?seed=' + item.name, // 找不到封面时给个随机几何图形兜底
      }));
    } catch (e) {
      console.error('音乐列表加载失败:', e);
      return [];
    }
  }

  // 初始化 APlayer
  async function initPlayer() {
    let audioList = await loadAudioList();
    if (audioList.length === 0) return;

    const ap = new APlayer({
      container: document.getElementById('aplayer-container'),
      audio: audioList,
      mini: false,
      autoplay: false,
      theme: 'var(--theme-color)', // 自动跟随 Butterfly 主题色
      loop: 'all',
      order: 'list',
      preload: 'auto',
      volume: 0.7,
      mutex: true,
      listFolded: false,
      listMaxHeight: '200px',
      lrcType: 0, 
    });

    window.__aplayer = ap;
    const panel = document.getElementById('global-player-panel');

    // 更新下一首信息逻辑
    function updateNextInfo() {
      // 安全获取音频列表
      const audios = ap.options.audio; 
      if (!audios || audios.length === 0) return;
      
      const currentIndex = ap.list.index;
      const nextIndex = (currentIndex + 1) % audios.length;
      const nextAudio = audios[nextIndex];
      
      document.getElementById('next-title').innerText = nextAudio.name || '未知';
      document.getElementById('next-artist').innerText = nextAudio.artist ? ' - ' + nextAudio.artist : '';
    }

    ap.on('listswitch', updateNextInfo);
    ap.on('play', updateNextInfo);
    updateNextInfo();

    // --- 按钮事件绑定 ---
    const toggleBtn = document.getElementById('panel-toggle');
    const closeBtn = document.getElementById('panel-close');
    const toggleIcon = toggleBtn.querySelector('i');

    // 展开/收起切换
    toggleBtn.addEventListener('click', function() {
      const isMinimized = panel.classList.toggle('minimized');
      // 动态切换图标方向
      if (isMinimized) {
        toggleIcon.className = 'fas fa-chevron-right';
        toggleBtn.title = '展开音乐';
      } else {
        toggleIcon.className = 'fas fa-chevron-left';
        toggleBtn.title = '收起面板';
      }
    });

    // 关闭按钮
    closeBtn.addEventListener('click', function() {
      panel.style.display = 'none';
      // 可选：关闭时暂停音乐
      // ap.pause(); 
    });
  }

  function start() {
    createPlayerPanel();
    initPlayer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();