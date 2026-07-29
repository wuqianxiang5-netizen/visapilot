/**
 * VisaPilot — 数据层
 * 包含所有国家、签证类型、签证中心、城市/行程数据
 */

const VISAPILOT = (function() {
  'use strict';

  // ========= 国家列表 =========
  const COUNTRIES = [
    { id: 'usa',        name: '美国',      flag: '🇺🇸', hot: true,  schengen: false },
    { id: 'uk',         name: '英国',      flag: '🇬🇧', hot: true,  schengen: false },
    { id: 'france',     name: '法国',      flag: '🇫🇷', hot: true,  schengen: false },
    { id: 'italy',      name: '意大利',    flag: '🇮🇹', hot: true,  schengen: false },
    { id: 'spain',      name: '西班牙',    flag: '🇪🇸', hot: true,  schengen: false },
    { id: 'germany',    name: '德国',      flag: '🇩🇪', hot: true,  schengen: false },
    { id: 'switzerland',name: '瑞士',      flag: '🇨🇭', hot: true,  schengen: false },
    { id: 'japan',      name: '日本',      flag: '🇯🇵', hot: false, schengen: false },
    { id: 'korea',      name: '韩国',      flag: '🇰🇷', hot: false, schengen: false },
    { id: 'india',      name: '印度',      flag: '🇮🇳', hot: false, schengen: false },
    { id: 'australia',  name: '澳大利亚',  flag: '🇦🇺', hot: false, schengen: false },
    { id: 'canada',     name: '加拿大',    flag: '🇨🇦', hot: false, schengen: false },
    { id: 'ireland',    name: '爱尔兰',    flag: '🇮🇪', hot: false, schengen: false },
    { id: 'philippines',name: '菲律宾',    flag: '🇵🇭', hot: false, schengen: false },
    { id: 'singapore',  name: '新加坡',    flag: '🇸🇬', hot: false, schengen: false },
    { id: 'thailand',   name: '泰国',      flag: '🇹🇭', hot: false, schengen: false },
    { id: 'vietnam',    name: '越南',      flag: '🇻🇳', hot: false, schengen: false },
    { id: 'malaysia',   name: '马来西亚',  flag: '🇲🇾', hot: false, schengen: false },
    { id: 'netherlands',name: '荷兰',      flag: '🇳🇱', hot: false, schengen: false },
    { id: 'schengen',   name: '申根签',    flag: '🇪🇺', hot: true,  schengen: true },
  ];

  // ========= 签证类型 =========
  const VISA_TYPES_BASE = ['旅游','商务','学生','工作','过境'];

  const VISA_CONFIG = {
    usa: {
      name: '美国', flag: '🇺🇸',
      types: ['旅游(B1/B2)','商务(B1)','学生(F1)','工作(H1B)','过境(C1)'],
      centers: [
        { city:'北京', addr:'北京市朝阳区安家楼路55号', system:'AIS' },
        { city:'上海', addr:'上海市南京西路1038号梅龙镇广场8楼', system:'AIS' },
        { city:'广州', addr:'广州市天河区珠江新城华就路43号', system:'AIS' },
        { city:'成都', addr:'成都市锦江区东御街18号', system:'AIS' },
        { city:'沈阳', addr:'沈阳市和平区青年大街288号', system:'AIS' },
      ],
      feeNote:'¥1200-¥1600（根据签证类型，不含SEVIS费）',
      baseFees: { '旅游(B1/B2)':1600,'商务(B1)':1600,'学生(F1)':1200,'工作(H1B)':1800,'过境(C1)':1200 }
    },
    uk: {
      name: '英国', flag: '🇬🇧',
      types: ['旅游','商务','学生(T4)','工作','过境','长期签证'],
      centers: [
        { city:'北京', addr:'北京市东城区东直门外大街26号', system:'gov.uk/TLScontact' },
        { city:'上海', addr:'上海市黄浦区四川中路213号', system:'gov.uk/TLScontact' },
        { city:'广州', addr:'广州市天河区体育西路189号', system:'gov.uk/TLScontact' },
        { city:'成都', addr:'成都市武侯区人民南路四段3号', system:'gov.uk/TLScontact' },
        { city:'深圳', addr:'深圳市福田区滨河大道9285号', system:'gov.uk/TLScontact' },
        { city:'杭州', addr:'杭州市上城区解放东路8号', system:'gov.uk/TLScontact' },
      ],
      feeNote:'¥900-¥1500（根据签证类型，含服务费）',
      baseFees: { '旅游':1200,'商务':1200,'学生(T4)':900,'工作':1500,'过境':1000,'长期签证':1800 }
    },

    france: {
      name: '法国', flag: '🇫🇷',
      types: ['旅游','商务','学生','工作','过境'],
      centers: [
        { city:'北京', addr:'北京市朝阳区东大桥路9号', system:'France-Visas' },
        { city:'上海', addr:'上海市静安区恒丰路329号', system:'France-Visas' },
        { city:'广州', addr:'广州市天河区体育西路189号', system:'France-Visas' },
        { city:'成都', addr:'成都市锦江区东御街18号', system:'France-Visas' },
        { city:'武汉', addr:'武汉市武昌区中北路171号', system:'France-Visas' },
        { city:'沈阳', addr:'沈阳市和平区青年大街288号', system:'France-Visas' },
      ],
      feeNote:'€80+服务费 ≈ ¥620-900（申根统一费率）',
      baseFees: { '旅游':800,'商务':800,'学生':620,'工作':1500,'过境':800 }
    },
    italy: {
      name: '意大利', flag: '🇮🇹',
      types: ['旅游','商务','学生','工作','过境'],
      centers: [
        { city:'北京', addr:'北京市朝阳区三里屯路2号', system:'VFS Global' },
        { city:'上海', addr:'上海市黄浦区四川中路213号', system:'VFS Global' },
        { city:'广州', addr:'广州市天河区体育西路189号', system:'VFS Global' },
        { city:'重庆', addr:'重庆市渝中区邹容路68号', system:'VFS Global' },
      ],
      feeNote:'€80+服务费 ≈ ¥620-900',
      baseFees: { '旅游':800,'商务':800,'学生':620,'工作':1500,'过境':800 }
    },
    spain: {
      name: '西班牙', flag: '🇪🇸',
      types: ['旅游','商务','学生','工作','过境'],
      centers: [
        { city:'北京', addr:'北京市朝阳区三里屯东四街9号', system:'BLS International' },
        { city:'上海', addr:'上海市浦东新区世纪大道88号', system:'BLS International' },
        { city:'广州', addr:'广州市天河区华夏路8号', system:'BLS International' },
      ],
      feeNote:'€80+服务费 ≈ ¥620-900',
      baseFees: { '旅游':800,'商务':800,'学生':620,'工作':1500,'过境':800 }
    },
    germany: {
      name: '德国', flag: '🇩🇪',
      types: ['旅游','商务','学生','工作','过境'],
      centers: [
        { city:'北京', addr:'北京市朝阳区东直门外大街17号', system:'TLScontact' },
        { city:'上海', addr:'上海市静安区恒丰路329号', system:'TLScontact' },
        { city:'广州', addr:'广州市天河区体育西路189号', system:'TLScontact' },
        { city:'成都', addr:'成都市锦江区东御街18号', system:'TLScontact' },
        { city:'沈阳', addr:'沈阳市和平区青年大街288号', system:'TLScontact' },
      ],
      feeNote:'€80+服务费 ≈ ¥620-900',
      baseFees: { '旅游':800,'商务':800,'学生':620,'工作':1500,'过境':800 }
    },
    netherlands: {
      name: '荷兰', flag: '🇳🇱',
      types: ['旅游','商务','学生','工作','过境'],
      centers: [
        { city:'北京', addr:'北京市朝阳区亮马桥路50号', system:'VFS Global' },
        { city:'上海', addr:'上海市静安区恒丰路329号', system:'VFS Global' },
        { city:'广州', addr:'广州市天河区体育西路189号', system:'VFS Global' },
      ],
      feeNote:'€80+服务费 ≈ ¥620-900',
      baseFees: { '旅游':800,'商务':800,'学生':620,'工作':1500,'过境':800 }
    },
    switzerland: {
      name: '瑞士', flag: '🇨🇭',
      types: ['旅游','商务','学生','工作','过境'],
      centers: [
        { city:'北京', addr:'北京市朝阳区三里屯东五街3号', system:'TLScontact' },
        { city:'上海', addr:'上海市静安区恒丰路329号', system:'TLScontact' },
        { city:'广州', addr:'广州市天河区体育西路189号', system:'TLScontact' },
      ],
      feeNote:'€80+服务费 ≈ ¥620-900',
      baseFees: { '旅游':800,'商务':800,'学生':620,'工作':1500,'过境':800 }
    },
    singapore: {
      name: '新加坡', flag: '🇸🇬',
      types: ['旅游','商务','学生','工作','过境'],
      centers: [
        { city:'北京', addr:'北京市朝阳区亮马桥路50号', system:'新加坡驻华大使馆' },
        { city:'上海', addr:'上海市万山路89号', system:'新加坡驻上海总领事馆' },
        { city:'广州', addr:'广州市天河北路233号', system:'新加坡驻广州总领事馆' },
      ],
      feeNote:'单次¥200，多次¥350',
      baseFees: { '旅游':200,'商务':350,'学生':250,'工作':500,'过境':200 }
    },
    thailand: {
      name: '泰国', flag: '🇹🇭',
      types: ['旅游','商务','学生','工作','过境','长期签证'],
      centers: [
        { city:'北京', addr:'北京市朝阳区建国门外大街1号', system:'泰国驻华大使馆' },
        { city:'上海', addr:'上海市南京西路288号', system:'泰国驻上海总领事馆' },
        { city:'广州', addr:'广州市环市东路368号', system:'泰国驻广州总领事馆' },
        { city:'成都', addr:'成都市武侯区人民南路四段3号', system:'泰国驻成都总领事馆' },
        { city:'厦门', addr:'厦门市思明区鹭江道8号', system:'泰国驻厦门总领事馆' },
      ],
      feeNote:'旅游签免签！商务签¥480，学生签¥400',
      baseFees: { '旅游':0,'商务':480,'学生':400,'工作':800,'过境':200,'长期签证':1200 }
    },
    vietnam: {
      name: '越南', flag: '🇻🇳',
      types: ['旅游','商务','学生','工作','过境'],
      centers: [
        { city:'北京', addr:'北京市朝阳区建国门外光华路32号', system:'越南驻华大使馆' },
        { city:'上海', addr:'上海市浦东新区陆家嘴环路1000号', system:'越南驻上海总领事馆' },
        { city:'广州', addr:'广州市海珠区新港东路1066号', system:'越南驻广州总领事馆' },
      ],
      feeNote:'电子签$25（约¥180），落地签$35',
      baseFees: { '旅游':180,'商务':350,'学生':250,'工作':500,'过境':180 }
    },
    malaysia: {
      name: '马来西亚', flag: '🇲🇾',
      types: ['旅游','商务','学生','工作','过境'],
      centers: [
        { city:'北京', addr:'北京市朝阳区亮马桥路50号', system:'马来西亚驻华大使馆' },
        { city:'上海', addr:'上海市延安西路2299号', system:'马来西亚驻上海总领事馆' },
        { city:'广州', addr:'广州市天河北路233号', system:'马来西亚驻广州总领事馆' },
      ],
      feeNote:'电子签¥160，贴纸签¥200',
      baseFees: { '旅游':160,'商务':200,'学生':200,'工作':800,'过境':160 }
    },
    schengen: {
      name: '申根签', flag: '🇪🇺',
      types: ['旅游','商务','学生','探亲访友','文化体育'],
      centers: [
        { city:'北京', addr:'北京市朝阳区东大桥路9号', system:'VFS Global/TLScontact' },
        { city:'上海', addr:'上海市静安区恒丰路329号', system:'VFS Global' },
        { city:'广州', addr:'广州市天河区体育西路189号', system:'TLScontact' },
        { city:'成都', addr:'成都市锦江区东御街18号', system:'VFS Global' },
        { city:'武汉', addr:'武汉市武昌区中北路171号', system:'VFS Global' },
        { city:'沈阳', addr:'沈阳市和平区青年大街288号', system:'TLScontact' },
      ],
      feeNote:'€80+服务费 ≈ ¥620-¥900',
      baseFees: { '旅游':800,'商务':800,'学生':620,'探亲访友':800,'文化体育':800 }
    },
    japan: {
      name: '日本', flag: '🇯🇵',
      types: ['旅游','商务','学生','工作','过境'],
      centers: [
        { city:'北京', addr:'北京市朝阳区亮马桥路50号', system:'日本驻华大使馆' },
        { city:'上海', addr:'上海市万山路8号', system:'日本驻上海总领事馆' },
        { city:'广州', addr:'广州市环市东路368号', system:'日本驻广州总领事馆' },
      ],
      feeNote:'单次¥200，三年¥600，五年¥1000',
      baseFees: { '旅游':200,'商务':200,'学生':200,'工作':400,'过境':200 }
    },
    korea: {
      name: '韩国', flag: '🇰🇷',
      types: ['旅游','商务','学生','工作','过境'],
      centers: [
        { city:'北京', addr:'北京市朝阳区亮马桥路27号', system:'韩国驻华大使馆' },
        { city:'上海', addr:'上海市万山路60号', system:'韩国驻上海总领事馆' },
        { city:'广州', addr:'广州市海珠区赤岗领事馆区', system:'韩国驻广州总领事馆' },
      ],
      feeNote:'单次¥280，五年¥650',
      baseFees: { '旅游':280,'商务':280,'学生':280,'工作':500,'过境':280 }
    },
    india: {
      name: '印度', flag: '🇮🇳',
      types: ['旅游','商务','学生','工作','医疗'],
      centers: [
        { city:'北京', addr:'北京市朝阳区亮马桥路50号', system:'印度驻华大使馆' },
        { city:'上海', addr:'上海市延安西路2200号', system:'印度驻上海总领事馆' },
      ],
      feeNote:'电子签$25起（约¥180），纸质签¥500起',
      baseFees: { '旅游':180,'商务':500,'学生':300,'工作':800,'医疗':180 }
    },
    australia: {
      name: '澳大利亚', flag: '🇦🇺',
      types: ['旅游','商务','学生','工作','过境','长期签证'],
      centers: [
        { city:'北京', addr:'北京市东城区东直门外大街21号', system:'澳洲移民局(AVS)' },
        { city:'上海', addr:'上海市南京西路1376号', system:'澳洲移民局(AVS)' },
        { city:'广州', addr:'广州市天河区珠江新城华夏路8号', system:'澳洲移民局(AVS)' },
      ],
      feeNote:'AUD$150起（约¥700），学生签¥500',
      baseFees: { '旅游':700,'商务':700,'学生':500,'工作':2000,'过境':700,'长期签证':2500 }
    },
    canada: {
      name: '加拿大', flag: '🇨🇦',
      types: ['旅游','商务','学生','工作','过境'],
      centers: [
        { city:'北京', addr:'北京市东城区东直门外大街19号', system:'IRCC/VFS' },
        { city:'上海', addr:'上海市黄浦区四川中路213号', system:'IRCC/VFS' },
        { city:'广州', addr:'广州市天河区体育西路189号', system:'IRCC/VFS' },
      ],
      feeNote:'CAD$100起（约¥520），学生签¥420',
      baseFees: { '旅游':520,'商务':520,'学生':420,'工作':850,'过境':520 }
    },
    ireland: {
      name: '爱尔兰', flag: '🇮🇪',
      types: ['旅游','商务','学生','工作','过境','长期签证'],
      centers: [
        { city:'北京', addr:'北京市朝阳区亮马桥路50号', system:'VFS Global' },
        { city:'上海', addr:'上海市静安区恒丰路329号', system:'VFS Global' },
      ],
      feeNote:'€80约¥620，学生签¥500',
      baseFees: { '旅游':620,'商务':620,'学生':500,'工作':1200,'过境':620,'长期签证':1500 }
    },
    philippines: {
      name: '菲律宾', flag: '🇵🇭',
      types: ['旅游','商务'],
      centers: [
        { city:'北京', addr:'北京市朝阳区建国门外秀水北街23号', system:'菲律宾驻华大使馆' },
        { city:'上海', addr:'上海市长宁区延安西路1160号', system:'菲律宾驻上海总领事馆' },
      ],
      feeNote:'约¥200，加急¥400',
      baseFees: { '旅游':200,'商务':200 }
    },
  };

  // ========= 申根子国家 =========
  const SCHENGEN_COUNTRIES = [
    { name:'法国', flag:'🇫🇷', hot:true,  code:'fra' },
    { name:'意大利', flag:'🇮🇹', hot:true,  code:'ita' },
    { name:'西班牙', flag:'🇪🇸', hot:true,  code:'esp' },
    { name:'德国', flag:'🇩🇪', hot:true,   code:'deu' },
    { name:'瑞士', flag:'🇨🇭', hot:true,    code:'che' },
    { name:'荷兰', flag:'🇳🇱', hot:false,   code:'nld' },
    { name:'比利时', flag:'🇧🇪', hot:false,  code:'bel' },
    { name:'卢森堡', flag:'🇱🇺', hot:false,  code:'lux' },
    { name:'奥地利', flag:'🇦🇹', hot:false,  code:'aut' },
    { name:'葡萄牙', flag:'🇵🇹', hot:false,  code:'prt' },
    { name:'希腊', flag:'🇬🇷', hot:false,    code:'grc' },
    { name:'瑞典', flag:'🇸🇪', hot:false,    code:'swe' },
    { name:'丹麦', flag:'🇩🇰', hot:false,    code:'dnk' },
    { name:'芬兰', flag:'🇫🇮', hot:false,    code:'fin' },
    { name:'挪威', flag:'🇳🇴', hot:false,    code:'nor' },
    { name:'冰岛', flag:'🇮🇸', hot:false,    code:'isl' },
    { name:'捷克', flag:'🇨🇿', hot:false,    code:'cze' },
    { name:'匈牙利', flag:'🇭🇺', hot:false,  code:'hun' },
    { name:'波兰', flag:'🇵🇱', hot:false,    code:'pol' },
    { name:'斯洛伐克', flag:'🇸🇰', hot:false, code:'svk' },
    { name:'斯洛文尼亚', flag:'🇸🇮', hot:false, code:'svn' },
    { name:'克罗地亚', flag:'🇭🇷', hot:false, code:'hrv' },
    { name:'爱沙尼亚', flag:'🇪🇪', hot:false, code:'est' },
    { name:'拉脱维亚', flag:'🇱🇻', hot:false, code:'lva' },
    { name:'立陶宛', flag:'🇱🇹', hot:false,  code:'ltu' },
    { name:'马耳他', flag:'🇲🇹', hot:false,  code:'mlt' },
    { name:'列支敦士登', flag:'🇱🇮', hot:false, code:'lie' },
    { name:'保加利亚', flag:'🇧🇬', hot:false, code:'bgr' },
    { name:'罗马尼亚', flag:'🇷🇴', hot:false, code:'rou' },
  ];

  // ========= 签证材料模板 =========
  const MATERIAL_TEMPLATES = {
    '旅游': [
      { id:'passport',      name:'护照原件',         required:true, note:'有效期6个月以上，至少2页空白' },
      { id:'photo',         name:'白底证件照',       required:true, note:'近6个月内，35×45mm' },
      { id:'application',   name:'签证申请表',        required:true, note:'在线填写并打印' },
      { id:'itinerary',     name:'旅行行程单',        required:true, note:'包含往返机票和住宿' },
      { id:'hotel',         name:'酒店预订单',        required:true, note:'覆盖全部停留天数' },
      { id:'flight',        name:'往返机票订单',      required:true, note:'未出票可提供预订凭证' },
      { id:'insurance',     name:'旅行医疗保险',      required:true, note:'保额≥3万欧元，申根必需' },
      { id:'bank',          name:'银行流水',          required:true, note:'近3-6个月，余额建议≥5万人民币' },
      { id:'employment',    name:'在职证明',          required:'conditional', note:'在职人员提供，含收入、职位、准假信息' },
      { id:'business_lic',  name:'营业执照副本',      required:'conditional', note:'企业主或单位提供，需加盖公章' },
      { id:'id_card',       name:'身份证复印件',      required:true, note:'正反面复印' },
      { id:'household',     name:'户口本复印件',      required:true, note:'所有页复印' },
    ],
    '商务': [
      { id:'passport',      name:'护照原件',         required:true, note:'有效期6个月以上' },
      { id:'photo',         name:'白底证件照',       required:true, note:'近6个月内' },
      { id:'application',   name:'签证申请表',        required:true, note:'在线填写并打印' },
      { id:'invitation',    name:'邀请函原件',        required:true, note:'邀请方出具的正式商务邀请函' },
      { id:'company_letter',name:'派遣函',           required:true, note:'中方公司出具，含行程和费用说明' },
      { id:'bank',          name:'银行流水',          required:true, note:'近3-6个月' },
      { id:'business_lic',  name:'营业执照副本',      required:true, note:'加盖公章' },
      { id:'id_card',       name:'身份证复印件',      required:true, note:'正反面' },
      { id:'tax',           name:'纳税证明',          required:'conditional', note:'企业主建议提供' },
    ],
    '学生': [
      { id:'passport',      name:'护照原件',         required:true, note:'有效期6个月以上' },
      { id:'photo',         name:'白底证件照',       required:true, note:'近6个月内' },
      { id:'application',   name:'签证申请表',        required:true, note:'在线填写' },
      { id:'acceptance',    name:'录取通知书',        required:true, note:'学校正式录取通知书' },
      { id:'enrollment',    name:'在读证明',          required:true, note:'学校出具的在校证明' },
      { id:'financial',     name:'财力证明',          required:true, note:'父母或本人名下存款证明' },
      { id:'relationship',  name:'亲属关系证明',       required:'conditional', note:'未成年或无收入者' },
      { id:'consent',       name:'父母同意书',         required:'conditional', note:'未成年申请人' },
      { id:'id_card',       name:'身份证复印件',       required:true, note:'正反面' },
      { id:'household',     name:'户口本复印件',       required:true },
    ],
    '工作': [
      { id:'passport',      name:'护照原件',         required:true },
      { id:'photo',         name:'白底证件照',       required:true },
      { id:'application',   name:'签证申请表',        required:true },
      { id:'work_permit',   name:'工作许可证明',      required:true, note:'雇主提供的劳务许可' },
      { id:'contract',      name:'劳动合同',          required:true },
      { id:'qualification', name:'学历/资质证明',      required:true },
      { id:'police',        name:'无犯罪记录证明',     required:true },
      { id:'medical',       name:'体检报告',          required:'conditional' },
      { id:'id_card',       name:'身份证复印件',       required:true },
    ],
    '过境': [
      { id:'passport',      name:'护照原件',         required:true },
      { id:'visa_dest',     name:'目的地国签证',      required:true, note:'如已持有' },
      { id:'ticket',        name:'联程机票',          required:true },
      { id:'application',   name:'过境签证申请表',     required:true },
      { id:'photo',         name:'证件照',           required:true },
    ],
    '探亲访友': [
      { id:'passport',      name:'护照原件',         required:true },
      { id:'photo',         name:'白底证件照',       required:true },
      { id:'application',   name:'签证申请表',        required:true },
      { id:'invitation',    name:'邀请函',           required:true, note:'亲友出具的正式邀请函' },
      { id:'host_docs',     name:'邀请人身份证明',    required:true, note:'邀请人护照/居留许可复印件' },
      { id:'relationship',  name:'关系证明',          required:true },
      { id:'bank',          name:'银行流水',          required:true },
      { id:'insurance',     name:'旅行医疗保险',       required:true },
    ],
    '医疗': [
      { id:'passport',      name:'护照原件',         required:true },
      { id:'photo',         name:'白底证件照',       required:true },
      { id:'application',   name:'签证申请表',        required:true },
      { id:'medical_ref',   name:'医疗转诊证明',      required:true },
      { id:'hospital_app',  name:'医院预约函',        required:true },
      { id:'financial',     name:'财力证明',          required:true },
      { id:'insurance',     name:'医疗保险',          required:true },
    ],
  };

  // ========= 办理流程 =========
  const PROCESS_STEPS = [
    { step:1, title:'准备材料', desc:'根据材料清单准备所有必需文件，注意翻译和公证要求' },
    { step:2, title:'填写申请表', desc:'在线填写签证申请表，如实填写所有信息' },
    { step:3, title:'预约递交', desc:'通过签证中心预约时间，建议提前1-2个月' },
    { step:4, title:'递交材料', desc:'按预约时间前往签证中心递交材料和采集指纹' },
    { step:5, title:'等待审核', desc:'审核期间保持电话畅通，可能接到使领馆电调' },
    { step:6, title:'领取护照', desc:'审核完成后到签证中心领取护照（可邮寄）' },
  ];

  // ========= 热门问答案例 =========
  const FAQ_DATA = [
    { q:'银行流水有什么要求？', a:'建议提供近3-6个月银行流水，余额保持在5万元人民币以上。工行、建行、招行等国内银行的流水均可使用。活期账户流水最佳，定期存款可作为辅助财力证明。' },
    { q:'材料翻译公证怎么做？', a:'非英文材料需翻译成英文或目的国官方语言。可自行翻译后找公证处公证，或通过签证中心的翻译服务办理。公证费约¥100-¥300/份，翻译¥50-¥200/份。' },
    { q:'预约时间要提前多久？', a:'建议提前1-2个月预约。夏季(6-8月)和冬季(12-2月)为旺季，预约名额紧张，建议提前2-3个月。淡季一般提前2-3周即可约到。' },
    { q:'旅行保险买哪家好？', a:'推荐国内保险公司：平安保险全球旅行险(¥80起)、人保财险出境意外险(¥60起)、太平洋境外旅行险(¥70起)、安联保险申根签证专用保险(¥90起)。申根签证要求保额≥3万欧元。' },
    { q:'护照有效期要求？', a:'一般要求护照有效期在回国后仍有6个月以上，至少2页空白签证页。申根要求有效期超过计划离境日期3个月。' },
    { q:'美签好签吗？', a:'美国签证(B1/B2)需要面签，签证官会当面询问。通过率约70-85%，建议准备充分的赴美理由和国内约束力证明。DS-160表如实填写很重要。' },
    { q:'申根签选哪个国家？', a:'行程中停留时间最长的国家作为申请国。如果各国停留时间相近，选择首入国。法国、意大利、西班牙出签较快（10-15天）。第一次申根建议选择法国或意大利。' },
    { q:'英签好签吗？', a:'英国签证需到签证中心录指纹，无需面签。通过率约85-95%。材料完备是关键，尤其银行流水和在职证明。标准审理15个工作日，加急5个工作日。' },
    { q:'签证费用多少？', a:'美签约¥1200-1600，英签¥900-1500，申根€80+服务费≈¥620-900，日本单次¥200，韩国单次¥280，澳洲AUD$150起≈¥700。均不含服务费。' },
    { q:'拒签了怎么办？', a:'分析拒签原因（通常是资金不足/材料不全/移民倾向），补充材料后可重新申请。建议间隔1-3个月再申请。部分国家允许申诉。可咨询VisaPilot代办获取专业建议。' },
    { q:'办理周期多久？', a:'一般5-15个工作日。加急服务：美签加急¥500，英签加急¥300，申根加急¥200。旺季审理时间可能延长50%。' },
    { q:'首次办签流程？', a:'确定目的国→准备材料→填写申请表→预约递交→前往签证中心→采集指纹→等待审核→领取护照。建议至少提前2个月开始准备。' },
    { q:'未成年人签证？', a:'未成年人需父母双方/监护人陪同办理。需提供出生证明、父母同意书(如一方不陪同)、父母身份证件、学校在读证明。部分国家要求公证。' },
    { q:'签证中心在哪里？', a:'主要签证中心分布在北京、上海、广州、成都等大城市。部分国家在沈阳、武汉、深圳、杭州也有签证中心。具体地址可在本平台每个国家详情页查看。' },
    { q:'支付宝/微信支付？', a:'大部分签证中心支持支付宝和微信支付签证费用和服务费。部分仍需要银行转账或现金支付。具体支付方式以签证中心通知为准。' },
    { q:'人工代办多少钱？', a:'VisaPilot提供三种套餐：DIY审核¥100（自行上传材料提交审核）、基础代办¥300（材料核对+填写+翻译+审核）、全程代办¥400（包含线下递交+代取护照+邮寄）。平台抽成30%，签证官按70%结算。' },
    { q:'代做资料怎么收费？', a:'基础代办¥300包含材料核对、填写申请表、翻译、审核四项服务。如只需单独翻译，¥100起。如需代取护照，加¥50。建议直接选择全程代办¥400最划算。' },
    { q:'怎么预约面签？', a:'在本平台选择国家→选择签证类型→下滑到"预约时间"区域→选择签证中心→查看日历选择日期→选择时间段→系统自动生成预约确认。也可通过本平台一键预约。' },
  ];

  // ========= 旅行城市数据 (ITDATA) =========
  const CITY_DATA = {
    fra: {
      name:'法国', flag:'🇫🇷', cities:[
        { name:'巴黎', attractions:['埃菲尔铁塔','卢浮宫','凯旋门','凡尔赛宫','塞纳河游船','巴黎圣母院','蒙马特高地','奥赛博物馆','香榭丽舍大街','老佛爷百货'],
          transport:['地铁单程€2.1','机场快线RER B €11','市内公交€1.9','打车起步€7'],
          hotels:{ economy:{ name:'拉丁区经济酒店', price:'€80-120/晚', area:'拉丁区' }, comfort:{ name:'玛黑区精品酒店', price:'€150-250/晚', area:'玛黑区' } },
          food:['法式蜗牛','鹅肝','马卡龙','可颂面包','红酒炖牛肉'] },
      ]
    },
    ita: {
      name:'意大利', flag:'🇮🇹', cities:[
        { name:'罗马', attractions:['斗兽场','梵蒂冈博物馆','特雷维喷泉','万神殿','西班牙广场','古罗马广场','博尔盖塞美术馆','圣天使堡','真理之口','纳沃纳广场'],
          transport:['地铁单程€1.5','Roma Pass €38','公交€1.5','打车起步€5'],
          hotels:{ economy:{ name:'Termini区经济酒店', price:'€70-100/晚', area:'Termini车站' }, comfort:{ name:'西班牙广场精品酒店', price:'€140-220/晚', area:'西班牙广场' } },
          food:['意面Carbonara','披萨Margherita','提拉米苏','冰淇淋Gelato','意式浓缩咖啡'] },
      ]
    },
    esp: {
      name:'西班牙', flag:'🇪🇸', cities:[
        { name:'马德里', attractions:['普拉多博物馆','马德里王宫','太阳门广场','丽池公园','伯纳乌球场','索菲亚王后艺术中心','马约尔广场','圣米格尔市场','德波神庙','格兰大道'],
          transport:['地铁单程€1.5','10次票€12.2','公交€1.5','打车起步€5'],
          hotels:{ economy:{ name:'太阳门区经济酒店', price:'€60-90/晚', area:'太阳门' }, comfort:{ name:'萨拉曼卡区精品酒店', price:'€130-200/晚', area:'萨拉曼卡' } },
          food:['海鲜饭Paella','西班牙火腿','土豆饼Tortilla','桑格利亚酒','西班牙油条Churros'] },
      ]
    },
    deu: {
      name:'德国', flag:'🇩🇪', cities:[
        { name:'柏林', attractions:['勃兰登堡门','柏林墙','国会大厦','博物馆岛','查理检查站','柏林大教堂','亚历山大广场','夏洛滕堡宫','波茨坦广场','东边画廊'],
          transport:['地铁单程€3.2','日票€8.8','公交€3.2','打车起步€5.5'],
          hotels:{ economy:{ name:'Mitte区经济酒店', price:'€70-100/晚', area:'Mitte区' }, comfort:{ name:'Kreuzberg精品酒店', price:'€120-180/晚', area:'Kreuzberg' } },
          food:['德国猪肘','香肠Bratwurst','啤酒','黑麦面包','苹果卷'] },
      ]
    },
    che: {
      name:'瑞士', flag:'🇨🇭', cities:[
        { name:'苏黎世', attractions:['苏黎世湖','班霍夫大街','苏黎世老城','苏黎世大教堂','瑞士国家博物馆','勒腾车站','林登霍夫山','苏黎世美术馆','苏黎世动物园','FIFA世界足球博物馆'],
          transport:['电车单程CHF4.3','日票CHF8.8','火车SBB','打车起步CHF8'],
          hotels:{ economy:{ name:'车站区经济酒店', price:'CHF100-150/晚', area:'车站区' }, comfort:{ name:'湖滨区精品酒店', price:'CHF200-350/晚', area:'湖滨区' } },
          food:['瑞士奶酪火锅','瑞士巧克力','芝士焗土豆','苏黎世小牛肉','瑞士卷'] },
      ]
    },
    gbr: {
      name:'英国', flag:'🇬🇧', cities:[
        { name:'伦敦', attractions:['大英博物馆','伦敦塔桥','大本钟','白金汉宫','伦敦眼','威斯敏斯特教堂','国家美术馆','海德公园','科文特花园','圣保罗大教堂'],
          transport:['地铁单程£2.5-6','Oyster卡日上限£8.5','公交£1.75','打车起步£3.2'],
          hotels:{ economy:{ name:'南肯辛顿经济酒店', price:'£80-120/晚', area:'南肯辛顿' }, comfort:{ name:'牛津街精品酒店', price:'£180-300/晚', area:'牛津街' } },
          food:['炸鱼薯条','英式早餐','牧羊人派','英式下午茶','牛排腰子派'] },
      ]
    },
    usa: {
      name:'美国', flag:'🇺🇸', cities:[
        { name:'纽约', attractions:['自由女神像','时代广场','中央公园','帝国大厦','大都会博物馆','百老汇','布鲁克林大桥','华尔街','现代艺术博物馆','高线公园'],
          transport:['地铁单程$2.9','周卡$34','公交$2.9','打车起步$3.5'],
          hotels:{ economy:{ name:'中城区经济酒店', price:'$120-180/晚', area:'中城区' }, comfort:{ name:'时代广场精品酒店', price:'$250-450/晚', area:'时代广场' } },
          food:['纽约披萨','百吉饼','热狗','芝士蛋糕','纽约牛排'] },
      ]
    },
    nld: {
      name:'荷兰', flag:'🇳🇱', cities:[
        { name:'阿姆斯特丹', attractions:['梵高博物馆','国立博物馆','运河游船','安妮之家','水坝广场','风车村','喜力体验馆','伦勃朗故居','花卉市场','红灯区'],
          transport:['电车单程€3.2','日票€8.5','公交€3.2','打车起步€5.5'],
          hotels:{ economy:{ name:'车站区经济酒店', price:'€80-120/晚', area:'车站区' }, comfort:{ name:'博物馆区精品酒店', price:'€160-250/晚', area:'博物馆区' } },
          food:['荷兰奶酪','荷兰煎饼','鲱鱼','薯条配蛋黄酱','荷兰松饼'] },
      ]
    },
    jpn: {
      name:'日本', flag:'🇯🇵', cities:[
        { name:'东京', attractions:['浅草寺','东京塔','秋叶原','涩谷十字路口','新宿御苑','迪士尼乐园','上野公园','筑地市场','明治神宫','六本木新城'],
          transport:['地铁单程¥178','Suica卡便捷','日卡¥800','打车起步¥420'],
          hotels:{ economy:{ name:'上野区经济酒店', price:'¥6000-9000/晚', area:'上野' }, comfort:{ name:'新宿区精品酒店', price:'¥15000-25000/晚', area:'新宿' } },
          food:['寿司','拉面','天妇罗','和牛','抹茶甜点'] },
      ]
    },
    kor: {
      name:'韩国', flag:'🇰🇷', cities:[
        { name:'首尔', attractions:['景福宫','明洞','南山塔','北村韩屋村','弘大','江南区','东大门市场','清溪川','乐天世界','梨花女子大学'],
          transport:['地铁单程₩1400','T-money卡','公交₩1200','打车起步₩3800'],
          hotels:{ economy:{ name:'明洞区经济酒店', price:'₩60000-90000/晚', area:'明洞' }, comfort:{ name:'江南区精品酒店', price:'₩150000-250000/晚', area:'江南' } },
          food:['韩式烤肉','拌饭Bibimbap','韩式炸鸡','参鸡汤','辣炒年糕'] },
      ]
    },
    ind: {
      name:'印度', flag:'🇮🇳', cities:[
        { name:'德里', attractions:['红堡','印度门','顾特卜塔','莲花寺','胡马雍陵','贾玛清真寺','阿克萨达姆神庙','国家博物馆','月光集市','洛迪花园'],
          transport:['地铁单程₹30-60','突突车₹100-300','公交₹10-25','打车起步₹100'],
          hotels:{ economy:{ name:'Main Bazaar经济酒店', price:'₹1500-2500/晚', area:'Main Bazaar' }, comfort:{ name:'康诺特广场精品酒店', price:'₹5000-10000/晚', area:'康诺特广场' } },
          food:['黄油鸡','咖喱角','印度烤饼','比尔亚尼饭','印度奶茶'] },
      ]
    },
    aus: {
      name:'澳大利亚', flag:'🇦🇺', cities:[
        { name:'悉尼', attractions:['悉尼歌剧院','海港大桥','邦迪海滩','达令港','悉尼塔','岩石区','塔龙加动物园','皇家植物园','曼利海滩','鱼市场'],
          transport:['轻轨单程A$4-7','Opal卡日上限A$17.8','公交A$2.7','打车起步A$4.5'],
          hotels:{ economy:{ name:'达令港经济酒店', price:'A$120-180/晚', area:'达令港' }, comfort:{ name:'环形码头精品酒店', price:'A$250-400/晚', area:'环形码头' } },
          food:['澳洲牛排','肉派','海鲜拼盘','拉明顿蛋糕','澳式咖啡'] },
      ]
    },
    can: {
      name:'加拿大', flag:'🇨🇦', cities:[
        { name:'温哥华', attractions:['斯坦利公园','格兰维尔岛','卡皮拉诺吊桥','加拿大广场','煤气镇','英吉利湾','范杜森植物园','UBC人类学博物馆','松鸡山','列治文夜市'],
          transport:['SkyTrain单程C$3.1','日卡C$11','公交C$3.1','打车起步C$3.8'],
          hotels:{ economy:{ name:'西区经济酒店', price:'C$100-150/晚', area:'西区' }, comfort:{ name:'洛逊街精品酒店', price:'C$200-350/晚', area:'洛逊街' } },
          food:['加拿大枫糖浆','烟熏三文鱼','普丁','加拿大龙虾','冰酒'] },
      ]
    },
    irl: {
      name:'爱尔兰', flag:'🇮🇪', cities:[
        { name:'都柏林', attractions:['圣三一学院','都柏林城堡','健力士啤酒博物馆','圣帕特里克大教堂','凤凰公园','半便士桥','爱尔兰国家博物馆','坦普尔巴区','都柏林动物园','克罗克公园'],
          transport:['巴士单程€2.5','Leap卡','DART列车','打车起步€5'],
          hotels:{ economy:{ name:'坦普尔巴区经济酒店', price:'€80-120/晚', area:'坦普尔巴' }, comfort:{ name:'格拉夫顿街精品酒店', price:'€160-250/晚', area:'格拉夫顿街' } },
          food:['爱尔兰炖肉','苏打面包','健力士炖牛肉','爱尔兰咖啡','海鲜巧达汤'] },
      ]
    },
    phl: {
      name:'菲律宾', flag:'🇵🇭', cities:[
        { name:'马尼拉', attractions:['黎刹公园','圣地亚哥堡','马尼拉大教堂','SM亚洲购物中心','王城区','国家博物馆','帕拉尼亚克夜市','菲律宾文化中心','马尼拉湾日落','美军公墓'],
          transport:['吉普尼₱12-20','MRT/LRT ₱20-30','Grab出租车起步₱125','公交₱15-25'],
          hotels:{ economy:{ name:'马卡蒂经济酒店', price:'₱1500-2500/晚', area:'马卡蒂' }, comfort:{ name:'BGC精品酒店', price:'₱4000-8000/晚', area:'博尼法西奥全球城' } },
          food:['菲律宾烤乳猪Lechon','阿斗波Adobo','西尼甘酸汤','菲律宾春卷Lumpia','哈罗哈罗刨冰'] },
      ]
    },
  };

  // ========= 保险推荐 =========
  const INSURANCE_PROVIDERS = [
    { name:'安联保险', tag:'申根签证专用', url:'https://www.allianz.com.cn/', icon:'🛡️', color:'#0066cc' },
    { name:'中国人寿', tag:'境外旅行险', url:'https://www.chinalife.com.cn/', icon:'🏛️', color:'#004098' },
    { name:'平安保险', tag:'全球旅行险', url:'https://www.pingan.com/', icon:'💠', color:'#e60012' },
    { name:'人保财险', tag:'出境意外险', url:'https://www.picc.com/', icon:'🔴', color:'#ff3333' },
    { name:'太平洋保险', tag:'境外旅行险', url:'https://www.cpic.com.cn/', icon:'🔵', color:'#0072c6' },
  ];

  // Schengen country info with embassy links
  const SCHENGEN_COUNTRY_INFO = {
    fra: { name:'法国', flag:'\uD83C\uDDEB\uD83C\uDDF7', standalone:true, embassy:'https://www.google.com/search?q=France+embassy+visa+China', city:'Beijing/Shanghai/Guangzhou/Chengdu/Wuhan/Shenyang' },
    ita: { name:'意大利', flag:'\uD83C\uDDEE\uD83C\uDDF9', standalone:true, embassy:'https://www.google.com/search?q=Italy+embassy+visa+China', city:'Beijing/Shanghai/Guangzhou/Chongqing' },
    esp: { name:'西班牙', flag:'\uD83C\uDDEA\uD83C\uDDF8', standalone:true, embassy:'https://www.google.com/search?q=Spain+embassy+visa+China', city:'Beijing/Shanghai/Guangzhou' },
    deu: { name:'德国', flag:'\uD83C\uDDE9\uD83C\uDDEA', standalone:true, embassy:'https://www.google.com/search?q=Germany+embassy+visa+China', city:'Beijing/Shanghai/Guangzhou/Chengdu/Shenyang' },
    che: { name:'瑞士', flag:'\uD83C\uDDE8\uD83C\uDDED', standalone:true, embassy:'https://www.google.com/search?q=Switzerland+embassy+visa+China', city:'Beijing/Shanghai/Guangzhou' },
    nld: { name:'荷兰', flag:'\uD83C\uDDF3\uD83C\uDDF1', standalone:true, embassy:'https://www.google.com/search?q=Netherlands+embassy+visa+China', city:'Beijing/Shanghai/Guangzhou' },
    bel: { name:'比利时', flag:'\uD83C\uDDE7\uD83C\uDDEA', standalone:false, embassy:'https://www.google.com/search?q=Belgium+embassy+visa+China', city:'Beijing/Shanghai/Guangzhou' },
    lux: { name:'卢森堡', flag:'\uD83C\uDDF1\uD83C\uDDFA', standalone:false, embassy:'https://www.google.com/search?q=Luxembourg+embassy+visa+China', city:'Beijing' },
    aut: { name:'奥地利', flag:'\uD83C\uDDE6\uD83C\uDDF9', standalone:false, embassy:'https://www.google.com/search?q=Austria+embassy+visa+China', city:'Beijing/Shanghai' },
    prt: { name:'葡萄牙', flag:'\uD83C\uDDF5\uD83C\uDDF9', standalone:false, embassy:'https://www.google.com/search?q=Portugal+embassy+visa+China', city:'Beijing/Shanghai/Guangzhou' },
    grc: { name:'希腊', flag:'\uD83C\uDDEC\uD83C\uDDF7', standalone:false, embassy:'https://www.google.com/search?q=Greece+embassy+visa+China', city:'Beijing/Shanghai/Guangzhou' },
    swe: { name:'瑞典', flag:'\uD83C\uDDF8\uD83C\uDDEA', standalone:false, embassy:'https://www.google.com/search?q=Sweden+embassy+visa+China', city:'Beijing/Shanghai' },
    dnk: { name:'丹麦', flag:'\uD83C\uDDE9\uD83C\uDDF0', standalone:false, embassy:'https://www.google.com/search?q=Denmark+embassy+visa+China', city:'Beijing/Shanghai/Guangzhou' },
    fin: { name:'芬兰', flag:'\uD83C\uDDEB\uD83C\uDDEE', standalone:false, embassy:'https://www.google.com/search?q=Finland+embassy+visa+China', city:'Beijing/Shanghai' },
    nor: { name:'挪威', flag:'\uD83C\uDDF3\uD83C\uDDF4', standalone:false, embassy:'https://www.google.com/search?q=Norway+embassy+visa+China', city:'Beijing/Shanghai' },
    isl: { name:'冰岛', flag:'\uD83C\uDDEE\uD83C\uDDF8', standalone:false, embassy:'https://www.google.com/search?q=Iceland+embassy+visa+China', city:'Beijing/Shanghai' },
    cze: { name:'捷克', flag:'\uD83C\uDDE8\uD83C\uDDFF', standalone:false, embassy:'https://www.google.com/search?q=Czech+embassy+visa+China', city:'Beijing/Shanghai' },
    hun: { name:'匈牙利', flag:'\uD83C\uDDED\uD83C\uDDFA', standalone:false, embassy:'https://www.google.com/search?q=Hungary+embassy+visa+China', city:'Beijing/Shanghai/Chongqing' },
    pol: { name:'波兰', flag:'\uD83C\uDDF5\uD83C\uDDF1', standalone:false, embassy:'https://www.google.com/search?q=Poland+embassy+visa+China', city:'Beijing/Shanghai/Guangzhou' },
    svk: { name:'斯洛伐克', flag:'\uD83C\uDDF8\uD83C\uDDF0', standalone:false, embassy:'https://www.google.com/search?q=Slovakia+embassy+visa+China', city:'Beijing' },
    svn: { name:'斯洛文尼亚', flag:'\uD83C\uDDF8\uD83C\uDDEE', standalone:false, embassy:'https://www.google.com/search?q=Slovenia+embassy+visa+China', city:'Beijing' },
    hrv: { name:'克罗地亚', flag:'\uD83C\uDDED\uD83C\uDDF7', standalone:false, embassy:'https://www.google.com/search?q=Croatia+embassy+visa+China', city:'Beijing/Shanghai' },
    est: { name:'爱沙尼亚', flag:'\uD83C\uDDEA\uD83C\uDDEA', standalone:false, embassy:'https://www.google.com/search?q=Estonia+embassy+visa+China', city:'Beijing/Shanghai' },
    lva: { name:'拉脱维亚', flag:'\uD83C\uDDF1\uD83C\uDDFB', standalone:false, embassy:'https://www.google.com/search?q=Latvia+embassy+visa+China', city:'Beijing' },
    ltu: { name:'立陶宛', flag:'\uD83C\uDDF1\uD83C\uDDF9', standalone:false, embassy:'https://www.google.com/search?q=Lithuania+embassy+visa+China', city:'Beijing' },
    mlt: { name:'马耳他', flag:'\uD83C\uDDF2\uD83C\uDDF9', standalone:false, embassy:'https://www.google.com/search?q=Malta+embassy+visa+China', city:'Beijing/Shanghai' },
    lie: { name:'列支敦士登', flag:'\uD83C\uDDF1\uD83C\uDDEE', standalone:false, embassy:'https://www.google.com/search?q=Liechtenstein+visa+Switzerland+embassy', city:'Swiss embassy in Beijing' },
    bgr: { name:'保加利亚', flag:'\uD83C\uDDE7\uD83C\uDDEC', standalone:false, embassy:'https://www.google.com/search?q=Bulgaria+embassy+visa+China', city:'Beijing/Shanghai' },
    rou: { name:'罗马尼亚', flag:'\uD83C\uDDF7\uD83C\uDDF4', standalone:false, embassy:'https://www.google.com/search?q=Romania+embassy+visa+China', city:'Beijing/Shanghai' },
  };

  return {
    COUNTRIES,
    VISA_TYPES_BASE,
    VISA_CONFIG,
    SCHENGEN_COUNTRIES,
    SCHENGEN_COUNTRY_INFO,
    MATERIAL_TEMPLATES,
    PROCESS_STEPS,
    FAQ_DATA,
    CITY_DATA,
    INSURANCE_PROVIDERS,
  };
})();
