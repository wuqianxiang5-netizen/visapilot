/**
 * VisaPilot — AI 智能问答 + 人工对话系统
 * 右下角浮动聊天 + 管理员/代办对话
 */

const VPChat = (function() {
  'use strict';

  // ========= AI 智能问答 =========
  const AI_RULES = [
    { pattern: /(?:人工|代办|代做|代取|多少钱|价格|套餐|费用)/, response: function() {
      return '💰 VisaPilot 提供三种代办套餐：\n• 🛎️ DIY审核 ¥100 — 自行上传材料提交签证官审核\n• 🛎️ 基础代办 ¥300 — 材料核对+填写+翻译+审核\n• 🛎️ 全程代办 ¥400 — 包含线下递交+代取护照+邮寄\n\n点击右下角 🛎️ 按钮可立即下单！';
    }},
    { pattern: /(?:银行流水|余额|存款|工资)/, response: '建议提供近3-6个月银行流水，余额保持在5万元人民币以上。\n\n工商银行、建设银行、招商银行等国内银行的流水均可使用。\n\n🔑 小贴士：活期账户流水最佳，定期存款可作为辅助财力证明。' },
    { pattern: /(?:翻译|公证)/, response: '📝 材料翻译公证指引：\n\n1. 自行翻译后找公证处公证\n2. 通过签证中心的翻译服务办理\n3. 公证费约¥100-¥300/份\n4. 翻译费¥50-¥200/份\n\n需要帮助？点击右下角 🛎️ 代办服务，专业团队帮您搞定！' },
    { pattern: /(?:预约|旺季|提前)/, response: '📅 建议提前1-2个月预约面签。\n\n• 夏季(6-8月)和冬季(12-2月)为旺季\n• 旺季建议提前2-3个月\n• 淡季提前2-3周即可\n\n使用下方日历选择日期和时间段，一键预约！' },
    { pattern: /(?:保险|医疗)/, response: '🏥 推荐国内保险公司：\n\n• 🛡️ 安联保险 — 申根签证专用（¥90起）\n• 💠 平安保险 — 全球旅行险（¥80起）\n• 🔴 人保财险 — 出境意外险（¥60起）\n• 🔵 太平洋保险 — 境外旅行险（¥70起）\n\n申根签证要求保额≥3万欧元！' },
    { pattern: /(?:护照|有效期)/, response: '🛂 一般要求护照有效期在回国后仍有6个月以上，至少2页空白签证页。\n\n申根要求有效期超过计划离境日期3个月。' },
    { pattern: /(?:美签|美国|B1|B2|F1)/, response: '🇺🇸 美国签证需面签，签证官当面询问。\n\n• 通过率约70-85%\n• 需准备充分的赴美理由和国内约束力证明\n• DS-160表如实填写很重要\n• 费用¥1200-1600\n• 办理周期5-15个工作日\n\n选择左侧「美国」查看详细信息！' },
    { pattern: /(?:申根|申根签|欧洲)/, response: '🇪🇺 申根签证可通行29个欧洲国家！\n\n• 选择行程中停留最长的国家申请\n• 停留时间相近则选首入国\n• 法国、意大利出签较快（10-15天）\n• 费用€80+服务费≈¥620-900\n• 第一次申根建议选法国或意大利\n\n点击左侧「申根签」查看29国详情！' },
    { pattern: /(?:英签|英国|UK)/, response: '🇬🇧 英国签证需到签证中心录指纹，无需面签。\n\n• 通过率约85-95%\n• 材料完备是关键，尤其银行流水和在职证明\n• 标准审理15个工作日\n• 加急5个工作日（+¥300）\n• 费用¥900-1500\n\n选择左侧「英国」查看详细信息！' },
    { pattern: /(?:拒签|驳回|失败)/, response: '❌ 拒签后怎么办？\n\n1. 分析拒签原因（资金不足/材料不全/移民倾向）\n2. 补充材料后重新申请\n3. 建议间隔1-3个月再申请\n4. 部分国家允许申诉\n\n📞 需要专业建议？点击🛎️人工代办获取签证专家指导！' },
    { pattern: /(?:办理周期|加急|多久|时间)/, response: '⏱️ 办理周期参考：\n\n• 一般5-15个工作日\n• 加急服务：美签+¥500，英签+¥300，申根+¥200\n• 旺季审理时间可能延长50%\n• 建议提前2个月开始准备' },
    { pattern: /(?:首次|新手|第一次|初)/, response: '🌟 首次办签完整流程：\n\n1. 确定目的国\n2. 准备材料\n3. 填写申请表\n4. 预约递交\n5. 前往签证中心\n6. 采集指纹\n7. 等待审核\n8. 领取护照\n\n建议至少提前2个月开始准备！' },
    { pattern: /(?:未成年|儿童|小孩)/, response: '👶 未成年人签证须知：\n\n• 需父母双方/监护人陪同办理\n• 需提供出生证明\n• 父母同意书（如一方不陪同）\n• 父母身份证件\n• 学校在读证明\n• 部分国家要求公证' },
    { pattern: /(?:签证中心|地址|在哪)/, response: '📍 主要签证中心城市：\n\n北京、上海、广州、成都\n部分国家在：沈阳、武汉、深圳、杭州\n\n具体地址可在本平台每个国家详情页查看！' },
    { pattern: /(?:支付宝|微信|支付)/, response: '💳 大部分签证中心支持支付宝和微信支付。\n\n部分仍需银行转账或现金支付，具体以签证中心通知为准。\n\n选择左侧国家查看该国的详细费用和支付指引！' },
    { pattern: /(?:日本|韩国|澳|加|爱尔兰|菲律宾)/, response: function(input) {
      const matches = ['日本','韩国','澳大利亚','加拿大','爱尔兰','菲律宾'];
      for (const m of matches) {
        if (input.includes(m)) {
          return `🇺🇳 ${m}签证信息请点击左侧边栏「${m}」查看详细材料清单、流程和费用！`;
        }
      }
      return '各国签证信息请点击左侧边栏对应国家查看详细材料清单和流程！';
    }},
  ];

  function aiReply(input) {
    for (const rule of AI_RULES) {
      if (rule.pattern.test(input)) {
        if (typeof rule.response === 'function') return rule.response(input);
        return rule.response;
      }
    }
    return '您好！我是 VisaPilot 智能助手。您可以问我关于签证的各类问题，如：\n\n• 各国签证费用和办理周期\n• 材料准备和银行流水要求\n• 预约时间建议\n• 旅行保险推荐\n• 拒签应对建议\n\n或者直接输入国家名+签证类型（如"法国旅游签证"），自动跳转详情页！';
  }

  // ========= AI 浮动聊天 UI =========
  let aiOpen = false;

  function toggleAIChat() {
    const panel = document.getElementById('vp-ai-chat-panel');
    if (!panel) return;
    aiOpen = !aiOpen;
    panel.classList.toggle('vp-open', aiOpen);
    if (aiOpen) {
      const msgs = document.getElementById('vp-ai-messages');
      if (msgs && msgs.children.length === 0) {
        addAIMessage('您好！我是VisaPilot智能助手👋\n\n您可以问我任何签证相关问题，或输入国家名+签证类型（如"法国旅游签证"）直接查看详情！');
      }
    }
  }

  function addAIMessage(text, isUser) {
    const msgs = document.getElementById('vp-ai-messages');
    if (!msgs) return;
    const div = document.createElement('div');
    div.className = `vp-ai-msg ${isUser ? 'vp-ai-user' : 'vp-ai-bot'}`;
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function sendAIMessage() {
    const input = document.getElementById('vp-ai-input');
    if (!input || !input.value.trim()) return;

    const text = input.value.trim();
    input.value = '';
    addAIMessage(text, true);

    // 检查是否包含国家+签证类型跳转
    const countryVisaPattern = /(美国|英国|法国|意大利|西班牙|德国|瑞士|日本|韩国|印度|澳大利亚|加拿大|爱尔兰|菲律宾|申根)\s*(旅游|商务|学生|工作|过境|探亲|医疗|长期)?/;
    const match = text.match(countryVisaPattern);
    if (match) {
      setTimeout(() => {
        const countryMap = {
          '美国':'usa','英国':'uk','法国':'fra','意大利':'ita','西班牙':'esp',
          '德国':'deu','瑞士':'che','日本':'japan','韩国':'korea','印度':'india',
          '澳大利亚':'australia','加拿大':'canada','爱尔兰':'ireland','菲律宾':'philippines',
          '申根':'schengen'
        };
        const countryId = countryMap[match[1]];
        if (countryId && VISAPILOT.VISA_CONFIG[countryId]) {
          addAIMessage(`🔗 正在跳转到 ${match[1]} ${match[2]||''} 签证详情页...`, false);
          setTimeout(() => {
            VPApp.navigateToCountry(countryId, match[2] || '旅游');
            toggleAIChat();
          }, 800);
          return;
        }
        addAIMessage(aiReply(text), false);
      }, 300);
    } else {
      setTimeout(() => {
        addAIMessage(aiReply(text), false);
      }, 300);
    }
  }

  // ========= 人工对话（管理员/代办/用户） =========
  function sendMessage(convId, text, fileInfo) {
    const msg = {
      type: fileInfo ? 'file' : 'text',
      content: fileInfo || text,
      sender: 'admin',
      senderName: VPAuth.currentUser()?.name || '管理员',
      timestamp: new Date().toISOString(),
    };
    if (fileInfo) msg.fileInfo = fileInfo;
    VPStorage.addMessage(convId, msg);
    return msg;
  }

  function renderChatMessages(convId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const msgs = VPStorage.getMessages(convId);

    container.innerHTML = msgs.map(m => {
      const isAdmin = m.sender === 'admin';
      const time = new Date(m.createdAt).toLocaleString('zh-CN', { hour:'2-digit', minute:'2-digit' });

      if (m.type === 'file' && m.fileInfo) {
        const fi = m.fileInfo;
        const ext = fi.name ? fi.name.split('.').pop().toLowerCase() : '';
        const isImage = ['jpg','jpeg','png','gif','webp'].includes(ext);

        let contentHtml = '';
        if (isImage && fi.data) {
          contentHtml = `<img src="${fi.data}" alt="${fi.name}" style="max-width:200px;max-height:200px;border-radius:4px;cursor:pointer" onclick="window.open('${fi.data}','_blank')" />`;
        } else if (fi.data) {
          const iconMap = { pdf:'📄', doc:'📝', docx:'📝', xls:'📎', xlsx:'📎' };
          const icon = iconMap[ext] || '📎';
          contentHtml = `<a href="${fi.data}" download="${fi.name}" style="display:inline-flex;align-items:center;gap:4px;padding:6px 12px;background:var(--bg-muted);border-radius:6px;text-decoration:none;color:var(--text)}">${icon} ${fi.name}</a>`;
        } else {
          contentHtml = `<span style="font-size:0.85em;color:var(--text-muted)">📎 ${fi.name} (仅文件名)</span>`;
        }
        return `<div class="vp-chat-msg ${isAdmin?'vp-chat-admin':'vp-chat-user'}">
          <div class="vp-chat-bubble">${contentHtml}</div>
          <div class="vp-chat-time">${time} · ${m.senderName}</div>
        </div>`;
      }
      return `<div class="vp-chat-msg ${isAdmin?'vp-chat-admin':'vp-chat-user'}">
        <div class="vp-chat-bubble">${escHtml(m.content)}</div>
        <div class="vp-chat-time">${time} · ${m.senderName}</div>
      </div>`;
    }).join('');

    container.scrollTop = container.scrollHeight;
  }

  function escHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  return {
    toggleAIChat, sendAIMessage, aiReply,
    sendMessage, renderChatMessages, escHtml,
    getAIHelp: toggleAIChat,
  };
})();
