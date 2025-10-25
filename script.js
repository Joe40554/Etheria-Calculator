document.addEventListener('DOMContentLoaded', function() {
    // 獲取DOM元素
    const calculateBtn = document.getElementById('calculate-btn');
    const equipmentSlots = document.querySelectorAll('.equipment-slot');
    
    // 初始化裝備欄位
    initializeEquipmentSlot('helmet');
    initializeEquipmentSlot('crystal');
    initializeEquipmentSlot('bracelet');
    initializeEquipmentSlot('accessory1');
    initializeEquipmentSlot('accessory2');
    initializeEquipmentSlot('accessory3');
    
    // 初始化寵物欄位
    initializePetSlot('pet1');
    initializePetSlot('pet2');
    initializePetSlot('pet3');
    
    // 初始化裝備欄位的事件監聽
    initializeEquipmentEvents();
    
    // 計算按鈕點擊事件
    calculateBtn.addEventListener('click', calculateTotalStats);
    
    // 儲存裝備和寵物的按鈕
    const saveEquipmentBtn = document.getElementById('save-equipment');
    const loadEquipmentBtn = document.getElementById('load-equipment');
    const deleteEquipmentBtn = document.getElementById('delete-equipment');
    const savePetBtn = document.getElementById('save-pet');
    const loadPetBtn = document.getElementById('load-pet');
    const deletePetBtn = document.getElementById('delete-pet');
    
    // 儲存和載入功能事件監聽
    if(saveEquipmentBtn) saveEquipmentBtn.addEventListener('click', saveEquipment);
    if(loadEquipmentBtn) loadEquipmentBtn.addEventListener('click', loadEquipment);
    if(deleteEquipmentBtn) deleteEquipmentBtn.addEventListener('click', deleteEquipment);
    if(savePetBtn) savePetBtn.addEventListener('click', savePet);
    if(loadPetBtn) loadPetBtn.addEventListener('click', loadPet);
    if(deletePetBtn) deletePetBtn.addEventListener('click', deletePet);
    
    // 初始化裝備欄位的事件監聽
    function initializeEquipmentEvents() {
        // 為每個裝備欄位添加事件監聽
        equipmentSlots.forEach(slot => {
            // 主屬性選擇變更事件（僅針對飾品）
            const mainStatSelect = slot.querySelector('.main-stat-type');
            if (mainStatSelect) {
                mainStatSelect.addEventListener('change', function() {
                    updateSubStatOptions(slot);
                });
            }
            
            // 為每個添加次要屬性按鈕添加事件
            const addSubStatBtn = slot.querySelector('.add-sub-stat');
            if (addSubStatBtn) {
                addSubStatBtn.addEventListener('click', function() {
                    addSubStat(slot);
                });
            }
            
            // 為每個裝備欄位的"儲存裝備"按鈕添加事件
            const saveEquipmentBtn = slot.querySelector('.save-equipment-btn');
            if (saveEquipmentBtn) {
                saveEquipmentBtn.addEventListener('click', function() {
                    const slotType = slot.getAttribute('data-slot');
                    const equipmentType = slot.getAttribute('data-type');
                    // 生成自動名稱，不使用彈出視窗
                    const date = new Date();
                    const equipmentName = `${equipmentType}-${date.getMonth()+1}${date.getDate()}${date.getHours()}${date.getMinutes()}`;
                    saveEquipmentBySlot(equipmentName, slotType, equipmentType);
                    // 顯示儲存成功訊息
                    const message = document.createElement('div');
                    message.textContent = `已儲存: ${equipmentName}`;
                    message.style.color = 'green';
                    message.style.marginTop = '5px';
                    message.style.fontSize = '12px';
                    // 移除舊訊息
                    const oldMessage = slot.querySelector('.save-message');
                    if (oldMessage) oldMessage.remove();
                    message.className = 'save-message';
                    slot.querySelector('.equipment-actions').appendChild(message);
                    // 3秒後自動移除訊息
                    setTimeout(() => message.remove(), 3000);
                });
            }
            
            // 為每個裝備欄位的"載入"按鈕添加事件
            const loadEquipmentBtn = slot.querySelector('.load-equipment-btn');
            if (loadEquipmentBtn) {
                loadEquipmentBtn.addEventListener('click', function() {
                    const slotType = slot.getAttribute('data-slot');
                    const select = this.previousElementSibling;
                    const equipmentName = select.value;
                    if (equipmentName) {
                        loadEquipmentBySlot(equipmentName, slotType);
                    }
                });
            }
        });
        
        // 為動態添加的"刪除次要屬性"按鈕設置事件委託
        document.addEventListener('click', function(e) {
            if (e.target && e.target.classList.contains('delete-sub-stat')) {
                const subStatContainer = e.target.closest('.sub-stat-container');
                if (subStatContainer) {
                    subStatContainer.remove();
                    // 更新該裝備欄位的次要屬性選項
                    const slot = e.target.closest('.equipment-slot');
                    if (slot) {
                        updateSubStatOptions(slot);
                    }
                }
            }
        });
        
        // 初始化所有裝備選擇下拉框
        document.querySelectorAll('.load-equipment-select').forEach(select => {
            const slotType = select.getAttribute('data-slot');
            updateEquipmentSelect(slotType);
        });
        
        // 更新裝備選擇下拉框
        function updateEquipmentSelect(slotType) {
            const select = document.querySelector(`.load-equipment-select[data-slot="${slotType}"]`);
            if (!select) return;
            
            // 清空現有選項，保留第一個預設選項
            while (select.options.length > 1) {
                select.remove(1);
            }
            
            // 獲取裝備欄位類型
            const slot = document.querySelector(`.equipment-slot[data-slot="${slotType}"]`);
            if (!slot) return;
            
            const equipmentType = slot.getAttribute('data-type');
            
            // 從localStorage獲取已儲存的裝備
            const savedEquipments = JSON.parse(localStorage.getItem('savedEquipments') || '{}');
            
            // 添加符合條件的裝備
            for (const type in savedEquipments) {
                // 如果是飾品，允許在三個飾品欄位間通用
                if ((type === equipmentType) || 
                    (equipmentType === '飾品' && type === '飾品') || 
                    (type === '飾品' && equipmentType === '飾品')) {
                    
                    for (const name in savedEquipments[type]) {
                        const option = document.createElement('option');
                        option.value = name;
                        option.textContent = name;
                        select.appendChild(option);
                    }
                }
            }
        }
    }
    
    // 儲存裝備功能
    function saveEquipment() {
        const equipmentName = document.getElementById('equipment-name').value;
        if (!equipmentName) {
            alert('請輸入裝備名稱');
            return;
        }
        
        // 獲取選中的裝備類型
        const equipmentType = document.getElementById('equipment-type-select').value;
        if (!equipmentType) {
            alert('請選擇要儲存的裝備類型');
            return;
        }
        
        // 找到對應類型的裝備欄位
        let targetSlot = null;
        equipmentSlots.forEach(slot => {
            if (slot.getAttribute('data-type') === equipmentType) {
                if (equipmentType !== '飾品' || slot.getAttribute('data-slot') === document.getElementById('accessory-slot-select').value) {
                    targetSlot = slot;
                }
            }
        });
        
        if (!targetSlot) {
            alert('找不到對應的裝備欄位');
            return;
        }
        
        // 獲取裝備資料
        const slotData = {
            type: targetSlot.getAttribute('data-type'),
            mainStat: targetSlot.getAttribute('data-main-stat'),
            mainStatValue: targetSlot.querySelector('.main-stat-value').value,
            subStats: []
        };
        
        // 如果是飾品，需要獲取主屬性類型
        if (targetSlot.querySelector('.main-stat-type')) {
            slotData.mainStatType = targetSlot.querySelector('.main-stat-type').value;
            slotData.slot = targetSlot.getAttribute('data-slot');
        }
        
        // 獲取次要屬性
        const subStats = targetSlot.querySelectorAll('.sub-stat');
        subStats.forEach(subStat => {
            const type = subStat.querySelector('.sub-stat-type').value;
            const value = subStat.querySelector('.sub-stat-value').value;
            if (type && value) {
                slotData.subStats.push({
                    type: type,
                    value: value
                });
            }
        });
        
        // 儲存到localStorage
        const savedEquipments = JSON.parse(localStorage.getItem('savedEquipments') || '{}');
        if (!savedEquipments[equipmentType]) {
            savedEquipments[equipmentType] = {};
        }
        savedEquipments[equipmentType][equipmentName] = slotData;
        localStorage.setItem('savedEquipments', JSON.stringify(savedEquipments));
        
        // 更新下拉選單
        updateEquipmentSelect();
        
        alert('裝備已儲存');
    }
    
    // 從特定裝備欄位儲存裝備
    function saveEquipmentBySlot(equipmentName, slotType, equipmentType) {
        // 找到對應的裝備欄位
        const targetSlot = document.querySelector(`.equipment-slot[data-slot="${slotType}"]`);
        
        if (!targetSlot) {
            console.error('找不到對應的裝備欄位');
            return;
        }
        
        // 獲取裝備資料
        const slotData = {
            type: equipmentType,
            mainStat: targetSlot.getAttribute('data-main-stat'),
            mainStatValue: targetSlot.querySelector('.main-stat-value').value,
            subStats: [],
            slot: slotType
        };
        
        // 如果是飾品，需要獲取主屬性類型
        if (targetSlot.querySelector('.main-stat-type')) {
            slotData.mainStatType = targetSlot.querySelector('.main-stat-type').value;
        }
        
        // 獲取次要屬性
        const subStats = targetSlot.querySelectorAll('.sub-stat-container');
        subStats.forEach(subStat => {
            if (!subStat.querySelector('.add-sub-stat')) { // 排除添加按鈕
                const type = subStat.querySelector('.sub-stat-type').value;
                const value = subStat.querySelector('.sub-stat-value').value;
                if (type && value) {
                    slotData.subStats.push({
                        type: type,
                        value: value
                    });
                }
            }
        });
        
        // 儲存到localStorage
        const savedEquipments = JSON.parse(localStorage.getItem('savedEquipments') || '{}');
        if (!savedEquipments[equipmentType]) {
            savedEquipments[equipmentType] = {};
        }
        savedEquipments[equipmentType][equipmentName] = slotData;
        localStorage.setItem('savedEquipments', JSON.stringify(savedEquipments));
        
        // 更新該裝備欄位的下拉選單
        updateEquipmentSelect(slotType);
    }
    
    // 載入單個裝備功能
    function loadEquipment() {
        const equipmentType = document.getElementById('load-equipment-type-select').value;
        if (!equipmentType) {
            alert('請選擇要載入的裝備類型');
            return;
        }
        
        const equipmentName = document.getElementById('load-equipment-select').value;
        if (!equipmentName) {
            alert('請選擇要載入的裝備');
            return;
        }
        
        // 從localStorage獲取裝備資料
        const savedEquipments = JSON.parse(localStorage.getItem('savedEquipments') || '{}');
        if (!savedEquipments[equipmentType] || !savedEquipments[equipmentType][equipmentName]) {
            alert('找不到該裝備資料');
            return;
        }
    }
    
    // 從特定裝備欄位載入裝備
    function loadEquipmentBySlot(equipmentName, slotType) {
        if (!equipmentName) return;
        
        // 找到對應的裝備欄位
        const targetSlot = document.querySelector(`.equipment-slot[data-slot="${slotType}"]`);
        if (!targetSlot) return;
        
        const equipmentType = targetSlot.getAttribute('data-type');
        
        // 從localStorage獲取裝備資料
        const savedEquipments = JSON.parse(localStorage.getItem('savedEquipments') || '{}');
        
        // 查找裝備資料
        let slotData = null;
        let foundType = null;
        
        // 先嘗試在相同類型中查找
        if (savedEquipments[equipmentType] && savedEquipments[equipmentType][equipmentName]) {
            slotData = savedEquipments[equipmentType][equipmentName];
            foundType = equipmentType;
        } 
        // 如果是飾品，允許在三個飾品欄位間通用
        else if (equipmentType === '飾品') {
            if (savedEquipments['飾品'] && savedEquipments['飾品'][equipmentName]) {
                slotData = savedEquipments['飾品'][equipmentName];
                foundType = '飾品';
            }
        }
        
        if (!slotData) {
            alert('找不到該裝備資料');
            return;
        }
        
        // 設置主屬性值
        targetSlot.querySelector('.main-stat-value').value = slotData.mainStatValue;
        
        // 如果是飾品，設置主屬性類型
        if (targetSlot.querySelector('.main-stat-type') && slotData.mainStatType) {
            targetSlot.querySelector('.main-stat-type').value = slotData.mainStatType;
        }
        
        // 清除現有的次要屬性
        const subStatsContainer = targetSlot.querySelector('.sub-stats');
        const existingSubStats = targetSlot.querySelectorAll('.sub-stat-container');
        existingSubStats.forEach(subStat => {
            if (!subStat.querySelector('.add-sub-stat')) {
                subStat.remove();
            }
        });
        
        // 添加次要屬性
        slotData.subStats.forEach(subStat => {
            const newSubStat = document.createElement('div');
            newSubStat.className = 'sub-stat-container';
            
            const select = document.createElement('select');
            select.className = 'sub-stat-type';
            
            // 添加選項
            const options = [
                { value: '', text: '選擇屬性' },
                { value: 'health-percent', text: '生命加成' },
                { value: 'health', text: '生命' },
                { value: 'attack-percent', text: '攻擊加成' },
                { value: 'attack', text: '攻擊' },
                { value: 'defense-percent', text: '防禦加成' },
                { value: 'defense', text: '防禦' },
                { value: 'speed', text: '速度' },
                { value: 'crit-rate', text: '暴擊率' },
                { value: 'crit-damage', text: '暴擊傷害' },
                { value: 'effect-hit', text: '效果命中' },
                { value: 'effect-resist', text: '效果抵抗' }
            ];
            
            options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.value;
                optionElement.textContent = option.text;
                select.appendChild(optionElement);
            });
            
            select.value = subStat.type;
            
            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'sub-stat-value';
            input.min = '0';
            input.value = subStat.value;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-sub-stat';
            deleteBtn.textContent = 'X';
            
            newSubStat.appendChild(select);
            newSubStat.appendChild(input);
            newSubStat.appendChild(deleteBtn);
            
            subStatsContainer.appendChild(newSubStat);
            
            // 添加事件監聽器
            select.addEventListener('change', function() {
                updateSubStatOptions(targetSlot);
            });
        });
        
        // 更新次要屬性選項
        updateSubStatOptions(targetSlot);
        
        // 顯示載入成功訊息
        const message = document.createElement('div');
        message.textContent = `已載入: ${equipmentName}`;
        message.style.color = 'green';
        message.style.marginTop = '5px';
        message.style.fontSize = '12px';
        // 移除舊訊息
        const oldMessage = targetSlot.querySelector('.load-message');
        if (oldMessage) oldMessage.remove();
        message.className = 'load-message';
        targetSlot.querySelector('.equipment-actions').appendChild(message);
        // 3秒後自動移除訊息
        setTimeout(() => message.remove(), 3000);
        
        // 重新計算總數值
        calculateStats();
    }
        
        const slotData = savedEquipments[equipmentType][equipmentName];
        
        // 找到對應類型的裝備欄位
        let targetSlot = null;
        equipmentSlots.forEach(slot => {
            if (slot.getAttribute('data-type') === equipmentType) {
                if (equipmentType !== '飾品' || 
                    (slotData.slot && slot.getAttribute('data-slot') === slotData.slot)) {
                    targetSlot = slot;
                }
            }
        });
        
        if (!targetSlot) {
            alert('找不到對應的裝備欄位');
            return;
        }
        
        // 設置主屬性值
        targetSlot.querySelector('.main-stat-value').value = slotData.mainStatValue;
        
        // 如果是飾品，設置主屬性類型
        if (targetSlot.querySelector('.main-stat-type') && slotData.mainStatType) {
            targetSlot.querySelector('.main-stat-type').value = slotData.mainStatType;
        }
        
        // 清除現有的次要屬性
        const subStats = targetSlot.querySelector('.sub-stats');
        const existingSubStats = targetSlot.querySelectorAll('.sub-stat');
        existingSubStats.forEach(subStat => {
            if (!subStat.classList.contains('add-sub-stat')) {
                subStat.remove();
            }
        });
        
        // 添加次要屬性
        slotData.subStats.forEach(subStat => {
            const newSubStat = document.createElement('div');
            newSubStat.className = 'sub-stat';
            
            const select = document.createElement('select');
            select.className = 'sub-stat-type';
            
            // 添加選項
            const options = [
                { value: '', text: '選擇屬性' },
                { value: 'health-percent', text: '生命加成' },
                { value: 'health', text: '生命' },
                { value: 'attack-percent', text: '攻擊加成' },
                { value: 'attack', text: '攻擊' },
                { value: 'defense-percent', text: '防禦加成' },
                { value: 'defense', text: '防禦' },
                { value: 'speed', text: '速度' },
                { value: 'crit-rate', text: '暴擊率' },
                { value: 'crit-damage', text: '暴擊傷害' },
                { value: 'effect-hit', text: '效果命中' },
                { value: 'effect-resist', text: '效果抵抗' }
            ];
            
            options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.value;
                optionElement.textContent = option.text;
                select.appendChild(optionElement);
            });
            
            select.value = subStat.type;
            
            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'sub-stat-value';
            input.min = '0';
            input.value = subStat.value;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-sub-stat';
            deleteBtn.textContent = 'X';
            deleteBtn.addEventListener('click', function() {
                newSubStat.remove();
                updateSubStatOptions(targetSlot);
            });
            
            newSubStat.appendChild(select);
            newSubStat.appendChild(input);
            newSubStat.appendChild(deleteBtn);
            
            subStats.insertBefore(newSubStat, subStats.querySelector('.add-sub-stat'));
            
            select.addEventListener('change', function() {
                updateSubStatOptions(targetSlot);
            });
        });
        
        updateSubStatOptions(targetSlot);
        
        alert('裝備已載入');
    }
    
    // 刪除裝備功能
    function deleteEquipment() {
        const equipmentType = document.getElementById('load-equipment-type-select').value;
        if (!equipmentType) {
            alert('請選擇要刪除的裝備類型');
            return;
        }
        
        const equipmentName = document.getElementById('load-equipment-select').value;
        if (!equipmentName) {
            alert('請選擇要刪除的裝備');
            return;
        }
        
        // 從localStorage刪除裝備資料
        const savedEquipments = JSON.parse(localStorage.getItem('savedEquipments') || '{}');
        if (savedEquipments[equipmentType] && savedEquipments[equipmentType][equipmentName]) {
            delete savedEquipments[equipmentType][equipmentName];
            localStorage.setItem('savedEquipments', JSON.stringify(savedEquipments));
            
            // 更新下拉選單
            updateEquipmentSelect();
            
            alert('裝備已刪除');
        } else {
            alert('找不到該裝備資料');
        }
    }
    
    // 更新裝備下拉選單
    function updateEquipmentSelect() {
        const select = document.getElementById('load-equipment-select');
        select.innerHTML = '<option value="">選擇裝備</option>';
        
        const equipmentTypeSelect = document.getElementById('load-equipment-type-select');
        const equipmentType = equipmentTypeSelect.value;
        
        if (equipmentType) {
            const savedEquipments = JSON.parse(localStorage.getItem('savedEquipments') || '{}');
            if (savedEquipments[equipmentType]) {
                for (const name in savedEquipments[equipmentType]) {
                    const option = document.createElement('option');
                    option.value = name;
                    option.textContent = name;
                    select.appendChild(option);
                }
            }
        }
    }
    
    // 顯示/隱藏飾品欄位選擇
    document.getElementById('equipment-type-select').addEventListener('change', function() {
        const accessorySlotSelect = document.getElementById('accessory-slot-select');
        if (this.value === '飾品') {
            accessorySlotSelect.style.display = 'inline-block';
        } else {
            accessorySlotSelect.style.display = 'none';
        }
    });
    
    // 更新裝備類型變更時更新裝備列表
    document.getElementById('load-equipment-type-select').addEventListener('change', updateEquipmentSelect);
    
    // 儲存寵物功能
    function savePet() {
        // 自動生成寵物名稱，避免彈出視窗
        const now = new Date();
        const petName = `寵物_${now.getMonth()+1}月${now.getDate()}日_${now.getHours()}:${now.getMinutes()}`;
        
        // 獲取寵物資料
        const petData = {
            health: document.getElementById('pet-health').value,
            attack: document.getElementById('pet-attack').value,
            defense: document.getElementById('pet-defense').value,
            speed: document.getElementById('pet-speed').value,
            skill1: {
                type: document.getElementById('pet-skill1-type').value,
                value: document.getElementById('pet-skill1-value').value
            },
            skill2: {
                type: document.getElementById('pet-skill2-type').value,
                value: document.getElementById('pet-skill2-value').value
            }
        };
        
        // 儲存到localStorage
        const savedPets = JSON.parse(localStorage.getItem('savedPets') || '{}');
        savedPets[petName] = petData;
        localStorage.setItem('savedPets', JSON.stringify(savedPets));
        
        // 更新下拉選單
        updatePetSelect();
        
        // 顯示成功訊息
        const petSection = document.querySelector('.pet-section');
        const successMsg = document.createElement('div');
        successMsg.textContent = `寵物 "${petName}" 已成功儲存！`;
        successMsg.style.color = 'green';
        successMsg.style.marginTop = '10px';
        successMsg.className = 'success-message';
        
        // 移除舊訊息
        const oldMsg = petSection.querySelector('.success-message');
        if (oldMsg) oldMsg.remove();
        
        petSection.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 3000);
        
        // 重新計算總數值
        calculateStats();
    }
    
    // 載入寵物功能
    function loadPet() {
        const petName = document.getElementById('load-pet-select').value;
        if (!petName) {
            alert('請選擇要載入的寵物');
            return;
        }
        
        // 從localStorage獲取寵物資料
        const savedPets = JSON.parse(localStorage.getItem('savedPets') || '{}');
        const petData = savedPets[petName];
        
        if (!petData) {
            alert('找不到該寵物資料');
            return;
        }
        
        // 載入寵物資料
        document.getElementById('pet-health').value = petData.health;
        document.getElementById('pet-attack').value = petData.attack;
        document.getElementById('pet-defense').value = petData.defense;
        document.getElementById('pet-speed').value = petData.speed;
        document.getElementById('pet-skill1-type').value = petData.skill1.type;
        document.getElementById('pet-skill1-value').value = petData.skill1.value;
        document.getElementById('pet-skill2-type').value = petData.skill2.type;
        document.getElementById('pet-skill2-value').value = petData.skill2.value;
        
        alert('寵物已載入');
    }
    
    // 刪除寵物功能
    function deletePet() {
        const petName = document.getElementById('load-pet-select').value;
        if (!petName) {
            alert('請選擇要刪除的寵物');
            return;
        }
        
        // 從localStorage刪除寵物資料
        const savedPets = JSON.parse(localStorage.getItem('savedPets') || '{}');
        delete savedPets[petName];
        localStorage.setItem('savedPets', JSON.stringify(savedPets));
        
        // 更新下拉選單
        updatePetSelect();
        
        alert('寵物已刪除');
    }
    
    // 更新寵物下拉選單
    function updatePetSelect() {
        const select = document.getElementById('load-pet-select');
        select.innerHTML = '<option value="">選擇已儲存的寵物</option>';
        
        const savedPets = JSON.parse(localStorage.getItem('savedPets') || '{}');
        
        for (const name in savedPets) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            select.appendChild(option);
        }
    }
    
    // 初始化下拉選單
    updateEquipmentSelect();
    updatePetSelect();
});
            }
            
            // 為每個添加次要屬性按鈕添加事件
            const addSubStatBtn = slot.querySelector('.add-sub-stat');
            if (addSubStatBtn) {
                addSubStatBtn.addEventListener('click', function() {
                    addSubStat(slot);
                });
            }
        });
    }
    
    // 添加次要屬性
    function addSubStat(slot) {
        const subStats = slot.querySelector('.sub-stats');
        const subStatCount = subStats.querySelectorAll('.sub-stat').length - 1; // 減1是因為包含了add-sub-stat按鈕
        
        // 最多只能有4個次要屬性
        if (subStatCount >= 4) {
            alert('每個裝備最多只能有4個次要屬性！');
            return;
        }
        
        // 創建新的次要屬性欄位
        const newSubStat = document.createElement('div');
        newSubStat.className = 'sub-stat';
        
        // 創建選擇屬性的下拉選單
        const select = document.createElement('select');
        select.className = 'sub-stat-type';
        
        // 添加選項
        const options = [
            { value: '', text: '選擇屬性' },
            { value: 'health-percent', text: '生命加成' },
            { value: 'health', text: '生命' },
            { value: 'attack-percent', text: '攻擊加成' },
            { value: 'attack', text: '攻擊' },
            { value: 'defense-percent', text: '防禦加成' },
            { value: 'defense', text: '防禦' },
            { value: 'speed', text: '速度' },
            { value: 'crit-rate', text: '暴擊率' },
            { value: 'crit-damage', text: '暴擊傷害' },
            { value: 'effect-hit', text: '效果命中' },
            { value: 'effect-resist', text: '效果抵抗' }
        ];
        
        // 獲取已選擇的屬性
        const selectedAttrs = getSelectedAttributes(slot);
        
        // 添加選項，排除已選擇的屬性
        options.forEach(option => {
            if (!selectedAttrs.includes(option.value) || option.value === '') {
                const optionElement = document.createElement('option');
                optionElement.value = option.value;
                optionElement.textContent = option.text;
                select.appendChild(optionElement);
            }
        });
        
        // 創建數值輸入框
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'sub-stat-value';
        input.min = '0';
        input.value = '0';
        
        // 創建刪除按鈕
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-sub-stat';
        deleteBtn.textContent = 'X';
        deleteBtn.addEventListener('click', function() {
            newSubStat.remove();
            updateSubStatOptions(slot);
        });
        
        // 將元素添加到新的次要屬性欄位
        newSubStat.appendChild(select);
        newSubStat.appendChild(input);
        newSubStat.appendChild(deleteBtn);
        
        // 將新的次要屬性欄位添加到裝備欄位
        subStats.insertBefore(newSubStat, subStats.querySelector('.add-sub-stat'));
        
        // 為新的選擇屬性下拉選單添加事件監聽
        select.addEventListener('change', function() {
            updateSubStatOptions(slot);
        });
    }
    
    // 獲取已選擇的屬性
    function getSelectedAttributes(slot) {
        const selectedAttrs = [];
        
        // 獲取主屬性
        const mainStatType = slot.getAttribute('data-main-stat');
        if (mainStatType) {
            // 固定主屬性（面甲、晶管、腕輪）
            if (mainStatType === '攻擊') selectedAttrs.push('attack', 'attack-percent');
            else if (mainStatType === '生命') selectedAttrs.push('health', 'health-percent');
            else if (mainStatType === '防禦') selectedAttrs.push('defense', 'defense-percent');
        } else {
            // 飾品的主屬性
            const mainStatSelect = slot.querySelector('.main-stat-type');
            if (mainStatSelect && mainStatSelect.value) {
                selectedAttrs.push(mainStatSelect.value);
            }
        }
        
        // 獲取次要屬性
        const subStatSelects = slot.querySelectorAll('.sub-stat-type');
        subStatSelects.forEach(select => {
            if (select.value) {
                selectedAttrs.push(select.value);
            }
        });
        
        return selectedAttrs;
    }
    
    // 更新次要屬性選項
    function updateSubStatOptions(slot) {
        // 獲取所有已選擇的屬性
        const subStats = slot.querySelectorAll('.sub-stat-container, .sub-stat');
        const selectedTypes = [];
        
        // 獲取主屬性
        const mainStatType = slot.getAttribute('data-main-stat');
        if (mainStatType) {
            // 固定主屬性（面甲、晶管、腕輪）
            if (mainStatType === '攻擊') {
                selectedTypes.push('attack', 'attack-percent');
            } else if (mainStatType === '生命') {
                selectedTypes.push('health', 'health-percent');
            } else if (mainStatType === '防禦') {
                selectedTypes.push('defense', 'defense-percent');
            }
        } else {
            // 飾品的主屬性
            const mainStatSelect = slot.querySelector('.main-stat-type');
            if (mainStatSelect && mainStatSelect.value) {
                selectedTypes.push(mainStatSelect.value);
            }
        }
        
        // 獲取所有次要屬性的選擇
        subStats.forEach(subStat => {
            if (subStat.querySelector('.add-sub-stat')) return;
            
            const select = subStat.querySelector('.sub-stat-type');
            if (select && select.value) {
                selectedTypes.push(select.value);
            }
        });
        
        // 更新每個次要屬性的選項
        subStats.forEach(subStat => {
            if (subStat.querySelector('.add-sub-stat')) return;
            
            const select = subStat.querySelector('.sub-stat-type');
            const currentValue = select.value;
            
            // 清空選項
            select.innerHTML = '';
            
            // 添加空選項
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = '選擇屬性';
            select.appendChild(emptyOption);
            
            // 添加所有可能的選項
            const options = [
                { value: 'health-percent', text: '生命加成' },
                { value: 'health', text: '生命' },
                { value: 'attack-percent', text: '攻擊加成' },
                { value: 'attack', text: '攻擊' },
                { value: 'defense-percent', text: '防禦加成' },
                { value: 'defense', text: '防禦' },
                { value: 'speed', text: '速度' },
                { value: 'crit-rate', text: '暴擊率' },
                { value: 'crit-damage', text: '暴擊傷害' },
                { value: 'effect-hit', text: '效果命中' },
                { value: 'effect-resist', text: '效果抵抗' }
            ];
            
            // 添加其他選項，排除已選擇的屬性（除了當前選項）
            options.forEach(option => {
                if (option.value === currentValue || !selectedTypes.includes(option.value)) {
                    const optionElement = document.createElement('option');
                    optionElement.value = option.value;
                    optionElement.textContent = option.text;
                    select.appendChild(optionElement);
                }
            });
            
            // 設置回原來的值
            select.value = currentValue;
            
            // 如果當前值不在選項中，設為空
            if (!Array.from(select.options).some(opt => opt.value === currentValue)) {
                select.value = '';
            }
            
            // 如果選擇了無效選項，顯示警告
            if (currentValue && selectedTypes.filter(t => t === currentValue).length > 1) {
                // 找到重複的屬性
                const duplicateCount = selectedTypes.filter(t => t === currentValue).length;
                if (duplicateCount > 1) {
                    const warning = document.createElement('div');
                    warning.textContent = '屬性重複！請選擇其他屬性';
                    warning.style.color = 'red';
                    warning.style.fontSize = '12px';
                    warning.className = 'duplicate-warning';
                    
                    // 移除舊警告
                    const oldWarning = subStat.querySelector('.duplicate-warning');
                    if (oldWarning) oldWarning.remove();
                    
                    subStat.appendChild(warning);
                    // 3秒後自動移除警告
                    setTimeout(() => warning.remove(), 3000);
                }
            }
        });
    }
    
    // 計算總數值
    function calculateStats() {
        // 獲取基本屬性
        const baseHealth = parseInt(document.getElementById('health').value) || 0;
        const baseAttack = parseInt(document.getElementById('attack').value) || 0;
        const baseDefense = parseInt(document.getElementById('defense').value) || 0;
        const baseSpeed = parseInt(document.getElementById('speed').value) || 0;
        const baseCritRate = parseFloat(document.getElementById('crit-rate').value) || 0;
        const baseCritDamage = parseFloat(document.getElementById('crit-damage').value) || 0;
        const baseEffectHit = parseFloat(document.getElementById('effect-hit').value) || 0;
        const baseEffectResist = parseFloat(document.getElementById('effect-resist').value) || 0;
        
        // 獲取寵物屬性
        const petHealth = parseInt(document.getElementById('pet-health').value) || 0;
        const petAttack = parseInt(document.getElementById('pet-attack').value) || 0;
        const petDefense = parseInt(document.getElementById('pet-defense').value) || 0;
        const petSpeed = parseInt(document.getElementById('pet-speed').value) || 0;
        
        // 獲取寵物技能
        const petSkill1Type = document.getElementById('pet-skill1-type').value;
        const petSkill1Value = parseInt(document.getElementById('pet-skill1-value').value) || 0;
        const petSkill2Type = document.getElementById('pet-skill2-type').value;
        const petSkill2Value = parseInt(document.getElementById('pet-skill2-value').value) || 0;
        
        // 初始化總數值
        let totalHealth = baseHealth;
        let totalAttack = baseAttack;
        let totalDefense = baseDefense;
        let totalSpeed = baseSpeed;
        let totalCritRate = baseCritRate;
        let totalCritDamage = baseCritDamage;
        let totalEffectHit = baseEffectHit;
        let totalEffectResist = baseEffectResist;
        
        // 初始化百分比加成
        let healthPercentBonus = 0;
        let attackPercentBonus = 0;
        let defensePercentBonus = 0;
        
        // 初始化固定值加成
        let healthFixedBonus = 0;
        let attackFixedBonus = 0;
        let defenseFixedBonus = 0;
        let speedFixedBonus = 0;
        
        // 計算裝備加成
        equipmentSlots.forEach(slot => {
            // 獲取主屬性
            const mainStatType = slot.getAttribute('data-main-stat');
            const mainStatValue = parseInt(slot.querySelector('.main-stat-value').value) || 0;
            
            // 根據主屬性類型增加相應的數值
            if (mainStatType === '攻擊' || (slot.querySelector('.main-stat-type') && slot.querySelector('.main-stat-type').value === 'attack')) {
                attackFixedBonus += mainStatValue;
            } else if (mainStatType === '生命' || (slot.querySelector('.main-stat-type') && slot.querySelector('.main-stat-type').value === 'health')) {
                healthFixedBonus += mainStatValue;
            } else if (mainStatType === '防禦' || (slot.querySelector('.main-stat-type') && slot.querySelector('.main-stat-type').value === 'defense')) {
                defenseFixedBonus += mainStatValue;
            } else if (slot.querySelector('.main-stat-type')) {
                // 飾品的主屬性
                const mainStatTypeValue = slot.querySelector('.main-stat-type').value;
                if (mainStatTypeValue === 'health-percent') {
                    healthPercentBonus += mainStatValue;
                } else if (mainStatTypeValue === 'health') {
                    healthFixedBonus += mainStatValue;
                } else if (mainStatTypeValue === 'attack-percent') {
                    attackPercentBonus += mainStatValue;
                } else if (mainStatTypeValue === 'attack') {
                    attackFixedBonus += mainStatValue;
                } else if (mainStatTypeValue === 'defense-percent') {
                    defensePercentBonus += mainStatValue;
                } else if (mainStatTypeValue === 'defense') {
                    defenseFixedBonus += mainStatValue;
                } else if (mainStatTypeValue === 'speed') {
                    speedFixedBonus += mainStatValue;
                } else if (mainStatTypeValue === 'crit-rate') {
                    totalCritRate += mainStatValue;
                } else if (mainStatTypeValue === 'crit-damage') {
                    totalCritDamage += mainStatValue;
                } else if (mainStatTypeValue === 'effect-hit') {
                    totalEffectHit += mainStatValue;
                } else if (mainStatTypeValue === 'effect-resist') {
                    totalEffectResist += mainStatValue;
                }
            }
            
            // 獲取次要屬性
            const subStats = slot.querySelectorAll('.sub-stat');
            subStats.forEach(subStat => {
                const subStatType = subStat.querySelector('.sub-stat-type').value;
                const subStatValue = parseInt(subStat.querySelector('.sub-stat-value').value) || 0;
                
                // 根據次要屬性類型增加相應的數值
                if (subStatType === 'health-percent') {
                    healthPercentBonus += subStatValue;
                } else if (subStatType === 'health') {
                    healthFixedBonus += subStatValue;
                } else if (subStatType === 'attack-percent') {
                    attackPercentBonus += subStatValue;
                } else if (subStatType === 'attack') {
                    attackFixedBonus += subStatValue;
                } else if (subStatType === 'defense-percent') {
                    defensePercentBonus += subStatValue;
                } else if (subStatType === 'defense') {
                    defenseFixedBonus += subStatValue;
                } else if (subStatType === 'speed') {
                    speedFixedBonus += subStatValue;
                } else if (subStatType === 'crit-rate') {
                    totalCritRate += subStatValue;
                } else if (subStatType === 'crit-damage') {
                    totalCritDamage += subStatValue;
                } else if (subStatType === 'effect-hit') {
                    totalEffectHit += subStatValue;
                } else if (subStatType === 'effect-resist') {
                    totalEffectResist += subStatValue;
                }
            });
        });
        
        // 處理寵物技能1
        if (petSkill1Type === 'attack') {
            attackFixedBonus += petSkill1Value;
        } else if (petSkill1Type === 'attack-percent') {
            attackPercentBonus += petSkill1Value;
        } else if (petSkill1Type === 'health') {
            healthFixedBonus += petSkill1Value;
        } else if (petSkill1Type === 'health-percent') {
            healthPercentBonus += petSkill1Value;
        } else if (petSkill1Type === 'defense') {
            defenseFixedBonus += petSkill1Value;
        } else if (petSkill1Type === 'defense-percent') {
            defensePercentBonus += petSkill1Value;
        }
        
        // 處理寵物技能2
        if (petSkill2Type === 'crit-rate') {
            totalCritRate += petSkill2Value;
        } else if (petSkill2Type === 'crit-damage') {
            totalCritDamage += petSkill2Value;
        } else if (petSkill2Type === 'speed') {
            speedFixedBonus += petSkill2Value;
        } else if (petSkill2Type === 'effect-hit') {
            totalEffectHit += petSkill2Value;
        } else if (petSkill2Type === 'effect-resist') {
            totalEffectResist += petSkill2Value;
        }
        
        // 計算最終數值
        totalHealth = baseHealth + (baseHealth * healthPercentBonus / 100) + healthFixedBonus + petHealth;
        totalAttack = baseAttack + (baseAttack * attackPercentBonus / 100) + attackFixedBonus + petAttack;
        totalDefense = baseDefense + (baseDefense * defensePercentBonus / 100) + defenseFixedBonus + petDefense;
        totalSpeed = baseSpeed + speedFixedBonus + petSpeed;
        
        // 更新總數值顯示
        document.getElementById('total-health').textContent = Math.round(totalHealth);
        document.getElementById('total-attack').textContent = Math.round(totalAttack);
        document.getElementById('total-defense').textContent = Math.round(totalDefense);
        document.getElementById('total-speed').textContent = Math.round(totalSpeed);
        document.getElementById('total-crit-rate').textContent = totalCritRate + '%';
        document.getElementById('total-crit-damage').textContent = totalCritDamage + '%';
        document.getElementById('total-effect-hit').textContent = totalEffectHit + '%';
        document.getElementById('total-effect-resist').textContent = totalEffectResist + '%';
    }
});