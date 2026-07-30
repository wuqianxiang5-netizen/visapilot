/**
 * VisaPilot — UI 渲染层
 * 所有页面/视图的渲染函数
 */

const VPUI = (function() {
  'use strict';
  // ========= 材料清单勾选持久化 =========
  function _ckKey(countryId, visaType, matId) {
    return 'vp_ck_' + countryId + '_' + visaType.replace(/[^\w]/g,'_') + '_' + matId;
  }
  function _ckGet(countryId, visaType, matId) {
    try { return localStorage.getItem(_ckKey(countryId, visaType, matId)) === '1'; } catch(e) { return false; }
  }
  function _ckToggle(countryId, visaType, matId, el) {
    const ch = el.checked;
    try { localStorage.setItem(_ckKey(countryId, visaType, matId), ch ? '1' : '0'); } catch(e) {}
    el.closest('.vp-material-item')?.classList.toggle('vp-material-done', ch);
  }

  // ========= 预约时间信息提示 =========
  function _aptInfo(countryId) {
    const m = {
      usa:{lead:'2-3个月',peak:'夏季（6-8月）和冬季（12-2月）名额紧张',channel:'AIS 签证预约系统'},
      uk:{lead:'1-2个月',peak:'夏季（7-9月）留学旺季',channel:'gov.uk / TLScontact 在线预约'},
      schengen:{lead:'1-2个月',peak:'夏季（6-8月）和圣诞节（12月）',channel:'VFS Global / TLScontact'},
      japan:{lead:'2-4周',peak:'樱花季（3-4月）和红叶季（10-11月）',channel:'日本驻华使领馆指定代办机构'},
      korea:{lead:'2-4周',peak:'暑假（7-8月）和春节前后',channel:'韩国驻华使领馆 / 签证中心'},
      india:{lead:'1-2个月',peak:'建议避开印度高温季节',channel:'印度签证电子申请中心'},
      australia:{lead:'1-2个月',peak:'寒假（12-2月）澳洲夏季',channel:'澳洲移民局 AVS 系统'},
      canada:{lead:'2-3个月',peak:'全年繁忙，夏季尤甚',channel:'IRCC 在线申请 / VFS'},
      ireland:{lead:'1-2个月',peak:'夏季（6-8月）',channel:'VFS Global 在线预约'},
      philippines:{lead:'1-2周',peak:'无明显旺季',channel:'菲律宾驻华使领馆'},
    };
    return m[countryId]||{lead:'1-2个月',peak:'请查看签证中心公告',channel:'签证中心在线预约系统'};
  }

  // ========= 增强型有效期/停留期限 =========
  function getEnhancedValidity(countryId, visaType) {
    const map={
      'usa':{'旅游(B1/B2)':'10年','商务(B1)':'10年','学生(F1)':'I-20有效期+60天','工作(H1B)':'3年（可延期）','过境(C1)':'最长29天'},
      'uk':{'旅游':'2年（可申请5/10年）','商务':'2年','学生(T4)':'课程时长+4个月','工作':'1-3年','过境':'48小时','长期签证':'5-10年'},
      'schengen':{'旅游':'3个月-5年','商务':'3个月-5年','学生':'课程时长','探亲访友':'3个月-1年','文化体育':'3个月-1年'},
      'japan':{'旅游':'单次3个月/三年5年','商务':'单次3个月/多次5年','学生':'课程时长','工作':'1-5年','过境':'15天'},
      'korea':{'旅游':'单次3个月/五年','商务':'单次3个月/五年','学生':'课程时长','工作':'1-3年','过境':'30天'},
      'india':{'旅游':'1年（电子签）','商务':'1年','学生':'课程时长','工作':'1年','医疗':'1年'},
      'australia':{'旅游':'1年（可多次）','商务':'1-3年','学生':'课程时长','工作':'2-4年','过境':'72小时','长期签证':'4年'},
      'canada':{'旅游':'最长10年','商务':'最长10年','学生':'课程时长+90天','工作':'1-3年','过境':'48小时'},
      'ireland':{'旅游':'3个月-5年','商务':'3个月-5年','学生':'课程时长','工作':'1-2年','过境':'最多3个月','长期签证':'5年'},
      'philippines':{'旅游':'3个月（可延）','商务':'3个月'},
    };
    return map[countryId]?.[visaType]||'1-5年';
  }

  function getEnhancedStay(countryId, visaType) {
    const map={
      'usa':{'旅游(B1/B2)':'最长180天','商务(B1)':'最长180天','学生(F1)':'课程期间','工作(H1B)':'签证有效期','过境(C1)':'最长29天'},
      'uk':{'旅游':'最长180天','商务':'最长180天','学生(T4)':'课程期间','工作':'签证有效期','过境':'48小时','长期签证':'签证有效期'},
      'schengen':{'旅游':'90天内最多停留90天','商务':'90天内最多停留90天','学生':'课程期间','探亲访友':'90天内最多停留90天','文化体育':'90天内最多停留90天'},
      'japan':{'旅游':'15-90天','商务':'15-90天','学生':'课程期间','工作':'签证有效期','过境':'15天'},
      'korea':{'旅游':'30-90天','商务':'30-90天','学生':'课程期间','工作':'签证有效期','过境':'30天'},
      'india':{'旅游':'最长60天','商务':'最长180天','学生':'课程期间','工作':'签证有效期','医疗':'最长60天'},
      'australia':{'旅游':'3-12个月','商务':'最长3个月','学生':'课程期间','工作':'签证有效期','过境':'72小时','长期签证':'签证有效期'},
      'canada':{'旅游':'最长180天','商务':'最长180天','学生':'课程期间','工作':'签证有效期','过境':'48小时'},
      'ireland':{'旅游':'最长90天','商务':'最长90天','学生':'课程期间','工作':'签证有效期','过境':'最多3个月','长期签证':'签证有效期'},
      'philippines':{'旅游':'30-59天','商务':'30天'},
    };
    return map[countryId]?.[visaType]||'视签证官决定为准';
  }


  // ========= 首页 =========
  function renderHome() {
    const main = document.getElementById('vp-main-content');
    if (!main) return;

    const hotCountries = VISAPILOT.COUNTRIES.filter(c => c.hot);

    main.innerHTML = `
      <div class="vp-home">
        <div class="vp-home-hero">
          <div class="vp-hero">
            <div class="vp-hero-content">
              <div class="vp-hero-logo">VisaPilot<span class="vp-hero-dot">.</span></div>
              <div class="vp-hero-subtitle">您身边的签证官 — 全球签证一站办理</div>
              <div class="vp-hero-desc">覆盖 ${VISAPILOT.COUNTRIES.length}+ 国家、${Object.keys(VISAPILOT.VISA_CONFIG).reduce((a,c) => a + VISAPILOT.VISA_CONFIG[c].types.length, 0)}+ 签证类型。智能材料清单、在线预约、专业代办。</div>
              <div class="vp-hero-btns">
                <a href="#" class="vp-hero-btn-primary" onclick="VPApp.navigateToCountry('usa');return false">立即查询签证</a>
                <a href="#" class="vp-hero-btn-secondary" onclick="VPApp.showRegister();return false">注册会员</a>
              </div>
            </div>
          </div>

          <div class="vp-hero-stats">
            <div class="vp-hero-stat-card">
              <div class="vp-hero-stat-num">${VISAPILOT.COUNTRIES.length}+</div>
              <div class="vp-hero-stat-label">覆盖国家</div>
            </div>
            <div class="vp-hero-stat-card">
              <div class="vp-hero-stat-num">${Object.keys(VISAPILOT.VISA_CONFIG).reduce((a,c) => a + VISAPILOT.VISA_CONFIG[c].types.length, 0)}+</div>
              <div class="vp-hero-stat-label">签证类型</div>
            </div>
            <div class="vp-hero-stat-card">
              <div class="vp-hero-stat-num">29</div>
              <div class="vp-hero-stat-label">申根国家</div>
            </div>
            <div class="vp-hero-stat-card">
              <div class="vp-hero-stat-num">24/7</div>
              <div class="vp-hero-stat-label">智能咨询</div>
            </div>
          </div>

          <div class="vp-home-search" style="margin-top:24px">
            <input type="text" class="vp-input vp-input-lg" id="vp-global-search" placeholder="🔍 搜索国家（中/英文）..." oninput="VPUI.searchCountry(this.value)">
            <div id="vp-search-results" class="vp-search-results"></div>
          </div>
        </div>

        <div class="vp-section">
          <h3>🔥 热门国家</h3>
          <div class="vp-country-grid">
            ${hotCountries.map(c => `
              <div class="vp-country-card vp-country-card-hot" onclick="VPApp.navigateToCountry('${c.id}')">
                <span class="vp-country-flag">${c.flag}</span>
                <span class="vp-country-name">${c.name}</span>
                ${c.hot ? '<span class="vp-badge-hot">🔥</span>' : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <div class="vp-section">
          <h3>🇪🇺 申根签 · 29国 · 一键通行</h3>
          <div class="vp-card-highlight" onclick="VPApp.navigateToCountry('schengen')">
            <div class="vp-card-highlight-content">
              <span class="vp-card-highlight-icon">🇪🇺</span>
              <div>
                <h4>申根签证（Schengen Visa）</h4>
                <p>一签通行 29 个欧洲国家 · 热门：法国、意大利、西班牙、德国、瑞士</p>
              </div>
              <span class="vp-card-arrow">→</span>
            </div>
          </div>
        </div>

        <div class="vp-section">
          <h3>🌍 全部国家/地区</h3>
          <div class="vp-country-grid">
            ${VISAPILOT.COUNTRIES.map(c => `
              <div class="vp-country-card ${c.hot ? '' : ''}" onclick="VPApp.navigateToCountry('${c.id}')">
                <span class="vp-country-flag">${c.flag}</span>
                <span class="vp-country-name">${c.name}</span>
                ${c.hot ? '<span class="vp-badge-hot">🔥</span>' : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 进度步骤指引 -->
        <div class="vp-section">
          <div class="vp-progress-steps">
            <div class="vp-progress-step-item">
              <div class="vp-progress-circle vp-progress-active">1</div>
              <span>选择国家</span>
            </div>
            <div class="vp-progress-line"></div>
            <div class="vp-progress-step-item">
              <div class="vp-progress-circle">2</div>
              <span>选择类型</span>
            </div>
            <div class="vp-progress-line"></div>
            <div class="vp-progress-step-item">
              <div class="vp-progress-circle">3</div>
              <span>准备材料</span>
            </div>
            <div class="vp-progress-line"></div>
            <div class="vp-progress-step-item">
              <div class="vp-progress-circle">4</div>
              <span>预约面签</span>
            </div>
            <div class="vp-progress-line"></div>
            <div class="vp-progress-step-item">
              <div class="vp-progress-circle">5</div>
              <span>出签取件</span>
            </div>
          </div>
        </div>

        <div class="vp-section">
          <h3>🛎️ 人工代办服务</h3>
          <div class="vp-plans-grid">
            <div class="vp-plan-card vp-plan-popular">
              <div class="vp-plan-badge">🛎️ 最受欢迎</div>
              <h4>线上审核</h4>
              <div class="vp-plan-price">¥100</div>
              <ul>
                <li>材料清单核对</li>
                <li>翻译整理</li>
                <li>材料审核</li>
                <li>持续至出签</li>
              </ul>
              <button class="vp-btn vp-btn-primary vp-btn-block" onclick="VPApp.openBooking('diy')">立即选择</button>
            </div>
            <div class="vp-plan-card vp-plan-popular">
              <div class="vp-plan-badge">⭐ 最值性价比</div>
              <h4>全程代办</h4>
              <div class="vp-plan-price">¥299</div>
              <ul>
                <li>基础材料办理</li>
                <li>电子材料交付</li>
                <li>现场材料检查</li>
                <li>拒签免费咨询</li>
              </ul>
              <button class="vp-btn vp-btn-primary vp-btn-block" onclick="VPApp.openBooking('basic')">立即选择</button>
            </div>
            <div class="vp-plan-card vp-plan-popular">
              <div class="vp-plan-badge">👍 最值推荐</div>
              <h4>全程代办</h4>
              <div class="vp-plan-price">¥399</div>
              <ul>
                <li>标准代办全套</li>
                <li>大使馆线下递交</li>
                <li>现场材料检查</li>
                <li>拒签免费咨询</li>
              </ul>
              <button class="vp-btn vp-btn-primary vp-btn-block" onclick="VPApp.openBooking('full')">立即选择</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ========= 搜索 =========
  function searchCountry(query) {
    const results = document.getElementById('vp-search-results');
    if (!results) return;
    if (!query.trim()) { results.innerHTML = ''; results.classList.remove('vp-show'); return; }

    const q = query.toLowerCase();
    const hits = VISAPILOT.COUNTRIES.filter(c =>
      c.name.includes(q) || c.flag.includes(q) || c.id.includes(q)
    );

    if (hits.length === 0) {
      results.innerHTML = '<div class="vp-search-empty">未找到匹配国家</div>';
    } else {
      results.innerHTML = hits.map(c => `
        <div class="vp-search-item" onclick="VPApp.navigateToCountry('${c.id}')">
          ${c.flag} ${c.name} ${c.hot ? '🔥' : ''}
        </div>
      `).join('');
    }
    results.classList.add('vp-show');
  }

  // ========= 侧边栏 =========
  function renderSidebar() {
    const sidebar = document.getElementById('vp-sidebar');
    if (!sidebar) return;

    const user = VPAuth.currentUser();

    sidebar.innerHTML = `
      <div class="vp-sidebar-header">🌍 国家/地区</div>
      <div class="vp-sidebar-item vp-sidebar-schengen" onclick="VPApp.navigateToCountry('schengen')">
        🇪🇺 申根签 · 29国 🔥
      </div>
      ${VISAPILOT.COUNTRIES.filter(c => c.id !== 'schengen').map(c => `
        <div class="vp-sidebar-item" onclick="VPApp.navigateToCountry('${c.id}')">
          ${c.flag} ${c.name} ${c.hot ? '🔥' : ''}
        </div>
      `).join('')}
      <hr class="vp-sidebar-divider">
      <div class="vp-sidebar-item" onclick="VPApp.showMyBookings()">📅 我的预约</div>
      ${user ? `<div class="vp-sidebar-item" onclick="VPApp.showProfile()">👤 个人中心</div>` : ''}
    `;

    // 高亮当前选中的国家
    if (VPApp.currentCountry) {
      sidebar.querySelectorAll('.vp-sidebar-item').forEach(el => {
        if (el.textContent.includes(VPApp.currentCountry === 'schengen' ? '申根签' : VISAPILOT.VISA_CONFIG[VPApp.currentCountry]?.name)) {
          el.classList.add('vp-sidebar-active');
        }
      });
    }
  }

  // ========= 国家详情页 =========
  function renderCountryDetail(countryId) {
    const config = VISAPILOT.VISA_CONFIG[countryId];
    if (!config) { renderHome(); return; }
    const main = document.getElementById('vp-main-content');
    if (!main) return;

    VPApp.currentCountry = countryId;

    // 申根页特殊处理
    if (countryId === 'schengen') {
      renderSchengenPage(main);
      return;
    }

    const mainVisaType = VPApp.currentVisaType || config.types[0];
    VPApp.currentVisaType = mainVisaType;

    main.innerHTML = `
      <div class="vp-country-detail">
        <div class="vp-country-header">
          <div class="vp-country-header-info">
            <h1>${config.flag} ${config.name} 签证</h1>
            <p class="vp-text-muted">费用参考：${config.feeNote}</p>
          </div>
        </div>

        <!-- 🇨🇳 中国客户专属提示 -->
        <div class="vp-china-banner">
          🇨🇳 中国客户专属 · 费用为人民币参考价 · 银行流水建议余额≥5万 · 支持支付宝/微信支付
          <button class="vp-btn vp-btn-sm" onclick="VPChat.toggleAIChat()" style="margin-left:8px">💬 咨询</button>
        </div>

        <!-- 签证类型标签 -->
        <div class="vp-visa-tabs" id="vp-visa-tabs">
          ${config.types.map(t => `
            <button class="vp-visa-tab ${t === mainVisaType ? 'active' : ''}" onclick="VPApp.switchVisaType('${countryId}','${t}')">${t}</button>
          `).join('')}
        </div>

        <div id="vp-visa-detail-content">
          ${renderVisaDetail(countryId, mainVisaType)}
        </div>

        <!-- 代办推荐卡片 -->
        <div class="vp-section" style="margin-top:24px">
          <h3>🛎️ 需要代办服务？</h3>
          <div class="vp-plans-grid">
            <div class="vp-plan-card vp-plan-popular">
              <div class="vp-plan-badge">🛎️ 最受欢迎</div>
              <h4>线上审核</h4>
              <div class="vp-plan-price">¥100</div>
              <button class="vp-btn vp-btn-primary vp-btn-block" onclick="VPApp.openBooking('diy')">立即选择</button>
            </div>
            <div class="vp-plan-card vp-plan-popular">
              <div class="vp-plan-badge">⭐ 最值性价比</div>
              <h4>全程代办</h4>
              <div class="vp-plan-price">¥299</div>
              <button class="vp-btn vp-btn-primary vp-btn-block" onclick="VPApp.openBooking('basic')">立即选择</button>
            </div>
            <div class="vp-plan-card vp-plan-popular">
              <div class="vp-plan-badge">👍 最值推荐</div>
              <h4>全程代办</h4>
              <div class="vp-plan-price">¥399</div>
              <button class="vp-btn vp-btn-primary vp-btn-block" onclick="VPApp.openBooking('full')">立即选择</button>
            </div>
          </div>
          <p style="margin-top:12px;font-size:0.9em;color:var(--text-muted)">
            <a href="#" onclick="VPChat.toggleAIChat();return false">💬 咨询智能助手</a> · 
            <a href="#" onclick="VPApp.openBooking('diy');return false">🛎️ 一键下单</a>
          </p>
        </div>
      </div>
    `;

    renderSidebar();
    reorderVisaDetailLayout();
  }

  function renderVisaDetail(countryId, visaType) {
    const config = VISAPILOT.VISA_CONFIG[countryId];
    const typeClean = visaType.match(/旅游|商务|学生|工作|过境|探亲访友|医疗|文化体育|长期签证/)?.[0];
    const templates = VISAPILOT.MATERIAL_TEMPLATES[typeClean] || VISAPILOT.MATERIAL_TEMPLATES['旅游'];
    const aptInfo = _aptInfo(countryId);

    // 费用
    const fee = config.baseFees[visaType] || '请咨询';
    const feeStr = typeof fee === 'number' ? `¥${fee}` : fee;

    return `
<!-- 大使馆链接 -->
        <div class="vp-section">
          <h3>🔗 大使馆官方链接</h3>
          <a href="https://www.google.com/search?q=${encodeURIComponent(config.name+' 大使馆 签证')}" target="_blank" class="vp-btn vp-btn-outline">访问 ${config.name} 大使馆官网</a>
        </div>

<!-- 签证概览卡 -->
        <div class="vp-overview-card">
          <h3>📋 签证概览</h3>
          <div class="vp-overview-grid">
            <div class="vp-overview-item"><span>类型</span><strong>${visaType}</strong></div>
            <div class="vp-overview-item"><span>费用</span><strong>${feeStr}</strong></div>
            <div class="vp-overview-item"><span>办理周期</span><strong>${getProcessTime(countryId)}个工作日</strong></div>
            <div class="vp-overview-item"><span>有效期</span><strong>${getEnhancedValidity(countryId, visaType)}</strong></div>
            <div class="vp-overview-item"><span>停留期限</span><strong>${getEnhancedStay(countryId, visaType)}</strong></div>
          </div>
        </div>

<!-- 办理流程 -->
        <div class="vp-section">
          <h3>📋 办理流程</h3>
          <div class="vp-process-steps">
            ${VISAPILOT.PROCESS_STEPS.map(s => `
              <div class="vp-process-step">
                <div class="vp-step-number">${s.step}</div>
                <div class="vp-step-content">
                  <h4>${s.title}</h4>
                  <p>${s.desc}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

<!-- 材料清单 -->
        <div class="vp-section">
          <h3>📋 材料清单</h3>
          <div class="vp-materials-list">
            ${templates.map(m => {
              const reqLabel = m.required === true ? '必交' : m.required === 'conditional' ? '视情况' : '可选';
              const user = VPAuth.currentUser();
              const canView = !user && m.required === true ? false : true;
              return `
                <div class="vp-material-item">
                  <label class="vp-checkbox ${_ckGet(countryId, visaType, m.id) ? 'vp-checked' : ''}">
                    <input type="checkbox" ${_ckGet(countryId, visaType, m.id) ? 'checked' : ''} ${canView ? `onchange="VPUI.handleMatToggle('${countryId}','${visaType}','${m.id}',this)"` : 'disabled'}>
                    <span>${canView ? m.name : '🔒 注册会员可见'}</span>
                  </label>
                  <span class="vp-material-required ${m.required === true ? 'vp-required' : ''}">${canView ? reqLabel : '🔒'}</span>
                  ${canView && m.note ? `<span class="vp-text-muted vp-material-note">${m.note}</span>` : ''}
                </div>
              `;
            }).join('')}
          </div>
          ${!VPAuth.currentUser() ? '<p class="vp-login-prompt"><a href="#" onclick="VPApp.showLogin();return false">🔐 登录/注册</a> 查看完整的材料清单和办理流程</p>' : ''}
        </div>

<!-- 签证中心 -->
        <div class="vp-section">
          <h3>📍 签证中心</h3>
          <div class="vp-center-list">
            ${config.centers.map(c => `
              <div class="vp-center-item">
                <strong>${c.city}</strong>
                <p>${c.addr}</p>
                <span class="vp-text-muted">预约系统：${c.system}</span>
              </div>
            `).join('')}
          </div>
        </div>
          <div class="vp-center-selector" style="margin:12px 0">
            <label>选择签证中心：</label>
            <select class="vp-select" id="vp-center-select" onchange="VPCalendar.init('${countryId}','${visaType}')">
              ${config.centers.map(c => `<option value="${c.city}">${c.city}</option>`).join('')}
            </select>

<!-- 预约时间区域 -->
        <div class="vp-section" id="vp-calendar-section">
          <h3>📅 预约时间</h3>
          <div class="vp-appointment-info">
            <div class="vp-apt-info-card">
              <p><strong>⏱ 建议提前：</strong>${aptInfo.lead}</p>
              <p><strong>🔥 旺季提示：</strong>${aptInfo.peak}</p>
              <p><strong>🔗 预约渠道：</strong>${aptInfo.channel}</p>
              <p class="vp-apt-tip">💡 尽早预约，旺季名额紧张。选择日期查看可预约时段。</p>
            </div>
          </div>
          <div id="vp-wait-time"></div>
          </div>
          <div class="vp-calendar-two-col">
            <div class="vp-cal-col-left">
              <div id="vp-calendar-body"></div>
            </div>
            <div class="vp-cal-col-right">
              <h4 style="margin-bottom:8px">🕐 可选时间段</h4>
              <div id="vp-timeslots" class="vp-timeslot-area"></div>
            </div>
          </div>
          <div id="vp-booking-summary"></div>
        </div>

        <!-- DIY 自助服务 -->
        <div class="vp-section">
          <h3>🛠️ DIY 自助服务</h3>
          <div class="vp-diy-tabs">
            <button class="vp-diy-tab active" onclick="VPUI.switchDIYTab(this,'upload','${countryId}','${visaType}')">📄 材料上传</button>
            <button class="vp-diy-tab" onclick="VPUI.switchDIYTab(this,'itinerary','${countryId}','${visaType}')">🗺️ 行程</button>
            <button class="vp-diy-tab" onclick="VPUI.switchDIYTab(this,'insurance','${countryId}','${visaType}')">🏥 保险</button>
            <button class="vp-diy-tab" onclick="VPUI.switchDIYTab(this,'translation','${countryId}','${visaType}')">🌐 翻译</button>
            <button class="vp-diy-tab" onclick="VPUI.switchDIYTab(this,'generate','${countryId}','${visaType}')">📦 生成</button>
          </div>
          <div id="vp-diy-content">
            ${VPAuth.currentUser() ? '<p class="vp-text-muted">选择上方标签开始DIY服务</p>' : '<p class="vp-login-prompt"><a href="#" onclick="VPApp.showLogin();return false">🔐 登录/注册</a> 使用DIY自助服务</p>'}
          </div>
        </div>

        <!-- 咨询入口 -->
        <div class="vp-section" style="text-align:center;padding:20px;background:var(--bg-muted);border-radius:12px">
          <p>还有疑问？<a href="#" onclick="VPChat.toggleAIChat();return false">💬 咨询智能助手</a> 或 <a href="#" onclick="VPApp.showConsultForm();return false">📝 提交咨询表单</a></p>
        </div>
      </div>`;
  }

  // ========= 申根专区 =========
  function renderSchengenPage(main) {
    main.innerHTML = `
      <div class="vp-country-detail">
        <div class="vp-china-banner">
          🇨🇳 中国客户专属 · 一签通行29国 · 法国/意大利出签最快（10-15天）
        </div>
        <div class="vp-schengen-page">
          <h1>🇪🇺 申根签证</h1>
          <div class="vp-schengen-info">
            <p>申根签证（Schengen Visa）允许持有人在申根区29个国家自由旅行，一签通行。</p>
            <p><strong>热门目的地：</strong>法国、意大利、西班牙、德国、瑞士、荷兰</p>
            <p><strong>注意事项：</strong></p>
            <ul>
              <li>选择行程中停留时间最长的国家申请</li>
              <li>如各国停留时间相近，选择首入国</li>
              <li>首次申根建议选择法国或意大利</li>
              <li>费用：€80+服务费≈¥620-900</li>
            </ul>
          </div>
          <h3 style="margin-top:24px">🌍 29国列表</h3>
          <div class="vp-country-grid vp-country-grid-lg">
            ${VISAPILOT.SCHENGEN_COUNTRIES.map(c => `
              <div class="vp-country-card" onclick="VPUI.clickSchengenCountry('${c.code}','${c.name}')">
                <span class="vp-country-flag">${c.flag}</span>
                <span class="vp-country-name">${c.name}</span>
                ${c.hot ? '<span class="vp-badge-hot">🔥</span>' : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function clickSchengenCountry(code, name) {
    var standaloneMap = { fra:'france', ita:'italy', esp:'spain', deu:'germany', nld:'netherlands', che:'switzerland' };
    var standaloneId = standaloneMap[code];
    if (standaloneId && VISAPILOT.VISA_CONFIG[standaloneId]) {
      VPApp.navigateToCountry(standaloneId);
    } else {
      renderSchengenCountryDetail(code);
    }
  }


  // ========= DIY 标签切换 =========
  function switchDIYTab(btn, tab, countryId, visaType) {
    const parent = btn.closest('.vp-diy-tabs');
    if (parent) parent.querySelectorAll('.vp-diy-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    const content = document.getElementById('vp-diy-content');
    if (!content) return;

    const countryConfig = VISAPILOT.VISA_CONFIG[countryId];
    const typeClean = visaType.match(/旅游|商务|学生|工作|过境|探亲访友|医疗|文化体育|长期签证/)?.[0];
    const templates = VISAPILOT.MATERIAL_TEMPLATES[typeClean] || VISAPILOT.MATERIAL_TEMPLATES['旅游'];
    const aptInfo = _aptInfo(countryId);

    const user = VPAuth.currentUser();
    if (!user) {
      content.innerHTML = '<p class="vp-login-prompt"><a href="#" onclick="VPApp.showLogin();return false">🔐 登录/注册</a> 使用DIY自助服务</p>';
      return;
    }

    switch (tab) {
      case 'upload':
        content.innerHTML = '<div id="vp-diy-upload"></div>';
        VPDIY.renderUploadSection('vp-diy-upload', countryId, visaType, templates);
        break;
      case 'itinerary':
        content.innerHTML = `
          <div class="vp-diy-itinerary">
            <h4>🗺️ 生成旅行行程单</h4>
            <div class="vp-form-row">
              <label>出发日期：<input type="date" class="vp-input" id="vp-it-start" value="${new Date().toISOString().slice(0,10)}"></label>
              <label>返回日期：<input type="date" class="vp-input" id="vp-it-end" value="${new Date(Date.now()+7*86400000).toISOString().slice(0,10)}"></label>
            </div>
            <div class="vp-form-row">
              <label>旅行风格：
                <select class="vp-select" id="vp-it-style">
                  <option value="relaxed">悠闲放松</option>
                  <option value="balanced" selected>适中均衡</option>
                  <option value="compact">紧凑高效</option>
                </select>
              </label>
              <label>兴趣偏好：
                <select class="vp-select" id="vp-it-preference">
                  <option value="mixed" selected>综合</option>
                  <option value="culture">文化历史</option>
                  <option value="gourmet">美食购物</option>
                  <option value="nature">自然风光</option>
                </select>
              </label>
            </div>
            <button class="vp-btn vp-btn-primary" onclick="VPUI.generateItineraryFromDIY('${countryId}','${visaType}')">🗺️ 生成行程单表格</button>
            <div id="vp-itinerary-result" style="margin-top:16px"></div>
          </div>
        `;
        break;
      case 'insurance':
        content.innerHTML = '<div id="vp-diy-insurance"></div>';
        VPDIY.renderInsurance('vp-diy-insurance', countryId);
        break;
      case 'translation':
        content.innerHTML = '<div id="vp-diy-translation"></div>';
        VPDIY.renderTranslation('vp-diy-translation');
        break;
      case 'generate':
        content.innerHTML = `
          <div class="vp-diy-generate">
            <h4>📦 生成个人材料包</h4>
            <div class="vp-form">
              <div class="vp-form-row"><label>姓名拼音：<input class="vp-input" id="vp-gen-name" placeholder="ZHANG SAN"></label></div>
              <div class="vp-form-row"><label>护照号：<input class="vp-input" id="vp-gen-passport" placeholder="E12345678"></label></div>
              <div class="vp-form-row"><label>出生日期：<input class="vp-input" id="vp-gen-birth" type="date"></label></div>
              <div class="vp-form-row"><label>单位/学校：<input class="vp-input" id="vp-gen-company" placeholder="公司名称"></label></div>
              <div class="vp-form-row"><label>职位：<input class="vp-input" id="vp-gen-position" placeholder="职位"></label></div>
              <div class="vp-form-row"><label>出访目的：<textarea class="vp-input" id="vp-gen-purpose" rows="3" placeholder="说明出行目的..."></textarea></label></div>
              <button class="vp-btn vp-btn-primary" onclick="VPUI.generatePackageFromDIY('${countryId}','${visaType}')">📄 生成个人材料</button>
            </div>
            <div id="vp-generate-result" style="margin-top:16px"></div>
          </div>
        `;
        break;
    }
  }

  function generateItineraryFromDIY(countryId, visaType) {
    const start = document.getElementById('vp-it-start')?.value;
    const end = document.getElementById('vp-it-end')?.value;
    const style = document.getElementById('vp-it-style')?.value || 'balanced';
    const preference = document.getElementById('vp-it-preference')?.value || 'mixed';

    if (!start || !end) { VPApp.showToast('请选择出发和返回日期','warning'); return; }

    const result = document.getElementById('vp-itinerary-result');
    if (result) {
      result.innerHTML = VPDIY.generateItinerary(countryId, start, end, style, preference);
    }
  }

  function generatePackageFromDIY(countryId, visaType) {
    const userInfo = {
      namePinyin: document.getElementById('vp-gen-name')?.value || '',
      passport: document.getElementById('vp-gen-passport')?.value || '',
      birthDate: document.getElementById('vp-gen-birth')?.value || '',
      company: document.getElementById('vp-gen-company')?.value || '',
      position: document.getElementById('vp-gen-position')?.value || '',
      tripPurpose: document.getElementById('vp-gen-purpose')?.value || '',
    };

    if (!userInfo.namePinyin || !userInfo.passport) {
      VPApp.showToast('请至少填写姓名拼音和护照号','warning');
      return;
    }

    const result = document.getElementById('vp-generate-result');
    if (result) {
      result.innerHTML = VPDIY.generateMaterialPackage(countryId, visaType, userInfo);
    }
  }

  // ========= 我的预约 =========
  function renderMyBookings() {
    const main = document.getElementById('vp-main-content');
    if (!main) return;
    const user = VPAuth.currentUser();
    if (!user) {
      VPApp.showLogin();
      return;
    }

    const bookings = VPStorage.getBookings().filter(b => b.userId === user.phone);
    const reviews = VPStorage.getReviews().filter(r => r.userId === user.phone);

    main.innerHTML = `
      <div class="vp-page">
        <h2>📅 我的预约</h2>
        <div class="vp-my-tabs">
          <button class="vp-my-tab active" onclick="VPUI.switchMyTab(this,'bookings')">📅 面签预约 (${bookings.length})</button>
          <button class="vp-my-tab" onclick="VPUI.switchMyTab(this,'reviews')">📋 审核记录 (${reviews.length})</button>
        </div>
        <div id="vp-my-bookings-content">
          ${renderBookingList(bookings)}
        </div>
      </div>
    `;
  }

  function switchMyTab(btn, tab) {
    const parent = btn.closest('.vp-my-tabs');
    parent.querySelectorAll('.vp-my-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    const content = document.getElementById('vp-my-bookings-content');
    if (!content) return;
    const user = VPAuth.currentUser();
    if (!user) return;

    if (tab === 'bookings') {
      const bookings = VPStorage.getBookings().filter(b => b.userId === user.phone);
      content.innerHTML = renderBookingList(bookings);
    } else {
      const reviews = VPStorage.getReviews().filter(r => r.userId === user.phone);
      content.innerHTML = renderReviewList(reviews);
    }
  }

  function renderBookingList(bookings) {
    if (bookings.length === 0) return '<div class="vp-empty-state">暂无预约记录</div>';

    return `
      <div class="vp-booking-list">
        ${bookings.map(b => `
          <div class="vp-booking-card">
            <div class="vp-booking-card-header">
              <span>${b.countryFlag || ''} ${b.countryName || b.countryId} · ${b.visaType}</span>
              <span class="vp-booking-status vp-booking-confirmed">✅ 已预约</span>
            </div>
            <div class="vp-booking-card-body">
              <p>📅 ${b.date} ${b.time}</p>
              <p>📍 ${b.center || '-'}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderReviewList(reviews) {
    if (reviews.length === 0) return '<div class="vp-empty-state">暂无审核记录</div>';

    return `
      <div class="vp-booking-list">
        ${reviews.map(r => {
          const statusMap = {
            'pending': { icon: '⏳', text: '等待签证官接单', color: 'var(--text-muted)' },
            'reviewing': { icon: '🔍', text: '审核中', color: 'var(--info)' },
            'approved': { icon: '✅', text: '审核通过', color: 'var(--success)' },
            'rejected': { icon: '❌', text: '需修改', color: 'var(--danger)' },
          };
          const st = statusMap[r.status] || statusMap['pending'];
          const hasReject = r.status === 'rejected';

          // 获取材料状态明细
          let materialsHtml = '';
          if (r.materialStatus) {
            materialsHtml = `<div class="vp-review-materials">
              ${Object.entries(r.materialStatus).map(([k, v]) => `
                <span class="vp-review-material-tag ${v === 'approved' ? 'vp-tag-ok' : 'vp-tag-fail'}">
                  ${v === 'approved' ? '✅' : '❌'} ${k}
                  ${v === 'rejected' && r.rejectReasons?.[k] ? `<span class="vp-text-muted" title="${r.rejectReasons[k]}">📝</span>` : ''}
                </span>
              `).join('')}
            </div>`;
          }

          return `
            <div class="vp-booking-card" style="border-left:3px solid ${st.color}">
              <div class="vp-booking-card-header">
                <span>${r.countryFlag || ''} ${r.countryName || r.countryId} · ${r.visaType}</span>
                <span style="color:${st.color}">${st.icon} ${st.text}</span>
              </div>
              <div class="vp-booking-card-body">
                <p>提交时间：${new Date(r.createdAt).toLocaleDateString('zh-CN')} · ¥100</p>
                ${r.agentName ? `<p>签证官：${r.agentName}</p>` : ''}
                ${materialsHtml ? `<div style="margin-top:8px">${materialsHtml}</div>` : ''}
              </div>
              <div class="vp-booking-card-actions">
                ${hasReject ? `<button class="vp-btn vp-btn-sm vp-btn-primary" onclick="VPApp.navigateToCountry('${r.countryId}','${r.visaType}')">🔄 重新提交材料</button>` : ''}
                ${r.agentPhone ? `<button class="vp-btn vp-btn-sm vp-btn-outline" onclick="VPUI.openReviewChat('${r.id}','${r.countryId}','${r.visaType}')">💬 联系签证官</button>` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function openReviewChat(reviewId, countryId, visaType) {
    const config = VISAPILOT.VISA_CONFIG[countryId];
    const convId = 'review_' + reviewId;
    const review = VPStorage.getReviews().find(r => r.id === reviewId);

    // 创建一个内嵌聊天弹窗
    const modal = document.createElement('div');
    modal.className = 'vp-modal-overlay';
    modal.innerHTML = `
      <div class="vp-modal vp-modal-lg" style="max-width:500px">
        <div class="vp-modal-header">
          <h3>💬 ${config?.flag || ''} ${config?.name || ''} · ${visaType}</h3>
          <button class="vp-modal-close" onclick="this.closest('.vp-modal-overlay').remove()">✕</button>
        </div>
        <div class="vp-modal-body" style="height:400px;display:flex;flex-direction:column">
          <div id="vp-review-chat-msgs" class="vp-chat-view" style="flex:1;overflow-y:auto;padding:8px;background:var(--bg-card);border-radius:8px;margin-bottom:8px"></div>
          <div class="vp-chat-input-area">
            <input type="file" id="vp-review-file-input" accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx" style="display:none" onchange="VPUI.sendReviewFile('${convId}',event)">
            <button class="vp-btn vp-btn-sm" onclick="document.getElementById('vp-review-file-input').click()">📎</button>
            <input type="text" class="vp-input" id="vp-review-chat-input" placeholder="输入消息..." onkeydown="if(event.key==='Enter')VPUI.sendReviewMsg('${convId}')">
            <button class="vp-btn vp-btn-sm vp-btn-primary" onclick="VPUI.sendReviewMsg('${convId}')">发送</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // 加载消息
    VPChat.renderChatMessages(convId, 'vp-review-chat-msgs');
  }

  function sendReviewMsg(convId) {
    const input = document.getElementById('vp-review-chat-input');
    if (!input || !input.value.trim()) return;
    VPChat.sendMessage(convId, input.value.trim());
    input.value = '';
    VPChat.renderChatMessages(convId, 'vp-review-chat-msgs');
  }

  function sendReviewFile(convId, event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { VPApp.showToast('文件不能超过2MB','warning'); return; }
    const reader = new FileReader();
    reader.onload = function(e) {
      VPChat.sendMessage(convId, '', { name: file.name, data: e.target.result });
      VPChat.renderChatMessages(convId, 'vp-review-chat-msgs');
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  // ========= 个人中心 =========
  function renderProfile() {
    const main = document.getElementById('vp-main-content');
    if (!main) return;
    const user = VPAuth.currentUser();
    if (!user) { VPApp.showLogin(); return; }

    main.innerHTML = `
      <div class="vp-page">
        <h2>👤 个人中心</h2>
        <div class="vp-profile-card">
          <p><strong>姓名：</strong>${user.name}</p>
          <p><strong>手机号：</strong>${user.phone}</p>
          <p><strong>微信号：</strong>${user.wechat || '未设置'}</p>
          <p><strong>角色：</strong>${user.role === 'agent' ? '🛎️ 签证官' : '👤 普通用户'}</p>
          <p><strong>注册时间：</strong>${new Date(user.createdAt).toLocaleString('zh-CN')}</p>
          <button class="vp-btn vp-btn-danger" onclick="VPApp.logout()">🚪 退出登录</button>
        </div>
      </div>
    `;
  }

  // ========= 咨询表单 =========
  function showConsultForm() {
    const modal = document.createElement('div');
    modal.className = 'vp-modal-overlay';
    modal.innerHTML = `
      <div class="vp-modal">
        <div class="vp-modal-header">
          <h3>📝 提交咨询</h3>
          <button class="vp-modal-close" onclick="this.closest('.vp-modal-overlay').remove()">✕</button>
        </div>
        <div class="vp-modal-body">
          <div class="vp-form">
            <label>姓名：<input class="vp-input" id="vp-consult-name" placeholder="请输入姓名"></label>
            <label>手机号：<input class="vp-input" id="vp-consult-phone" placeholder="请输入手机号"></label>
            <label>微信号：<input class="vp-input" id="vp-consult-wechat" placeholder="请输入微信号（选填）"></label>
            <label>目标国家：<input class="vp-input" id="vp-consult-country" placeholder="如：法国"></label>
            <label>签证类型：<input class="vp-input" id="vp-consult-visa" placeholder="如：旅游签证"></label>
            <label>备注：<textarea class="vp-input" id="vp-consult-remark" rows="3" placeholder="其他需要咨询的问题..."></textarea></label>
            <button class="vp-btn vp-btn-primary vp-btn-block" onclick="VPUI.submitConsult()">提交咨询</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  function submitConsult() {
    const name = document.getElementById('vp-consult-name')?.value.trim();
    const phone = document.getElementById('vp-consult-phone')?.value.trim();
    const wechat = document.getElementById('vp-consult-wechat')?.value.trim();
    const country = document.getElementById('vp-consult-country')?.value.trim();
    const visaType = document.getElementById('vp-consult-visa')?.value.trim();
    const remark = document.getElementById('vp-consult-remark')?.value.trim();

    if (!name || !phone) { VPApp.showToast('请填写姓名和手机号','warning'); return; }

    VPStorage.addConsultation({ name, phone, wechat, country, visaType, remark });
    VPApp.showToast('✅ 咨询已提交，客服将尽快联系您','success');
    document.querySelector('.vp-modal-overlay')?.remove();
  }

  // ========= Helper =========
  function getProcessTime(countryId) {
    const times = { usa:'5-15', uk:'15-30', schengen:'10-20', france:'10-20', italy:'10-20',
      spain:'10-20', germany:'10-20', netherlands:'10-20', switzerland:'10-20',
      japan:'5-15', korea:'7-20', india:'5-15', australia:'15-45', canada:'20-60',
      ireland:'15-35', philippines:'5-10', singapore:'5-10', thailand:'5-15',
      vietnam:'5-10', malaysia:'5-10' };
    return times[countryId] || '10-30';
  }

  function getEnhancedValidity(countryId, visaType) {
    const v = {
      '旅游(B1/B2)':'10年', '旅游':'2年',
      '商务(B1)':'10年', '商务':'5年',
      '学生(F1)':'I-20有效期', '学生(T4)':'课程时长',
      '工作(H1B)':'3年', '工作':'1-3年',
    };
    return v[visaType] || '1-5年';
  }

  function getEnhancedStay(countryId, visaType) {
    const d = {
      '旅游(B1/B2)':'最长180天', '旅游':'30-90天',
      '商务(B1)':'最长180天', '商务':'90天',
    };
    return d[visaType] || '以签证官决定为准';
  }
  // ========= Schengen country detail pages =========
  function renderSchengenCountryDetail(code) {
    var info = VISAPILOT.SCHENGEN_COUNTRY_INFO ? VISAPILOT.SCHENGEN_COUNTRY_INFO[code] : null;
    if (!info) { renderHome(); return; }
    var main = document.getElementById('vp-main-content');
    if (!main) return;
    VPApp.currentCountry = 'schengen_' + code;
    var config = VISAPILOT.VISA_CONFIG.schengen;
    var visaType = '旅游';
    VPApp.currentVisaType = visaType;
    main.innerHTML = buildSchengenPage(info, config, visaType);
    renderSidebar();
    setTimeout(function() {
      VPCalendar.init('schengen', visaType);
      VPCalendar.renderWaitTime('schengen');
    }, 100);
  }
  
  function buildSchengenPage(info, config, visaType) {
    var t = visaType.match(/旅游|商务|学生|过境|探亲访友|文化体育/);
    var tmpl = VISAPILOT.MATERIAL_TEMPLATES[t ? t[0] : '旅游'] || VISAPILOT.MATERIAL_TEMPLATES['旅游'];
    var fee = config.baseFees[visaType] || '请咨询';
    var feeStr = typeof fee === 'number' ? '\u00a5' + fee : fee;
    
    var html = '<div class="vp-country-detail">' +
      '<div class="vp-country-header"><h1>' + info.flag + ' ' + info.name + ' <span class="vp-badge-schengen">Schengen</span></h1></div>' +
      '<div class="vp-china-banner">China Tips | Fees in CNY | Bank balance >=5w | Alipay/WeChat' +
      '<button class="vp-btn vp-btn-sm" onclick="VPChat.toggleAIChat()" style="margin-left:8px">Chat</button></div>' +
      '<div class="vp-visa-tabs" id="vp-visa-tabs-schengen">';
    
    for (var i = 0; i < config.types.length; i++) {
      var t2 = config.types[i];
      html += '<button class="vp-visa-tab' + (t2 === visaType ? ' active' : '') + '" onclick="VPUI.switchSchengenType(\'' + code + '\',\'' + t2 + '\')">' + t2 + '</button>';
    }
    html += '</div><div id="vp-visa-detail-content">' + buildSchengenBody(info, config, visaType, tmpl, feeStr) + '</div>';
    return html;
  }
  
  function buildSchengenBody(info, config, visaType, tmpl, feeStr) {
    var user = VPAuth.currentUser();
    var key = 'schengen_' + info.code;
    
    var html = '<div class="vp-visa-overview">' +
      '<div class="vp-overview-card"><h3>Visa Overview</h3><div class="vp-overview-grid">' +
      '<div class="vp-overview-item"><span>Type</span><strong>' + visaType + '</strong></div>' +
      '<div class="vp-overview-item"><span>Fee</span><strong>' + feeStr + '</strong></div>' +
      '<div class="vp-overview-item"><span>Process</span><strong>' + getProcessTime('schengen') + ' days</strong></div>' +
      '<div class="vp-overview-item"><span>Validity</span><strong>' + getEnhancedValidity('schengen', visaType) + '</strong></div>' +
      '<div class="vp-overview-item"><span>Stay</span><strong>' + getEnhancedStay('schengen', visaType) + '</strong></div>' +
      '</div></div>';
    
    html += '<div class="vp-section"><h3>Materials</h3><div class="vp-materials-list">';
    
    for (var i2 = 0; i2 < tmpl.length; i2++) {
      var m = tmpl[i2];
      var canView = !user && m.required === true ? false : true;
      html += '<div class="vp-material-item">' +
        '<label class="vp-checkbox"><input type="checkbox"' + (canView ? '' : ' disabled') + '>' +
        '<span>' + (canView ? m.name : '[Login to view]') + '</span></label>' +
        '<span class="vp-material-required' + (m.required === true ? ' vp-required' : '') + '">' +
        (m.required === true ? 'Required' : m.required === 'conditional' ? 'Optional' : 'Extra') + '</span>' +
        (m.note ? '<span class="vp-text-muted vp-material-note">' + m.note + '</span>' : '') +
      '</div>';
    }
    
    html += '</div></div>';
    
    html += '<div class="vp-section"><h3>Process</h3><div class="vp-process-steps">';
    for (var s = 0; s < VISAPILOT.PROCESS_STEPS.length; s++) {
      var p = VISAPILOT.PROCESS_STEPS[s];
      html += '<div class="vp-process-step"><div class="vp-step-number">' + p.step + '</div><div class="vp-step-content"><h4>' + p.title + '</h4><p>' + p.desc + '</p></div></div>';
    }
    html += '</div></div>';
    
    html += '<div class="vp-section"><h3>Centers</h3><div class="vp-center-list">';
    for (var c2 = 0; c2 < config.centers.length; c2++) {
      var cc = config.centers[c2];
      html += '<div class="vp-center-item"><strong>' + cc.city + '</strong><p>' + cc.addr + '</p><span class="vp-text-muted">' + cc.system + '</span></div>';
    }
    html += '</div></div>';
    
    html += '<div class="vp-section"><h3>Embassy</h3>' +
      '<a href="' + info.embassy + '" target="_blank" class="vp-btn vp-btn-outline">Visit ' + info.name + ' Embassy</a>' +
      (info.city ? '<p class="vp-text-muted" style="margin-top:6px;font-size:0.85em">Consulate: ' + info.city + '</p>' : '') + '</div>';
    
    html += '<div class="vp-section" id="vp-calendar-section"><h3>Calendar</h3>' +
      '<div id="vp-wait-time-schengen"></div>' +
      '<div class="vp-center-selector" style="margin:12px 0"><label>Center:</label>' +
      '<select class="vp-select" id="vp-center-select" onchange="VPCalendar.init(\'schengen\',\'' + visaType + '\')">';
    for (var c3 = 0; c3 < config.centers.length; c3++) {
      html += '<option value="' + config.centers[c3].city + '">' + config.centers[c3].city + '</option>';
    }
    html += '</select></div>' +
      '<div class="vp-calendar-two-col"><div class="vp-cal-col-left"><div id="vp-calendar-body"></div></div>' +
      '<div class="vp-cal-col-right"><h4 style="margin-bottom:8px">Time slots</h4><div id="vp-timeslots" class="vp-timeslot-area"></div></div></div>' +
      '<div id="vp-booking-summary"></div></div></div>';
    
    return html;
  }
  
  function switchSchengenType(code, newType) {
    VPApp.currentVisaType = newType;
    var info = VISAPILOT.SCHENGEN_COUNTRY_INFO ? VISAPILOT.SCHENGEN_COUNTRY_INFO[code] : null;
    if (!info) return;
    var config = VISAPILOT.VISA_CONFIG.schengen;
    var t = newType.match(/旅游|商务|学生|过境|探亲访友|文化体育/);
    var tmpl = VISAPILOT.MATERIAL_TEMPLATES[t ? t[0] : '旅游'] || VISAPILOT.MATERIAL_TEMPLATES['旅游'];
    var fee = config.baseFees[newType] || '请咨询';
    var feeStr = typeof fee === 'number' ? '\u00a5' + fee : fee;
    var body = buildSchengenBody(info, config, newType, tmpl, feeStr);
    document.getElementById('vp-visa-detail-content').innerHTML = body;
    var tabs = document.querySelectorAll('#vp-visa-tabs-schengen .vp-visa-tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.toggle('active', tabs[i].textContent === newType);
    }
  }
  



  // ========= Reorder visa detail page layout =========
  function reorderVisaDetailLayout() {
    var overview = document.querySelector('.vp-visa-overview');
    if (!overview) return;
    var embassy, overviewCard, matSection, procSection, centerSection;
    
    Array.from(overview.children).forEach(function(el) {
      var html = el.innerHTML || '';
      if (html.indexOf('大使馆') >= 0) embassy = el;
      else if (html.indexOf('签证概览') >= 0) overviewCard = el;
      else if (html.indexOf('材料清单') >= 0) matSection = el;
      else if (html.indexOf('办理流程') >= 0) procSection = el;
      else if (html.indexOf('签证中心') >= 0) centerSection = el;
    });
    
    var centerSelector = document.querySelector('.vp-center-selector');
    if (centerSelector && centerSelector.parentNode) {
      centerSelector.parentNode.removeChild(centerSelector);
    }
    
    if (embassy && overviewCard && embassy.parentNode === overview) {
      overview.insertBefore(embassy, overviewCard);
    }
    if (matSection && procSection && matSection.parentNode === overview && matSection.nextSibling === procSection) {
      overview.insertBefore(procSection, matSection);
    } else if (matSection && procSection && matSection.parentNode === overview && procSection.nextSibling === matSection) {
      // Already in correct order
    } else if (matSection && procSection && matSection.parentNode === overview) {
      overview.insertBefore(matSection, procSection.nextSibling);
    }
    if (centerSelector && centerSection) {
      centerSection.appendChild(centerSelector);
    }
    if (centerSelector && centerSection && !centerSection.contains(centerSelector)) {
      centerSection.appendChild(centerSelector);
    }
  }
  
  return {
    renderHome, renderSidebar, renderCountryDetail,
    reorderVisaDetailLayout,
    handleMatToggle: _ckToggle,
    matChecked: _ckGet,
    _aptInfo, getEnhancedValidity, getEnhancedStay,
    renderVisaDetail, renderSchengenPage, renderMyBookings,
    renderProfile, searchCountry, switchDIYTab,
    generateItineraryFromDIY, generatePackageFromDIY,
    switchMyTab, showConsultForm, submitConsult,
    clickSchengenCountry, openReviewChat,
    sendReviewMsg, sendReviewFile,
  };
})();
