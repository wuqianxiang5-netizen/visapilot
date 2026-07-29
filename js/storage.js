/**
 * VisaPilot — 存储层
 * 所有数据持久化到 localStorage
 */

const VPStorage = (function() {
  'use strict';

  const PREFIX = 'vp_';

  function get(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch(e) { return null; }
  }

  function set(key, data) {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(data)); } catch(e) { /* quota exceeded */ }
  }

  function remove(key) {
    try { localStorage.removeItem(PREFIX + key); } catch(e) {}
  }

  // ======= 用户 =======
  function getUsers() { return get('users') || []; }
  function setUsers(arr) { set('users', arr); }
  function getUser(key) { return getUsers().find(u => u.phone === key || u.email === key) || null; }
  function getUserByEmail(email) { return getUsers().find(u => u.email === email) || null; }
  function saveUser(u) {
    const users = getUsers().filter(x => x.phone !== u.phone && x.email !== u.email);
    users.push(u);
    setUsers(users);
  }
  function getAllUsers() { initPresetAccounts(); return get('users') || []; }

  // ======= 预设账号 =======
  function initPresetAccounts(existing) {
    const users = existing || get('users');
    if (users && users.length > 0) { ensureAdminExists(); return; }
    const presets = [
      { name:'普通用户', phone:'user@test.com', email:'user@test.com', wechat:'test_user', password:'123456', role:'user', approved:true, createdAt:new Date().toISOString() },
      { name:'签证官张三', phone:'officer@test.com', email:'officer@test.com', wechat:'visa_officer', password:'123456', role:'agent', approved:true, createdAt:new Date().toISOString() },
      { name:'管理员', phone:'admin@test.com', email:'admin@test.com', wechat:'admin', password:'admin123', role:'admin', approved:true, createdAt:new Date().toISOString() },
    ];
    set('users', presets);
  }

  function ensureAdminExists() {
    const users = get('users') || [];
    if (!users.find(u => u.role === 'admin')) {
      users.push({ name:'管理员', phone:'admin@test.com', email:'admin@test.com', wechat:'admin', password:'admin123', role:'admin', approved:true, createdAt:new Date().toISOString() });
      set('users', users);
    }
  }

  // ======= 会话 =======
  function getSession() { return get('session') || null; }
  function setSession(s) { set('session', s); }
  function clearSession() { remove('session'); }
  function isLoggedIn() {
    const s = getSession();
    return s && s.phone ? true : false;
  }
  function currentUser() {
    const s = getSession();
    if (!s) return null;
    return getUser(s.phone);
  }

  // ======= 咨询/订单 =======
  function getConsultations() { return get('consultations') || []; }
  function setConsultations(arr) { set('consultations', arr); }
  function addConsultation(c) {
    const list = getConsultations();
    c.id = Date.now() + '_' + Math.random().toString(36).slice(2,6);
    c.createdAt = new Date().toISOString();
    c.read = false;
    list.unshift(c);
    setConsultations(list);
    return c;
  }

  function getOrders() { return get('orders') || []; }
  function setOrders(arr) { set('orders', arr); }
  function addOrder(o) {
    const list = getOrders();
    o.id = Date.now() + '_' + Math.random().toString(36).slice(2,8);
    o.createdAt = new Date().toISOString();
    o.status = 'pending'; // pending | assigned | processing | done
    list.unshift(o);
    setOrders(list);
    return o;
  }

  // ======= 聊天 =======
  function getMessages(convId) {
    const all = get('messages') || {};
    return all[convId] || [];
  }
  function addMessage(convId, msg) {
    const all = get('messages') || {};
    if (!all[convId]) all[convId] = [];
    msg.id = Date.now() + '_' + Math.random().toString(36).slice(2,6);
    msg.createdAt = new Date().toISOString();
    all[convId].push(msg);
    set('messages', all);
    return msg;
  }
  function getAllConversations() {
    return get('messages') || {};
  }
  function getAllMessages() { return get('messages') || {}; }

  // ======= 材料上传 =======
  function getUploads(ownerId) {
    const all = get('uploads') || {};
    return all[ownerId] || {};
  }
  function saveUpload(ownerId, materialId, fileInfo) {
    const all = get('uploads') || {};
    if (!all[ownerId]) all[ownerId] = {};
    all[ownerId][materialId] = fileInfo;
    set('uploads', all);
  }
  function getAllUploads() { return get('uploads') || {}; }

  // ======= 预约记录 =======
  function getBookings() { return get('bookings') || []; }
  function setBookings(arr) { set('bookings', arr); }
  function addBooking(b) {
    const list = getBookings();
    b.id = Date.now() + '_' + Math.random().toString(36).slice(2,6);
    b.createdAt = new Date().toISOString();
    list.unshift(b);
    setBookings(list);
    return b;
  }

  // ======= 审核记录 =======
  function getReviews() { return get('reviews') || []; }
  function setReviews(arr) { set('reviews', arr); }
  function addReview(r) {
    const list = getReviews();
    r.id = Date.now() + '_' + Math.random().toString(36).slice(2,6);
    r.createdAt = new Date().toISOString();
    r.status = 'pending'; // pending | reviewing | approved | rejected
    list.unshift(r);
    setReviews(list);
    return r;
  }
  function updateReview(id, updates) {
    const list = getReviews();
    const idx = list.findIndex(r => r.id === id);
    if (idx >= 0) {
      Object.assign(list[idx], updates);
      setReviews(list);
    }
  }

  // ======= 代办审核 =======
  function getAgentReviews() { return get('agent_reviews') || []; }
  function setAgentReviews(arr) { set('agent_reviews', arr); }
  function addAgentReview(r) {
    const list = getAgentReviews();
    r.id = Date.now() + '_' + Math.random().toString(36).slice(2,6);
    r.createdAt = new Date().toISOString();
    r.status = 'pending';
    list.push(r);
    setAgentReviews(list);
    return r;
  }

  return {
    getUserByEmail, initPresetAccounts, ensureAdminExists,
    getUsers, setUsers, getUser, saveUser, getAllUsers,
    getSession, setSession, clearSession, isLoggedIn, currentUser,
    getConsultations, setConsultations, addConsultation,
    getOrders, setOrders, addOrder,
    getMessages, addMessage, getAllConversations, getAllMessages,
    getUploads, saveUpload, getAllUploads,
    getBookings, setBookings, addBooking,
    getReviews, setReviews, addReview, updateReview,
    getAgentReviews, setAgentReviews, addAgentReview,
  };
})();
