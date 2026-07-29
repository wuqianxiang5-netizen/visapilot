/**
 * VisaPilot — 预约面签日历系统
 */

const VPCalendar = (function() {
  'use strict';

  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();

  // 模拟可约日期和时段
  function generateSlots(year, month) {
    const slots = {};
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0,0,0,0);

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      if (date < today) continue;
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue; // skip weekends

      // 模拟一些日期不可约
      if (Math.random() < 0.2) continue;

      const dateStr = formatDate(date);
      const amSlots = [];
      const pmSlots = [];

      // 上午 08:30-11:30
      let t = new Date(date);
      t.setHours(8,30,0,0);
      for (let i = 0; i < 7; i++) {
        const h = t.getHours();
        const m = t.getMinutes();
        const timeStr = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
        const isHot = (h >= 9 && h <= 10);
        const isFull = Math.random() < 0.15;
        amSlots.push({ time: timeStr, full: isFull, hot: isHot });
        t.setMinutes(m + 30);
      }

      // 下午 13:00-16:00
      t = new Date(date);
      t.setHours(13,0,0,0);
      for (let i = 0; i < 7; i++) {
        const h = t.getHours();
        const m = t.getMinutes();
        const timeStr = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
        const isHot = (h >= 14 && h <= 15);
        const isFull = Math.random() < 0.15;
        pmSlots.push({ time: timeStr, full: isFull, hot: isHot });
        t.setMinutes(m + 30);
      }

      slots[dateStr] = { amSlots, pmSlots, count: amSlots.filter(s=>!s.full).length + pmSlots.filter(s=>!s.full).length };
    }
    return slots;
  }

  function formatDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function renderCalendar(containerId, countryId, visaType, onSelect) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const slots = generateSlots(currentYear, currentMonth);
    render(container, slots, countryId, visaType, onSelect);
  }

  function render(container, slots, countryId, visaType, onSelect) {
    const today = new Date();
    const monthNames = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
    const dayNames = ['日','一','二','三','四','五','六'];

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

    let html = `
      <div class="vp-calendar-wrap">
        <div class="vp-calendar-nav">
          <button class="vp-btn vp-btn-sm" onclick="VPCalendar.prevMonth()">◀ 上月</button>
          <span class="vp-calendar-title">${currentYear}年 ${monthNames[currentMonth]}</span>
          <button class="vp-btn vp-btn-sm" onclick="VPCalendar.nextMonth()">下月 ▶</button>
        </div>
        <table class="vp-calendar-table">
          <thead><tr>
    `;
    dayNames.forEach(d => { html += `<th>${d}</th>`; });
    html += `</tr></thead><tbody><tr>`;

    // 空白格
    for (let i = 0; i < firstDayOfWeek; i++) {
      html += '<td class="vp-cal-empty"></td>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
      if ((day + firstDayOfWeek - 1) % 7 === 0 && day > 1) {
        html += '</tr><tr>';
      }
      const date = new Date(currentYear, currentMonth, day);
      date.setHours(0,0,0,0);
      const dateStr = formatDate(date);
      const slotData = slots[dateStr];
      const isPast = date < today;
      const isToday = date.getTime() === today.getTime();
      const isAvailable = slotData && !isPast;
      const count = slotData ? slotData.count : 0;

      let cls = 'vp-cal-cell';
      if (isToday) cls += ' vp-cal-today';
      if (isPast) cls += ' vp-cal-past';
      else if (isAvailable) cls += ' vp-cal-avail';
      else cls += ' vp-cal-full';

      html += `<td class="${cls}" data-date="${dateStr}">
        <div class="vp-cal-day">${day}</div>
        ${isAvailable ? `<div class="vp-cal-count">${count}个时段</div>` : (isPast ? '' : '<div class="vp-cal-count">暂无</div>')}
      </td>`;
    }

    const remainingCells = (7 - (daysInMonth + firstDayOfWeek) % 7) % 7;
    for (let i = 0; i < remainingCells; i++) {
      html += '<td class="vp-cal-empty"></td>';
    }

    html += `</tr></tbody></table></div>`;

    container.innerHTML = html;

    // 点击可用日期
    container.querySelectorAll('.vp-cal-avail').forEach(el => {
      el.addEventListener('click', function() {
        const dateStr = this.dataset.date;
        container.querySelectorAll('.vp-cal-avail').forEach(c => c.classList.remove('vp-cal-selected'));
        this.classList.add('vp-cal-selected');
        if (onSelect) onSelect(dateStr, slots[dateStr]);
      });
    });

    // 渲染时段选择区
    const timeSlotArea = document.getElementById('vp-timeslots');
    if (timeSlotArea) {
      const firstAvail = container.querySelector('.vp-cal-avail');
      if (firstAvail) {
        const dateStr = firstAvail.dataset.date;
        firstAvail.classList.add('vp-cal-selected');
        renderTimeSlots(timeSlotArea, dateStr, slots[dateStr], countryId, visaType);
      } else {
        timeSlotArea.innerHTML = '<div class="vp-empty-state">当前月份暂无可用日期</div>';
      }
    }
  }

  function renderTimeSlots(container, dateStr, slotData, countryId, visaType) {
    if (!slotData) {
      container.innerHTML = '<div class="vp-empty-state">该日期暂无可用时段</div>';
      return;
    }
    const selectedDate = new Date(dateStr);
    const weekDay = ['周日','周一','周二','周三','周四','周五','周六'][selectedDate.getDay()];

    let html = `
      <div class="vp-timeslot-header">
        <h4>📅 ${dateStr} ${weekDay}</h4>
        <p>选择时间段进行预约</p>
      </div>
      <div class="vp-timeslot-groups">
        <div class="vp-timeslot-group">
          <h5>🌅 上午段 08:30-11:30</h5>
          <div class="vp-timeslot-grid">
    `;
    slotData.amSlots.forEach(s => {
      const disabled = s.full ? 'disabled' : '';
      const hot = s.hot ? '<span class="vp-badge-hot">🔥</span>' : '';
      html += `<button class="vp-btn vp-btn-slot ${disabled}" ${disabled?'':'onclick="VPCalendar.selectTime(\''+dateStr+'\',\''+s.time+'\',\''+countryId+'\',\''+visaType+'\')"'}>
        ${s.time} ${hot}
      </button>`;
    });
    html += `
          </div>
        </div>
        <div class="vp-timeslot-group">
          <h5>🌆 下午段 13:00-16:00</h5>
          <div class="vp-timeslot-grid">
    `;
    slotData.pmSlots.forEach(s => {
      const disabled = s.full ? 'disabled' : '';
      const hot = s.hot ? '<span class="vp-badge-hot">🔥</span>' : '';
      html += `<button class="vp-btn vp-btn-slot ${disabled}" ${disabled?'':'onclick="VPCalendar.selectTime(\''+dateStr+'\',\''+s.time+'\',\''+countryId+'\',\''+visaType+'\')"'}>
        ${s.time} ${hot}
      </button>`;
    });
    html += `
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  function prevMonth() {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    refresh();
  }

  function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    refresh();
  }

  let _onSelectCb = null;
  let _countryId = '';
  let _visaType = '';

  function refresh() {
    renderCalendar('vp-calendar-body', _countryId, _visaType, _onSelectCb);
  }

  function init(countryId, visaType, onSelect) {
    currentMonth = new Date().getMonth();
    currentYear = new Date().getFullYear();
    _countryId = countryId;
    _visaType = visaType;
    _onSelectCb = onSelect;
    refresh();
  }

  function selectTime(dateStr, time, countryId, visaType) {
    const country = VISAPILOT.VISA_CONFIG[countryId] || { name: countryId, flag: '' };
    const bookingSummary = document.getElementById('vp-booking-summary');
    if (!bookingSummary) return;

    const centerSelect = document.getElementById('vp-center-select');
    const selectedCenter = centerSelect ? centerSelect.value || '签证中心' : '签证中心';

    // 获取签证中心地址
    let centerAddr = '';
    const config = VISAPILOT.VISA_CONFIG[countryId];
    if (config && config.centers) {
      const center = config.centers.find(c => c.city === selectedCenter);
      if (center) centerAddr = center.addr;
    }

    bookingSummary.innerHTML = `
      <div class="vp-booking-card">
        <h4>✅ 预约确认</h4>
        <div class="vp-booking-details">
          <p><strong>目的国：</strong>${country.flag} ${country.name}</p>
          <p><strong>签证类型：</strong>${visaType}</p>
          <p><strong>签证中心：</strong>${selectedCenter}</p>
          ${centerAddr ? `<p><strong>地址：</strong>${centerAddr}</p>` : ''}
          <p><strong>日期：</strong>${dateStr}</p>
          <p><strong>时间：</strong>${time}</p>
        </div>
        <p class="vp-booking-note">⚠️ 请提前15分钟到达签证中心</p>
        <a href="https://www.google.com/search?q=${encodeURIComponent(country.name+' 签证预约')}" target="_blank" class="vp-btn vp-btn-primary vp-btn-block">前往官方系统正式预约</a>
        <button class="vp-btn vp-btn-outline vp-btn-block vp-mt-sm" onclick="VPCalendar.saveBooking('${countryId}','${visaType}','${selectedCenter}','${dateStr}','${time}')">📝 保存预约记录</button>
      </div>
    `;
  }

  function saveBooking(countryId, visaType, center, dateStr, time) {
    const user = VPAuth.currentUser();
    if (!user) {
      VPApp.showToast('请先登录后再保存预约','warning');
      return;
    }
    const country = VISAPILOT.VISA_CONFIG[countryId] || { name: countryId, flag: '' };
    const booking = {
      userId: user.phone,
      userName: user.name,
      countryId,
      countryName: country.name,
      countryFlag: country.flag,
      visaType,
      center,
      date: dateStr,
      time,
    };
    VPStorage.addBooking(booking);
    VPApp.showToast('✅ 预约记录已保存','success');
  }

  function renderWaitTime(countryId) {
    const el = document.getElementById('vp-wait-time');
    if (!el) return;
    const month = new Date().getMonth();
    const isPeak = month >= 5 && month <= 7 || month >= 11;
    const baseDays = [15, 20, 25, 10, 12, 20, 25, 20, 18, 15];
    const idx = ['usa','uk','schengen','japan','korea','india','australia','canada','ireland','philippines'].indexOf(countryId);
    const days = (idx >= 0 ? baseDays[idx] : 15) + (isPeak ? 10 : 0);
    let status, color;
    if (days <= 15) { status = '充裕'; color = 'green'; }
    else if (days <= 25) { status = '一般'; color = 'orange'; }
    else { status = '紧张'; color = 'red'; }

    el.innerHTML = `
      <div class="vp-wait-time-card">
        <h4>⏱️ 预约等待时间</h4>
        <div class="vp-wait-days" style="color:${color}">${days} 天</div>
        <div class="vp-wait-status" style="color:${color}">${status}</div>
        <p class="vp-wait-note">${isPeak ? '⚠️ 当前处于旺季，等待时间较长，建议提前2-3个月预约' : '当前为淡季，预约相对容易'}</p>
      </div>
    `;
  }

  return {
    init, renderCalendar, prevMonth, nextMonth,
    selectTime, saveBooking, renderWaitTime,
    formatDate,
  };
})();
