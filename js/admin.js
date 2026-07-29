/**
 * VisaPilot — 管理后台
 * 用户管理、代办审核、分配、对话、审核管理
 */

const VPAdmin = (function() {
  'use strict';

  function init() {
    renderUsers();
    renderAgentReviews();
    renderReviewMgmt();
    renderAllocation();
    renderConversations();
  }

  // ========= 用户管理 =========
  function renderUsers() {
    const container = document.getElementById('vp-admin-users');
    if (!container) return;
    const users = VPStorage.getAllUsers().filter(u => u.role !== 'admin');

    if (users.length === 0) {
      container.innerHTML = '<div class="vp-empty-state">暂无注册用户</div>';
      return;
    }

    container.innerHTML = `
      <table class="vp-table">
        <thead>
          <tr>
            <th>注册时间</th><th>姓名</th><th>手机号</th><th>微信号</th><th>角色</th><th>状态</th><th>订单</th>
          </tr>
        </thead>
        <tbody>
          ${users.map(u => `
            <tr>
              <td>${new Date(u.createdAt).toLocaleDateString('zh-CN')}</td>
              <td>${u.name}</td>
              <td>${u.phone}</td>
              <td>${u.wechat || '-'}</td>
              <td>${u.role === 'agent' ? '🛎️ 代办' : '👤 用户'}</td>
              <td>${u.role === 'agent' ? (u.approved ? '🟢 已通过' : '🟡 待审核') : '✅ 正常'}</td>
              <td>${(VPStorage.getOrders().filter(o => o.userId === u.phone).length)}单</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  // ========= 代办审核 =========
  function renderAgentReviews() {
    const container = document.getElementById('vp-admin-agent-reviews');
    if (!container) return;
    const reviews = VPStorage.getAgentReviews();

    if (reviews.length === 0) {
      container.innerHTML = '<div class="vp-empty-state">暂无代办申请</div>';
      return;
    }

    container.innerHTML = `
      <table class="vp-table">
        <thead>
          <tr><th>申请时间</th><th>姓名</th><th>手机号</th><th>微信号</th><th>简介</th><th>状态</th><th>操作</th></tr>
        </thead>
        <tbody>
          ${reviews.map(r => `
            <tr>
              <td>${new Date(r.createdAt).toLocaleDateString('zh-CN')}</td>
              <td>${r.name}</td>
              <td>${r.phone}</td>
              <td>${r.wechat || '-'}</td>
              <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.info || '-'}</td>
              <td>${r.status === 'pending' ? '🟡 待审核' : r.status === 'approved' ? '🟢 已通过' : '🔴 已拒绝'}</td>
              <td>
                ${r.status === 'pending' ? `
                  <button class="vp-btn vp-btn-sm vp-btn-success" onclick="VPAdmin.approveAgent('${r.phone}')">✅ 通过</button>
                  <button class="vp-btn vp-btn-sm vp-btn-danger" onclick="VPAdmin.rejectAgent('${r.phone}')">❌ 拒绝</button>
                ` : (r.status === 'approved' ? '✅ 已通过' : '❌ 已拒绝')}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  function approveAgent(phone) {
    const users = VPStorage.getUsers();
    const user = users.find(u => u.phone === phone);
    if (user) {
      user.approved = true;
      VPStorage.saveUser(user);
    }
    const reviews = VPStorage.getAgentReviews();
    const r = reviews.find(r => r.phone === phone);
    if (r) r.status = 'approved';
    VPStorage.setAgentReviews(reviews);
    renderAgentReviews();
    VPApp.showToast('✅ 代办已通过审核','success');
  }

  function rejectAgent(phone) {
    const reviews = VPStorage.getAgentReviews();
    const r = reviews.find(r => r.phone === phone);
    if (r) r.status = 'rejected';
    VPStorage.setAgentReviews(reviews);
    renderAgentReviews();
    VPApp.showToast('✅ 代办申请已拒绝','info');
  }

  // ========= 审核管理 =========
  function renderReviewMgmt() {
    const container = document.getElementById('vp-admin-reviews');
    if (!container) return;
    const reviews = VPStorage.getReviews();

    if (reviews.length === 0) {
      container.innerHTML = '<div class="vp-empty-state">暂无审核记录</div>';
      return;
    }

    container.innerHTML = `
      <table class="vp-table">
        <thead>
          <tr><th>时间</th><th>用户</th><th>国家</th><th>签证类型</th><th>材料数</th><th>状态</th><th>专员</th></tr>
        </thead>
        <tbody>
          ${reviews.map(r => `
            <tr>
              <td>${new Date(r.createdAt).toLocaleDateString('zh-CN')}</td>
              <td>${r.userName || r.userId}</td>
              <td>${r.countryName || r.countryId}</td>
              <td>${r.visaType}</td>
              <td>${r.materialCount || 0}</td>
              <td>${r.status === 'pending' ? '🟡 待审核' : r.status === 'reviewing' ? '🔍 审核中' : r.status === 'approved' ? '✅ 通过' : '❌ 退回'}</td>
              <td>${r.agentName || '未分配'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  // ========= 分配系统 =========
  function renderAllocation() {
    const container = document.getElementById('vp-admin-allocation');
    if (!container) return;
    const consultations = VPStorage.getConsultations().filter(c => !c.assignedTo);
    const agents = VPStorage.getUsers().filter(u => u.role === 'agent' && u.approved);
    const orders = VPStorage.getOrders().filter(o => o.status === 'pending');

    let html = '<h4>未分配的咨询</h4>';
    if (consultations.length === 0) {
      html += '<div class="vp-empty-state">暂无未分配咨询</div>';
    } else {
      html += `
        <table class="vp-table">
          <thead><tr><th>时间</th><th>姓名</th><th>手机</th><th>国家</th><th>分配</th></tr></thead>
          <tbody>
            ${consultations.map(c => `
              <tr>
                <td>${new Date(c.createdAt).toLocaleDateString('zh-CN')}</td>
                <td>${c.name}</td>
                <td>${c.phone}</td>
                <td>${c.country}</td>
                <td>
                  <select class="vp-select vp-select-sm" data-consult-id="${c.id}">
                    <option value="">选择专员</option>
                    ${agents.map(a => `<option value="${a.phone}">${a.name}</option>`).join('')}
                  </select>
                  <button class="vp-btn vp-btn-sm vp-btn-primary" onclick="VPAdmin.assignConsult(this)">分配</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    html += '<h4 style="margin-top:20px">待处理订单</h4>';
    if (orders.length === 0) {
      html += '<div class="vp-empty-state">暂无待处理订单</div>';
    } else {
      html += `
        <table class="vp-table">
          <thead><tr><th>时间</th><th>用户</th><th>套餐</th><th>金额</th><th>分配</th></tr></thead>
          <tbody>
            ${orders.map(o => `
              <tr>
                <td>${new Date(o.createdAt).toLocaleDateString('zh-CN')}</td>
                <td>${o.userName || o.userId}</td>
                <td>${o.plan || '标准'}</td>
                <td>¥${o.amount || 0}</td>
                <td>
                  <select class="vp-select vp-select-sm" data-order-id="${o.id}">
                    <option value="">选择专员</option>
                    ${agents.map(a => `<option value="${a.phone}">${a.name}</option>`).join('')}
                  </select>
                  <button class="vp-btn vp-btn-sm vp-btn-primary" onclick="VPAdmin.assignOrder(this)">分配</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    container.innerHTML = html;
  }

  function assignConsult(btn) {
    const row = btn.closest('tr');
    const select = row.querySelector('select');
    const agentPhone = select.value;
    const consultId = select.dataset.consultId;
    if (!agentPhone) { VPApp.showToast('请选择专员','warning'); return; }

    const consultations = VPStorage.getConsultations();
    const c = consultations.find(cc => cc.id === consultId);
    if (c) {
      c.assignedTo = agentPhone;
      VPStorage.setConsultations(consultations);
      // 发送系统通知
      const convId = 'consult_' + consultId;
      VPChat.sendMessage(convId, `📢 系统通知：管理员已将 ${c.name} 分配给您。国家：${c.country}，签证：${c.visaType}。`);
      VPApp.showToast('✅ 已分配','success');
      renderAllocation();
    }
  }

  function assignOrder(btn) {
    const row = btn.closest('tr');
    const select = row.querySelector('select');
    const agentPhone = select.value;
    const orderId = select.dataset.orderId;
    if (!agentPhone) { VPApp.showToast('请选择专员','warning'); return; }

    const orders = VPStorage.getOrders();
    const o = orders.find(oo => oo.id === orderId);
    if (o) {
      o.status = 'assigned';
      o.assignedTo = agentPhone;
      VPStorage.setOrders(orders);
      const convId = 'order_' + orderId;
      VPChat.sendMessage(convId, `📢 系统通知：管理员已将订单分配给专员。订单号：${orderId}`);
      VPApp.showToast('✅ 已分配','success');
      renderAllocation();
    }
  }

  // ========= 对话面板 =========
  function renderConversations() {
    const container = document.getElementById('vp-admin-conversations');
    if (!container) return;

    // 收集所有对话
    const allMsgs = VPStorage.getAllConversations();
    const convKeys = Object.keys(allMsgs);

    if (convKeys.length === 0) {
      container.innerHTML = '<div class="vp-empty-state">暂无对话记录</div>';
      return;
    }

    // 渲染对话列表
    let listHtml = '<div class="vp-chat-list">';
    convKeys.forEach(key => {
      const msgs = allMsgs[key];
      const lastMsg = msgs[msgs.length - 1];
      const preview = lastMsg ? (lastMsg.content ? lastMsg.content.slice(0,30) : '[文件]') : '';
      const unread = msgs.filter(m => !m.read && m.sender !== 'admin').length;
      listHtml += `<div class="vp-chat-item" onclick="VPAdmin.openConv('${key}')">
        <div class="vp-chat-item-name">${key}</div>
        <div class="vp-chat-item-preview">${preview}</div>
        ${unread > 0 ? `<span class="vp-badge vp-badge-danger">${unread}</span>` : ''}
      </div>`;
    });
    listHtml += '</div>';
    listHtml += '<div id="vp-admin-chat-view" class="vp-chat-view"><div class="vp-empty-state">选择左侧对话查看</div></div>';

    container.innerHTML = listHtml;
  }

  let currentConvKey = null;

  function openConv(key) {
    currentConvKey = key;
    const view = document.getElementById('vp-admin-chat-view');
    if (!view) return;

    // 标记为已读
    const allMsgs = VPStorage.getAllConversations();
    if (allMsgs[key]) {
      allMsgs[key].forEach(m => { if (m.sender !== 'admin') m.read = true; });
    }

    VPChat.renderChatMessages(key, 'vp-admin-chat-view');

    // 添加输入框
    const inputHtml = `
      <div class="vp-chat-input-area">
        <input type="text" class="vp-input" id="vp-admin-chat-input" placeholder="输入消息..." onkeydown="if(event.key==='Enter')VPAdmin.sendAdminMsg()">
        <button class="vp-btn vp-btn-sm vp-btn-primary" onclick="VPAdmin.sendAdminMsg()">发送</button>
      </div>
    `;
    view.innerHTML += inputHtml;
    VPChat.renderChatMessages(key, 'vp-admin-chat-view');
  }

  function sendAdminMsg() {
    if (!currentConvKey) return;
    const input = document.getElementById('vp-admin-chat-input');
    if (!input || !input.value.trim()) return;
    VPChat.sendMessage(currentConvKey, input.value.trim());
    input.value = '';
    openConv(currentConvKey);
  }

  return {
    init, renderUsers, renderAgentReviews, renderReviewMgmt,
    renderAllocation, renderConversations,
    approveAgent, rejectAgent,
    assignConsult, assignOrder,
    openConv, sendAdminMsg,
  };
})();
