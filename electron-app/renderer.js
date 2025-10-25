document.addEventListener('DOMContentLoaded', () => {
  // 解析數值工具：空值或無效值視為 0
  const num = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  };

  // 對應中文屬性到鍵名（包含英文鍵以兼容管理分頁資料）
  const statKeyMap = {
    '生命': 'health',
    '攻擊': 'attack',
    '防禦': 'defense',
    '速度': 'speed',
    // 兼容英文鍵
    'health': 'health',
    'attack': 'attack',
    'defense': 'defense',
    'speed': 'speed',
  };

  // 初始化增加/刪除次屬性按鈕
  function initEquipmentUI() {
    document.querySelectorAll('.equipment-slot').forEach(slot => {
      const addBtn = slot.querySelector('.add-sub-stat-btn');
      const subWrap = slot.querySelector('.sub-stats');
      const updateAddBtn = () => {
        const count = slot.querySelectorAll('.sub-stat-container').length;
        if (addBtn) addBtn.disabled = count >= 4;
      };
      const bindDelete = (container) => {
        const btn = container.querySelector('.delete-sub-stat');
        if (btn) {
          btn.addEventListener('click', () => {
            container.remove();
            updateAddBtn();
          });
        }
      };
      if (addBtn) {
        addBtn.addEventListener('click', () => {
          const count = slot.querySelectorAll('.sub-stat-container').length;
          if (count >= 4) { updateAddBtn(); return; }
          const container = document.createElement('div');
          container.className = 'sub-stat-container';
          container.innerHTML = `
            <select class="sub-stat-type">
              <option value="">選擇屬性</option>
              <option value="health-percent">生命加成</option>
              <option value="health">生命</option>
              <option value="attack-percent">攻擊加成</option>
              <option value="attack">攻擊</option>
              <option value="defense-percent">防禦加成</option>
              <option value="defense">防禦</option>
              <option value="speed">速度</option>
              <option value="crit-rate">暴擊率</option>
              <option value="crit-damage">暴擊傷害</option>
              <option value="effect-hit">效果命中</option>
              <option value="effect-resist">效果抵抗</option>
            </select>
            <input type="number" class="sub-stat-value" min="0" value="0">
            <button class="delete-sub-stat">X</button>
          `;
          subWrap?.appendChild(container);
          bindDelete(container);
          updateAddBtn();
        });
      }
      // 綁定現有刪除按鈕並初始化按鈕狀態
      slot.querySelectorAll('.sub-stat-container').forEach(bindDelete);
      updateAddBtn();
    });
  }

  function bindDelete(container) {
    const btn = container.querySelector('.delete-sub-stat');
    if (btn) {
      btn.addEventListener('click', () => {
        container.remove();
      });
    }
  }

  // 核心計算：彙總所有輸入與裝備數值
  function computeTotals() {
    const totals = {
      health: 0,
      attack: 0,
      defense: 0,
      speed: 0,
      critRate: 0,
      critDamage: 0,
      effectHit: 0,
      effectResist: 0,
    };

    // 基本屬性
    totals.health += num(document.getElementById('health')?.value || 0);
    totals.attack += num(document.getElementById('attack')?.value || 0);
    totals.defense += num(document.getElementById('defense')?.value || 0);
    totals.speed += num(document.getElementById('speed')?.value || 0);

    // 進階屬性（百分比直接相加顯示）
    totals.critRate += num(document.getElementById('crit-rate')?.value || 0);
    totals.critDamage += num(document.getElementById('crit-damage')?.value || 0);
    totals.effectHit += num(document.getElementById('effect-hit')?.value || 0);
    totals.effectResist += num(document.getElementById('effect-resist')?.value || 0);

    // 裝備主屬性與次屬性
    document.querySelectorAll('.equipment-slot').forEach(slot => {
      const mainStatType = slot.dataset.mainStat; // 例如 '攻擊'
      const mainVal = num(slot.querySelector('.main-stat-value')?.value || 0);
      const key = statKeyMap[mainStatType];
      if (key) totals[key] += mainVal;

      slot.querySelectorAll('.sub-stat-container').forEach(sub => {
        const type = sub.querySelector('.sub-stat-type')?.value || '';
        const value = num(sub.querySelector('.sub-stat-value')?.value || 0);
        switch (type) {
          case 'health':
            totals.health += value; break;
          case 'attack':
            totals.attack += value; break;
          case 'defense':
            totals.defense += value; break;
          case 'speed':
            totals.speed += value; break;
          case 'health-percent':
            // 簡化：百分比直接顯示在進階屬性，不轉換為實際數值
            // 若需要套用到生命，後續可改為 totals.health += totals.health * value / 100
            break;
          case 'attack-percent':
            break;
          case 'defense-percent':
            break;
          case 'crit-rate':
            totals.critRate += value; break;
          case 'crit-damage':
            totals.critDamage += value; break;
          case 'effect-hit':
            totals.effectHit += value; break;
          case 'effect-resist':
            totals.effectResist += value; break;
          default:
            break;
        }
      });
    });

    // 寵物基礎屬性
    totals.health += num(document.getElementById('pet-health')?.value || 0);
    totals.attack += num(document.getElementById('pet-attack')?.value || 0);
    totals.defense += num(document.getElementById('pet-defense')?.value || 0);
    totals.speed += num(document.getElementById('pet-speed')?.value || 0);

    // 寵物技能（百分比或進階屬性）
    const petSkills = [
      { typeEl: document.getElementById('pet-skill1-type'), valEl: document.getElementById('pet-skill1-value') },
      { typeEl: document.getElementById('pet-skill2-type'), valEl: document.getElementById('pet-skill2-value') },
    ];
    petSkills.forEach(({ typeEl, valEl }) => {
      const type = typeEl?.value || '';
      const value = num(valEl?.value || 0);
      switch (type) {
        case 'health': totals.health += value; break;
        case 'attack': totals.attack += value; break;
        case 'defense': totals.defense += value; break;
        case 'speed': totals.speed += value; break;
        case 'crit-rate': totals.critRate += value; break;
        case 'crit-damage': totals.critDamage += value; break;
        case 'effect-hit': totals.effectHit += value; break;
        case 'effect-resist': totals.effectResist += value; break;
        // 百分比型先不套用，避免誤增，後續可選擇套用到基礎
        default: break;
      }
    });

    // 更新畫面
    document.getElementById('total-health').textContent = String(Math.round(totals.health));
    document.getElementById('total-attack').textContent = String(Math.round(totals.attack));
    document.getElementById('total-defense').textContent = String(Math.round(totals.defense));
    document.getElementById('total-speed').textContent = String(Math.round(totals.speed));
    document.getElementById('total-crit-rate').textContent = String(totals.critRate);
    document.getElementById('total-crit-damage').textContent = String(totals.critDamage);
    document.getElementById('total-effect-hit').textContent = String(totals.effectHit);
    document.getElementById('total-effect-resist').textContent = String(totals.effectResist);
  }

  // 綁定計算按鈕
  const calcBtn = document.getElementById('calculate-btn');
  if (calcBtn) {
    calcBtn.addEventListener('click', computeTotals);
  }

  // 變更即時更新（可選）
  ['health','attack','defense','speed','crit-rate','crit-damage','effect-hit','effect-resist'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', computeTotals);
  });

  initEquipmentUI();
  // 初始計算一次
  computeTotals();
});

// 裝備資料收集
function collectEquipmentFromSlot(slotEl) {
  const mainStatType = slotEl.dataset.mainStat || '';
  const mainValEl = slotEl.querySelector('.main-stat-value');
  const mainVal = mainValEl ? parseFloat(mainValEl.value || '0') || 0 : 0;
  const subStats = [];
  slotEl.querySelectorAll('.sub-stat-container').forEach(sub => {
    const type = sub.querySelector('.sub-stat-type')?.value || '';
    const value = parseFloat(sub.querySelector('.sub-stat-value')?.value || '0') || 0;
    if (type) subStats.push({ type, value });
  });
  return { mainStatType, mainStatValue: mainVal, subStats };
}

// 將裝備資料填回欄位
function fillSlotFromEquip(slotEl, equip) {
  if (equip.mainStatType) slotEl.dataset.mainStat = equip.mainStatType;
  if (slotEl.querySelector('.main-stat-value')) {
    slotEl.querySelector('.main-stat-value').value = String(equip.mainStatValue || 0);
  }
  const subContainer = slotEl.querySelector('.sub-stats');
  if (subContainer) {
    // 清空現有
    subContainer.innerHTML = '';
    (equip.subStats || []).forEach(({ type, value }) => {
      const container = document.createElement('div');
      container.className = 'sub-stat-container';
      container.innerHTML = `
        <select class="sub-stat-type">
          <option value="">選擇屬性</option>
          <option value="health-percent">生命加成</option>
          <option value="health">生命</option>
          <option value="attack-percent">攻擊加成</option>
          <option value="attack">攻擊</option>
          <option value="defense-percent">防禦加成</option>
          <option value="defense">防禦</option>
          <option value="speed">速度</option>
          <option value="crit-rate">暴擊率</option>
          <option value="crit-damage">暴擊傷害</option>
          <option value="effect-hit">效果命中</option>
          <option value="effect-resist">效果抵抗</option>
        </select>
        <input type="number" class="sub-stat-value" min="0" value="0">
        <button class="delete-sub-stat">X</button>
      `;
      subContainer.appendChild(container);
      container.querySelector('.sub-stat-type').value = type || '';
      container.querySelector('.sub-stat-value').value = String(value || 0);
    });
    const addBtn = slotEl.querySelector('.add-sub-stat-btn');
    if (addBtn) addBtn.disabled = (slotEl.querySelectorAll('.sub-stat-container').length >= 4);
  }
}

// 重新載入已保存的裝備列表
async function refreshEquipmentLists() {
  try {
    const res = await window.electronAPI.getEquipment();
    if (!res?.success) throw new Error(res?.error || '讀取裝備失敗');
    const items = res.equipments || [];
    document.querySelectorAll('.load-equipment-select').forEach(select => {
      const slot = select.dataset.slot;
      select.innerHTML = '<option value="">選擇裝備</option>';
      items.filter(i => i.slot === slot).forEach(i => {
        const opt = document.createElement('option');
        opt.value = i.name;
        opt.textContent = i.name;
        select.appendChild(opt);
      });
    });
    const managerSelect = document.getElementById('equipment-manager-list');
    if (managerSelect) {
      managerSelect.innerHTML = '';
      items.forEach(i => {
        const opt = document.createElement('option');
        const partLabel = i.slot === 'helmet' ? '頭盔' : (i.slot || '未知');
        opt.value = i.name;
        opt.textContent = `${i.name} (${partLabel})`;
        managerSelect.appendChild(opt);
      });
    }
  } catch (e) {
    window.electronAPI?.showError?.(`讀取裝備失敗: ${e.message}`);
  }
}

// 綁定裝備的儲存/載入/刪除
function bindEquipmentActions() {
  // 儲存
  document.querySelectorAll('.save-equipment-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const slotId = btn.dataset.slot;
      const slotEl = document.getElementById(slotId);
      const data = collectEquipmentFromSlot(slotEl);
      data.slot = slotId;
      // 依規則命名
      data.name = buildEquipmentName(slotEl, data);
      try {
        const res = await window.electronAPI.saveEquipment(data);
        if (res?.success) {
          await refreshEquipmentLists();
          window.electronAPI?.showSuccess?.(`裝備已儲存：${data.name}`);
          document.getElementById('calculate-btn')?.click();
        } else {
          throw new Error(res?.error || '未知錯誤');
        }
      } catch (e) {
        window.electronAPI?.showError?.(`儲存失敗：${e.message}`);
      }
    });
  });

  // 載入
  document.querySelectorAll('.load-equipment-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const slotId = btn.dataset.slot;
      const select = document.querySelector(`.load-equipment-select[data-slot="${slotId}"]`);
      const name = select?.value || '';
      if (!name) return;
      try {
        const res = await window.electronAPI.getEquipment();
        if (!res?.success) throw new Error(res?.error || '讀取裝備失敗');
        const item = (res.equipments || []).find(i => i.name === name);
        if (!item) throw new Error('未找到該裝備');
        const slotEl = document.getElementById(slotId);
        fillSlotFromEquip(slotEl, item);
        window.electronAPI?.showSuccess?.(`已載入裝備：${name}`);
        document.getElementById('calculate-btn')?.click();
      } catch (e) {
        window.electronAPI?.showError?.(`載入失敗：${e.message}`);
      }
    });
  });

  // 刪除
  document.querySelectorAll('.delete-equipment-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const slotId = btn.dataset.slot;
      const select = document.querySelector(`.load-equipment-select[data-slot="${slotId}"]`);
      const name = select?.value || '';
      if (!name) return;
      try {
        const res = await window.electronAPI.deleteEquipment(name);
        if (!res?.success) throw new Error(res?.error || '刪除失敗');
        await refreshEquipmentLists();
        window.electronAPI?.showSuccess?.(`已刪除裝備：${name}`);
        document.getElementById('calculate-btn')?.click();
      } catch (e) {
        window.electronAPI?.showError?.(`刪除失敗：${e.message}`);
      }
    });
  });
}

// 啟動時刷新下拉選單
(async function initStorageUI() {
  if (window.electronAPI?.getEquipment) {
    await refreshEquipmentLists();
  }
  bindEquipmentActions();
})();

// 渲染邏輯：計算 + 裝備資料管理

// ===== 數值映射與工具 =====
const ATTR_MAP = {
  '生命': 'hp', '攻擊': 'atk', '防禦': 'def', '速度': 'spd', '暴擊': 'crit', '暴傷': 'critd', '命中': 'acc', '抗性': 'res',
  'HP': 'hp', 'ATK': 'atk', 'DEF': 'def', 'SPD': 'spd', 'CRIT': 'crit', 'CRITD': 'critd', 'ACC': 'acc', 'RES': 'res'
};
const parseNum = v => {
  const n = parseFloat(String(v).replace(/[^\d.-]/g, ''));
  return isNaN(n) ? 0 : n;
};

// ===== 讀取 DOM 欄位 =====
function readBasicStats() {
  const ids = ['base-hp','base-atk','base-def','base-spd','base-crit','base-critd','base-acc','base-res'];
  const result = {};
  ids.forEach(id => result[ATTR_MAP[id.split('-')[1].toUpperCase()] || id] = parseNum(document.getElementById(id)?.value || 0));
  return result;
}

function readAdvancedStats() {
  const ids = ['adv-hp','adv-atk','adv-def','adv-spd','adv-crit','adv-critd','adv-acc','adv-res'];
  const result = {};
  ids.forEach(id => result[ATTR_MAP[id.split('-')[1].toUpperCase()] || id] = parseNum(document.getElementById(id)?.value || 0));
  return result;
}

function readEquipmentMain(slotId) {
  const select = document.querySelector(`#${slotId} .main-attr-select`);
  const valueInput = document.querySelector(`#${slotId} .main-attr-value`);
  const attrName = select?.value || '';
  const attrKey = ATTR_MAP[attrName] || attrName;
  const value = parseNum(valueInput?.value || 0);
  return { attrKey, value };
}

function readEquipmentSubs(slotId) {
  const subRows = document.querySelectorAll(`#${slotId} .sub-attrs .sub-row`);
  const subs = [];
  subRows.forEach(row => {
    const attr = row.querySelector('.sub-attr-select')?.value || '';
    const key = ATTR_MAP[attr] || attr;
    const val = parseNum(row.querySelector('.sub-attr-value')?.value || 0);
    const isPercent = row.querySelector('.sub-attr-percent')?.checked || false;
    subs.push({ key, val, isPercent });
  });
  return subs;
}

// ===== 計算邏輯 =====
function computeTotal() {
  const base = readBasicStats();
  const adv = readAdvancedStats();
  const slots = ['helmet'];
  // 主屬性視為固定值加總（目前頭盔主屬僅平坦值）
  const mainFlat = { hp: 0, atk: 0, def: 0, spd: 0 };
  // 次屬固定值加總
  const subsFlat = { hp: 0, atk: 0, def: 0, spd: 0 };
  // 次屬百分比（以角色屬性為基礎）
  const subsPctBase = { hp: 0, atk: 0, def: 0 };
  // 直接加總的百分比屬性（特例）
  const subsDirectPct = { crit: 0, critd: 0, acc: 0, res: 0 };

  slots.forEach(s => {
    const m = readEquipmentMain(s);
    if (m.attrKey && mainFlat.hasOwnProperty(m.attrKey)) {
      mainFlat[m.attrKey] += m.value;
    }
    const subs = readEquipmentSubs(s);
    subs.forEach(sub => {
      const k = sub.key;
      const v = sub.val;
      const isPct = !!sub.isPercent;
      // 固定值：生命/攻擊/防禦/速度
      if (['hp','atk','def','spd'].includes(k) && !isPct) {
        subsFlat[k] += v;
        return;
      }
      // 百分比（以角色屬性為基礎）：生命加成/攻擊加成/防禦加成
      if (['hp','atk','def'].includes(k) && isPct) {
        subsPctBase[k] += v; // 直接累計百分比（例如 50 表示 50%）
        return;
      }
      // 特例：暴擊率、暴擊傷害、效果命中、效果抵抗（直接加總到總額）
      if (['crit','critd','acc','res'].includes(k)) {
        subsDirectPct[k] += v; // 不論是否勾選百分比，數值本身即為百分比
        return;
      }
      // 其他情況（例如速度勾選了百分比），視為平坦值處理
      if (['spd'].includes(k)) {
        subsFlat[k] += v;
      }
    });
  });

  // 套用規則計算總額
  const total = {};
  total.hp = (base.hp||0) + (adv.hp||0) + mainFlat.hp + subsFlat.hp + (base.hp||0) * (subsPctBase.hp||0) / 100;
  total.atk = (base.atk||0) + (adv.atk||0) + mainFlat.atk + subsFlat.atk + (base.atk||0) * (subsPctBase.atk||0) / 100;
  total.def = (base.def||0) + (adv.def||0) + mainFlat.def + subsFlat.def + (base.def||0) * (subsPctBase.def||0) / 100;
  total.spd = (base.spd||0) + (adv.spd||0) + mainFlat.spd + subsFlat.spd; // 速度僅平坦值

  // 直接加總類（百分比數值直接相加）
  total.crit = (base.crit||0) + (adv.crit||0) + subsDirectPct.crit;
  total.critd = (base.critd||0) + (adv.critd||0) + subsDirectPct.critd;
  total.acc = (base.acc||0) + (adv.acc||0) + subsDirectPct.acc;
  total.res = (base.res||0) + (adv.res||0) + subsDirectPct.res;

  updateTotalUI(total);
  return total;
}

function updateTotalUI(total) {
  const map = {
    hp: 'total-hp', atk: 'total-atk', def: 'total-def', spd: 'total-spd',
    crit: 'total-crit', critd: 'total-critd', acc: 'total-acc', res: 'total-res'
  };
  Object.entries(map).forEach(([k,id]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(total[k]||0);
  });
}

// ===== UI 初始化（次屬性按鈕） =====
function initSubAttrButtons() {
  const slots = ['helmet'];
  slots.forEach(slotId => {
    const container = document.querySelector(`#${slotId} .sub-attrs`);
    const addBtn = document.querySelector(`#${slotId} .add-sub-attr-btn`);
    const delBtn = document.querySelector(`#${slotId} .del-sub-attr-btn`);
    if (!container || !addBtn || !delBtn) return;

    const updateAddBtn = () => {
      const count = container.querySelectorAll('.sub-row').length;
      addBtn.disabled = count >= 4;
    };
    const addRow = () => {
      const count = container.querySelectorAll('.sub-row').length;
      if (count >= 4) { updateAddBtn(); return; }
      const row = document.createElement('div');
      row.className = 'sub-row';
      row.innerHTML = `
        <select class="sub-attr-select">
          <option>生命</option><option>攻擊</option><option>防禦</option><option>速度</option>
          <option>暴擊</option><option>暴傷</option><option>命中</option><option>抗性</option>
        </select>
        <input type="number" class="sub-attr-value" placeholder="數值" />
        <label><input type="checkbox" class="sub-attr-percent" /> %</label>
      `;
      container.appendChild(row);
      updateAddBtn();
    };
    const delRow = () => {
      const rows = container.querySelectorAll('.sub-row');
      if (rows.length > 0) rows[rows.length - 1].remove();
      updateAddBtn();
    };
    addBtn.addEventListener('click', addRow);
    delBtn.addEventListener('click', delRow);
    updateAddBtn();
  });
}

// ===== 裝備資料序列化與反序列化 =====
function collectHelmetData() {
  const slotId = 'helmet';
  const main = readEquipmentMain(slotId);
  const subs = readEquipmentSubs(slotId);
  return {
    name: `${slotId}-${Date.now()}`,
    slot: slotId,
    main,
    subs
  };
}

function fillHelmetFromData(data) {
  if (!data || data.slot !== 'helmet') return;
  const slotId = 'helmet';
  // 主屬性
  const select = document.querySelector(`#${slotId} .main-attr-select`);
  const input = document.querySelector(`#${slotId} .main-attr-value`);
  if (select) select.value = Object.keys(ATTR_MAP).find(k => ATTR_MAP[k] === data.main.attrKey) || data.main.attrKey;
  if (input) input.value = data.main.value;
  // 次屬性
  const container = document.querySelector(`#${slotId} .sub-attrs`);
  container.innerHTML = '';
  (data.subs||[]).forEach(sub => {
    const row = document.createElement('div');
    row.className = 'sub-row';
    const name = Object.keys(ATTR_MAP).find(k => ATTR_MAP[k] === sub.key) || sub.key;
    row.innerHTML = `
      <select class="sub-attr-select">
        <option>生命</option><option>攻擊</option><option>防禦</option><option>速度</option>
        <option>暴擊</option><option>暴傷</option><option>命中</option><option>抗性</option>
      </select>
      <input type="number" class="sub-attr-value" placeholder="數值" />
      <label><input type="checkbox" class="sub-attr-percent" /> %</label>
    `;
    container.appendChild(row);
    row.querySelector('.sub-attr-select').value = name;
    row.querySelector('.sub-attr-value').value = sub.val;
    row.querySelector('.sub-attr-percent').checked = !!sub.isPercent;
  });
  const addBtn = document.querySelector(`#${slotId} .add-sub-attr-btn`);
  if (addBtn) addBtn.disabled = (container.querySelectorAll('.sub-row').length >= 4);
}

// ===== IPC 對接 =====
async function refreshEquipmentSelects() {
  const res = await window.electronAPI.getEquipment();
  const list = (res && res.equipments) || [];
  // 頭盔欄位的下拉
  const helmetSelect = document.getElementById('saved-helmet-select');
  if (helmetSelect) {
    helmetSelect.innerHTML = '';
    list.filter(e => e.slot === 'helmet').forEach(e => {
      const opt = document.createElement('option');
      opt.value = e.name;
      opt.textContent = e.name;
      helmetSelect.appendChild(opt);
    });
  }
  // 管理器下拉（顯示全部）
  const managerSelect = document.getElementById('equipment-manager-list');
  if (managerSelect) {
    managerSelect.innerHTML = '';
    list.forEach(e => {
      const opt = document.createElement('option');
      opt.value = e.name;
      opt.textContent = `${e.name} (${e.slot || '未知'})`;
      managerSelect.appendChild(opt);
    });
  }
}

async function saveHelmet() {
  const data = collectHelmetData();
  const res = await window.electronAPI.saveEquipment(data);
  if (res && res.success) {
    await window.electronAPI.showSuccess(`已保存裝備：${data.name}`);
    await refreshEquipmentSelects();
  } else {
    await window.electronAPI.showError(res?.error || '保存失敗');
  }
}

async function loadHelmet() {
  const sel = document.getElementById('saved-helmet-select');
  const name = sel?.value;
  if (!name) return;
  const res = await window.electronAPI.getEquipment();
  const item = (res.items || []).find(e => e.name === name);
  if (!item) return window.electronAPI.showError('找不到選中的裝備');
  fillHelmetFromData(item);
  computeTotal();
}

async function deleteHelmet() {
  const sel = document.getElementById('saved-helmet-select');
  const name = sel?.value;
  if (!name) return;
  const res = await window.electronAPI.deleteEquipment(name);
  if (res && res.success) {
    await window.electronAPI.showSuccess(`已刪除裝備：${name}`);
    await refreshEquipmentSelects();
  } else {
    await window.electronAPI.showError(res?.error || '刪除失敗');
  }
}

// ===== 裝備管理器（重命名/刪除） =====
function ensureTabs() {
  if (document.getElementById('app-tabs')) return;
  const tabs = document.createElement('div');
  tabs.id = 'app-tabs';
  tabs.style.display = 'flex';
  tabs.style.gap = '10px';
  tabs.style.padding = '10px 20px';
  tabs.style.background = '#fff';
  tabs.style.borderBottom = '1px solid #ddd';
  const btnCalc = document.createElement('button');
  btnCalc.id = 'tab-btn-calculator';
  btnCalc.textContent = '計算器';
  btnCalc.style.padding = '8px 12px';
  const btnMgr = document.createElement('button');
  btnMgr.id = 'tab-btn-equip-manager';
  btnMgr.textContent = '裝備管理';
  btnMgr.style.padding = '8px 12px';
  tabs.appendChild(btnCalc);
  tabs.appendChild(btnMgr);
  document.body.insertBefore(tabs, document.body.firstChild);
  let page = document.getElementById('equipment-manager-page');
  if (!page) {
    page = document.createElement('div');
    page.id = 'equipment-manager-page';
    page.style.display = 'none';
    page.style.padding = '20px';
    document.body.appendChild(page);
  }
  const container = document.querySelector('.container');
  const showCalc = () => { if (container) container.style.display = ''; page.style.display = 'none'; };
  const showMgr = async () => { if (container) container.style.display = 'none'; page.style.display = ''; await refreshEquipmentLists(); };
  btnCalc.addEventListener('click', showCalc);
  btnMgr.addEventListener('click', showMgr);
}
function ensureEquipmentManagerUI() {
  ensureTabs();
  const page = document.getElementById('equipment-manager-page');
  if (!page) return;
  // 移除舊的底部管理區塊（若存在）
  const orphan = document.querySelector('.container #equipment-manager');
  if (orphan) orphan.remove();
  // 建立（或覆蓋）管理頁內容：表格
  let manager = document.getElementById('equipment-manager');
  if (!manager) {
    manager = document.createElement('section');
    manager.id = 'equipment-manager';
    page.appendChild(manager);
  }
  manager.innerHTML = `
    <h2>裝備管理</h2>
    <table id="equipment-table" style="width:100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="border-bottom:1px solid #ddd; text-align:left; padding:6px;">名稱</th>
          <th style="border-bottom:1px solid #ddd; text-align:left; padding:6px;">部位</th>
          <th style="border-bottom:1px solid #ddd; text-align:left; padding:6px;">主屬性</th>
          <th style="border-bottom:1px solid #ddd; text-align:left; padding:6px;">主數值</th>
          <th style="border-bottom:1px solid #ddd; text-align:left; padding:6px;">次要屬性</th>
          <th style="border-bottom:1px solid #ddd; text-align:left; padding:6px;">操作</th>
        </tr>
      </thead>
      <tbody id="equipment-table-body"></tbody>
    </table>
  `;
}
function createSubRow(type = '', value = 0) {
  const wrap = document.createElement('div');
  wrap.className = 'mgr-sub-row';
  wrap.style.display = 'flex';
  wrap.style.gap = '6px';
  wrap.style.marginBottom = '4px';
  wrap.innerHTML = `
    <select class="mgr-sub-type">
      <option value="">選擇屬性</option>
      <option value="health-percent">生命加成</option>
      <option value="health">生命</option>
      <option value="attack-percent">攻擊加成</option>
      <option value="attack">攻擊</option>
      <option value="defense-percent">防禦加成</option>
      <option value="defense">防禦</option>
      <option value="speed">速度</option>
      <option value="crit-rate">暴擊率</option>
      <option value="crit-damage">暴擊傷害</option>
      <option value="effect-hit">效果命中</option>
      <option value="effect-resist">效果抵抗</option>
    </select>
    <input type="number" class="mgr-sub-value" min="0" value="${value}">
    <button class="mgr-sub-del">刪除</button>
  `;
  wrap.querySelector('.mgr-sub-type').value = type || '';
  wrap.querySelector('.mgr-sub-del').addEventListener('click', () => {
    const tr = wrap.closest('tr');
    const subList = tr?.querySelector('.mgr-sub-list');
    wrap.remove();
    const addBtn = tr?.querySelector('.mgr-sub-add');
    if (addBtn) addBtn.disabled = (subList?.querySelectorAll('.mgr-sub-row').length >= 4);
    // 重新評估，若低於 4 則可再添加
    if (addBtn && subList) addBtn.disabled = subList.querySelectorAll('.mgr-sub-row').length >= 4;
  });
  return wrap;
}
function renderManagerTable(items = []) {
  const tbody = document.getElementById('equipment-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  items.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="padding:6px;"><input type="text" class="mgr-name" value="${item.name || ''}" style="width:100%"></td>
      <td style="padding:6px;">${item.slot || '未知'}</td>
      <td style="padding:6px;">
        <select class="mgr-main-type" style="width:100%">
          <option value="health">生命</option>
          <option value="attack">攻擊</option>
          <option value="defense">防禦</option>
          <option value="speed">速度</option>
        </select>
      </td>
      <td style="padding:6px;"><input type="number" class="mgr-main-value" min="0" value="${item.mainStatValue || 0}" style="width:100%"></td>
      <td style="padding:6px;">
        <div class="mgr-sub-list"></div>
        <button class="mgr-sub-add">添加次屬</button>
      </td>
      <td style="padding:6px;">
        <button class="mgr-save">保存</button>
        <button class="mgr-delete">刪除</button>
      </td>
    `;
    tbody.appendChild(tr);
    // 設定主屬性
    const mainSelect = tr.querySelector('.mgr-main-type');
    mainSelect.value = item.mainStatType || 'attack';
    // 填入次屬性
    const subList = tr.querySelector('.mgr-sub-list');
    (item.subStats || []).forEach(s => subList.appendChild(createSubRow(s.type, s.value)));
    tr.querySelector('.mgr-sub-add').addEventListener('click', () => subList.appendChild(createSubRow('', 0)));
    // 保存
    tr.querySelector('.mgr-save').addEventListener('click', async () => {
      const originalName = item.name;
      const newName = tr.querySelector('.mgr-name').value.trim();
      const slot = item.slot;
      const mainType = tr.querySelector('.mgr-main-type').value;
      const mainValue = parseFloat(tr.querySelector('.mgr-main-value').value || '0') || 0;
      const subStats = Array.from(subList.querySelectorAll('.mgr-sub-row')).map(row => ({
        type: row.querySelector('.mgr-sub-type').value,
        value: parseFloat(row.querySelector('.mgr-sub-value').value || '0') || 0,
      })).filter(s => s.type);
      try {
        // 若改名，先刪除舊的，再保存新的
        if (newName && newName !== originalName) {
          await window.electronAPI.deleteEquipment(originalName);
        }
        const res = await window.electronAPI.saveEquipment({ name: newName || originalName, slot, mainStatType: mainType, mainStatValue: mainValue, subStats });
        if (res?.success) {
          await window.electronAPI.showSuccess('已保存調整');
          await refreshEquipmentLists();
        } else {
          throw new Error(res?.error || '保存失敗');
        }
      } catch (e) {
        await window.electronAPI.showError(e.message);
      }
    });
    // 刪除
    tr.querySelector('.mgr-delete').addEventListener('click', async () => {
      try {
        const res = await window.electronAPI.deleteEquipment(item.name);
        if (res?.success) {
          await window.electronAPI.showSuccess('已刪除裝備');
          await refreshEquipmentLists();
        } else {
          throw new Error(res?.error || '刪除失敗');
        }
      } catch (e) {
        await window.electronAPI.showError(e.message);
      }
    });
  });
}
function enforceManagerSubLimit() {
  const rows = document.querySelectorAll('#equipment-table-body tr');
  rows.forEach(tr => {
    const subList = tr.querySelector('.mgr-sub-list');
    const addBtn = tr.querySelector('.mgr-sub-add');
    if (!subList || !addBtn) return;
    const count = subList.querySelectorAll('.mgr-sub-row').length;
    addBtn.disabled = count >= 4;
  });
}
async function refreshEquipmentLists() {
  try {
    const res = await window.electronAPI.getEquipment();
    if (!res?.success) throw new Error(res?.error || '讀取裝備失敗');
    const items = res.equipments || [];
    // 計算器頁下拉
    document.querySelectorAll('.load-equipment-select').forEach(select => {
      const slot = select.dataset.slot;
      select.innerHTML = '<option value="">選擇裝備</option>';
      items.filter(i => i.slot === slot).forEach(i => {
        const opt = document.createElement('option');
        opt.value = i.name;
        opt.textContent = i.name;
        select.appendChild(opt);
      });
    });
    // 管理頁表格
    renderManagerTable(items);
    enforceManagerSubLimit();
  } catch (e) {
    window.electronAPI?.showError?.(`讀取裝備失敗: ${e.message}`);
  }
}

// 根据规则产出生命名：部位-主要属性+数值-速度+数值
function buildEquipmentName(slotEl, data) {
  const part = slotEl?.dataset?.type || data.slot || '裝備';
  let mainLabel = slotEl?.dataset?.mainStat || data.mainStatType || '';
  const mainVal = data.mainStatValue ?? data.main?.value ?? 0;
  if (mainLabel === '暴擊率') mainLabel = '暴擊加成';
  const percentMain = ['暴擊率','暴擊加成','暴擊傷害','效果命中','效果抵抗'].includes(mainLabel);
  const mainValStr = percentMain ? `${mainVal}%` : `${mainVal}`;
  const speedSub = (data.subStats || data.subs || []).find(s => (s.type || s.key) === 'speed' || (s.type || s.key) === 'SPD');
  const speedVal = speedSub ? (speedSub.value ?? speedSub.val ?? 0) : 0;
  return `${part}-${mainLabel}${mainValStr}-速度${speedVal}`;
}
window.addEventListener('DOMContentLoaded', async () => {
  // 頂部分頁與管理頁建立
  ensureTabs();
  ensureEquipmentManagerUI();
  // 初始化與刷新列表
  await refreshEquipmentLists();
  // 保持原計算器行為：點擊與變更即重算
  document.getElementById('calculate-btn')?.addEventListener('click', computeTotal);
  document.querySelectorAll('input, select')?.forEach(el => el.addEventListener('change', computeTotal));
  // 次屬性按鈕初始化（原功能）
  initSubAttrButtons?.();
  // 頭盔儲存/載入/刪除（原功能）
  document.getElementById('save-helmet-btn')?.addEventListener('click', saveHelmet);
  document.getElementById('load-helmet-btn')?.addEventListener('click', loadHelmet);
  document.getElementById('delete-helmet-btn')?.addEventListener('click', deleteHelmet);
  // 預設顯示計算器頁
  const container = document.querySelector('.container');
  const page = document.getElementById('equipment-manager-page');
  if (container) container.style.display = '';
  if (page) page.style.display = 'none';
  computeTotal?.();
});