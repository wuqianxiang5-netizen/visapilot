/**
 * VisaPilot — DIY 自助模块
 * 材料上传、行程单、保险、翻译
 */

const VPDIY = (function() {
  'use strict';

  // ========= 材料上传 =========
  function uploadMaterial(countryId, visaType, materialId, file, onComplete) {
    const user = VPAuth.currentUser();
    if (!user) { VPApp.showToast('请先登录','warning'); return; }

    var maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      VPApp.showToast('文件大小不能超过10MB','warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      const fileInfo = {
        name: file.name,
        size: file.size,
        type: file.type,
        data: file.size <= 3 * 1024 * 1024 ? e.target.result : null, // ≤3MB存数据
        uploadedAt: new Date().toISOString(),
      };
      const key = user.phone;
      const subKey = countryId + '_' + visaType + '_' + materialId;
      VPStorage.saveUpload(key, subKey, fileInfo);
      VPApp.showToast('✅ 文件上传成功，签证官可在线查看','success');
      if (onComplete) onComplete();
    };
    reader.onerror = function() {
      VPApp.showToast('文件上传失败，请重试','error');
    };
    reader.readAsDataURL(file);
  }

  function getUploadedMaterials(countryId, visaType) {
    const user = VPAuth.currentUser();
    if (!user) return {};
    const uploads = VPStorage.getUploads(user.phone);
    const result = {};
    Object.keys(uploads).forEach(key => {
      if (key.startsWith(countryId + '_' + visaType)) {
        const materialId = key.replace(countryId + '_' + visaType + '_', '');
        result[materialId] = uploads[key];
      }
    });
    return result;
  }

  function renderUploadSection(containerId, countryId, visaType, materials) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const user = VPAuth.currentUser();
    const uploaded = getUploadedMaterials(countryId, visaType);
    const requiredCount = materials.filter(m => m.required === true).length;
    const uploadedRequired = materials.filter(m => m.required === true && uploaded[m.id]).length;
    const progress = requiredCount > 0 ? Math.round(uploadedRequired / requiredCount * 100) : 0;

    let html = `
      <div class="vp-diy-section">
        <div class="vp-upload-progress">
          <div class="vp-progress-text"><strong>${progress}%</strong></div>
          <div class="vp-progress-bar">
            <div class="vp-progress-fill" style="width:${progress}%"></div>
          </div>
          <span class="vp-progress-text">必交 ${uploadedRequired}/${requiredCount}</span>
        </div>
        <div class="vp-upload-list">
    `;

    materials.forEach(m => {
      const isUploaded = !!uploaded[m.id];
      const status = isUploaded ? '✅ 已完成' : (m.required === true ? '<span class="vp-text-danger">⚠待传</span>' : '可选');
      html += `
        <div class="vp-upload-item ${isUploaded ? 'vp-upload-done' : ''}">
          <div class="vp-upload-info">
            <strong>${m.name}</strong>
            ${m.note ? `<span class="vp-text-muted">${m.note}</span>` : ''}
            ${isUploaded ? `<span class="vp-upload-filename">📎 ${uploaded[m.id].name}</span>` : ''}
            <span class="vp-upload-status">${status}</span>
          </div>
          <div class="vp-upload-action">
            <label class="vp-btn vp-btn-sm vp-btn-outline">
              📎 上传
              <input type="file" accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx" style="display:none"
                onchange="VPDIY.handleUpload('${countryId}','${visaType}','${m.id}',this)">
            </label>
          </div>
        </div>
      `;
    });

    html += '</div>';

    html += '<div class="vp-upload-dropzone" ' +
      'ondrop="VPDIY.handleDrop(event,\'' + countryId + '\',\'' + visaType + '\')" ' +
      'ondragover="event.preventDefault();this.classList.add(\'vp-drag-over\')" ' +
      'ondragleave="this.classList.remove(\'vp-drag-over\')">' +
      '<div class="vp-dropzone-icon">📁</div>' +
      '<p>拖拽文件到此处上传</p>' +
      '<p class="vp-text-muted" style="font-size:0.85em">支持 JPG/PNG/PDF/Word/Excel，单文件≤10MB</p>' +
    '</div>';

    html += uploadedFilesHtml(uploaded, countryId, visaType);

    // 提交审核按钮 / 一键预约按钮
    const allRequiredUploaded = materials.filter(m => m.required === true).every(m => uploaded[m.id]);
    if (allRequiredUploaded && requiredCount > 0) {
      html += `
        <div class="vp-upload-actions">
          <button class="vp-btn vp-btn-success vp-btn-lg vp-pulse" onclick="VPDIY.submitForReview('${countryId}','${visaType}')">
            📤 提交签证官审核（¥100）
          </button>
          <button class="vp-btn vp-btn-primary vp-btn-lg vp-pulse" onclick="VPDIY.jumpToCalendar('${countryId}','${visaType}')" style="margin-left:8px">
            ✅ 材料已齐 · 一键预约面签
          </button>
        </div>
      `;
    } else {
      html += `
        <div class="vp-upload-actions">
          <button class="vp-btn vp-btn-secondary vp-btn-lg" disabled style="opacity:0.5">
            ⏳ 还需上传 ${requiredCount - uploadedRequired} 项必交材料
          </button>
        </div>
      `;
    }

    container.innerHTML = html;
  }

  function uploadedFilesHtml(uploaded, countryId, visaType) {
    const keys = Object.keys(uploaded);
    if (keys.length === 0) return '';
    return '<div class="vp-upload-file-list"><h5 style="margin:8px 0;font-size:0.9em">已上传文件</h5>' + keys.map(k => {
      var f = uploaded[k];
      var ext = f.name ? f.name.split('.').pop().toLowerCase() : '';
      var icon = (['jpg','jpeg','png','gif','webp'].includes(ext)) ? '🖼️' : 
                 (ext === 'pdf') ? '📄' : 
                 (['doc','docx'].includes(ext)) ? '📝' : 
                 (['xls','xlsx'].includes(ext)) ? '📊' : '📎';
      return '<div class="vp-file-list-item" onclick="VPDIY.previewUploadedFile(\'' + k + '\')"><span>' + icon + ' ' + f.name + '</span><span class="vp-text-muted" style="font-size:0.82em">' + (f.size > 1024*1024 ? Math.round(f.size/1024/1024*10)/10 + 'MB' : Math.round(f.size/1024) + 'KB') + '</span></div>';
    }).join('') + '</div>';
  }

  function handleUpload(countryId, visaType, materialId, input) {
    const file = input.files[0];
    if (!file) return;
    uploadMaterial(countryId, visaType, materialId, file, function() {
      const countryConfig = VISAPILOT.VISA_CONFIG[countryId];
      const templates = VISAPILOT.MATERIAL_TEMPLATES[visaType.match(/旅游|商务|学生|工作|过境|探亲访友|医疗|文化体育/)?.[0] || '旅游'] || [];
      renderUploadSection('vp-diy-upload', countryId, visaType, templates);
    });
    input.value = '';
  }

  function handleDrop(event, countryId, visaType) {
    event.preventDefault();
    event.currentTarget.classList.remove('vp-drag-over');
    var files = event.dataTransfer.files;
    if (files.length === 0) return;
    // Upload the first dropped file to the first unmatched material
    var user = VPAuth.currentUser();
    if (!user) { VPApp.showToast('请先登录后上传','warning'); return; }
    var typeClean = visaType.match(/旅游|商务|学生|工作|过境|探亲访友|医疗|文化体育|长期签证/)?.[0];
    var templates = VISAPILOT.MATERIAL_TEMPLATES[typeClean] || VISAPILOT.MATERIAL_TEMPLATES['旅游'];
    var uploaded = getUploadedMaterials(countryId, visaType);
    var firstMissing = templates.find(function(m) { return m.required === true && !uploaded[m.id]; });
    if (!firstMissing) { VPApp.showToast('所有材料已上传完毕','info'); return; }
    var file = files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
      var fileInfo = { name: file.name, size: file.size, type: file.type,
        data: file.size <= 3 * 1024 * 1024 ? e.target.result : null, uploadedAt: new Date().toISOString() };
      VPStorage.saveUpload(user.phone, countryId + '_' + visaType + '_' + firstMissing.id, fileInfo);
      VPApp.showToast('✅ ' + firstMissing.name + ' 已上传','success');
      renderUploadSection('vp-diy-upload', countryId, visaType, templates);
    };
    reader.readAsDataURL(file);
  }

  function previewUploadedFile(key) {
    var user = VPAuth.currentUser();
    if (!user) return;
    var uploads = VPStorage.getUploads(user.phone);
    var f = uploads[key];
    if (!f || !f.data) { VPApp.showToast('文件数据不可预览','warning'); return; }
    window.open(f.data, '_blank');
  }

  function submitForReview(countryId, visaType) {
    const user = VPAuth.currentUser();
    if (!user) { VPApp.showToast('请先登录后再提交审核','warning'); return; }
    const country = VISAPILOT.VISA_CONFIG[countryId] || { name: countryId, flag: '' };
    const templates = VISAPILOT.MATERIAL_TEMPLATES[visaType.match(/旅游|商务|学生|工作|过境|探亲访友|医疗|文化体育/)?.[0] || '旅游'] || [];

    // 创建审核记录
    const review = {
      userId: user.phone,
      userName: user.name,
      countryId,
      countryName: country.name,
      countryFlag: country.flag,
      visaType,
      materialCount: templates.filter(m => m.required === true).length,
      amount: 100,
      status: 'pending',
    };
    VPStorage.addReview(review);

    // 创建订单
    const order = {
      userId: user.phone,
      userName: user.name,
      country: country.name,
      visaType,
      plan: 'DIY审核',
      amount: 100,
    };
    VPStorage.addOrder(order);

    VPApp.showToast('✅ 已提交审核（¥100），请等待签证官接单','success');
  }

  function jumpToCalendar(countryId, visaType) {
    const user = VPAuth.currentUser();
    if (!user) { VPApp.showToast('请先登录后再预约面签','warning'); return; }
    const country = VISAPILOT.VISA_CONFIG[countryId];
    if (!country) { VPApp.showToast('国家信息未找到','error'); return; }
    // 保存预约记录
    VPStorage.addBooking({
      userId: user.phone, userName: user.name,
      countryId: countryId, countryName: country.name, countryFlag: country.flag,
      visaType: visaType, center: country.centers[0]?.city || '',
      date: '', time: '', status: 'confirmed',
    });
    VPCalendar.init(countryId, visaType);
    const section = document.getElementById('vp-calendar-section');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
    // 自动选中3天后第一个可用日期
    setTimeout(function() {
      var calBody = document.getElementById('vp-calendar-body');
      if (!calBody) return;
      var cells = calBody.querySelectorAll('.vp-cal-avail');
      var target = new Date(); target.setDate(target.getDate() + 3);
      var targetStr = target.getFullYear() + '-' + 
        String(target.getMonth()+1).padStart(2,'0') + '-' + 
        String(target.getDate()).padStart(2,'0');
      var found = false;
      for (var i = 0; i < cells.length; i++) {
        if (cells[i].dataset.date >= targetStr) {
          cells[i].click(); found = true; break;
        }
      }
      if (!found && cells.length > 0) { cells[0].click(); }
      // 移动到时间段区域
      var ts = document.getElementById('vp-timeslots');
      if (ts) ts.scrollIntoView({ behavior: 'smooth', block: 'start' });
      VPApp.showToast('✅ 预约记录已创建，请选择具体时间段','success');
    }, 500);
  }

  // ========= 行程单生成 =========
  function generateItinerary(countryId, startDate, endDate, style, preference) {
    const countryCodeMap = {
      'usa':'usa','uk':'gbr','schengen':'fra','japan':'jpn','korea':'kor',
      'india':'ind','australia':'aus','canada':'can','ireland':'irl','philippines':'phl',
      'fra':'fra','ita':'ita','esp':'esp','deu':'deu','che':'che',
    };
    const code = countryCodeMap[countryId] || 'fra';
    const cityData = VISAPILOT.CITY_DATA[code];
    if (!cityData) return '<div class="vp-empty-state">暂不支持该国家的行程生成</div>';

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    if (days < 1) return '<div class="vp-empty-state">请选择有效的日期范围</div>';
    if (days > 60) return '<div class="vp-empty-state">最长支持60天行程</div>';

    const city = cityData.cities[0];
    const attrs = city.attractions;
    const foods = city.food || [];
    const transport = city.transport || [];
    const styleFactor = style === 'relaxed' ? 2 : style === 'balanced' ? 3 : 4;

    const styleLabels = { relaxed:'悠闲放松', balanced:'适中均衡', compact:'紧凑高效' };
    const prefLabels = { mixed:'综合', culture:'文化历史', gourmet:'美食购物', nature:'自然风光' };
    const preferenceFilter = {
      mixed: (i) => true,
      culture: (i) => Math.abs(i % 3) !== 2,
      gourmet: (i) => i % 3 === 0 || i % 3 === 2,
      nature: (i) => i % 2 === 0,
    };
    const filterFn = preferenceFilter[preference] || preferenceFilter.mixed;

    let html = `
      <div class="vp-itinerary">
        <h4>🗺️ ${cityData.flag} ${city.name} · ${styleLabels[style] || '适中均衡'} · ${prefLabels[preference] || '综合'}</h4>
        <p>${startDate} ~ ${endDate} · 共 ${days} 天</p>
        <div class="vp-itinerary-links">
          <a href="https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city.name)}" target="_blank" class="vp-btn vp-btn-sm vp-btn-primary">🏨 Booking.com 订酒店</a>
          <a href="https://flights.ctrip.com/" target="_blank" class="vp-btn vp-btn-sm vp-btn-primary">✈️ 携程订机票</a>
          <a href="https://trains.ctrip.com/" target="_blank" class="vp-btn vp-btn-sm vp-btn-primary">🚄 携程火车/高铁</a>
        </div>
        <table class="vp-table vp-itinerary-table">
          <thead>
            <tr><th>天数</th><th>日期</th><th>上午活动</th><th>下午活动</th><th>晚上美食</th><th>住宿推荐</th><th>交通建议</th></tr>
          </thead>
          <tbody>
    `;

    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateStr = `${d.getMonth()+1}月${d.getDate()}日`;
      const dayNum = i + 1;

      // morning activities
      const morningIdx = (i * styleFactor) % attrs.length * 2;
      const afternoonIdx = (i * styleFactor + 1) % attrs.length * 2;
      const eveningFood = foods[i % foods.length] || '当地特色餐厅';

      const morningAttrs = [];
      for (let j = 0; j < 2 && (morningIdx + j) < attrs.length; j++) {
        const idx = (morningIdx + j) % attrs.length;
        if (filterFn(idx)) morningAttrs.push(attrs[idx]);
      }

      const afternoonAttrs = [];
      for (let j = 0; j < 2 && (afternoonIdx + j) < attrs.length; j++) {
        const idx = (afternoonIdx + j) % attrs.length;
        if (filterFn(idx)) afternoonAttrs.push(attrs[idx]);
      }

      const transportTip = transport[i % transport.length] || '市内公共交通';
      const hotelUrl = i % 2 === 0 ?
        `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city.name + ' ' + city.hotels.economy.area)}` :
        `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city.name + ' ' + city.hotels.comfort.area)}`;
      const hotelName = i % 2 === 0 ? city.hotels.economy.name : city.hotels.comfort.name;
      const hotelPrice = i % 2 === 0 ? city.hotels.economy.price : city.hotels.comfort.price;
      const hotelArea = i % 2 === 0 ? city.hotels.economy.area : city.hotels.comfort.area;

      html += `
        <tr>
          <td>Day ${dayNum}</td>
          <td>${dateStr}</td>
          <td>${morningAttrs.join(' / ') || '自由活动'}</td>
          <td>${afternoonAttrs.join(' / ') || '自由活动'}</td>
          <td>${eveningFood}</td>
          <td><a href="${hotelUrl}" target="_blank">${hotelName}<br><small>${hotelPrice} · ${hotelArea}</small></a></td>
          <td>${transportTip}</td>
        </tr>
      `;
    }

    html += `
          </tbody>
        </table>
        <div class="vp-itinerary-actions" style="margin-top:12px">
          <button class="vp-btn vp-btn-sm" onclick="VPDIY.copyItinerary(this)">📋 复制表格</button>
          <button class="vp-btn vp-btn-sm" onclick="VPDIY.downloadItinerary('${cityData.flag} ${city.name} · 行程单')">⬇ 下载 .txt</button>
        </div>
      </div>
    `;

    return html;
  }

  function copyItinerary(btn) {
    const table = btn.closest('.vp-itinerary').querySelector('table');
    if (!table) return;
    let text = '';
    table.querySelectorAll('tr').forEach(tr => {
      const cells = [];
      tr.querySelectorAll('th, td').forEach(td => {
        cells.push(td.textContent.trim().replace(/\s+/g, ' '));
      });
      text += cells.join(' | ') + '\n';
    });
    navigator.clipboard.writeText(text).then(() => {
      VPApp.showToast('📋 已复制到剪贴板','success');
    }).catch(() => {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      VPApp.showToast('📋 已复制到剪贴板','success');
    });
  }

  function downloadItinerary(title) {
    const container = document.querySelector('.vp-itinerary');
    if (!container) return;
    const table = container.querySelector('table');
    if (!table) return;

    let text = title + '\n' + '='.repeat(40) + '\n\n';
    table.querySelectorAll('tr').forEach(tr => {
      const cells = [];
      tr.querySelectorAll('th, td').forEach(td => {
        cells.push(td.textContent.trim().replace(/\s+/g, ' '));
      });
      text += cells.join(' | ') + '\n';
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '行程单_' + new Date().toISOString().slice(0,10) + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ========= 保险模块 =========
  function renderInsurance(containerId, countryId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const providers = VISAPILOT.INSURANCE_PROVIDERS;

    let html = `
      <div class="vp-insurance-section">
        <h4>🏥 旅行医疗保险</h4>
        <p class="vp-insurance-note">${countryId === 'schengen' ? '申根签证要求：保额≥3万欧元' : '建议购买覆盖全部行程的旅行保险'}</p>
        <div class="vp-insurance-grid">
    `;

    providers.forEach(p => {
      html += `
        <a href="${p.url}" target="_blank" class="vp-insurance-card" style="border-color:${p.color}">
          <span class="vp-insurance-icon">${p.icon}</span>
          <div class="vp-insurance-info">
            <strong>${p.name}</strong>
            <span>${p.tag}</span>
          </div>
        </a>
      `;
    });

    html += `
        </div>
        <div class="vp-insurance-upload" style="margin-top:12px">
          <label class="vp-btn vp-btn-sm vp-btn-outline">
            📤 上传自己的保险文件
            <input type="file" accept=".jpg,.jpeg,.png,.pdf" style="display:none" onchange="VPDIY.uploadInsurance(this)">
          </label>
          <span id="vp-insurance-file-status"></span>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  function uploadInsurance(input) {
    const file = input.files[0];
    if (!file) return;
    const user = VPAuth.currentUser();
    if (!user) { VPApp.showToast('请先登录','warning'); return; }
    if (file.size > 10 * 1024 * 1024) { VPApp.showToast('文件不能超过10MB','warning'); return; }

    const reader = new FileReader();
    reader.onload = function(e) {
      VPStorage.saveUpload(user.phone, 'insurance_file', {
        name: file.name,
        size: file.size,
        type: file.type,
        data: file.size <= 3 * 1024 * 1024 ? e.target.result : null,
      });
      const status = document.getElementById('vp-insurance-file-status');
      if (status) status.textContent = '✅ 已上传：' + file.name;
      VPApp.showToast('✅ 保险文件已上传','success');
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  // ========= 翻译模块 =========
  function renderTranslation(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="vp-translation-section">
        <h4>🌐 文件一键翻译</h4>
        <p class="vp-text-muted">上传中文文件，自动匹配常见材料模板</p>
        <div class="vp-translation-templates">
          <div class="vp-translation-template">📄 在职证明 → 英文版</div>
          <div class="vp-translation-template">📊 银行流水 → 英文版</div>
          <div class="vp-translation-template">🏢 营业执照 → 英文版</div>
        </div>
        <div class="vp-translation-upload" style="margin-top:12px">
          <label class="vp-btn vp-btn-sm vp-btn-outline">
            📤 上传中文文件（JPG/PNG/PDF）
            <input type="file" accept=".jpg,.jpeg,.png,.pdf" style="display:none" onchange="VPDIY.translateFile(this)">
          </label>
          <button class="vp-btn vp-btn-sm vp-btn-primary" onclick="VPDIY.toggleTranslation()" style="margin-left:8px">🔄 原文/译文切换</button>
        </div>
        <div id="vp-translation-result" style="margin-top:12px">
          <div class="vp-empty-state">上传文件后查看翻译结果</div>
        </div>
      </div>
    `;
  }

  let showOriginal = true;

  function translateFile(input) {
    const file = input.files[0];
    if (!file) return;

    const result = document.getElementById('vp-translation-result');
    if (!result) return;

    showOriginal = true;
    result.innerHTML = `
      <div class="vp-translation-preview">
        <div class="vp-translation-original">
          <h5>📄 原文（${file.name}）</h5>
          <p style="background:var(--bg-muted);padding:12px;border-radius:6px;border:1px solid var(--border)">
            ${file.name} 已上传成功！<br>
            已自动匹配翻译模板 → 英文版<br><br>
            [系统提示] 本平台为演示环境，完整翻译功能需对接翻译API。<br>
            以下为模拟翻译结果预览：
          </p>
        </div>
        <div class="vp-translation-translated">
          <h5>🌐 译文（English）</h5>
          <p style="background:var(--bg-muted);padding:12px;border-radius:6px;border:1px solid var(--border)">
            File "${file.name}" has been uploaded successfully!<br>
            Automatic translation matched → English Version<br><br>
            [Demo] Full translation requires API integration.<br>
            This is a preview of the translated result.
          </p>
        </div>
      </div>
      <div style="margin-top:8px;display:flex;gap:8px">
        <button class="vp-btn vp-btn-sm" onclick="navigator.clipboard.writeText(document.querySelector('.vp-translation-translated p').textContent);VPApp.showToast('📋 已复制译文','success')">📋 复制译文</button>
        <button class="vp-btn vp-btn-sm" onclick="VPDIY.downloadTranslation()">⬇ 下载译文</button>
      </div>
    `;
    input.value = '';
  }

  function toggleTranslation() {
    showOriginal = !showOriginal;
    const result = document.getElementById('vp-translation-result');
    if (!result) return;
    const original = result.querySelector('.vp-translation-original');
    const translated = result.querySelector('.vp-translation-translated');
    if (original && translated) {
      original.style.display = showOriginal ? 'block' : 'none';
      translated.style.display = showOriginal ? 'none' : 'block';
    }
  }

  function downloadTranslation() {
    const text = document.querySelector('.vp-translation-translated p')?.textContent;
    if (!text) { VPApp.showToast('暂无译文可下载','warning'); return; }
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'translation_' + new Date().toISOString().slice(0,10) + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ========= 材料包生成 =========
  function generateMaterialPackage(countryId, visaType, userInfo) {
    if (!userInfo) return '<div class="vp-empty-state">请填写个人信息</div>';

    const country = VISAPILOT.VISA_CONFIG[countryId];
    if (!country) return '<div class="vp-empty-state">未找到国家信息</div>';

    const templates = VISAPILOT.MATERIAL_TEMPLATES[visaType.match(/旅游|商务|学生|工作|过境|探亲访友|医疗|文化体育/)?.[0] || '旅游'] || [];

    let html = `
      <div class="vp-material-package">
        <h4>📦 ${country.flag} ${country.name} · ${visaType} · 个人材料包</h4>
        <div class="vp-package-section">
          <h5>👤 申请人信息</h5>
          <p>姓名（拼音）：${userInfo.namePinyin || '-'}</p>
          <p>护照号：${userInfo.passport || '-'}</p>
          <p>出生日期：${userInfo.birthDate || '-'}</p>
          <p>单位/学校：${userInfo.company || '-'}</p>
          <p>职位：${userInfo.position || '-'}</p>
        </div>
        <div class="vp-package-section">
          <h5>📋 完整材料清单</h5>
          <ul>
    `;

    templates.forEach(t => {
      const req = t.required === true ? '必交' : (t.required === 'conditional' ? '视情况' : '可选');
      html += `<li>[${req}] ${t.name} — ${t.note || ''}</li>`;
    });

    html += `
          </ul>
        </div>
        <div class="vp-package-section">
          <h5>✈️ 出行说明</h5>
          <p>${userInfo.tripPurpose || '-'}</p>
        </div>
        <div class="vp-package-section">
          <h5>📝 在线申请表填写指引</h5>
          <p>请访问 ${country.name} 签证中心官网在线填写签证申请表，如实填写所有信息。</p>
        </div>
        <div style="margin-top:12px;display:flex;gap:8px">
          <button class="vp-btn vp-btn-sm" onclick="VPDIY.copyPackage(this)">📋 一键复制</button>
          <button class="vp-btn vp-btn-sm" onclick="VPDIY.downloadPackage()">⬇ 下载 .txt</button>
        </div>
      </div>
    `;

    return html;
  }

  function copyPackage(btn) {
    const text = btn.closest('.vp-material-package').textContent;
    navigator.clipboard.writeText(text).then(() => VPApp.showToast('📋 已复制','success')).catch(() => VPApp.showToast('复制失败','error'));
  }

  function downloadPackage() {
    const text = document.querySelector('.vp-material-package')?.textContent;
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '材料包_' + new Date().toISOString().slice(0,10) + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return {
    uploadMaterial, getUploadedMaterials, renderUploadSection,
    handleUpload, submitForReview, jumpToCalendar,
    generateItinerary, copyItinerary, downloadItinerary,
    renderInsurance, uploadInsurance,
    renderTranslation, translateFile, toggleTranslation, downloadTranslation,
    generateMaterialPackage, copyPackage, downloadPackage,
  };
})();
