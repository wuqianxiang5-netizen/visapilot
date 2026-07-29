/**
 * VisaPilot — 认证模块
 * 注册、登录、会话管理
 */

const VPAuth = (function() {
  'use strict';

  function register(data) {
    const users = VPStorage.getUsers();
    if (users.find(u => u.phone === data.phone)) {
      return { ok:false, error:'该手机号已注册' };
    }
    const user = {
      name: data.name,
      phone: data.phone,
      wechat: data.wechat || '',
      password: data.password,
      role: data.role || 'user', // user | agent | admin
      agentInfo: data.agentInfo || null,
      approved: data.role === 'agent' ? false : true,
      createdAt: new Date().toISOString(),
    };
    VPStorage.saveUser(user);
    if (data.role === 'agent') {
      // 添加代办审核记录
      const r = {
        phone: data.phone,
        name: data.name,
        wechat: data.wechat || '',
        info: data.agentInfo || '',
        status: 'pending',
      };
      VPStorage.addAgentReview(r);
    }
    return { ok:true };
  }

  function login(emailOrPhone, password) {
    const user = VPStorage.getUser(emailOrPhone);
    if (!user) return { ok:false, error:'账号不存在' };
    if (user.password !== password) return { ok:false, error:'密码错误' };
    if (user.role === 'agent' && !user.approved) return { ok:false, error:'您的代办申请尚未通过审核，请联系管理员' };
    VPStorage.setSession({ phone: user.phone, role: user.role, name: user.name });
    return { ok:true, user };
  }

  function logout() {
    VPStorage.clearSession();
  }

  function currentUser() {
    return VPStorage.currentUser();
  }

  function isLoggedIn() {
    return VPStorage.isLoggedIn();
  }

  function isAdmin() {
    const u = currentUser();
    return u && u.role === 'admin';
  }

  function isAgent() {
    const u = currentUser();
    return u && u.role === 'agent';
  }

  function require(role) {
    const u = currentUser();
    if (!u) return false;
    if (role === 'admin') return u.role === 'admin';
    if (role === 'agent') return u.role === 'agent';
    return true;
  }

  function getAgentName(phone) {
    const u = VPStorage.getUser(phone);
    return u ? u.name : '未知';
  }

  return {
    register, login, logout,
    currentUser, isLoggedIn, isAdmin, isAgent,
    require, getAgentName,
  };
})();
