/**
 * VisaPilot — 代办工作台
 * 订单面板、对话、材料审核
 */

const VPAgent = (function() {
  'use strict';

  function init() {
    renderOrders();
    renderAgentConversations();
    renderMaterialReviews();
  }

  // ========= 订单面板 =========
  function renderOrders() {
    const container = document.getElementById('vp-agent-orders');
    if (!container) return;
    const agent = VPAuth.currentUser();
    if (!agent) { container.innerHTML = '<div class="vp-empty-state">请先登录</div>'; return; }

    const allOrders = VPStorage.getOrders();
    const pending = allOrders.filter(o => o.status === 'pending' && !o.assignedTo);
    const myOrders = allOrders.filter(o => o.assignedTo === agent.phone);

    let html = '<h4>📋 待接单</h4>';
    if (pending.length === 0) {
      html += '<div class="vp-empty-state">暂无待接订单</div>';
    } else {
      pending.forEach(o => {
        const commission = Math.round((o.amount || 0) * 0.7);
        html += `
          <div class="vp-order-card">
            <div class="vp-order-header">
              <strong>${o.userName || '用户'}</strong>
              <span class="vp-order-time">${new Date(o.createdAt).toLocaleDateString('zh-CN')}</span>
            </div>
            <div class="vp-order-body">
              <p>目标：${o.country || ''} ${o.visaType || ''}</p>
              <p>备注：${o.remark || '-'}</p>
              <p class="vp-order-commission">订单原价：¥${o.amount || 0} &nbsp;|&nbsp; 您获得：¥${commission}（平台抽成30%）</p>
            </div>
            <button class="vp-btn vp-btn-sm vp-btn-success" onclick="VPAgent.acceptOrder('${o.id}')">✅ 接单</button>
          </div>
        `;
      });
    }

    html += '<h4 style="margin-top:16px">📋 已接单</h4>';
    if (myOrders.length === 0) {
      html += '<div class="vp-empty-state">暂无已接订单</div>';
    } else {
      myOrders.forEach(o => {
        const commission = Math.round((o.amount || 0) * 0.7);
        html += `
          <div class="vp-order-card vp-order-card-done">
            <div class="vp-order-header">
              <strong>${o.userName || '用户'}</strong>
              <span class="vp-order-status">${o.status === 'assigned' ? '已接单' : o.status === 'processing' ? '处理中' : '已完成'}</span>
            </div>
            <div class="vp-order-body">
              <p>目标：${o.country || ''} ${o.visaType || ''}</p>
              <p>订单原价：¥${o.amount || 0} &nbsp;|&nbsp; 您获得：¥${commission}</p>
            </div>
            <button class="vp-btn vp-btn-sm" onclick="VPApp.showTab('agent','chat')">💬 联系用户</button>
          </div>
        `;
      });
    }

    container.innerHTML = html;
  }

  function acceptOrder(orderId) {
    const agent = VPAuth.currentUser();
    if (!agent) { VPApp.showToast('请先登录','warning'); return; }
    const orders = VPStorage.getOrders();
    const o = orders.find(oo => oo.id === orderId);
    if (o) {
      o.status = 'assigned';
      o.assignedTo = agent.phone;
      VPStorage.setOrders(orders);

      // 创建系统通知
      const convId = 'order_' + orderId;
      VPChat.sendMessage(convId, `📢 系统通知：${agent.name} 已接单！专员将通过此对话与您沟通。`);
      VPApp.showToast('✅ 接单成功','success');
      renderOrders();
    }
  }

  // ========= 对话面板 =========
  function renderAgentConversations() {
    const container = document.getElementById('vp-agent-conversations');
    if (!container) return;
    const agent = VPAuth.currentUser();
    if (!agent) { container.innerHTML = '<div class="vp-empty-state">请先登录</div>'; return; }

    const myOrders = VPStorage.getOrders().filter(o => o.assignedTo === agent.phone);
    const myConsultations = VPStorage.getConsultations().filter(c => c.assignedTo === agent.phone);

    const convs = [];

    myOrders.forEach(o => {
      const convId = 'order_' + o.id;
      const msgs = VPStorage.getMessages(convId);
      convs.push({ id: convId, name: o.userName || '用户', preview: msgs.length > 0 ? (msgs[msgs.length-1].content||'[文件]') : '暂无消息' });
    });
    myConsultations.forEach(c => {
      const convId = 'consult_' + c.id;
      const msgs = VPStorage.getMessages(convId);
      convs.push({ id: convId, name: c.name, preview: msgs.length > 0 ? (msgs[msgs.length-1].content||'[文件]') : '暂无消息' });
    });

    if (convs.length === 0) {
      container.innerHTML = '<div class="vp-empty-state">暂无对话</div>';
      return;
    }

    let html = '<div class="vp-chat-list">';
    convs.forEach(conv => {
      html += `<div class="vp-chat-item" onclick="VPAgent.openAgentConv('${conv.id}')">
        <div class="vp-chat-item-name">${conv.name}</div>
        <div class="vp-chat-item-preview">${conv.preview}</div>
      </div>`;
    });
    html += '</div><div id="vp-agent-chat-view" class="vp-chat-view"><div class="vp-empty-state">选择客户开始对话</div></div>';
    container.innerHTML = html;
  }

  let currentAgentConv = null;

  function openAgentConv(convId) {
    currentAgentConv = convId;
    const view = document.getElementById('vp-agent-chat-view');
    if (!view) return;
    VPChat.renderChatMessages(convId, 'vp-agent-chat-view');

    // 添加输入区域带文件上传
    const inputHtml = `
      <div class="vp-chat-input-area">
        <input type="file" id="vp-agent-file-input" accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx" style="display:none" onchange="VPAgent.sendAgentFile(event)">
        <button class="vp-btn vp-btn-sm" onclick="document.getElementById('vp-agent-file-input').click()" title="发送文件">📎</button>
        <input type="text" class="vp-input" id="vp-agent-chat-input" placeholder="输入消息..." onkeydown="if(event.key==='Enter')VPAgent.sendAgentMsg()">
        <button class="vp-btn vp-btn-sm vp-btn-primary" onclick="VPAgent.sendAgentMsg()">发送</button>
      </div>
    `;
    view.innerHTML += inputHtml;
    VPChat.renderChatMessages(convId, 'vp-agent-chat-view');
  }

  function sendAgentMsg() {
    if (!currentAgentConv) return;
    const input = document.getElementById('vp-agent-chat-input');
    if (!input || !input.value.trim()) return;
    VPChat.sendMessage(currentAgentConv, input.value.trim());
    input.value = '';
    openAgentConv(currentAgentConv);
  }

  function sendAgentFile(event) {
    const file = event.target.files[0];
    if (!file || !currentAgentConv) return;
    if (file.size > 2 * 1024 * 1024) { VPApp.showToast('文件不能超过2MB','warning'); return; }

    const reader = new FileReader();
    reader.onload = function(e) {
      VPChat.sendMessage(currentAgentConv, '', {
        name: file.name,
        data: e.target.result,
      });
      openAgentConv(currentAgentConv);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  // ========= 材料审核 =========
  function renderMaterialReviews() {
    const container = document.getElementById('vp-agent-reviews');
    if (!container) return;
    const agent = VPAuth.currentUser();
    if (!agent) { container.innerHTML = '<div class="vp-empty-state">请先登录</div>'; return; }

    const reviews = VPStorage.getReviews();
    const pendingReviews = reviews.filter(r => r.status === 'pending' && !r.agentPhone);
    const myReviews = reviews.filter(r => r.agentPhone === agent.phone);

    let html = '<h4>📋 待审核材料</h4>';
    if (pendingReviews.length === 0) {
      html += '<div class="vp-empty-state">暂无待审核材料</div>';
    } else {
      pendingReviews.forEach(r => {
        html += `
          <div class="vp-order-card">
            <div class="vp-order-header">
              <strong>${r.userName || r.userId}</strong>
              <span>${new Date(r.createdAt).toLocaleDateString('zh-CN')}</span>
            </div>
            <div class="vp-order-body">
              <p>${r.countryFlag || ''} ${r.countryName || r.countryId} · ${r.visaType}</p>
              <p>${r.materialCount || 0} 项材料</p>
            </div>
            <button class="vp-btn vp-btn-sm vp-btn-success" onclick="VPAgent.acceptReview('${r.id}')">✅ 接单审核</button>
          </div>
        `;
      });
    }

    html += '<h4 style="margin-top:16px">📋 已审核材料</h4>';
    if (myReviews.length === 0) {
      html += '<div class="vp-empty-state">暂无已审核材料</div>';
    } else {
      myReviews.forEach(r => {
        const statusText = r.status === 'reviewing' ? '🔍 审核中' : r.status === 'approved' ? '✅ 已通过' : '❌ 已退回';
        html += `
          <div class="vp-order-card vp-order-card-done">
            <div class="vp-order-header">
              <strong>${r.userName || r.userId}</strong>
              <span>${statusText}</span>
            </div>
            <div class="vp-order-body">
              <p>${r.countryFlag || ''} ${r.countryName || r.countryId} · ${r.visaType}</p>
              ${r.status === 'reviewing' ? `
                <button class="vp-btn vp-btn-sm vp-btn-primary" onclick="VPAgent.showReviewDetail('${r.id}')">📋 查看详情</button>
              ` : ''}
            </div>
          </div>
        `;
      });
    }
    container.innerHTML = html;
  }

  function acceptReview(reviewId) {
    const agent = VPAuth.currentUser();
    if (!agent) { VPApp.showToast('请先登录','warning'); return; }
    VPStorage.updateReview(reviewId, { status: 'reviewing', agentPhone: agent.phone, agentName: agent.name });
    VPApp.showToast('✅ 已接单审核','success');
    renderMaterialReviews();
  }

  function showReviewDetail(reviewId) {
    const review = VPStorage.getReviews().find(r => r.id === reviewId);
    if (!review) return;
    const container = document.getElementById('vp-agent-reviews');
    if (!container) return;

    // 获取用户上传的材料
    const uploads = VPStorage.getUploads(review.userId);
    const materials = review.materials || [];
    const countryConfig = VISAPILOT.VISA_CONFIG[review.countryId];
    const templates = VISAPILOT.MATERIAL_TEMPLATES[review.visaType === '旅游(B1/B2)' ? '旅游' : review.visaType.replace(/\(.*\)/,'')] || [];

    let html = `
      <div class="vp-review-detail">
        <div class="vp-review-header">
          <button class="vp-btn vp-btn-sm" onclick="VPAgent.renderMaterialReviews()">← 返回</button>
          <h3>${review.countryFlag || ''} ${review.countryName || review.countryId} · ${review.visaType}</h3>
          <p>用户：${review.userName || review.userId}</p>
        </div>
        <table class="vp-table">
          <thead>
            <tr><th>材料名称</th><th>上传文件</th><th>状态</th><th>操作</th></tr>
          </thead>
          <tbody>
    `;

    templates.forEach(tmpl => {
      const uploaded = uploads[review.countryId + '_' + review.visaType + '_' + tmpl.id];
      const materialStatus = review.materialStatus ? review.materialStatus[tmpl.id] : null;
      const statusIcon = materialStatus === 'approved' ? '✅' : materialStatus === 'rejected' ? '❌' : '⏳';
      const statusText = materialStatus === 'approved' ? '已通过' : materialStatus === 'rejected' ? '需修改' : '待审核';

      let fileHtml = '-';
      if (uploaded) {
        const ext = uploaded.name ? uploaded.name.split('.').pop().toLowerCase() : '';
        const isImg = ['jpg','jpeg','png','gif','webp'].includes(ext);
        const isPdf = ext === 'pdf';
        const isWord = ['doc','docx'].includes(ext);

        if (isImg && uploaded.data) {
          fileHtml = `<span>${uploaded.name}</span> <button class="vp-btn vp-btn-xs" onclick="VPAgent.viewFile('${uploaded.data}','${ext}')">👁 预览</button>`;
        } else if (isPdf && uploaded.data) {
          fileHtml = `<span>${uploaded.name}</span> <button class="vp-btn vp-btn-xs" onclick="VPAgent.viewFile('${uploaded.data}','${ext}')">📄 阅读</button>`;
        } else if (isWord && uploaded.data) {
          fileHtml = `<span>${uploaded.name}</span> <button class="vp-btn vp-btn-xs" onclick="VPAgent.viewFile('${uploaded.data}','${ext}')">📝 阅读</button>`;
        } else if (uploaded.data) {
          fileHtml = `<span>${uploaded.name}</span> <button class="vp-btn vp-btn-xs" onclick="VPAgent.downloadFile('${uploaded.data}','${uploaded.name}')">⬇ 下载</button>`;
        } else {
          fileHtml = `<span>${uploaded.name}</span> <span class="vp-text-muted">(仅文件名)</span>`;
        }
      }

      html += `
        <tr>
          <td>${tmpl.name}</td>
          <td style="max-width:200px;word-break:break-all">${fileHtml}</td>
          <td class="vp-status-${materialStatus || 'pending'}">${statusIcon} ${statusText}</td>
          <td>
            <button class="vp-btn vp-btn-xs vp-btn-success" onclick="VPAgent.approveMaterial('${reviewId}','${tmpl.id}')">✅ 通过</button>
            <button class="vp-btn vp-btn-xs vp-btn-danger" onclick="VPAgent.rejectMaterial('${reviewId}','${tmpl.id}')">❌ 退回</button>
          </td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
        <div style="margin-top:12px;display:flex;gap:8px">
          <button class="vp-btn vp-btn-success" onclick="VPAgent.approveAll('${reviewId}')">✅ 全部通过</button>
        </div>
    `;

    // 退回原因输入区域
    if (review.rejectedMaterial) {
      html += `<div id="vp-reject-reason-area" style="margin-top:12px;background:var(--bg-muted);padding:12px;border-radius:8px">
        <label>退回原因：</label>
        <input type="text" class="vp-input" id="vp-reject-reason-input" placeholder="输入退回原因（可选）" style="width:300px">
        <button class="vp-btn vp-btn-sm vp-btn-primary" onclick="VPAgent.saveRejectReason('${reviewId}')">💾 保存</button>
      </div>`;
    }

    html += '</div>';
    container.innerHTML = html;
  }

  function approveMaterial(reviewId, materialId) {
    const review = VPStorage.getReviews().find(r => r.id === reviewId);
    if (!review) return;
    if (!review.materialStatus) review.materialStatus = {};
    review.materialStatus[materialId] = 'approved';
    VPStorage.updateReview(reviewId, { materialStatus: review.materialStatus });
    showReviewDetail(reviewId);
  }

  function rejectMaterial(reviewId, materialId) {
    const review = VPStorage.getReviews().find(r => r.id === reviewId);
    if (!review) return;
    if (!review.materialStatus) review.materialStatus = {};
    review.materialStatus[materialId] = 'rejected';
    review.rejectedMaterial = materialId;
    VPStorage.updateReview(reviewId, { materialStatus: review.materialStatus, rejectedMaterial: materialId });
    showReviewDetail(reviewId);

    // 自动聚焦输入框
    setTimeout(() => {
      const input = document.getElementById('vp-reject-reason-input');
      if (input) input.focus();
    }, 100);
  }

  function saveRejectReason(reviewId) {
    const input = document.getElementById('vp-reject-reason-input');
    if (!input) return;
    const reason = input.value.trim();
    const review = VPStorage.getReviews().find(r => r.id === reviewId);
    if (review && review.rejectedMaterial) {
      if (!review.rejectReasons) review.rejectReasons = {};
      review.rejectReasons[review.rejectedMaterial] = reason;
      VPStorage.updateReview(reviewId, { rejectReasons: review.rejectReasons });
      VPApp.showToast('💾 退回原因已保存','success');
      showReviewDetail(reviewId);
    }
  }

  function approveAll(reviewId) {
    const review = VPStorage.getReviews().find(r => r.id === reviewId);
    if (!review) return;
    VPStorage.updateReview(reviewId, { status: 'approved', approvedAt: new Date().toISOString() });
    VPApp.showToast('✅ 所有材料已审核通过！','success');
    renderMaterialReviews();
  }

  function viewFile(data, ext) {
    if (!data) { VPApp.showToast('文件数据不可用','warning'); return; }
    const isImg = ['jpg','jpeg','png','gif','webp'].includes(ext);
    const isPdf = ext === 'pdf';
    const isWord = ['doc','docx'].includes(ext);

    if (isImg) {
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`<html><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="${data}" style="max-width:100%;max-height:100vh;object-fit:contain" /></body></html>`);
      } else {
        // 降级下载
        downloadFile(data, 'preview.'+ext);
      }
    } else if (isPdf) {
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`<html><body style="margin:0;height:100vh"><embed src="${data}" type="application/pdf" width="100%" height="100%" /></body></html>`);
      } else {
        downloadFile(data, 'document.pdf');
      }
    } else if (isWord) {
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`
          <html><body style="font-family:sans-serif;padding:40px;max-width:600px;margin:auto;text-align:center">
            <h2>📝 Word 文档下载</h2>
            <p>请点击下方按钮下载文件</p>
            <a href="${data}" download="document.${ext}" style="display:inline-block;padding:12px 24px;background:#0066cc;color:white;border-radius:6px;text-decoration:none;margin-top:20px">⬇ 一键下载</a>
          </body></html>`);
      } else {
        downloadFile(data, 'document.'+ext);
      }
    } else {
      downloadFile(data, 'file.'+ext);
    }
  }

  function downloadFile(data, filename) {
    const a = document.createElement('a');
    a.href = data;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return {
    init, renderOrders, acceptOrder,
    renderAgentConversations, openAgentConv, sendAgentMsg, sendAgentFile,
    renderMaterialReviews, acceptReview, showReviewDetail,
    approveMaterial, rejectMaterial, saveRejectReason, approveAll,
    viewFile, downloadFile,
  };
})();
