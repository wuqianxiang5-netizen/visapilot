/* ============================================================
   VisaPilot - Complete Application Logic
   ============================================================ */

(function() {
  'use strict';

  // ====================================================================
  // DATA LAYER
  // ====================================================================

  const COUNTRIES = [
    { id: 'us', name: '美国', flag: '\u{1F1FA}\u{1F1F8}', types: ['旅游( B1/B2 )', '商务( B1 )', '学生( F1 )', '工作( H1B )', '过境( C )'] },
    { id: 'uk', name: '英国', flag: '\u{1F1EC}\u{1F1E7}', types: ['旅游( Standard Visitor )', '商务', '学生( Tier 4 )', '工作( Skilled Worker )', '过境', '长期签证'] },
    { id: 'schengen', name: '申根区', flag: '\u{1F1EA}\u{1F1FA}', types: ['旅游', '商务', '探亲访友', '短期学习', '过境'] },
    { id: 'france', name: '法国', flag: '\u{1F1EB}\u{1F1F7}', types: ['旅游( Short Stay )', '商务', '学生', '长期居留', '过境'] },
    { id: 'italy', name: '意大利', flag: '\u{1F1EE}\u{1F1F9}', types: ['旅游', '商务', '学生', '工作', '家庭团聚'] },
    { id: 'spain', name: '西班牙', flag: '\u{1F1EA}\u{1F1F8}', types: ['旅游', '商务', '学生', '工作', '居留'] },
    { id: 'japan', name: '日本', flag: '\u{1F1EF}\u{1F1F5}', types: ['旅游( 单次 )', '旅游( 多次 )', '商务', '过境', '工作'] },
    { id: 'korea', name: '韩国', flag: '\u{1F1F0}\u{1F1F7}', types: ['旅游( C-3-9 )', '商务( C-3-4 )', '工作( E系列 )', '留学( D-2 )', '过境'] },
    { id: 'india', name: '印度', flag: '\u{1F1EE}\u{1F1F3}', types: ['旅游( e-Tourist )', '商务( e-Business )', '学生', '工作', '医疗'] },
    { id: 'australia', name: '澳大利亚', flag: '\u{1F1E6}\u{1F1FA}', types: ['旅游( 600 )', '商务( 600 )', '学生( 500 )', '工作( 482 )', '打工度假( 462 )'] },
    { id: 'canada', name: '加拿大', flag: '\u{1F1E8}\u{1F1E6}', types: ['旅游( TRV )', '商务', '学生( Study Permit )', '工作( Work Permit )', '超级签证( Super Visa )'] },
    { id: 'ireland', name: '爱尔兰', flag: '\u{1F1EE}\u{1F1EA}', types: ['旅游( Short Stay C )', '商务', '学生', '工作( Employment )', '长期居留'] },
    { id: 'philippines', name: '菲律宾', flag: '\u{1F1F5}\u{1F1ED}', types: ['旅游( 9A )', '商务( 9A )', '工作( 9G )', '学生( 9F )', '退休( SRRV )'] },
    { id: 'germany', name: '德国', flag: '\u{1F1E9}\u{1F1EA}', types: ['旅游( Schengen )', '商务', '学生', '工作( EU Blue Card )', '家庭团聚'] },
    { id: 'netherlands', name: '荷兰', flag: '\u{1F1F3}\u{1F1F1}', types: ['旅游( Schengen )', '商务', '学生', '工作', '高技术移民'] },
    { id: 'switzerland', name: '瑞士', flag: '\u{1F1E8}\u{1F1ED}', types: ['旅游( Schengen )', '商务', '学生', '工作', '长期居留'] },
    { id: 'singapore', name: '新加坡', flag: '\u{1F1F8}\u{1F1EC}', types: ['旅游', '商务', '工作( EP/SP )', '学生', '长期访问'] },
    { id: 'thailand', name: '泰国', flag: '\u{1F1F9}\u{1F1ED}', types: ['旅游( 落地签 )', '旅游( 电子签 )', '商务', '学生( ED )', '退休'] },
    { id: 'vietnam', name: '越南', flag: '\u{1F1FB}\u{1F1F3}', types: ['旅游( 电子签 )', '商务( DN )', '工作( LD )', '探亲', '过境'] },
    { id: 'malaysia', name: '马来西亚', flag: '\u{1F1F2}\u{1F1FE}', types: ['旅游( eNTRI )', '商务', '学生', '工作', '第二家园( MM2H )'] },
  ];

  function getMaterialsForVisa(visaKey, visaType) {
    const common = [
      { id: 'passport', label: '护照原件（有效期6个月以上）', required: true },
      { id: 'photo', label: '近6个月白底彩色照片（2寸）', required: true },
      { id: 'form', label: '签证申请表（完整填写）', required: true },
      { id: 'idcard', label: '身份证复印件', required: true },
      { id: 'itinerary', label: '机票酒店预订单', required: true },
    ];
    const tourist = [
      ...common,
      { id: 'bank', label: '近6个月银行流水（余额5万以上）', required: true },
      { id: 'employment', label: '在职证明 / 营业执照', required: true },
      { id: 'travel_plan', label: '行程计划书', required: true },
      { id: 'insurance', label: '旅行医疗保险', required: false },
      { id: 'property', label: '房产证 / 车辆登记证（辅助）', required: false },
    ];
    const business = [
      ...common,
      { id: 'invitation', label: '邀请函原件（外方公司）', required: true },
      { id: 'bank', label: '近6个月银行流水', required: true },
      { id: 'employment', label: '在职证明（中英文）', required: true },
      { id: 'biz_license', label: '营业执照副本复印件（盖章）', required: true },
    ];
    const student = [
      { id: 'passport', label: '护照原件（有效期6个月以上）', required: true },
      { id: 'photo', label: '近6个月白底彩色照片（2寸）', required: true },
      { id: 'form', label: '签证申请表（完整填写）', required: true },
      { id: 'idcard', label: '身份证复印件', required: true },
      { id: 'acceptance', label: '录取通知书 / CAS', required: true },
      { id: 'bank', label: '资金证明（学费+生活费）', required: true },
      { id: 'language', label: '语言成绩单（雅思/托福）', required: false },
      { id: 'study_plan', label: '学习计划书', required: false },
      { id: 'insurance', label: '留学医疗保险', required: false },
    ];
    const work = [
      ...common,
      { id: 'work_permit', label: '工作许可 / 担保函', required: true },
      { id: 'contract', label: '劳动合同', required: true },
      { id: 'education', label: '学历公证书', required: true },
      { id: 'bank', label: '近6个月银行流水', required: true },
      { id: 'resume', label: '个人简历（英文）', required: false },
    ];
    if (visaType.includes('旅游')) return tourist;
    if (visaType.includes('商务')) return business;
    if (visaType.includes('学生') || visaType.includes('留学')) return student;
    if (visaType.includes('工作')) return work;
    return common;
  }

  function generateTimeSlots(date) {
    const slots = [];
    for (let h = 9; h <= 16; h++) {
      slots.push({ time: `${h.toString().padStart(2, '0')}:00`, available: Math.random() > 0.3 });
      slots.push({ time: `${h.toString().padStart(2, '0')}:30`, available: Math.random() > 0.3 });
    }
    return slots;
  }

  // ====================================================================
  // STATE MANAGEMENT
  // ====================================================================

  let state = {
    currentUser: null, currentPage: 'dashboard',
    selectedCountry: null, selectedVisaType: null,
    uploadedFiles: [], appointments: [], orders: [],
    chatMessages: {}, users: [], officers: [], pendingOfficers: [],
  };

  function loadState() {
    try {
      const saved = localStorage.getItem('visapilot_state');
      if (saved) { Object.assign(state, JSON.parse(saved)); }
      if (!state.users || !state.users.length) seedData();
    } catch(e) { seedData(); }
  }

  function saveState() {
    try { localStorage.setItem('visapilot_state', JSON.stringify(state)); } catch(e) {}
  }

  function seedData() {
    state.users = [
      { id: 1, name: '张三', email: 'user@test.com', phone: '13800138000', wechat: 'zhangsan_wx', password: '123456', role: 'user', vip: true },
      { id: 2, name: '李四', email: 'user2@test.com', phone: '13900139000', wechat: 'lisi_wx', password: '123456', role: 'user', vip: false },
    ];
    state.officers = [
      { id: 101, name: '王签证', email: 'officer@test.com', password: '123456', role: 'officer', approved: true, status: 'active' },
      { id: 102, name: '赵代办', email: 'officer2@test.com', password: '123456', role: 'officer', approved: false, status: 'pending' },
    ];
    state.pendingOfficers = state.officers.filter(o => !o.approved);
    state.admin = { id: 999, name: '管理员', email: 'admin@test.com', password: 'admin123', role: 'admin' };
    state.orders = [
      { id: 'ORD-001', userId: 1, officerId: null, country: '美国', visaType: '旅游( B1/B2 )', status: 'pending', amount: 1200, createdAt: '2026-07-25' },
      { id: 'ORD-002', userId: 2, officerId: null, country: '申根区', visaType: '商务', status: 'paid', amount: 1500, createdAt: '2026-07-26' },
    ];
    state.appointments = [
      { id: 'APT-001', userId: 1, country: '美国', visaType: '旅游( B1/B2 )', date: '2026-08-15', time: '09:00', status: 'confirmed' },
    ];
    state.chatMessages = {
      '1': [
        { from: 'user', text: '您好，请问美签材料需要公证吗？', time: '2026-07-28 14:30' },
        { from: 'officer', text: '一般不需要，除非是有特殊情况的辅助材料。', time: '2026-07-28 14:32' },
      ],
      '2': [
        { from: 'user', text: '申根签多久能出签？', time: '2026-07-27 10:00' },
      ],
    };
    saveState();
  }

  loadState();

  function findUser(email) {
    return state.users.find(u => u.email === email) ||
           state.officers.find(o => o.email === email) ||
           (state.admin && state.admin.email === email ? state.admin : null);
  }

  // ====================================================================
  // TOAST & MODAL HELPERS
  // ====================================================================

  function toast(message, type) {
    type = type || 'info';
    const container = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = 'toast toast-' + type;
    const icons = { success: '\u2713', error: '\u2715', info: '\u2139' };
    el.innerHTML = '<span>' + (icons[type] || '\u2139') + '</span> ' + message;
    container.appendChild(el);
    setTimeout(function() {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.3s';
      setTimeout(function() { el.remove(); }, 300);
    }, 3000);
  }

  function showModal(title, bodyHTML, footerHTML) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyHTML;
    document.getElementById('modalFooter').innerHTML = footerHTML || '';
    document.getElementById('modalOverlay').classList.add('active');
  }

  function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
  }

  // ====================================================================
  // AUTH SYSTEM
  // ====================================================================

  function login(email, password, role) {
    var user = findUser(email);
    if (!user || user.password !== password) {
      document.getElementById('loginHint').style.display = 'block';
      return false;
    }
    if (role === 'admin' && user.role !== 'admin') { toast('此账号不是管理员', 'error'); return false; }
    if (role === 'officer' && user.role !== 'officer') { toast('此账号不是签证官', 'error'); return false; }
    if (role === 'user' && user.role !== 'user') { toast('此账号不是普通用户', 'error'); return false; }
    document.getElementById('loginHint').style.display = 'none';
    state.currentUser = user;
    saveState();
    enterApp();
    return true;
  }

  function register(data) {
    if (state.users.find(function(u) { return u.email === data.email; })) {
      toast('该邮箱已被注册', 'error');
      return false;
    }
    state.users.push({
      id: state.users.length + 100,
      name: data.name, email: data.email,
      phone: data.phone || '', wechat: data.wechat || '',
      password: data.password, role: 'user', vip: false,
    });
    saveState();
    toast('注册成功，请登录', 'success');
    return true;
  }

  function logout() {
    state.currentUser = null;
    saveState();
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('appContainer').classList.remove('active');
  }

  // ====================================================================
  // NAVIGATION
  // ====================================================================

  function enterApp() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('appContainer').classList.add('active');
    document.getElementById('sidebar').classList.remove('open');
    renderSidebar();
    navigateTo('dashboard');
  }

  var NAV_ITEMS = {
    user: [
      { id: 'dashboard', label: '我的签证', icon: '\u{1F4CB}' },
      { id: 'materials', label: '材料清单', icon: '\u{1F4C4}' },
      { id: 'appointment', label: '预约面签', icon: '\u{1F4C5}' },
      { id: 'services', label: '增值服务', icon: '\u2B50' },
      { id: 'profile', label: '个人中心', icon: '\u{1F464}' },
    ],
    officer: [
      { id: 'dashboard', label: '工作台', icon: '\u{1F4CB}' },
      { id: 'orders', label: '订单管理', icon: '\u{1F4E6}' },
      { id: 'chat', label: '用户沟通', icon: '\u{1F4AC}' },
    ],
    admin: [
      { id: 'dashboard', label: '管理概览', icon: '\u{1F4CA}' },
      { id: 'users', label: '用户管理', icon: '\u{1F465}' },
      { id: 'officers', label: '签证官审核', icon: '\u{1F511}' },
      { id: 'chat', label: '用户对话', icon: '\u{1F4AC}' },
    ],
  };

  function renderSidebar() {
    var nav = document.getElementById('sidebarNav');
    var role = state.currentUser.role;
    var items = NAV_ITEMS[role] || NAV_ITEMS.user;
    nav.innerHTML = items.map(function(item) {
      var badgeCount = '';
      if (item.id === 'dashboard' && role === 'officer') {
        var pending = state.orders.filter(function(o) { return !o.officerId; }).length;
        if (pending > 0) badgeCount = '<span class="badge-count">' + pending + '</span>';
      }
      if (item.id === 'officers' && role === 'admin') {
        if (state.pendingOfficers.length > 0) badgeCount = '<span class="badge-count">' + state.pendingOfficers.length + '</span>';
      }
      var activeClass = state.currentPage === item.id ? ' active' : '';
      return '<div class="nav-item' + activeClass + '" data-page="' + item.id + '"><span class="icon">' + item.icon + '</span>' + item.label + badgeCount + '</div>';
    }).join('');

    var u = state.currentUser;
    document.getElementById('userAvatar').textContent = u.name ? u.name[0].toUpperCase() : 'U';
    document.getElementById('sidebarUserName').textContent = u.name || u.email;
    var roleLabels = { user: '普通用户', officer: '签证官', admin: '管理员' };
    document.getElementById('sidebarUserRole').textContent = roleLabels[u.role] || u.role;

    nav.querySelectorAll('.nav-item').forEach(function(el) {
      el.addEventListener('click', function() { navigateTo(el.dataset.page); });
    });
  }

  function navigateTo(page) {
    state.currentPage = page;
    saveState();
    renderSidebar();
    closeMobileMenu();

    var role = state.currentUser.role;
    var content = document.getElementById('mainContent');

    switch(page) {
      case 'dashboard': renderDashboard(content, role); break;
      case 'materials': renderMaterials(content); break;
      case 'appointment': renderAppointment(content); break;
      case 'services': renderServices(content); break;
      case 'profile': renderProfile(content); break;
      case 'orders': renderOfficerOrders(content); break;
      case 'chat': renderChat(content, role); break;
      case 'users': renderAdminUsers(content); break;
      case 'officers': renderAdminOfficers(content); break;
      default: renderDashboard(content, role);
    }
  }

  function closeMobileMenu() {
    document.getElementById('sidebar').classList.remove('open');
  }

  // ====================================================================
  // DASHBOARD
  // ====================================================================

  function renderDashboard(container, role) {
    if (role === 'user') renderUserDashboard(container);
    else if (role === 'officer') renderOfficerDashboard(container);
    else if (role === 'admin') renderAdminDashboard(container);
  }

  function renderUserDashboard(container) {
    var myAppts = state.appointments.filter(function(a) { return a.userId === state.currentUser.id; });
    var myOrders = state.orders.filter(function(o) { return o.userId === state.currentUser.id; });

    container.innerHTML =
      '<div class="page-header"><h1>我的签证</h1><p>管理您的签证申请，随时查看进度</p></div>' +
      '<div class="page-body">' +
        '<div class="grid-3 mb-6">' +
          '<div class="stat-card"><div class="stat-icon" style="background:var(--primary-bg);color:var(--primary)">\u{1F4CB}</div><div class="stat-value">' + myOrders.length + '</div><div class="stat-label">我的订单</div></div>' +
          '<div class="stat-card"><div class="stat-icon" style="background:var(--success-bg);color:var(--success)">\u{1F4C5}</div><div class="stat-value">' + myAppts.filter(function(a) { return a.status === 'confirmed'; }).length + '</div><div class="stat-label">已预约面签</div></div>' +
          '<div class="stat-card"><div class="stat-icon" style="background:var(--info-bg);color:var(--info)">\u2708</div><div class="stat-value">' + (state.currentUser.vip ? 'VIP' : '普通') + '</div><div class="stat-label">会员等级</div></div>' +
        '</div>' +
        '<div class="card mb-4">' +
          '<div class="card-header"><h3>选择签证目的地</h3></div>' +
          '<div class="visa-grid" id="visaGrid">' +
            COUNTRIES.map(function(c) {
              return '<div class="visa-card" data-country="' + c.id + '"><div class="flag">' + c.flag + '</div><div class="name">' + c.name + '</div><div class="count">' + c.types.length + '种签证</div></div>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<div id="visaTypeSection" class="hidden">' +
          '<div class="card mb-4">' +
            '<div class="card-header"><h3>选择签证类型</h3><button class="btn btn-ghost btn-sm" id="backToCountries">\u2190 返回国家选择</button></div>' +
            '<div id="visaTypes"></div>' +
          '</div>' +
        '</div>' +
        (myOrders.length > 0 ?
          '<div class="card mb-4"><div class="card-header"><h3>最近订单</h3><button class="btn btn-ghost btn-sm" onclick="window.__vp_nav(\'materials\')">查看全部 \u2192</button></div>' +
          '<div class="table-wrapper"><table><thead><tr><th>订单号</th><th>国家</th><th>类型</th><th>状态</th><th>金额</th></tr></thead><tbody>' +
          myOrders.map(function(o) {
            var statusLabel = o.status === 'pending' ? '待处理' : o.status === 'paid' ? '已支付' : '已完成';
            var badgeClass = o.status === 'pending' ? 'badge-yellow' : o.status === 'paid' ? 'badge-blue' : 'badge-green';
            return '<tr><td><strong>' + o.id + '</strong></td><td>' + o.country + '</td><td>' + o.visaType + '</td><td><span class="badge ' + badgeClass + '">' + statusLabel + '</span></td><td>\u00A5' + o.amount + '</td></tr>';
          }).join('') +
          '</tbody></table></div></div>' : '') +
        (myAppts.length > 0 ?
          '<div class="card"><div class="card-header"><h3>我的预约</h3></div>' +
          myAppts.map(function(a) {
            return '<div class="file-item"><span class="file-icon">\u{1F4C5}</span><div class="file-info"><div class="file-name">' + a.country + ' - ' + a.visaType + '</div><div class="file-size">' + a.date + ' ' + a.time + ' \u00B7 <span class="badge badge-green">' + (a.status === 'confirmed' ? '已确认' : '待确认') + '</span></div></div></div>';
          }).join('') +
          '</div>' : '') +
      '</div>';

    container.querySelectorAll('.visa-card').forEach(function(card) {
      card.addEventListener('click', function() {
        var countryId = card.dataset.country;
        var country = COUNTRIES.find(function(c) { return c.id === countryId; });
        if (!country) return;
        state.selectedCountry = country;
        saveState();
        container.querySelectorAll('.visa-card').forEach(function(c) { c.classList.remove('selected'); });
        card.classList.add('selected');
        var section = container.querySelector('#visaTypeSection');
        section.classList.remove('hidden');
        var tc = container.querySelector('#visaTypes');
        tc.innerHTML = '<div class="grid-2">' + country.types.map(function(t) {
          return '<button class="btn btn-secondary btn-block visa-type-btn" data-type="' + t + '">' + t + '</button>';
        }).join('') + '</div>';
        tc.querySelectorAll('.visa-type-btn').forEach(function(btn) {
          btn.addEventListener('click', function() {
            state.selectedVisaType = btn.dataset.type;
            saveState();
            navigateTo('materials');
          });
        });
      });
    });

    var backBtn = container.querySelector('#backToCountries');
    if (backBtn) {
      backBtn.addEventListener('click', function() {
        state.selectedCountry = null;
        state.selectedVisaType = null;
        saveState();
        container.querySelector('#visaTypeSection').classList.add('hidden');
        container.querySelectorAll('.visa-card').forEach(function(c) { c.classList.remove('selected'); });
      });
    }
  }

  // ====================================================================
  // MATERIALS (核心功能)
  // ====================================================================

  function renderMaterials(container) {
    var country = state.selectedCountry;
    var visaType = state.selectedVisaType;
    var materials = (country && visaType) ? getMaterialsForVisa(country.id, visaType) : getMaterialsForVisa('us', '旅游( B1/B2 )');
    var uploadedFiles = state.uploadedFiles || [];

    var badgeHTML = country ? '<span class="badge badge-blue">' + country.flag + ' ' + country.name + ' \u00B7 ' + visaType + '</span>' : '<span class="badge badge-gray">请先选择目的地</span>';

    container.innerHTML =
      '<div class="page-header"><div class="flex items-center gap-3"><h1>材料清单</h1>' + badgeHTML + '</div><p>准备以下材料，支持上传、下载模板、翻译和一键预约</p></div>' +
      '<div class="page-body">' +
        '<div class="progress-steps">' +
          '<div class="progress-step done"><span class="step-num">1</span><span class="step-label">选择国家</span></div><div class="step-connector done"></div>' +
          '<div class="progress-step done"><span class="step-num">2</span><span class="step-label">选择类型</span></div><div class="step-connector done"></div>' +
          '<div class="progress-step active"><span class="step-num">3</span><span class="step-label">准备材料</span></div><div class="step-connector"></div>' +
          '<div class="progress-step"><span class="step-num">4</span><span class="step-label">预约面签</span></div><div class="step-connector"></div>' +
          '<div class="progress-step"><span class="step-num">5</span><span class="step-label">出签取件</span></div>' +
        '</div>' +
        '<div class="grid-2">' +
          '<div class="card">' +
            '<div class="card-header"><h3>\u{1F4C4} 所需材料</h3><button class="btn btn-ghost btn-sm" onclick="window.__vp_translateAll()">\u{1F310} 一键翻译</button></div>' +
            '<div id="materialChecklist">' +
              materials.map(function(m, i) {
                var requiredBadge = m.required ? '<span class="badge badge-red">必需</span>' : '<span class="badge badge-gray">可选</span>';
                return '<div class="file-item material-item" data-material-id="' + m.id + '">' +
                  '<span class="file-icon">' + (m.required ? '\u{1F4CC}' : '\u{1F4CE}') + '</span>' +
                  '<div class="file-info"><div class="file-name">' + m.label + '</div><div class="file-size">' + requiredBadge + '</div></div>' +
                  '<div class="file-actions"><button class="btn btn-ghost btn-sm upload-material-btn" data-material="' + m.id + '">\u{1F4E4} 上传</button><button class="btn btn-ghost btn-sm template-btn">\u{1F4CB} 模板</button></div>' +
                '</div>';
              }).join('') +
            '</div>' +
            '<div class="mt-4 flex items-center justify-between">' +
              '<button class="btn btn-primary" id="translateAllBtn">\u{1F310} 一键翻译所有文件</button>' +
              '<button class="btn btn-success" id="proceedAppointmentBtn">\u{1F4C5} 立即预约面签</button>' +
            '</div>' +
          '</div>' +
          '<div>' +
            '<div class="card mb-4">' +
              '<div class="card-header"><h3>\u{1F4E4} DIY 自助上传</h3></div>' +
              '<div class="upload-zone" id="uploadZone">' +
                '<div class="upload-icon">\u{1F4C1}</div><p>点击上传或拖拽文件到此区域</p>' +
                '<p class="formats">支持 JPG / PNG / PDF / Word / Excel</p>' +
                '<input type="file" id="fileInput" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx" multiple style="display:none">' +
              '</div>' +
              '<div id="uploadedFileList" class="mt-3">' +
                (uploadedFiles.length > 0 ? uploadedFiles.map(function(f) {
                  var icon = f.type && f.type.startsWith('image') ? '\u{1F5BC}' : '\u{1F4D5}';
                  return '<div class="file-item"><span class="file-icon">' + icon + '</span>' +
                    '<div class="file-info"><div class="file-name">' + f.name + '</div><div class="file-size">' + (f.size / 1024).toFixed(1) + ' KB</div></div>' +
                    '<div class="file-actions"><button class="btn btn-ghost btn-sm translate-file-btn" data-name="' + f.name + '">\u{1F310} 翻译</button>' +
                    '<button class="btn btn-ghost btn-sm" onclick="window.__vp_removeFile(\'' + f.name.replace(/'/g, "\\'") + '\')">\u2715</button></div></div>';
                }).join('') : '') +
              '</div>' +
            '</div>' +
            '<div class="card mb-4">' +
              '<div class="card-header"><h3>\u{1F5FA} 智能行程规划</h3></div>' +
              '<div class="form-group"><label class="form-label">出行天数</label><input class="form-input" type="number" id="tripDays" value="5" min="1" max="30"></div>' +
              '<div class="form-group"><label class="form-label">出发日期</label><input class="form-input" type="date" id="tripDate"></div>' +
              '<div class="form-group"><label class="form-label">偏好</label><select class="form-select" id="tripPreference"><option value="culture">文化历史</option><option value="nature">自然风光</option><option value="shopping">购物美食</option><option value="mixed" selected>综合推荐</option></select></div>' +
              '<button class="btn btn-primary btn-block" id="generateItineraryBtn">\u{1F5FA} 生成行程单</button>' +
              '<div id="itineraryResult" class="mt-3"></div>' +
            '</div>' +
            '<div class="card">' +
              '<div class="card-header"><h3>\u{1F6E1} 旅行医疗保险</h3></div>' +
              '<div class="flex flex-wrap gap-3 mb-3">' +
                '<button class="btn btn-secondary btn-sm insurance-option" data-insurance="allianz">安联保险</button>' +
                '<button class="btn btn-secondary btn-sm insurance-option" data-insurance="life">中国人寿</button>' +
                '<button class="btn btn-secondary btn-sm insurance-option" data-insurance="pingan">平安保险</button>' +
              '</div>' +
              '<div class="upload-zone" style="padding:16px;" id="insuranceUploadZone"><p class="text-sm">\u{1F4C4} 或自行上传保险单 PDF</p><input type="file" accept=".pdf" style="display:none" id="insuranceInput"></div>' +
              '<div id="insuranceStatus" class="mt-2"></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    setupMaterialPage();
  }

  function setupMaterialPage() {
    var zone = document.getElementById('uploadZone');
    var input = document.getElementById('fileInput');
    if (zone) {
      zone.addEventListener('click', function() { if (input) input.click(); });
      zone.addEventListener('dragover', function(e) { e.preventDefault(); zone.classList.add('dragover'); });
      zone.addEventListener('dragleave', function() { zone.classList.remove('dragover'); });
      zone.addEventListener('drop', function(e) {
        e.preventDefault();
        zone.classList.remove('dragover');
        if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
      });
    }
    if (input) {
      input.addEventListener('change', function() { if (input.files.length) handleFiles(input.files); });
    }

    document.querySelectorAll('.upload-material-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var fi = document.createElement('input');
        fi.type = 'file';
        fi.accept = '.jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx';
        fi.click();
        fi.addEventListener('change', function() {
          if (fi.files.length) { handleFiles(fi.files); toast('已上传 ' + fi.files[0].name, 'success'); }
        });
      });
    });

    document.querySelectorAll('.template-btn').forEach(function(btn) {
      btn.addEventListener('click', function() { toast('模板已生成，可在下载中心查看', 'info'); });
    });

    var translateBtn = document.getElementById('translateAllBtn');
    if (translateBtn) translateBtn.addEventListener('click', window.__vp_translateAll);
    var proceedBtn = document.getElementById('proceedAppointmentBtn');
    if (proceedBtn) proceedBtn.addEventListener('click', function() { navigateTo('appointment'); });

    document.querySelectorAll('.translate-file-btn').forEach(function(btn) {
      btn.addEventListener('click', function() { toast('文件 ' + btn.dataset.name + ' 翻译完成', 'success'); });
    });

    var tripDate = document.getElementById('tripDate');
    if (tripDate) tripDate.value = new Date().toISOString().split('T')[0];

    var genBtn = document.getElementById('generateItineraryBtn');
    if (genBtn) genBtn.addEventListener('click', generateItinerary);

    document.querySelectorAll('.insurance-option').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.insurance-option').forEach(function(b) { b.classList.remove('btn-primary'); b.classList.add('btn-secondary'); });
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');
        var names = { allianz: '安联保险', life: '中国人寿', pingan: '平安保险' };
        var statusEl = document.getElementById('insuranceStatus');
        if (statusEl) statusEl.innerHTML = '<div class="alert alert-success">\u2705 已选择 ' + names[btn.dataset.insurance] + '</div>';
        toast('已选择 ' + names[btn.dataset.insurance], 'success');
      });
    });

    var insZone = document.getElementById('insuranceUploadZone');
    var insInput = document.getElementById('insuranceInput');
    if (insZone && insInput) {
      insZone.addEventListener('click', function() { insInput.click(); });
      insInput.addEventListener('change', function() {
        if (insInput.files.length) {
          var statusEl = document.getElementById('insuranceStatus');
          if (statusEl) statusEl.innerHTML = '<div class="alert alert-success">\u2705 已上传保险单: ' + insInput.files[0].name + '</div>';
          toast('保险单上传成功', 'success');
        }
      });
    }
  }

  function handleFiles(files) {
    if (!state.uploadedFiles) state.uploadedFiles = [];
    for (var i = 0; i < files.length; i++) {
      state.uploadedFiles.push({ name: files[i].name, size: files[i].size, type: files[i].type });
    }
    saveState();
    toast('成功上传 ' + files.length + ' 个文件', 'success');
    navigateTo('materials');
  }

  function generateItinerary() {
    var country = state.selectedCountry;
    var days = parseInt(document.getElementById('tripDays') ? document.getElementById('tripDays').value : 5);
    var date = document.getElementById('tripDate') ? document.getElementById('tripDate').value : '2026-08-01';
    var prefSelect = document.getElementById('tripPreference');
    var pref = prefSelect ? prefSelect.value : 'mixed';

    if (!country) { toast('请先选择目的地国家', 'error'); return; }

    var attractions = {
      culture: ['博物馆参观', '历史遗迹游览', '艺术画廊', '文化街区漫步', '古城探索'],
      nature: ['国家公园徒步', '自然风景区游览', '生态保护区参观', '湖泊/河流观光', '山景游览'],
      shopping: ['购物中心', '特色市场', '免税店', '精品街区', '当地特产店'],
      mixed: ['主要景点游览', '当地特色体验', '美食探店', '文化体验', '休闲购物'],
    };
    var acts = attractions[pref] || attractions.mixed;
    var citySuggestions = { us: '纽约/洛杉矶', uk: '伦敦', france: '巴黎', italy: '罗马', japan: '东京', korea: '首尔', australia: '悉尼', canada: '多伦多', schengen: '巴黎/罗马/巴塞罗那' };
    var city = citySuggestions[country.id] || '当地';

    var html = '<div class="alert alert-info">\u{1F4CB} <strong>行程单已生成</strong> \u2014 可下载PDF或截图保存</div>';
    html += '<table style="font-size:0.82rem;"><thead><tr><th>日期</th><th>行程安排</th></tr></thead><tbody>';
    var startDate = new Date(date);
    for (var i = 0; i < Math.min(days, 14); i++) {
      var d = new Date(startDate);
      d.setDate(d.getDate() + i);
      var dateStr = (d.getMonth() + 1) + '/' + d.getDate();
      var act = acts[i % acts.length];
      html += '<tr><td>第' + (i + 1) + '天 (' + dateStr + ')</td><td>' + city + ' \u00B7 ' + act + (i === 0 ? ' \u00B7 抵达入住' : '') + (i === days - 1 ? ' \u00B7 返程' : '') + '</td></tr>';
    }
    html += '</tbody></table>';
    html += '<div class="mt-2 text-sm text-muted">\u{1F4CD} 主要城市: ' + city + ' | 天数: ' + days + '天 | 偏好: ' + pref + '</div>';

    var resultEl = document.getElementById('itineraryResult');
    if (resultEl) resultEl.innerHTML = html;
    toast('行程单已生成', 'success');
  }

  // ====================================================================
  // APPOINTMENT
  // ====================================================================

  function renderAppointment(container) {
    var today = new Date().toISOString().split('T')[0];
    container.innerHTML =
      '<div class="page-header"><h1>预约面签</h1><p>选择日期和时间，在线预约面签</p></div>' +
      '<div class="page-body">' +
        '<div class="progress-steps">' +
          '<div class="progress-step done"><span class="step-num">1</span><span class="step-label">选择国家</span></div><div class="step-connector done"></div>' +
          '<div class="progress-step done"><span class="step-num">2</span><span class="step-label">准备材料</span></div><div class="step-connector done"></div>' +
          '<div class="progress-step active"><span class="step-num">3</span><span class="step-label">预约面签</span></div>' +
        '</div>' +
        '<div class="grid-3">' +
          '<div class="card"><h3 class="mb-3">\u{1F4C5} 选择日期</h3><input class="form-input" type="date" id="apptDate" min="' + today + '" value="' + today + '">' +
          '<div class="mt-3"><label class="form-label">选择预约时段</label><div class="time-slots" id="timeSlots"></div></div></div>' +
          '<div class="card"><h3 class="mb-3">\u{1F6C2} 签证信息</h3>' +
          '<div class="form-group"><label class="form-label">目的地国家</label><select class="form-select" id="apptCountry">' +
            COUNTRIES.map(function(c) {
              var sel = state.selectedCountry && state.selectedCountry.id === c.id ? ' selected' : '';
              return '<option value="' + c.id + '"' + sel + '>' + c.flag + ' ' + c.name + '</option>';
            }).join('') +
          '</select></div>' +
          '<div class="form-group"><label class="form-label">签证类型</label><select class="form-select" id="apptVisaType"><option>旅游</option><option>商务</option><option>学生</option><option>工作</option><option>过境</option></select></div></div>' +
          '<div class="card"><h3 class="mb-3">\u{1F464} 申请人信息</h3>' +
          '<div class="form-group"><label class="form-label">姓名</label><input class="form-input" id="apptName" value="' + (state.currentUser.name || '') + '"></div>' +
          '<div class="form-group"><label class="form-label">手机号</label><input class="form-input" id="apptPhone" value="' + (state.currentUser.phone || '') + '"></div>' +
          '<div class="form-group"><label class="form-label">邮箱</label><input class="form-input" id="apptEmail" value="' + (state.currentUser.email || '') + '"></div></div>' +
        '</div>' +
        '<div class="card mt-4"><div class="card-header"><h3>服务选项</h3></div>' +
        '<div class="grid-3">' +
          '<div class="price-card"><h4>代做资料</h4><div class="price">\u00A5300 <span>/次</span></div><button class="btn btn-primary btn-block add-service-btn" data-service="docs" data-price="300">添加</button></div>' +
          '<div class="price-card"><h4>代做资料+线下递交</h4><div class="price">\u00A5700 <span>/次</span></div><button class="btn btn-primary btn-block add-service-btn" data-service="docs+submit" data-price="700">添加</button></div>' +
          '<div class="price-card featured"><h4>全套服务+代取护照</h4><div class="price">\u00A51,200 <span>/次</span></div><button class="btn btn-primary btn-block add-service-btn" data-service="full" data-price="1200">添加</button></div>' +
        '</div><div id="serviceSummary" class="mt-3"></div></div>' +
        '<div class="card mt-4"><div class="flex items-center justify-between mb-3"><h3>确认预约</h3><span class="badge badge-blue">材料齐全后可一键预约</span></div>' +
        '<p class="text-sm text-muted mb-4">请确认已上传所有必需材料，选择服务后点击预约。</p>' +
        '<button class="btn btn-success btn-lg" id="confirmAppointmentBtn" disabled>\u{1F4C5} 确认预约并支付</button></div>' +
        '<div id="myAppointmentsSection" class="mt-4"><h3 class="mb-3">我的预约记录</h3>' +
        (state.appointments.filter(function(a) { return a.userId === state.currentUser.id; }).length > 0 ?
          state.appointments.filter(function(a) { return a.userId === state.currentUser.id; }).map(function(a) {
            return '<div class="file-item"><span class="file-icon">\u{1F4C5}</span><div class="file-info"><div class="file-name">' + a.country + ' - ' + a.visaType + '</div><div class="file-size">' + a.date + ' ' + a.time + ' \u00B7 <span class="badge badge-green">' + (a.status === 'confirmed' ? '已确认' : '待确认') + '</span></div></div></div>';
          }).join('') :
          '<p class="text-muted text-sm">暂无预约记录</p>') +
        '</div>' +
      '</div>';

    setupAppointmentPage();
  }

  function setupAppointmentPage() {
    var selectedService = null;
    var selectedPrice = 0;
    var selectedTime = null;
    var dateInput = document.getElementById('apptDate');
    var slotsContainer = document.getElementById('timeSlots');

    function loadSlots() {
      var date = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
      var slots = generateTimeSlots(date);
      if (slotsContainer) {
        slotsContainer.innerHTML = slots.map(function(s) {
          return '<button class="time-slot' + (!s.available ? ' booked' : '') + '" data-time="' + s.time + '"' + (!s.available ? ' disabled' : '') + '>' + s.time + (!s.available ? ' (已满)' : '') + '</button>';
        }).join('');
        slotsContainer.querySelectorAll('.time-slot:not(.booked)').forEach(function(btn) {
          btn.addEventListener('click', function() {
            slotsContainer.querySelectorAll('.time-slot').forEach(function(b) { b.classList.remove('selected'); });
            btn.classList.add('selected');
            selectedTime = btn.dataset.time;
            var confirmBtn = document.getElementById('confirmAppointmentBtn');
            if (confirmBtn) confirmBtn.disabled = false;
          });
        });
      }
    }
    loadSlots();
    if (dateInput) dateInput.addEventListener('change', loadSlots);

    document.querySelectorAll('.add-service-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        selectedService = btn.dataset.service;
        selectedPrice = parseInt(btn.dataset.price);
        document.querySelectorAll('.add-service-btn').forEach(function(b) { b.textContent = '添加'; b.classList.remove('btn-success'); b.classList.add('btn-primary'); });
        btn.textContent = '已添加 \u2713';
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-success');
        var names = { 'docs': '代做资料', 'docs+submit': '代做资料+线下递交', 'full': '全套服务+代取护照' };
        var summaryEl = document.getElementById('serviceSummary');
        if (summaryEl) summaryEl.innerHTML = '<div class="alert alert-success">\u2705 已选择: <strong>' + names[selectedService] + '</strong> \u2014 合计: <strong>\u00A5' + selectedPrice + '</strong></div>';
      });
    });

    var confirmBtn = document.getElementById('confirmAppointmentBtn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', function() {
        var countrySelect = document.getElementById('apptCountry');
        var country = countrySelect ? countrySelect.options[countrySelect.selectedIndex].text : '未选择';
        var visaTypeEl = document.getElementById('apptVisaType');
        var visaType = visaTypeEl ? visaTypeEl.value : '旅游';
        var date = dateInput ? dateInput.value : '';
        var name = document.getElementById('apptName') ? document.getElementById('apptName').value : state.currentUser.name;

        if (!date) { toast('请选择预约日期', 'error'); return; }
        if (!selectedTime) { toast('请选择预约时段', 'error'); return; }

        state.appointments.push({
          id: 'APT-' + String(state.appointments.length + 1).padStart(3, '0'),
          userId: state.currentUser.id,
          country: country, visaType: visaType,
          date: date, time: selectedTime, status: 'confirmed',
        });

        if (selectedService) {
          state.orders.push({
            id: 'ORD-' + String(state.orders.length + 1).padStart(3, '0'),
            userId: state.currentUser.id, officerId: null,
            country: country, visaType: visaType,
            status: 'paid', amount: selectedPrice,
            createdAt: new Date().toISOString().split('T')[0],
          });
        }

        saveState();
        toast('\u2705 预约成功! ' + date + ' ' + selectedTime + ' \u00B7 ' + country, 'success');
        navigateTo('appointment');
      });
    }
  }

  // ====================================================================
  // SERVICES
  // ====================================================================

  function renderServices(container) {
    container.innerHTML =
      '<div class="page-header"><h1>增值服务</h1><p>专业代办，让签证申请更省心</p></div>' +
      '<div class="page-body">' +
        '<div class="grid-3 mb-6">' +
          '<div class="price-card"><h3>代做资料</h3><div class="price">\u00A5300 <span>/次</span></div><p class="desc">专业团队整理签证材料</p>' +
          '<ul class="features"><li>材料清单核对</li><li>表格填写指导</li><li>材料格式检查</li><li>翻译服务</li></ul>' +
          '<button class="btn btn-primary btn-block purchase-btn" data-service="docs" data-price="300">立即购买</button></div>' +
          '<div class="price-card featured"><h3>代做资料+线下递交</h3><div class="price">\u00A5700 <span>/次</span></div><p class="desc">含线下材料递交服务</p>' +
          '<ul class="features"><li>代做资料全部服务</li><li>大使馆线下递交</li><li>面试辅导</li><li>进度跟踪</li></ul>' +
          '<button class="btn btn-primary btn-block purchase-btn" data-service="docs+submit" data-price="700">立即购买</button></div>' +
          '<div class="price-card"><h3>全套服务+代取护照</h3><div class="price">\u00A51,200 <span>/次</span></div><p class="desc">全程托管服务</p>' +
          '<ul class="features"><li>代做资料+线下递交</li><li>代取护照</li><li>VIP客服一对一</li><li>加急处理</li></ul>' +
          '<button class="btn btn-primary btn-block purchase-btn" data-service="full" data-price="1200">立即购买</button></div>' +
        '</div>' +
        '<div class="card"><h3 class="mb-3">购买记录</h3>' +
        (state.orders.filter(function(o) { return o.userId === state.currentUser.id; }).length > 0 ?
          '<div class="table-wrapper"><table><thead><tr><th>订单号</th><th>服务</th><th>金额</th><th>状态</th><th>日期</th></tr></thead><tbody>' +
          state.orders.filter(function(o) { return o.userId === state.currentUser.id; }).map(function(o) {
            return '<tr><td>' + o.id + '</td><td>' + o.visaType + ' - ' + o.country + '</td><td>\u00A5' + o.amount + '</td><td><span class="badge badge-green">已支付</span></td><td>' + o.createdAt + '</td></tr>';
          }).join('') +
          '</tbody></table></div>' : '<p class="text-muted text-sm">暂无购买记录</p>') +
        '</div>' +
      '</div>';

    document.querySelectorAll('.purchase-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var price = btn.dataset.price;
        var service = btn.dataset.service;
        var names = { 'docs': '代做资料', 'docs+submit': '代做资料+线下递交', 'full': '全套服务+代取护照' };
        showModal('确认购买',
          '<p>您正在购买: <strong>' + names[service] + '</strong></p><p class="mt-2">金额: <strong style="font-size:1.5rem;color:var(--primary);">\u00A5' + price + '</strong></p><div class="alert alert-info mt-3">\u{1F4B3} 模拟支付页面：点击确认完成支付</div>',
          '<button class="btn btn-secondary" onclick="window.__vp_closeModal()">取消</button><button class="btn btn-success" id="confirmPurchase">确认支付 \u00A5' + price + '</button>'
        );
        setTimeout(function() {
          var confirmPurchaseBtn = document.getElementById('confirmPurchase');
          if (confirmPurchaseBtn) {
            confirmPurchaseBtn.addEventListener('click', function() {
              state.orders.push({
                id: 'ORD-' + String(state.orders.length + 1).padStart(3, '0'),
                userId: state.currentUser.id, officerId: null,
                country: state.selectedCountry ? state.selectedCountry.name : '多国',
                visaType: names[service], status: 'paid',
                amount: parseInt(price),
                createdAt: new Date().toISOString().split('T')[0],
              });
              saveState();
              closeModal();
              toast('\u{1F389} 支付成功！已生成订单', 'success');
              navigateTo('services');
            });
          }
        }, 50);
      });
    });
  }

  // ====================================================================
  // PROFILE
  // ====================================================================

  function renderProfile(container) {
    var u = state.currentUser;
    container.innerHTML =
      '<div class="page-header"><h1>个人中心</h1><p>管理您的个人信息和账号设置</p></div>' +
      '<div class="page-body"><div class="grid-2">' +
        '<div class="card"><div class="card-header"><h3>\u{1F464} 基本信息</h3></div>' +
        '<div class="form-group"><label class="form-label">姓名</label><input class="form-input" id="profileName" value="' + (u.name || '') + '"></div>' +
        '<div class="form-group"><label class="form-label">邮箱</label><input class="form-input" value="' + u.email + '" disabled></div>' +
        '<div class="form-group"><label class="form-label">手机号</label><input class="form-input" id="profilePhone" value="' + (u.phone || '') + '"></div>' +
        '<div class="form-group"><label class="form-label">微信号</label><input class="form-input" id="profileWechat" value="' + (u.wechat || '') + '"></div>' +
        '<button class="btn btn-primary" id="saveProfileBtn">保存修改</button></div>' +
        '<div><div class="card mb-4"><div class="card-header"><h3>\u{1F512} 安全设置</h3></div>' +
        '<div class="form-group"><label class="form-label">新密码</label><input class="form-input" type="password" id="newPassword" placeholder="留空不修改"></div>' +
        '<button class="btn btn-primary" id="changePasswordBtn">修改密码</button></div>' +
        '<div class="card"><div class="card-header"><h3>\u{1F3AF} 会员权益</h3></div>' +
        (u.vip ?
          '<div class="alert alert-success">\u{1F31F} 您已是VIP会员，享有多项专属权益</div>' +
          '<ul style="padding-left:20px;color:var(--text-secondary);font-size:0.85rem;"><li>所有材料模板免费下载</li><li>优先预约面签时段</li><li>专属客服一对一服务</li><li>加急处理通道</li></ul>' :
          '<div class="alert alert-info">开通VIP会员，享受专属服务</div><button class="btn btn-primary" onclick="toast(\'VIP开通功能即将上线\', \'info\')">开通VIP - \u00A5199/年</button>') +
        '</div></div></div></div>';

    document.getElementById('saveProfileBtn').addEventListener('click', function() {
      var name = document.getElementById('profileName').value;
      var phone = document.getElementById('profilePhone').value;
      var wechat = document.getElementById('profileWechat').value;
      var user = state.users.find(function(u) { return u.id === state.currentUser.id; });
      if (user) { user.name = name; user.phone = phone; user.wechat = wechat; }
      state.currentUser.name = name;
      state.currentUser.phone = phone;
      state.currentUser.wechat = wechat;
      saveState();
      toast('个人信息已更新', 'success');
      renderSidebar();
    });

    document.getElementById('changePasswordBtn').addEventListener('click', function() {
      var pwd = document.getElementById('newPassword').value;
      if (!pwd) { toast('请输入新密码', 'error'); return; }
      var user = state.users.find(function(u) { return u.id === state.currentUser.id; });
      if (user) user.password = pwd;
      state.currentUser.password = pwd;
      saveState();
      toast('密码已修改', 'success');
    });
  }

  // ====================================================================
  // OFFICER
  // ====================================================================

  function renderOfficerDashboard(container) {
    var pendingOrders = state.orders.filter(function(o) { return !o.officerId; });
    var myOrders = state.orders.filter(function(o) { return o.officerId === state.currentUser.id; });

    container.innerHTML =
      '<div class="page-header"><div class="flex items-center justify-between"><div><h1>签证官工作台</h1><p>管理接单、处理签证申请</p></div>' +
      (state.currentUser.approved ? '<span class="badge badge-green">已认证 \u2713</span>' : '<span class="badge badge-yellow">审核中..</span>') +
      '</div></div><div class="page-body">' +
        '<div class="grid-3 mb-4">' +
          '<div class="stat-card"><div class="stat-icon" style="background:var(--warning-bg);color:var(--warning)">\u{1F4E6}</div><div class="stat-value">' + pendingOrders.length + '</div><div class="stat-label">待接单</div></div>' +
          '<div class="stat-card"><div class="stat-icon" style="background:var(--primary-bg);color:var(--primary)">\u{1F4CB}</div><div class="stat-value">' + myOrders.length + '</div><div class="stat-label">已接单</div></div>' +
          '<div class="stat-card"><div class="stat-icon" style="background:var(--success-bg);color:var(--success)">\u{1F4AC}</div><div class="stat-value">' + Object.keys(state.chatMessages).length + '</div><div class="stat-label">对话用户</div></div>' +
        '</div>' +
        '<div class="card mb-4"><div class="card-header"><h3>\u{1F4E6} 可接订单</h3></div>' +
        (pendingOrders.length > 0 ?
          pendingOrders.map(function(o) {
            return '<div class="file-item"><span class="file-icon">\u{1F4CB}</span><div class="file-info"><div class="file-name">' + o.country + ' - ' + o.visaType + '</div><div class="file-size">订单号: ' + o.id + ' \u00B7 金额: \u00A5' + o.amount + ' \u00B7 ' + o.createdAt + '</div></div><button class="btn btn-primary btn-sm accept-order-btn" data-order-id="' + o.id + '">接受订单</button></div>';
          }).join('') :
          '<p class="text-muted text-sm p-4">暂无待接订单</p>') +
        '</div>' +
        (myOrders.length > 0 ?
          '<div class="card"><div class="card-header"><h3>\u{1F4CB} 我的订单</h3></div>' +
          myOrders.map(function(o) {
            return '<div class="file-item"><span class="file-icon">\u{1F4E6}</span><div class="file-info"><div class="file-name">' + o.country + ' - ' + o.visaType + '</div><div class="file-size">' + o.id + ' \u00B7 用户ID: ' + o.userId + '</div></div><button class="btn btn-ghost btn-sm" onclick="window.__vp_nav(\'chat\')">\u{1F4AC} 联系用户</button></div>';
          }).join('') +
          '</div>' : '') +
      '</div>';

    document.querySelectorAll('.accept-order-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        if (!state.currentUser.approved) { toast('您的账号尚未通过审核，无法接单', 'error'); return; }
        var order = state.orders.find(function(o) { return o.id === btn.dataset.orderId; });
        if (order) { order.officerId = state.currentUser.id; order.status = 'processing'; saveState(); toast('已接单成功', 'success'); navigateTo('dashboard'); }
      });
    });
  }

  function renderOfficerOrders(container) {
    var myOrders = state.orders.filter(function(o) { return o.officerId === state.currentUser.id; });
    container.innerHTML =
      '<div class="page-header"><h1>订单管理</h1><p>管理您已接取的订单</p></div><div class="page-body"><div class="card">' +
      (myOrders.length > 0 ?
        '<div class="table-wrapper"><table><thead><tr><th>订单号</th><th>国家</th><th>类型</th><th>金额</th><th>用户</th><th>状态</th><th>操作</th></tr></thead><tbody>' +
        myOrders.map(function(o) {
          var user = state.users.find(function(u) { return u.id === o.userId; });
          return '<tr><td>' + o.id + '</td><td>' + o.country + '</td><td>' + o.visaType + '</td><td>\u00A5' + o.amount + '</td><td>' + (user ? user.name : '#' + o.userId) + '</td><td><span class="badge badge-blue">处理中</span></td><td><button class="btn btn-ghost btn-sm" onclick="window.__vp_nav(\'chat\')">\u{1F4AC} 沟通</button></td></tr>';
        }).join('') +
        '</tbody></table></div>' : '<p class="text-muted">暂无订单</p>') +
      '</div></div>';
  }

  // ====================================================================
  // CHAT
  // ====================================================================

  function renderChat(container, role) {
    var isAdmin = role === 'admin';
    var isOfficer = role === 'officer';
    var chatUsers = [];

    if (isAdmin) {
      chatUsers = state.users.map(function(u) {
        var msgs = state.chatMessages[u.id];
        var preview = msgs && msgs.length > 0 ? msgs[msgs.length - 1].text : '暂无消息';
        return { id: u.id, name: u.name, preview: preview };
      });
    } else if (isOfficer) {
      var myOrderIds = state.orders.filter(function(o) { return o.officerId === state.currentUser.id; }).map(function(o) { return o.userId; });
      chatUsers = state.users.filter(function(u) { return myOrderIds.indexOf(u.id) >= 0; }).map(function(u) {
        var msgs = state.chatMessages[u.id];
        var preview = msgs && msgs.length > 0 ? msgs[msgs.length - 1].text : '暂无消息';
        return { id: u.id, name: u.name, preview: preview };
      });
    } else {
      chatUsers = [{ id: state.currentUser.id, name: '客服中心', preview: (state.chatMessages[state.currentUser.id] && state.chatMessages[state.currentUser.id].length > 0) ? state.chatMessages[state.currentUser.id][state.chatMessages[state.currentUser.id].length - 1].text : '欢迎咨询' }];
    }

    var activeChatId = chatUsers.length > 0 ? chatUsers[0].id : null;

    container.innerHTML =
      '<div class="page-header"><h1>' + (isAdmin ? '用户对话' : isOfficer ? '用户沟通' : '在线客服') + '</h1><p>与用户' + (isAdmin ? '' : '和客服') + '实时沟通</p></div>' +
      '<div class="page-body"><div class="chat-container">' +
        '<div class="chat-sidebar" id="chatUserList">' +
          chatUsers.map(function(u) {
            var activeClass = u.id === activeChatId ? ' active' : '';
            return '<div class="chat-user-item' + activeClass + '" data-chat-user="' + u.id + '"><div class="name">' + u.name + '</div><div class="preview">' + u.preview + '</div></div>';
          }).join('') +
          (chatUsers.length === 0 ? '<div class="p-4 text-sm text-muted">暂无对话</div>' : '') +
        '</div>' +
        '<div class="chat-main">' +
          '<div class="chat-messages" id="chatMessagesContainer">' +
            (activeChatId && state.chatMessages[activeChatId] ? state.chatMessages[activeChatId].map(function(m) {
              var isSent = (m.from === 'admin' && isAdmin) || (m.from === 'officer' && isOfficer) || (m.from === 'user' && !isAdmin && !isOfficer);
              return '<div class="chat-msg ' + (isSent ? 'sent' : 'received') + '">' + m.text + '<div class="msg-time">' + m.time + '</div></div>';
            }).join('') : '') +
            (!activeChatId ? '<div class="p-4 text-sm text-muted">选择用户开始对话</div>' : '') +
          '</div>' +
          '<div class="chat-input-area"><input type="text" id="chatInput" placeholder="输入消息..."' + (!activeChatId ? ' disabled' : '') + '><button class="btn btn-primary" id="chatSendBtn"' + (!activeChatId ? ' disabled' : '') + '>发送</button></div>' +
        '</div>' +
      '</div></div>';

    var sendBtn = document.getElementById('chatSendBtn');
    var chatInput = document.getElementById('chatInput');
    var messagesContainer = document.getElementById('chatMessagesContainer');

    function sendMessage() {
      var text = chatInput ? chatInput.value.trim() : '';
      if (!text || !activeChatId) return;
      if (!state.chatMessages[activeChatId]) state.chatMessages[activeChatId] = [];
      var sender = isAdmin ? 'admin' : isOfficer ? 'officer' : 'user';
      var now = new Date().toLocaleString('zh-CN');
      state.chatMessages[activeChatId].push({ from: sender, text: text, time: now });
      saveState();
      if (messagesContainer) {
        messagesContainer.innerHTML += '<div class="chat-msg sent">' + text + '<div class="msg-time">' + now + '</div></div>';
      }
      if (chatInput) chatInput.value = '';
      if (messagesContainer) messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    if (chatInput) chatInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') sendMessage(); });

    document.querySelectorAll('.chat-user-item').forEach(function(item) {
      item.addEventListener('click', function() { renderChat(container, role); });
    });
  }

  // ====================================================================
  // ADMIN
  // ====================================================================

  function renderAdminDashboard(container) {
    var totalRevenue = state.orders.reduce(function(s, o) { return s + (o.amount || 0); }, 0);
    container.innerHTML =
      '<div class="page-header"><h1>管理概览</h1><p>VisaPilot 系统运营数据</p></div><div class="page-body">' +
        '<div class="grid-4 mb-4">' +
          '<div class="stat-card"><div class="stat-icon" style="background:var(--primary-bg);color:var(--primary)">\u{1F465}</div><div class="stat-value">' + state.users.length + '</div><div class="stat-label">注册用户</div></div>' +
          '<div class="stat-card"><div class="stat-icon" style="background:var(--success-bg);color:var(--success)">\u{1F6C2}</div><div class="stat-value">' + state.officers.length + '</div><div class="stat-label">签证官</div></div>' +
          '<div class="stat-card"><div class="stat-icon" style="background:var(--warning-bg);color:var(--warning)">\u{1F4E6}</div><div class="stat-value">' + state.orders.length + '</div><div class="stat-label">总订单</div></div>' +
          '<div class="stat-card"><div class="stat-icon" style="background:var(--info-bg);color:var(--info)">\u{1F4B0}</div><div class="stat-value">\u00A5' + totalRevenue + '</div><div class="stat-label">总收入</div></div>' +
        '</div><div class="grid-2">' +
          '<div class="card"><div class="card-header"><h3>最近订单</h3><button class="btn btn-ghost btn-sm">查看全部</button></div>' +
          '<div class="table-wrapper"><table><thead><tr><th>订单号</th><th>用户</th><th>金额</th><th>状态</th></tr></thead><tbody>' +
          state.orders.slice(-5).reverse().map(function(o) {
            var user = state.users.find(function(u) { return u.id === o.userId; });
            var statusLabel = o.status === 'paid' ? '已支付' : o.status === 'pending' ? '待处理' : '已完成';
            return '<tr><td>' + o.id + '</td><td>' + (user ? user.name : 'N/A') + '</td><td>\u00A5' + o.amount + '</td><td><span class="badge badge-green">' + statusLabel + '</span></td></tr>';
          }).join('') +
          '</tbody></table></div></div>' +
          '<div class="card"><div class="card-header"><h3>待审核签证官</h3><span class="badge badge-yellow">' + state.pendingOfficers.length + ' 人</span></div>' +
          (state.pendingOfficers.length > 0 ?
            state.pendingOfficers.map(function(o) {
              return '<div class="file-item"><span class="file-icon">\u{1F511}</span><div class="file-info"><div class="file-name">' + o.name + ' (' + o.email + ')</div><div class="file-size">注册于 2026-07-27 \u00B7 待审核</div></div><button class="btn btn-success btn-sm approve-officer-btn" data-officer-id="' + o.id + '">通过</button></div>';
            }).join('') :
            '<p class="text-muted text-sm p-4">暂无待审核人员</p>') +
          '</div></div></div>';

    document.querySelectorAll('.approve-officer-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = parseInt(btn.dataset.officerId);
        var officer = state.officers.find(function(o) { return o.id === id; });
        if (officer) {
          officer.approved = true;
          state.pendingOfficers = state.officers.filter(function(o) { return !o.approved; });
          saveState();
          toast(officer.name + ' 已通过审核', 'success');
          navigateTo('dashboard');
        }
      });
    });
  }

  function renderAdminUsers(container) {
    container.innerHTML =
      '<div class="page-header"><h1>用户管理</h1><p>查看和管理所有注册用户</p></div><div class="page-body">' +
      '<div class="card"><div class="table-wrapper"><table><thead><tr><th>ID</th><th>姓名</th><th>邮箱</th><th>手机号</th><th>微信号</th><th>VIP</th><th>操作</th></tr></thead><tbody>' +
      state.users.map(function(u) {
        return '<tr><td>' + u.id + '</td><td>' + u.name + '</td><td>' + u.email + '</td><td>' + (u.phone || '-') + '</td><td>' + (u.wechat || '-') + '</td><td>' + (u.vip ? '\u{1F31F}' : '-') + '</td><td><button class="btn btn-ghost btn-sm admin-chat-btn" data-user-id="' + u.id + '">\u{1F4AC} 对话</button></td></tr>';
      }).join('') +
      '</tbody></table></div></div></div>';

    document.querySelectorAll('.admin-chat-btn').forEach(function(btn) {
      btn.addEventListener('click', function() { navigateTo('chat'); });
    });
  }

  function renderAdminOfficers(container) {
    container.innerHTML =
      '<div class="page-header"><h1>签证官审核</h1><p>审核签证官（代办人员）的注册申请</p></div><div class="page-body">' +
        '<div class="card mb-4"><div class="card-header"><h3>\u23F3 待审核签证官</h3><span class="badge badge-yellow">' + state.pendingOfficers.length + ' 人</span></div>' +
        (state.pendingOfficers.length > 0 ?
          state.pendingOfficers.map(function(o) {
            return '<div class="file-item"><span class="file-icon">\u{1F511}</span><div class="file-info"><div class="file-name">' + o.name + ' (' + o.email + ')</div><div class="file-size">申请时间: 2026-07-27 \u00B7 状态: <span class="badge badge-yellow">待审核</span></div></div><button class="btn btn-success btn-sm approve-officer-btn" data-officer-id="' + o.id + '">\u2705 通过审核</button><button class="btn btn-danger btn-sm">\u274C 拒绝</button></div>';
          }).join('') :
          '<div class="alert alert-success">所有签证官均已通过审核</div>') +
        '</div>' +
        '<div class="card"><div class="card-header"><h3>\u2705 已通过签证官</h3></div>' +
        '<div class="table-wrapper"><table><thead><tr><th>ID</th><th>姓名</th><th>邮箱</th><th>状态</th><th>操作</th></tr></thead><tbody>' +
        state.officers.filter(function(o) { return o.approved; }).map(function(o) {
          return '<tr><td>' + o.id + '</td><td>' + o.name + '</td><td>' + o.email + '</td><td><span class="badge badge-green">已认证</span></td><td><button class="btn btn-ghost btn-sm">禁用</button></td></tr>';
        }).join('') +
        '</tbody></table></div></div></div>';

    document.querySelectorAll('.approve-officer-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = parseInt(btn.dataset.officerId);
        var officer = state.officers.find(function(o) { return o.id === id; });
        if (officer) {
          officer.approved = true;
          state.pendingOfficers = state.officers.filter(function(o) { return !o.approved; });
          saveState();
          toast(officer.name + ' 已通过审核，可以接单', 'success');
          navigateTo('officers');
        }
      });
    });
  }

  // ====================================================================
  // GLOBAL HELPERS
  // ====================================================================

  window.__vp_nav = function(page) { navigateTo(page); };
  window.__vp_closeModal = closeModal;
  window.__vp_removeFile = function(name) {
    state.uploadedFiles = (state.uploadedFiles || []).filter(function(f) { return f.name !== name; });
    saveState();
    toast('已移除 ' + name, 'info');
    navigateTo('materials');
  };
  window.__vp_translateAll = function() {
    var files = state.uploadedFiles || [];
    if (files.length === 0) { toast('暂无文件需要翻译', 'info'); return; }
    toast('正在翻译 ' + files.length + ' 个文件...', 'info');
    setTimeout(function() { toast('\u2705 所有文件翻译完成，已保存至下载目录', 'success'); }, 1000);
  };

  // ====================================================================
  // EVENT BINDINGS
  // ====================================================================

  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.role-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.role-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
      });
    });

    document.getElementById('loginForm').addEventListener('submit', function(e) {
      e.preventDefault();
      var email = document.getElementById('loginEmail').value;
      var password = document.getElementById('loginPassword').value;
      var activeRole = document.querySelector('.role-btn.active');
      var role = activeRole ? activeRole.dataset.role : 'user';
      login(email, password, role);
    });

    document.getElementById('showRegisterForm').addEventListener('click', function() {
      document.getElementById('loginForm').style.display = 'none';
      document.getElementById('showRegisterForm').style.display = 'none';
      document.getElementById('registerForm').style.display = 'block';
    });

    document.getElementById('backToLogin').addEventListener('click', function() {
      document.getElementById('loginForm').style.display = 'block';
      document.getElementById('showRegisterForm').style.display = 'block';
      document.getElementById('registerForm').style.display = 'none';
    });

    document.getElementById('registerForm').addEventListener('submit', function(e) {
      e.preventDefault();
      var data = {
        name: document.getElementById('regName').value,
        email: document.getElementById('regEmail').value,
        phone: document.getElementById('regPhone').value,
        wechat: document.getElementById('regWechat').value,
        password: document.getElementById('regPassword').value,
      };
      if (register(data)) {
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('showRegisterForm').style.display = 'block';
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('loginEmail').value = data.email;
      }
    });

    document.getElementById('logoutBtn').addEventListener('click', logout);

    document.getElementById('mobileMenuBtn').addEventListener('click', function() {
      document.getElementById('sidebar').classList.toggle('open');
    });
  });

})();
