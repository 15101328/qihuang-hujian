/* ========================================
   岐黄慧鉴 - 中医体质辨识与养生参考 Web应用
   核心逻辑：国标量表计分 + 规则加权匹配
   ======================================== */

/* ============ 数据定义 ============ */

// 体质类型定义
const C = {
    P: ['平和质', '阴阳气血调和'],
    Q: ['气虚质', '元气不足易疲乏'],
    Y: ['阳虚质', '阳气不足怕寒冷'],
    N: ['阴虚质', '阴液亏少易燥热'],
    T: ['痰湿质', '痰湿凝聚体胖黏'],
    H: ['湿热质', '湿热内蕴口黏腻'],
    X: ['血瘀质', '血行不畅多瘀滞'],
    G: ['气郁质', '气机郁滞情志不畅'],
    B: ['特禀质', '先天特异易过敏']
};

// 体质调理建议
const CD = {
    P: {
        y: '饮食多样、谷薯蔬果肉蛋奶均衡，定时定量',
        j: '少食过冷过热、过度油腻',
        l: '作息规律，每周3-5次中等强度运动（快走、太极、八段锦）',
        e: '保持心情舒畅，定期体检'
    },
    Q: {
        y: '山药、大枣、小米、南瓜、香菇、莲子、黄芪、党参（药食同源目录内）',
        j: '生冷瓜果、大量萝卜、浓茶',
        l: '避免过劳与久站久坐，宜缓和运动如八段锦、慢走',
        e: '减少过度思虑，保证午休'
    },
    Y: {
        y: '生姜、干姜、肉桂、花椒、核桃仁、桂圆、枸杞子、羊肉汤（普通食材）',
        j: '冰饮冷食、苦瓜、绿豆、生鱼片',
        l: '注意腰腹与足部保暖，睡前热水泡脚，避免熬夜',
        e: '多晒太阳，适度活动以助阳气'
    },
    N: {
        y: '枸杞子、桑椹、黑芝麻、银耳、百合、铁皮石斛、蜂蜜、雪梨',
        j: '辛辣煎炸、羊肉狗肉、烟酒、过量咖啡',
        l: '避免熬夜（23点前入睡），节制房事，宜静养类运动',
        e: '保持环境湿润，避免久处干燥环境'
    },
    T: {
        y: '薏苡仁、赤小豆、茯苓、白扁豆、陈皮、荷叶、冬瓜、白萝卜',
        j: '甜腻点心、油炸食品、奶油、酒精',
        l: '增加有氧运动出汗，控制体重，避免久坐',
        e: '保持环境通风干燥'
    },
    H: {
        y: '薏苡仁、赤小豆、蒲公英、淡竹叶、鱼腥草、绿豆、马齿苋',
        j: '烧烤辛辣、酒类、动物内脏、甜腻食物',
        l: '规律运动排汗，注意个人卫生与皮肤清洁',
        e: '情绪平稳，避免熬夜加重内热'
    },
    X: {
        y: '山楂、桃仁、玫瑰花（重瓣红玫瑰）、黑木耳、醋、洋葱',
        j: '高脂饮食、寒凉收涩之品、烟酒',
        l: '避免久坐久卧，适度活动促进循环，戒烟',
        e: '保持情绪舒畅，气行则血行'
    },
    G: {
        y: '佛手、香橼、陈皮、山楂、玫瑰花、薄荷、佛手瓜',
        j: '过量咖啡浓茶、酒精',
        l: '规律作息，培养兴趣爱好，通过运动与倾诉疏泄情绪',
        e: '多与亲友交流，避免长期独处压抑'
    },
    B: {
        y: '山药、大枣、蜂蜜（少量）、乌梅、枸杞子，饮食清淡易消化',
        j: '明确过敏原（如海鲜、坚果、芒果等）严格回避；慎食发物',
        l: '室内定期除螨除尘，换季注意防护，外出可戴口罩',
        e: '随身携带医生开具的抗过敏药物，定期随访'
    }
};

// 体质测评题目 [编号, 体质key, 题干, 是否反向计分]
const Q = [
    [1, 'P', '您精力充沛吗？', 0],
    [2, 'P', '您能适应外界寒热气候的变化吗？', 0],
    [3, 'P', '您睡眠良好、醒来精神吗？', 0],
    [4, 'Q', '您容易疲乏、精神不振吗？', 0],
    [5, 'Q', '您容易气短（说话费力、接不上气）吗？', 0],
    [6, 'Q', '您稍微活动就出汗（自汗）吗？', 0],
    [7, 'Y', '您比别人更怕冷吗？', 0],
    [8, 'Y', '您手脚经常发凉吗？', 0],
    [9, 'Y', '您喜欢热饮、吃凉的就胃部不适吗？', 0],
    [10, 'N', '您手心脚心发热吗？', 0],
    [11, 'N', '您口干燥、总想喝水吗？', 0],
    [12, 'N', '您皮肤或口唇偏干燥吗？', 0],
    [13, 'T', '您腹部肥满松软吗？', 0],
    [14, 'T', '您面部油脂分泌较多吗？', 0],
    [15, 'T', '您常感胸闷或痰多吗？', 0],
    [16, 'H', '您口苦、口臭吗？', 0],
    [17, 'H', '您大便黏滞不爽、容易粘马桶吗？', 0],
    [18, 'H', '您面部或鼻部油腻、易生痤疮吗？', 0],
    [19, 'X', '您面色偏晦暗或有色素沉着吗？', 0],
    [20, 'X', '您身上有固定部位的疼痛吗？', 0],
    [21, 'X', '您无明显原因出现瘀斑或瘀点吗？', 0],
    [22, 'G', '您情绪低落、容易烦恼吗？', 0],
    [23, 'G', '您容易紧张焦虑吗？', 0],
    [24, 'G', '您多愁善感、容易受惊吓吗？', 0],
    [25, 'B', '您容易患过敏性鼻炎、哮喘或荨麻疹吗？', 0],
    [26, 'B', '您容易对药物、食物、花粉、气味过敏吗？', 0],
    [27, 'B', '※您有遗传性疾病或明显家族遗传倾向吗？', 0]
];

// 选项标签
const LBL = {1: '没有', 2: '偶尔', 3: '经常', 4: '多数时候', 5: '总是'};

// 症状标签映射
const SYM = {
    fa: '疲乏无力', qd: '气短懒言', wh: '畏寒怕冷', sz: '手足不温',
    fr: '发热', ef: '怕风', zh: '动则出汗', dh: '夜间盗汗',
    ch: '午后潮热', wx: '手足心发热', xt: '形体肥胖', xs: '形体消瘦',
    mb: '面色苍白', mh: '面色晦暗', mr: '面红目赤', jg: '皮肤干燥',
    fz: '眼睑或下肢浮肿', yun: '头晕', tt: '头痛', tz: '头重如裹',
    em: '耳鸣', tl: '听力减退', mg: '眼干涩', sm: '视物模糊',
    bs: '鼻塞', lq: '流清鼻涕', lh: '流黄鼻涕', yg: '咽干',
    yt: '咽痛', kk: '口苦', kg: '口干', ko: '口臭', kd: '口淡无味',
    tf: '脱发明显', xj: '心悸', xm: '胸闷', ks: '咳嗽',
    tk: '痰白清稀', th: '痰黄黏稠', qc: '气促喘憋', td: '痰多',
    sl: '失眠', dm: '多梦易醒', rs: '入睡困难',
    sy: '食欲减退', fz2: '食后腹胀', wz: '胃脘胀痛', wr: '胃中灼热',
    ee: '恶心', ot: '呕吐', aq: '频繁嗳气', db: '大便稀溏',
    dg: '大便干结', dn: '大便黏滞不爽', fx: '腹泻', bm: '便秘',
    al: '腹部冷痛', xw: '喜温喜按',
    xq: '小便清长', xh: '小便短黄', yy: '夜尿频繁', yx: '腰膝酸软',
    xy: '性欲减退', yj: '月经不调', tj: '痛经', bd: '白带量多',
    jt: '关节疼痛', jb: '肢体屈伸不利', js: '肌肉酸痛',
    mb2: '肢体麻木', cj: '小腿抽筋', gd: '固定部位刺痛',
    yb: '皮肤瘀斑瘀点',
    qd2: '情绪低落', fn: '烦躁易怒', jl: '焦虑紧张', jw: '健忘',
    s1: '舌淡胖有齿痕', s2: '舌红少苔', s3: '舌苔白腻',
    s4: '舌苔黄腻', s5: '舌质紫暗或有瘀点', s6: '舌淡苔白'
};

// 症状分组
const GRP = [
    ['全身与寒热', ['fa','qd','wh','sz','fr','ef','zh','dh','ch','wx','xt','xs','mb','mh','mr','jg','fz']],
    ['头面与五官', ['yun','tt','tz','em','tl','mg','sm','bs','lq','lh','yg','yt','kk','kg','ko','kd','tf']],
    ['心肺与睡眠', ['xj','xm','ks','tk','th','qc','td','sl','dm','rs']],
    ['消化与二便', ['sy','fz2','wz','wr','ee','ot','aq','db','dg','dn','fx','bm','al','xw']],
    ['泌尿与生殖', ['xq','xh','yy','yx','xy','yj','tj','bd']],
    ['肢体与经络', ['jt','jb','js','mb2','cj','gd','yb']],
    ['情志与记忆', ['qd2','fn','jl','jw']],
    ['舌象（可选）', ['s1','s2','s3','s4','s5','s6']]
];

// 危险信号
const RF = [
    ['胸痛剧烈或有压榨感', '可能为心源性疾病，请立即急诊'],
    ['咯血或咳血', '需尽快呼吸科就诊'],
    ['意识模糊、抽搐', '立即拨打120'],
    ['持续高热超过3天', '需查明感染等病因'],
    ['突发剧烈头痛伴呕吐', '警惕脑血管事件'],
    ['一侧肢体无力、口角歪斜、言语不清', '警惕脑卒中，立即急诊'],
    ['安静状态下呼吸困难', '需急诊评估'],
    ['呕血或黑色柏油样便', '警惕上消化道出血'],
    ['不明原因明显消瘦', '需完善检查排除器质性疾病'],
    ['剧烈腹痛持续不缓解', '需急诊排除急腹症']
];

// 证候规则
const SYND = [
    {n:'脾气虚证', m:['fa','sy'], s:[['qd',3],['fz2',3],['db',3],['mb',2],['jw',1],['zh',2],['xm',1],['s1',3],['s6',2]],
     f:'山药、大枣、小米、南瓜、莲子、芡实、黄芪、党参', a:'生冷瓜果、油腻甜食、浓茶', l:'三餐规律、细嚼慢咽，餐后缓行，避免过劳与久坐'},
    {n:'脾阳虚证（中焦虚寒）', m:['al'], s:[['wh',3],['sz',3],['db',3],['xw',3],['fz2',2],['kd',2],['fa',2],['s1',3],['s3',2]],
     f:'生姜、干姜、肉桂、花椒、山药、大枣、桂圆', a:'冰饮冷食、苦瓜、绿豆、生鱼片', l:'注意腹部保暖，可请专业人员指导艾灸中脘、足三里'},
    {n:'肾阳虚证', m:['yx'], s:[['wh',3],['sz',3],['yy',3],['xq',2],['xy',2],['fa',2],['mh',1],['cj',1],['tj',1],['s1',2]],
     f:'核桃仁、黑芝麻、枸杞子、肉苁蓉、杜仲叶、桂圆', a:'生冷寒凉、过量咖啡浓茶', l:'腰腹足部保暖，早睡，适度运动，避免久坐劳累'},
    {n:'肾阴虚证', m:['wx'], s:[['ch',3],['kg',3],['dh',3],['yg',2],['jg',2],['em',2],['yx',2],['sl',2],['s2',3]],
     f:'枸杞子、桑椹、黑芝麻、银耳、铁皮石斛、蜂蜜', a:'辛辣煎炸、羊肉狗肉、烟酒', l:'避免熬夜，节制房事，宜静养类运动，环境保湿'},
    {n:'肝郁气滞证', m:['qd2'], s:[['xm',3],['aq',3],['jl',3],['tt',2],['sy',2],['fz2',2],['fn',2],['sl',2],['tj',2],['yj',2]],
     f:'佛手、香橼、陈皮、山楂、玫瑰花、薄荷', a:'过量咖啡浓茶、酒精', l:'规律作息，培养兴趣爱好，通过运动与交流疏泄情绪'},
    {n:'肝火上炎证', m:['fn'], s:[['mr',3],['kk',3],['tt',3],['yt',2],['em',2],['ko',2],['dg',2],['xh',2],['cj',1],['s4',2]],
     f:'菊花、决明子、淡竹叶、蒲公英、绿豆', a:'辛辣油炸、酒类、羊肉', l:'避免情绪激动，保证睡眠，减少用眼与熬夜'},
    {n:'痰湿内阻证', m:['xt'], s:[['tz',3],['td',3],['fz2',2],['fa',2],['xm',2],['ko',1],['mb2',1],['s3',3]],
     f:'薏苡仁、赤小豆、茯苓、白扁豆、陈皮、荷叶、冬瓜', a:'甜腻点心、油炸食品、奶油、酒精', l:'增加有氧运动，控制体重，避免久坐，环境通风干燥'},
    {n:'湿热内蕴证', m:['dn','kk'], s:[['ko',3],['mr',2],['yt',2],['xh',2],['tf',1],['s4',3],['bm',1]],
     f:'薏苡仁、赤小豆、蒲公英、淡竹叶、鱼腥草、绿豆', a:'烧烤辛辣、酒类、动物内脏、甜腻食物', l:'规律运动排汗，注意皮肤与个人卫生，避免熬夜'},
    {n:'血瘀内阻证', m:['gd'], s:[['mh',3],['yb',3],['tt',2],['mb2',2],['tj',2],['yj',2],['xm',1],['s5',3]],
     f:'山楂、桃仁、玫瑰花、黑木耳、醋', a:'高脂饮食、寒凉收涩之品、烟酒', l:'避免久坐久卧，适度活动促进循环，戒烟'},
    {n:'气血两虚证', m:['fa','mb'], s:[['qd',3],['xj',3],['yun',3],['jw',2],['sl',2],['mg',2],['sy',2],['xs',1],['s1',2]],
     f:'大枣、桂圆、山药、阿胶、当归、枸杞子', a:'生冷食物、餐时浓茶（影响铁吸收）', l:'循序渐进运动，避免过劳，保证充足睡眠'},
    {n:'肺阴虚证（燥）', m:['yg'], s:[['ks',3],['kg',3],['jg',2],['dh',2],['tf',1],['ch',1],['s2',2]],
     f:'银耳、百合、桑椹、蜂蜜、雪梨、铁皮石斛', a:'辛辣燥热、烟酒、油炸食品', l:'保持室内湿度，避免粉尘与吸烟，减少用嗓'},
    {n:'心脾两虚证', m:['xj'], s:[['sl',3],['dm',3],['jw',3],['fa',2],['qd',2],['yun',2],['sy',2],['s1',2]],
     f:'大枣、桂圆、莲子、山药、酸枣仁、茯苓', a:'浓茶咖啡、睡前饮酒', l:'固定作息，睡前1小时减少屏幕使用'},
    {n:'风寒束表证（外感风寒）', m:['ef'], s:[['fr',2],['wh',3],['tt',3],['js',2],['bs',3],['lq',3],['tk',2],['s6',2]],
     f:'生姜、葱白、紫苏、陈皮、红糖水', a:'生冷瓜果、油腻', l:'注意保暖，多休息，多饮温水'},
    {n:'风热犯表证（外感风热）', m:['yt'], s:[['fr',3],['lh',3],['ks',2],['th',2],['kg',2],['tt',2],['mr',1]],
     f:'菊花、薄荷、桑叶、金银花、芦根', a:'辛辣煎炸、羊肉、酒类', l:'多饮温水，充分休息，避免再次受凉'},
    {n:'食滞胃脘证', m:['fz2'], s:[['sy',3],['aq',3],['ko',3],['ee',2],['ot',2],['dg',2],['wz',2],['s3',2]],
     f:'山楂、麦芽、鸡内金、陈皮、白萝卜', a:'油腻食物、夜宵、过量零食', l:'定时定量，晚餐宜早宜少，餐后散步'}
];

/* ============ 工具函数 ============ */
function esc(s) {
    return s.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
}

/* ============ 页面导航 ============ */
function go(v) {
    document.querySelectorAll('main>section').forEach(s => {
        s.style.display = (s.id === 'v-' + v) ? 'block' : 'none';
    });
    document.querySelectorAll('nav button').forEach(b => {
        b.classList.toggle('on', b.dataset.v === v);
    });
    window.scrollTo({top: 0, behavior: 'smooth'});
}

/* ============ 渲染体质测评题目 ============ */
function renderQ() {
    const container = document.getElementById('qlist');
    container.innerHTML = Q.map((q, i) => {
        return `<div class="q">
            <div class="qt">${i+1}. ${q[2]}</div>
            <div class="op">
                ${[1,2,3,4,5].map(n => 
                    `<label><input type="radio" name="q${q[0]}" value="${n}"><span>${LBL[n]}</span></label>`
                ).join('')}
            </div>
        </div>`;
    }).join('');
}

/* ============ 渲染症状标签 ============ */
function renderSym() {
    // 危险信号
    const rfContainer = document.getElementById('rfbox');
    rfContainer.innerHTML = RF.map((r, i) => 
        `<span class="tag danger" data-idx="${i}" onclick="tg(this,'rf')">${r[0]}</span>`
    ).join('');
    
    // 症状分组
    const symContainer = document.getElementById('symbox');
    symContainer.innerHTML = GRP.map(g => {
        return `<div class="grp">
            <b>${g[0]}</b>
            ${g[1].map(k => 
                `<span class="tag" data-k="${k}" onclick="tg(this,'sy')">${SYM[k]}</span>`
            ).join('')}
        </div>`;
    }).join('');
}

/* ============ 标签切换 ============ */
function tg(el, group) {
    el.classList.toggle('on');
}

/* ============ 计算体质辨识结果 ============ */
function calcCons() {
    // 收集答案
    const raw = {};
    Object.keys(C).forEach(k => raw[k] = 0);
    let miss = 0;
    
    Q.forEach(q => {
        const v = document.querySelector(`input[name="q${q[0]}"]:checked`);
        if (!v) { miss++; return; }
        let n = +v.value;
        // 反向计分处理（如果有标记）
        if (q[3]) n = 6 - n;
        raw[q[1]] += n;
    });
    
    if (miss > 0) {
        alert('还有 ' + miss + ' 题未作答，请完成全部条目后再提交。');
        return;
    }
    
    // 计算转化分
    // 公式：转化分 = [(原始分 - 条目数) / (条目数 x 4)] x 100
    const tr = {};
    Object.keys(raw).forEach(k => {
        let itemCount, rawScore;
        if (k === 'P') {
            itemCount = 3; rawScore = raw.P;
        } else {
            itemCount = 4; rawScore = raw[k];
        }
        tr[k] = Math.round(((rawScore - itemCount) / (itemCount * 4)) * 100);
    });
    
    // 判定结果
    const res = {};
    Object.keys(C).forEach(k => {
        if (k === 'P') {
            const others = Object.keys(tr).filter(x => x !== 'P');
            const allLow = others.every(x => tr[x] < 30);
            const allLow2 = others.every(x => tr[x] < 40);
            res[k] = (tr.P >= 60 && allLow) ? '是' : (tr.P >= 60 && allLow2 ? '基本是' : '否');
        } else {
            res[k] = (tr[k] >= 40) ? '是' : (tr[k] >= 30 ? '倾向是' : '否');
        }
    });
    
    // 确定主导体质
    let main = '平和质', ms = -1;
    Object.keys(tr).forEach(k => {
        if (k !== 'P' && (res[k] === '是' || res[k] === '倾向是') && tr[k] > ms) {
            ms = tr[k];
            main = C[k][0];
        }
    });
    if (res.P === '是' || res.P === '基本是') main = '平和质';
    
    // 生成结果HTML
    let h = `<div class="card">
        <h2>体质辨识结果</h2>
        <p>主导体质：<b style="color:var(--primary);font-size:20px">${main}</b></p>
        <hr style="border:none;border-top:1px solid var(--border);margin:12px 0">`;
    
    // 各体质得分
    Object.keys(C).forEach(k => {
        h += `<div class="bar-wrap">
            <div class="bar-label">
                <span>${C[k][0]}（${C[k][1]}）</span>
                <span>转化分 ${tr[k]} · ${res[k]}</span>
            </div>
            <div class="bar"><i style="width:${Math.max(2, tr[k])}%"></i></div>
        </div>`;
    });
    
    // 调理建议
    const key = Object.keys(C).find(k => C[k][0] === main) || 'P';
    const d = CD[key];
    h += `<h3>调理建议</h3>
        <p><b>宜食：</b>${d.y}</p>
        <p><b>忌食：</b>${d.j}</p>
        <p><b>起居：</b>${d.l}</p>
        <p><b>情志：</b>${d.e}</p>
        <div class="tip" style="margin-top:12px">
            <b>说明：</b>转化分 >= 40 判为"是"，30-39 为"倾向是"。体质可随年龄、季节与生活方式变化，建议每6-12个月复测。本结果不构成医学诊断，仅供参考。
        </div>
        <div class="noprint" style="margin-top:12px">
            <button class="btn" onclick="window.print()">打印 / 保存PDF</button>
        </div>
    </div>`;
    
    document.getElementById('out1').innerHTML = h;
    save('体质辨识', main, h);
}

/* ============ 计算证候倾向结果 ============ */
function calcSynd() {
    // 检查危险信号
    const rfTags = document.querySelectorAll('#rfbox .tag.on');
    const rfHits = [];
    rfTags.forEach(el => {
        const idx = parseInt(el.dataset.idx);
        rfHits.push(RF[idx]);
    });
    
    let h = '';
    
    // 如果有危险信号，优先提示就医
    if (rfHits.length > 0) {
        h += `<div class="card">
            <h2>请优先就医</h2>
            <div class="warn">您勾选了以下需要尽快医疗评估的情况：
                <ul style="margin-top:8px;padding-left:20px">
                    ${rfHits.map(r => `<li><b>${r[0]}</b> -- ${r[1]}</li>`).join('')}
                </ul>
                请立即前往医院就诊，紧急情况拨打120。本系统不再提供养生建议，以免延误病情。
            </div>
        </div>`;
        document.getElementById('out2').innerHTML = h;
        save('症状自查', '触发危险信号-请就医', h);
        return;
    }
    
    // 收集勾选的症状
    const symTags = document.querySelectorAll('#symbox .tag.on');
    const keys = [];
    symTags.forEach(el => keys.push(el.dataset.k));
    
    // 症状太少不给出结果
    if (keys.length < 4) {
        document.getElementById('out2').innerHTML = 
            `<div class="card"><h2>信息不足</h2>
            <p>您勾选的症状较少（${keys.length} 项），不足以给出可靠参考。建议补充勾选更多症状，或直接到中医科面诊（望闻问切四诊合参更准确）。</p>
            </div>`;
        return;
    }
    
    // 计算各证候得分
    const rs = SYND.map(s => {
        // 检查主症
        const hitM = s.m.filter(k => keys.includes(k)).length;
        // 计算次症得分
        let hit = 0, tot = 0;
        s.s.forEach(x => {
            tot += x[1];
            if (keys.includes(x[0])) hit += x[1];
        });
        const sc = tot ? Math.round(hit / tot * 100) : 0;
        
        return {
            n: s.n,
            ok: hitM > 0,
            sc: sc,
            det: s.s.filter(x => keys.includes(x[0])).map(x => SYM[x[0]] + '(' + x[1] + ')'),
            f: s.f, a: s.a, l: s.l
        };
    })
    .filter(r => r.ok)
    .sort((a, b) => b.sc - a.sc)
    .slice(0, 3);
    
    if (!rs.length) {
        h = `<div class="card"><h2>未匹配到常见证候</h2>
            <p>您勾选的表现未构成某一常见证候的典型组合。这不代表没有问题，建议到中医科面诊，由医师四诊合参判断。</p>
        </div>`;
    } else {
        h = `<div class="card">
            <h2>证候倾向参考（按匹配度排序）</h2>`;
        
        rs.forEach((r, i) => {
            const cf = r.sc >= 60 ? '较高' : (r.sc >= 40 ? '中等' : '偏低');
            h += `<div class="result-item">
                <span class="score">${r.sc}分</span>
                <h4>${i+1}. ${r.n} <small style="font-weight:normal;color:var(--text-light)">（置信度：${cf}）</small></h4>
                <p><b>判定依据：</b>${r.det.join('、')}</p>
                <p><b>宜食：</b>${r.f}</p>
                <p><b>慎食：</b>${r.a}</p>
                <p><b>起居：</b>${r.l}</p>
            </div>`;
        });
        
        h += `<div class="tip" style="margin-top:16px">
            <b>如何理解这个结果：</b>本结果为"规则加权匹配"，即根据您勾选的症状与中医常见证候要素的重合程度计算，<b>不是诊断</b>。中医强调四诊合参，舌象、脉象、面色等需医师现场判断。若症状持续超过2周或加重，请及时就医。
        </div>
        <div class="noprint" style="margin-top:12px">
            <button class="btn" onclick="window.print()">打印 / 保存PDF</button>
        </div>
        </div>`;
    }
    
    document.getElementById('out2').innerHTML = h;
    save('症状自查', rs.length ? rs[0].n : '未匹配', h);
}

/* ============ 保存到历史记录 ============ */
function save(type, sub, html) {
    const a = JSON.parse(localStorage.getItem('qhhj_hist') || '[]');
    a.unshift({
        type: type,
        sub: sub,
        html: html,
        date: new Date().toLocaleString('zh-CN', {year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})
    });
    // 最多保留20条
    localStorage.setItem('qhhj_hist', JSON.stringify(a.slice(0, 20)));
    renderHist();
}

/* ============ 渲染历史记录 ============ */
function renderHist() {
    const a = JSON.parse(localStorage.getItem('qhhj_hist') || '[]');
    const container = document.getElementById('hlist');
    
    if (!a.length) {
        container.innerHTML = '<p class="small" style="color:var(--text-light)">暂无记录</p>';
        return;
    }
    
    container.innerHTML = a.map((x, i) => 
        `<div class="hist-item">
            <div class="info">
                <b>${x.type} - ${x.sub}</b>
                <span>${x.date}</span>
            </div>
            <button class="btn sec" style="padding:4px 12px;font-size:13px" onclick="viewHist(${i})">查看</button>
        </div>`
    ).join('');
}

/* ============ 查看历史记录 ============ */
function viewHist(idx) {
    const a = JSON.parse(localStorage.getItem('qhhj_hist') || '[]');
    if (a[idx]) {
        go('cons');
        // 延迟等待DOM渲染
        setTimeout(() => {
            document.getElementById('out1').innerHTML = a[idx].html;
        }, 100);
    }
}

/* ============ 初始化 ============ */
document.addEventListener('DOMContentLoaded', function() {
    renderQ();
    renderSym();
    renderHist();
    
    // 检查是否已同意免责声明
    if (localStorage.getItem('qhhj_agree')) {
        document.getElementById('mask').style.display = 'none';
    }
});

/* ============ 同意免责声明 ============ */
function agreeMask() {
    document.getElementById('mask').style.display = 'none';
    localStorage.setItem('qhhj_agree', '1');
}

/* ============ 清空历史记录 ============ */
function clearHist() {
    if (confirm('确定要清空所有历史记录吗？此操作不可撤销。')) {
        localStorage.removeItem('qhhj_hist');
        renderHist();
    }
}
