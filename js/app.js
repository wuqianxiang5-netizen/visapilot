/**
 * VisaPilot — 主应用控制器
 * 状态管理、路由、导航、全局工具
 */

const VPApp = (function() {
  'use strict';

  let currentCountryId = null;
  let currentVisaType = null;

  // ========= 初始化 =========
  function init() {
    VPStorage.initPresetAccounts();
    VPUI.renderSidebar();
    VPUI.renderHome();
    initNav();
    initFloatingButtons();
    initAIChat();
    renderUserStatus();
    checkAutoLogin();
  }

  function checkAutoLogin() {
    if (VPStorage.isLoggedIn()) {
      renderUserStatus();
    }
  }

  // ========= 导航 =========
  function initNav() {
    // 导航栏按钮事件
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', function(e) {
        const nav = this.dataset.nav;
        switch (nav) {
          case 'home': VPUI.renderHome(); break;
          case 'consult': VPUI.showConsultForm(); break;
          case 'login': showLogin(); break;
          case 'register': showRegister(); break;
          case 'admin': showAdminLogin(); break;
          case 'agent': showAgentLogin(); break;
          case 'booking': openBooking('diy'); break;
        }
      });
    });
  }

  function navigateToCountry(countryId, visaType) {
    currentCountryId = countryId;
    currentVisaType = visaType || null;
    VPUI.renderCountryDetail(countryId);
    VPUI.renderSidebar();

    // 初始化日历
    setTimeout(() => {
      const vt = currentVisaType || VISAPILOT.VISA_CONFIG[countryId]?.types[0] || '旅游';
      VPCalendar.init(countryId, vt);
      VPCalendar.renderWaitTime(countryId);
    }, 100);
  }

  function switchVisaType(countryId, visaType) {
    currentVisaType = visaType;
    const content = document.getElementById('vp-visa-detail-content');
    if (content) {
      content.innerHTML = VPUI.renderVisaDetail(countryId, visaType);
    }
    // 更新标签高亮
    document.querySelectorAll('.vp-visa-tab').forEach(t => {
      t.classList.toggle('active', t.textContent === visaType);
    });
    // 重新初始化日历
    VPCalendar.init(countryId, visaType);
    VPCalendar.renderWaitTime(countryId);

    // 重新初始化 DIY
    const diyContent = document.getElementById('vp-diy-content');
    if (diyContent) {
      diyContent.innerHTML = '<p class="vp-text-muted">选择上方标签开始DIY服务</p>';
    }
  }

  // ========= 登录/注册弹窗 =========
  function showLogin() {
    const modal = document.createElement('div');
    modal.className = 'vp-modal-overlay';
    modal.innerHTML = `
      <div class="vp-modal">
        <div class="vp-modal-header">
          <h3>登录</h3>
          <button class="vp-modal-close" onclick="this.closest('.vp-modal-overlay').remove()">✕</button>
        </div>
        <div class="vp-modal-body">
          <div class="vp-login-tabs">
            <button class="vp-login-tab active" onclick="VPUI.switchLoginTab(this,'user')">👤 用户登录</button>
            <button class="vp-login-tab" onclick="VPUI.switchLoginTab(this,'agent')">🛎️ 签证官登录</button>
          </div>
          <div id="vp-login-form-area">
            <div class="vp-form">
              <label>邮箱/手机号：<input class="vp-input" id="vp-login-phone" placeholder="user@test.com 或手机号"></label>
              <label>密码：<input class="vp-input" id="vp-login-password" type="password" placeholder="请输入密码" onkeydown="if(event.key==='Enter')VPApp.doLogin()"></label>
              <button class="vp-btn vp-btn-primary vp-btn-block" onclick="VPApp.doLogin()">登录</button>
              <p class="vp-form-footer">还没有账号？<a href="#" onclick="VPApp.showRegister();return false">立即注册</a></p>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  let loginRole = 'user';

  function doLogin() {
    const phone = document.getElementById('vp-login-phone')?.value.trim();
    const password = document.getElementById('vp-login-password')?.value;

    if (!phone || !password) { showToast('请填写邮箱/手机号和密码','warning'); return; }

    const result = VPAuth.login(phone, password);
    if (result.ok) {
      showToast(`✅ 登录成功，欢迎 ${result.user.name}！`,'success');
      document.querySelector('.vp-modal-overlay')?.remove();
      renderUserStatus();

      // 如果是代办，自动跳转到工作台
      if (result.user.role === 'agent') {
        showAgentDashboard();
      } else if (result.user.role === 'admin') {
        // admin登录通过管理入口
      }
    } else {
      showToast('❌ ' + result.error,'error');
    }
  }

  function showRegister() {
    document.querySelector('.vp-modal-overlay')?.remove();

    const modal = document.createElement('div');
    modal.className = 'vp-modal-overlay';
    modal.innerHTML = `
      <div class="vp-modal">
        <div class="vp-modal-header">
          <h3>注册</h3>
          <button class="vp-modal-close" onclick="this.closest('.vp-modal-overlay').remove()">✕</button>
        </div>
        <div class="vp-modal-body">
          <div class="vp-login-tabs">
            <button class="vp-login-tab active" onclick="VPUI.switchRegTab(this,'user')">👤 用户注册</button>
            <button class="vp-login-tab" onclick="VPUI.switchRegTab(this,'agent')">🛎️ 签证官注册</button>
          </div>
          <div id="vp-reg-form-area">
            <div class="vp-form">
              <label>姓名：<input class="vp-input" id="vp-reg-name" placeholder="请输入姓名"></label>
              <label>手机号：<input class="vp-input" id="vp-reg-phone" placeholder="请输入手机号"></label>
              <label>微信号：<input class="vp-input" id="vp-reg-wechat" placeholder="请输入微信号（选填）"></label>
              <label>密码：<input class="vp-input" id="vp-reg-password" type="password" placeholder="请设置密码（至少6位）"></label>
              <label class="vp-form-checkbox">
                <input type="checkbox" id="vp-reg-terms"> 我已阅读并同意《服务协议》
              </label>
              <button class="vp-btn vp-btn-primary vp-btn-block" onclick="VPApp.doRegister()">注册</button>
              <p class="vp-form-footer">已有账号？<a href="#" onclick="VPApp.showLogin();return false">立即登录</a></p>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // 重置注册角色
    window._regRole = 'user';
  }

  function doRegister() {
    const name = document.getElementById('vp-reg-name')?.value.trim();
    const email = document.getElementById('vp-reg-email')?.value.trim();
    const phone = document.getElementById('vp-reg-phone')?.value.trim();
    const wechat = document.getElementById('vp-reg-wechat')?.value.trim();
    const password = document.getElementById('vp-reg-password')?.value;
    const role = window._regRole || 'user';

    if (!name || !email || !password) { showToast('请填写姓名、邮箱和密码','warning'); return; }
    if (password.length < 6) { showToast('密码至少6位','warning'); return; }

    const regRole = document.querySelector('#vp-reg-form-area .vp-form .vp-agent-fields') ? 'agent' : role;

    let agentInfo = null;
    if (regRole === 'agent') {
      const org = document.getElementById('vp-reg-agent-org')?.value;
      const years = document.getElementById('vp-reg-agent-years')?.value;
      const bio = document.getElementById('vp-reg-agent-bio')?.value;
      agentInfo = { org, years, bio };
    }

    const result = VPAuth.register({
      name, phone, email: email || phone, wechat, password,
      role: regRole,
      agentInfo,
    });

    if (result.ok) {
      if (regRole === 'agent') {
        showToast('✅ 签证官申请已提交，等待管理员审核','info');
      } else {
        showToast('✅ 注册成功，请登录','success');
      }
      document.querySelector('.vp-modal-overlay')?.remove();
      showLogin();
    } else {
      showToast('❌ ' + result.error,'error');
    }
  }

  function logout() {
    VPAuth.logout();
    renderUserStatus();
    showToast('已退出登录','info');
    VPUI.renderHome();
  }

  // ========= 用户状态栏 =========
  function renderUserStatus() {
    const el = document.getElementById('vp-user-status');
    if (!el) return;
    const user = VPAuth.currentUser();
    if (user) {
      if (user.role === 'admin') {
        el.innerHTML = `<span>👑 管理员 ${user.name}</span> <a href="#" class="vp-link" onclick="VPApp.logout()">退出</a>`;
      } else if (user.role === 'agent') {
        el.innerHTML = `<span>🛎️ ${user.name}</span> <a href="#" class="vp-link" onclick="VPApp.logout()">退出</a>`;
      } else {
        el.innerHTML = `<span>👤 ${user.name}</span> <a href="#" class="vp-link" onclick="VPApp.logout()">退出</a>`;
      }
    } else {
      el.innerHTML = `<a href="#" class="vp-link" onclick="VPApp.showLogin();return false">登录</a> | <a href="#" class="vp-link" onclick="VPApp.showRegister();return false">注册</a>`;
    }
  }

  // ========= 浮动按钮 =========
  function initFloatingButtons() {
    // AI 聊天按钮
    document.getElementById('vp-ai-btn')?.addEventListener('click', VPChat.toggleAIChat);

    // 代办按钮
    document.getElementById('vp-booking-btn')?.addEventListener('click', function() {
      openBooking('diy');
    });
  }

  // ========= AI 聊天面板 =========
  function initAIChat() {
    const panel = document.getElementById('vp-ai-chat-panel');
    if (!panel) return;

    document.getElementById('vp-ai-send-btn')?.addEventListener('click', VPChat.sendAIMessage);
    document.getElementById('vp-ai-input')?.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') VPChat.sendAIMessage();
    });
  }

  // ========= 代办下单 =========
  function openBooking(plan) {
    const plans = {
      diy: { name: '线上审核', price: 100, desc: '材料清单核对、翻译整理、材料审核' },
      basic: { name: '全程代办', price: 299, desc: '基础材料办理+电子材料交付+现场材料检查+状态跟踪+拒签免费咨询' },
      full: { name: '全程代办', price: 399, desc: '标准代办+大使馆线下递交+现场材料检查+状态跟踪+拒签免费咨询' },
    };
    const p = plans[plan] || plans.diy;

    const modal = document.createElement('div');
    modal.className = 'vp-modal-overlay';
    modal.innerHTML = `
      <div class="vp-modal">
        <div class="vp-modal-header">
          <h3>🛎️ 人工代办 - ${p.name}</h3>
          <button class="vp-modal-close" onclick="this.closest('.vp-modal-overlay').remove()">✕</button>
        </div>
        <div class="vp-modal-body">
          <div class="vp-form">
            <div class="vp-plan-selected">
              <h4>${p.name} · <span class="vp-plan-price-inline">¥${p.price}</span></h4>
              <p>${p.desc}</p>
            </div>
            <label>姓名：<input class="vp-input" id="vp-book-name" placeholder="请输入姓名" value="${VPAuth.currentUser()?.name || ''}"></label>
            <label>手机号：<input class="vp-input" id="vp-book-phone" placeholder="请输入手机号" value="${VPAuth.currentUser()?.phone || ''}"></label>
            <label>目标国家：<input class="vp-input" id="vp-book-country" placeholder="如：法国" value="${currentCountryId ? (VISAPILOT.VISA_CONFIG[currentCountryId]?.name || '') : ''}"></label>
            <label>签证类型：<input class="vp-input" id="vp-book-visa" placeholder="如：旅游签证" value="${currentVisaType || ''}"></label>
            <div class="vp-order-summary">
              <p>套餐：${p.name}</p>
              <p>金额：<strong>¥${p.price}</strong></p>
              <p class="vp-text-muted">客服将在30分钟内电话联系您</p>
            </div>
            <button class="vp-btn vp-btn-primary vp-btn-block vp-btn-lg" onclick="VPApp.submitBooking('${plan}')">立即下单（¥${p.price}）</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  function submitBooking(plan) {
    const name = document.getElementById('vp-book-name')?.value.trim();
    const phone = document.getElementById('vp-book-phone')?.value.trim();
    const country = document.getElementById('vp-book-country')?.value.trim();
    const visaType = document.getElementById('vp-book-visa')?.value.trim();

    if (!name || !phone) { showToast('请填写姓名和手机号','warning'); return; }

    const plans = { diy:100, basic:299, full:399 };
    const price = plans[plan] || 100;

    const order = VPStorage.addOrder({
      userId: phone,
      userName: name,
      country,
      visaType,
      plan: plan,
      amount: price,
    });

    // 也添加为咨询记录
    VPStorage.addConsultation({
      name, phone,
      country,
      visaType,
      remark: `下单：${plan === 'diy' ? '线上审核' : '全程代办'} ¥${price}`,
    });

    document.querySelector('.vp-modal-overlay')?.remove();

    // 显示成功弹窗
    const successModal = document.createElement('div');
    successModal.className = 'vp-modal-overlay';
    successModal.innerHTML = `
      <div class="vp-modal">
        <div class="vp-modal-header">
          <h3>✅ 下单成功</h3>
        </div>
        <div class="vp-modal-body">
          <div class="vp-success-content">
            <div class="vp-success-icon">🎉</div>
            <p>您的订单已提交成功</p>
            <p>订单号：<strong>${order.id}</strong></p>
            <p>客服将在30分钟内电话联系您</p>
            <button class="vp-btn vp-btn-primary vp-btn-block" onclick="this.closest('.vp-modal-overlay').remove()">我知道了</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(successModal);
  }

  // ========= 管理后台登录 =========
  function showAdminLogin() {
    const modal = document.createElement('div');
    modal.className = 'vp-modal-overlay';
    modal.innerHTML = `
      <div class="vp-modal">
        <div class="vp-modal-header">
          <h3>🔐 后台管理登录</h3>
          <button class="vp-modal-close" onclick="this.closest('.vp-modal-overlay').remove()">✕</button>
        </div>
        <div class="vp-modal-body">
          <div class="vp-form">
            <label>管理员邮箱：<input class="vp-input" id="vp-admin-account" placeholder="admin@test.com"></label>
            <label>密码：<input class="vp-input" id="vp-admin-password" type="password" placeholder="visapilot123" value="visapilot123" onkeydown="if(event.key==='Enter')VPApp.doAdminLogin()"></label>
            <button class="vp-btn vp-btn-primary vp-btn-block" onclick="VPApp.doAdminLogin()">进入管理后台</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  function doAdminLogin() {
    const account = document.getElementById('vp-admin-account')?.value.trim() || 'admin@test.com';
    const password = document.getElementById('vp-admin-password')?.value;
    const result = VPAuth.login(account, password || 'admin123');
    if (result.ok && result.user.role === 'admin') {
      document.querySelector('.vp-modal-overlay')?.remove();
      renderUserStatus();
      showAdminDashboard();
      showToast('✅ 管理员登录成功','success');
    } else if (result.ok) {
      showToast('❌ 此账号不是管理员','error');
    } else {
      showToast('❌ '+result.error,'error');
    }
  }

  // ========= 管理后台面板 =========
  function showAdminDashboard() {
    const main = document.getElementById('vp-main-content');
    if (!main) return;

    main.innerHTML = `
      <div class="vp-admin-dashboard">
        <h2>🔐 后台管理</h2>
        <!-- 数据概览 -->
        <div class="vp-stats-grid">
          <div class="vp-stat-card" style="border-left:4px solid #3b82f6">
            <div class="vp-stat-num">${VPStorage.getAllUsers().filter(u => u.role === 'user').length}</div>
            <div class="vp-stat-label">👤 注册用户</div>
          </div>
          <div class="vp-stat-card" style="border-left:4px solid #8b5cf6">
            <div class="vp-stat-num">${VPStorage.getAllUsers().filter(u => u.role === 'agent' && u.approved).length}</div>
            <div class="vp-stat-label">🛎️ 签证官</div>
          </div>
          <div class="vp-stat-card" style="border-left:4px solid #10b981">
            <div class="vp-stat-num">${VPStorage.getOrders().length}</div>
            <div class="vp-stat-label">📋 总订单</div>
          </div>
          <div class="vp-stat-card" style="border-left:4px solid #f59e0b">
            <div class="vp-stat-num">¥${VPStorage.getOrders().reduce((s,o) => s + (o.amount||0), 0)}</div>
            <div class="vp-stat-label">💰 总收入</div>
          </div>
        </div>
        <div class="vp-admin-tabs">
          <button class="vp-admin-tab active" onclick="VPUI.switchAdminTab(this,'users')">👥 用户管理</button>
          <button class="vp-admin-tab" onclick="VPUI.switchAdminTab(this,'agent-reviews')">👤 代办审核</button>
          <button class="vp-admin-tab" onclick="VPUI.switchAdminTab(this,'reviews')">📋 审核管理</button>
          <button class="vp-admin-tab" onclick="VPUI.switchAdminTab(this,'allocation')">📋 分配</button>
          <button class="vp-admin-tab" onclick="VPUI.switchAdminTab(this,'conversations')">💬 用户对话</button>
        </div>
        <div id="vp-admin-content">
          <div id="vp-admin-users">加载中...</div>
        </div>
      </div>
    `;

    VPAdmin.init();
  }

  // ========= 代办工作台 =========
  function showAgentLogin() {
    const modal = document.createElement('div');
    modal.className = 'vp-modal-overlay';
    modal.innerHTML = `
      <div class="vp-modal">
        <div class="vp-modal-header">
          <h3>🛎️ 签证官登录</h3>
          <button class="vp-modal-close" onclick="this.closest('.vp-modal-overlay').remove()">✕</button>
        </div>
        <div class="vp-modal-body">
          <div class="vp-form">
            <label>邮箱：<input class="vp-input" id="vp-agent-login-phone" placeholder="officer@test.com" value="officer@test.com"></label>
            <label>密码：<input class="vp-input" id="vp-agent-login-password" type="password" placeholder="请输入密码" onkeydown="if(event.key==='Enter')VPApp.doAgentLogin()"></label>
            <button class="vp-btn vp-btn-primary vp-btn-block" onclick="VPApp.doAgentLogin()">登录</button>
            <p class="vp-form-footer">还没有账号？<a href="#" onclick="VPApp.showRegister();return false">注册签证官</a></p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  function doAgentLogin() {
    const phone = document.getElementById('vp-agent-login-phone')?.value.trim();
    const password = document.getElementById('vp-agent-login-password')?.value;
    if (!phone || !password) { showToast('请填写邮箱/手机号和密码','warning'); return; }

    const result = VPAuth.login(phone, password);
    if (result.ok && result.user.role === 'agent') {
      document.querySelector('.vp-modal-overlay')?.remove();
      renderUserStatus();
      showAgentDashboard();
      showToast('✅ 登录成功','success');
    } else if (result.ok && result.user.role !== 'agent') {
      showToast('❌ 此账号不是签证官账号','error');
    } else {
      showToast('❌ ' + result.error,'error');
    }
  }

  function showAgentDashboard() {
    const main = document.getElementById('vp-main-content');
    if (!main) return;

    main.innerHTML = `
      <div class="vp-admin-dashboard">
        <h2>🛎️ 代办工作台</h2>
        <div class="vp-agent-stats-row">
          <div class="vp-agent-stat"><strong>${VPStorage.getOrders().filter(o => o.status === 'pending').length}</strong><span>待接单</span></div>
          <div class="vp-agent-stat"><strong>${VPStorage.getOrders().filter(o => o.assignedTo === agentPhone).length}</strong><span>已接单</span></div>
          <div class="vp-agent-stat"><strong>${VPStorage.getMessages('agent_'+agentPhone).length || VPStorage.getAllConversations()['agent_'+agentPhone]?.length || 0}+</strong><span>对话数</span></div>
        </div>
        <div class="vp-admin-tabs">
          <button class="vp-admin-tab active" onclick="VPUI.switchAgentTab(this,'orders')">📋 订单面板</button>
          <button class="vp-admin-tab" onclick="VPUI.switchAgentTab(this,'reviews')">📋 材料审核</button>
          <button class="vp-admin-tab" onclick="VPUI.switchAgentTab(this,'chat')">💬 用户对话</button>
        </div>
        <div id="vp-agent-content">
          <div id="vp-agent-orders">加载中...</div>
        </div>
      </div>
    `;

    VPAgent.init();
  }

  // ========= 我的预约页 =========
  function esc(s) { var d=document.createElement('div'); d.textContent=s; return d.innerHTML; }

  function saveProfile() {
    var name = document.getElementById('vp-pro-name')?.value.trim();
    var phone = document.getElementById('vp-pro-phone')?.value.trim();
    var wechat = document.getElementById('vp-pro-wechat')?.value.trim();
    var pwd = document.getElementById('vp-pro-pwd')?.value;
    if (!name) { showToast('姓名不能为空','warning'); return; }
    var user = VPAuth.currentUser();
    if (user) {
      user.name = name;
      user.phone = phone;
      user.wechat = wechat;
      if (pwd && pwd.length >= 6) user.password = pwd;
      VPStorage.saveUser(user);
      renderUserStatus();
      showToast('✅ 信息已保存','success');
    }
  }

  function showMyBookings() {
    if (!VPAuth.currentUser()) {
      showLogin();
      return;
    }
    VPUI.renderMyBookings();
  }

  function showProfile() {
    VPUI.renderProfile();
  }

  // ========= Toast 通知 =========
  function showToast(msg, type) {
    let container = document.getElementById('vp-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'vp-toast-container';
      container.style.cssText = 'position:fixed;top:16px;right:16px;z-index:10000;display:flex;flex-direction:column;gap:8px';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `vp-toast vp-toast-${type || 'info'}`;
    toast.textContent = msg;
    toast.style.cssText = `
      padding:12px 20px;border-radius:8px;font-size:14px;box-shadow:0 4px 16px rgba(0,0,0,0.12);
      animation: slideIn .3s ease;max-width:360px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#6366f1'};
      color: white;
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ========= 管理员标签切换 =========
  function switchAdminTab(btn, tab) {
    document.querySelectorAll('.vp-admin-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    // clear previous content and set the right ID
    const content = document.getElementById('vp-admin-content');
    const views = {
      'users': '<div id="vp-admin-users"></div>',
      'agent-reviews': '<div id="vp-admin-agent-reviews"></div>',
      'reviews': '<div id="vp-admin-reviews"></div>',
      'allocation': '<div id="vp-admin-allocation"></div>',
      'conversations': '<div id="vp-admin-conversations"></div>',
    };
    if (content) {
      content.innerHTML = views[tab] || views['users'];
    }

    switch (tab) {
      case 'users': VPAdmin.renderUsers(); break;
      case 'agent-reviews': VPAdmin.renderAgentReviews(); break;
      case 'reviews': VPAdmin.renderReviewMgmt(); break;
      case 'allocation': VPAdmin.renderAllocation(); break;
      case 'conversations': VPAdmin.renderConversations(); break;
    }
  }

  function switchAgentTab(btn, tab) {
    document.querySelectorAll('.vp-admin-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    const content = document.getElementById('vp-agent-content');
    const views = {
      'orders': '<div id="vp-agent-orders"></div>',
      'reviews': '<div id="vp-agent-reviews"></div>',
      'chat': '<div id="vp-agent-conversations"></div>',
    };
    if (content) {
      content.innerHTML = views[tab] || views['orders'];
    }

    switch (tab) {
      case 'orders': VPAgent.renderOrders(); break;
      case 'reviews': VPAgent.renderMaterialReviews(); break;
      case 'chat': VPAgent.renderAgentConversations(); break;
    }
  }

  // ========= 登录/注册标签切换（UI helper that we expose） =========
  function switchLoginTab(btn, role) {
    document.querySelectorAll('.vp-login-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    loginRole = role;

    const area = document.getElementById('vp-login-form-area');
    if (area) {
      area.innerHTML = `
        <div class="vp-form">
          <label>邮箱/手机号：<input class="vp-input" id="vp-login-phone" placeholder="user@test.com 或手机号"></label>
          <label>密码：<input class="vp-input" id="vp-login-password" type="password" placeholder="请输入密码" onkeydown="if(event.key==='Enter')VPApp.doLogin()"></label>
          <button class="vp-btn vp-btn-primary vp-btn-block" onclick="VPApp.doLogin()">登录</button>
          <p class="vp-form-footer">还没有账号？<a href="#" onclick="VPApp.showRegister();return false">立即注册</a></p>
        </div>
      `;
    }
  }

  function switchRegTab(btn, role) {
    document.querySelectorAll('.vp-login-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    window._regRole = role;

    const area = document.getElementById('vp-reg-form-area');
    if (area) {
      let extraFields = '';
      if (role === 'agent') {
        extraFields = `
          <div class="vp-agent-fields">
            <label>姓名/机构名称：<input class="vp-input" id="vp-reg-agent-org" placeholder="姓名或机构名称"></label>
            <label>从业经验（年）：<input class="vp-input" id="vp-reg-agent-years" type="number" placeholder="如：3"></label>
            <label>个人简介：<textarea class="vp-input" id="vp-reg-agent-bio" rows="3" placeholder="介绍您的签证代办经验..."></textarea></label>
          </div>
          <p class="vp-text-muted" style="font-size:0.85em">平台抽取订单金额 30% 作为服务费</p>
        `;
      }

      area.innerHTML = `
        <div class="vp-form">
          <label>姓名：<input class="vp-input" id="vp-reg-name" placeholder="请输入姓名"></label>
          <label>邮箱：<input class="vp-input" id="vp-reg-email" type="email" placeholder="user@example.com"></label>
          <label>手机号：<input class="vp-input" id="vp-reg-phone" placeholder="请输入手机号"></label>
          <label>微信号：<input class="vp-input" id="vp-reg-wechat" placeholder="请输入微信号（选填）"></label>
          <label>密码：<input class="vp-input" id="vp-reg-password" type="password" placeholder="请设置密码（至少6位）"></label>
          ${extraFields}
          <button class="vp-btn vp-btn-primary vp-btn-block" onclick="VPApp.doRegister()">${role === 'agent' ? '提交审核' : '注册'}</button>
          <p class="vp-form-footer">已有账号？<a href="#" onclick="VPApp.showLogin();return false">立即登录</a></p>
        </div>
      `;
    }
  }

  // Public API
  return {
    init,
    navigateToCountry,
    switchVisaType,
    showLogin,
    doLogin,
    showRegister,
    doRegister,
    logout,
    showAdminLogin,
    doAdminLogin,
    showAdminDashboard,
    showAgentLogin,
    doAgentLogin,
    showAgentDashboard,
    openBooking,
    submitBooking,
    showMyBookings,
    showProfile,
    showConsultForm: VPUI.showConsultForm,
    showToast,
    switchAdminTab,
    switchAgentTab,
    switchLoginTab,
    switchRegTab,
    get currentCountry() { return currentCountryId; },
    set currentCountry(v) { currentCountryId = v; },
    get currentVisaType() { return currentVisaType; },
    set currentVisaType(v) { currentVisaType = v; },
  };
})();

// 页面加载后初始化
document.addEventListener('DOMContentLoaded', VPApp.init);
