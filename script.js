// 工人报工系统 JavaScript 文件
// 用途：处理所有交互逻辑和数据管理
// 用户账户数据（演示用）
const users = {
    'admin': { password: '123456', type: 'admin', name: '管理员' },
    'worker1': { password: '123456', type: 'worker', name: '张三' },
    'worker2': { password: '123456', type: 'worker', name: '李四' },
    'worker3': { password: '123456', type: 'worker', name: '王五' }
};
// 工作类型映射
const workTypeMap = {
"plumbing": "水电改造",
"woodwork": "木作工程",
"masonry": "泥瓦施工",
"painting": "油漆施工",
"installation": "安装工程",
"cleanup": "竣工保洁"
};
// 当前登录用户
let currentUser = null;
// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});
// 初始化应用
function initializeApp() {
    // 设置今天日期为默认值
    const today = new Date().toISOString().split('T')[0];
    const workDateInput = document.getElementById('workDate');
    if (workDateInput) {
        workDateInput.value = today;
    }
    
    // 绑定登录表单事件
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // 绑定工人报告表单事件
    const progressForm = document.getElementById('progressForm');
    if (progressForm) {
        progressForm.addEventListener('submit', handleProgressSubmit);
    }
    
    // 检查是否有已登录的用户
    checkExistingLogin();
}
// 检查现有登录状态
function checkExistingLogin() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        if (currentUser.type === 'worker') {
            showWorkerPage();
        } else if (currentUser.type === 'admin') {
            showAdminPage();
        }
    }
}
// 处理登录
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const userType = document.getElementById('userType').value;
    
    // 验证用户
    if (users[username] && users[username].password === password && users[username].type === userType) {
        currentUser = {
            username: username,
            name: users[username].name,
            type: userType
        };
        
        // 保存登录状态
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // 根据用户类型跳转
        if (userType === 'worker') {
            showWorkerPage();
        } else if (userType === 'admin') {
            showAdminPage();
        }
    } else {
        showMessage('submitMessage', '用户名、密码或角色错误！', 'error');
    }
}
// 显示工人页面
function showWorkerPage() {
    hideAllPages();
    document.getElementById('workerPage').classList.remove('hidden');
    document.getElementById('workerName').textContent = currentUser.name;
}
// 显示管理员页面
function showAdminPage() {
    hideAllPages();
    document.getElementById('adminPage').classList.remove('hidden');
    document.getElementById('adminName').textContent = currentUser.name;
    loadAllReports();
    populateWorkerFilter();
}
// 隐藏所有页面
function hideAllPages() {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
}
// 退出登录
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    hideAllPages();
    document.getElementById('loginPage').classList.remove('hidden');
    
    // 清空登录表单
    document.getElementById('loginForm').reset();
}
// 处理工人进度提交
function handleProgressSubmit(event) {
    event.preventDefault();
    
    const report = {
        id: Date.now(),
        date: document.getElementById('workDate').value,
        workerName: currentUser.name,
        workerUsername: currentUser.username,
        workType: document.getElementById('workType').value,
        workHours: parseFloat(document.getElementById('workHours').value),
        workDescription: document.getElementById('workDescription').value,
        workProgress: parseInt(document.getElementById('workProgress').value),
        submitTime: new Date().toLocaleString('zh-CN')
    };
    
    // 保存报告
    saveReport(report);
    
    // 显示成功消息
    showMessage('submitMessage', '报告提交成功！', 'success');
    
    // 重置表单
    document.getElementById('progressForm').reset();
    
    // 重新设置今天日期
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('workDate').value = today;
}
// 保存报告到本地存储
function saveReport(report) {
    let reports = JSON.parse(localStorage.getItem('workReports') || '[]');
    reports.push(report);
    localStorage.setItem('workReports', JSON.stringify(reports));
}
// 加载所有报告（管理员用）
function loadAllReports(filters = {}) {
    const reports = JSON.parse(localStorage.getItem('workReports') || '[]');
    const reportsBody = document.getElementById('reportsBody');
    
    // 应用筛选
    let filteredReports = reports;
    
    if (filters.date) {
        filteredReports = filteredReports.filter(report => report.date === filters.date);
    }
    
    if (filters.worker) {
        filteredReports = filteredReports.filter(report => report.workerUsername === filters.worker);
    }
    
    // 按日期倒序排列
    filteredReports.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 清空表格
    reportsBody.innerHTML = '';
    
    if (filteredReports.length === 0) {
        reportsBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">暂无数据</td></tr>';
        return;
    }
    
    // 填充表格
    filteredReports.forEach(report => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${report.date}</td>
            <td>${report.workerName}</td>
            <td>${workTypeMap[report.workType] || report.workType}</td>
            <td>${report.workHours} 小时</td>
            <td>${report.workDescription}</td>
            <td>
                <div>${report.workProgress}%</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${report.workProgress}%"></div>
                </div>
            </td>
            <td>${report.submitTime}</td>
        `;
        reportsBody.appendChild(row);
    });
}
// 填充工人筛选下拉框
function populateWorkerFilter() {
    const filterWorker = document.getElementById('filterWorker');
    filterWorker.innerHTML = '<option value="">所有工人</option>';
    
    // 获取所有工人用户
    Object.keys(users).forEach(username => {
        if (users[username].type === 'worker') {
            const option = document.createElement('option');
            option.value = username;
            option.textContent = users[username].name;
            filterWorker.appendChild(option);
        }
    });
}
// 筛选报告
function filterReports() {
    const date = document.getElementById('filterDate').value;
    const worker = document.getElementById('filterWorker').value;
    
    const filters = {};
    if (date) filters.date = date;
    if (worker) filters.worker = worker;
    
    loadAllReports(filters);
}
// 清除筛选
function clearFilters() {
    document.getElementById('filterDate').value = '';
    document.getElementById('filterWorker').value = '';
    loadAllReports();
}
// 显示消息提示
function showMessage(elementId, message, type) {
    const messageElement = document.getElementById(elementId);
    if (!messageElement) return;
    
    messageElement.textContent = message;
    messageElement.className = `message ${type}`;
    messageElement.style.display = 'block';
    
    // 3秒后自动隐藏
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 3000);
}
// 工具函数：格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
}
// 工具函数：验证日期格式
function isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}
// 导出功能（可选扩展）
function exportToCSV() {
    const reports = JSON.parse(localStorage.getItem('workReports') || '[]');
    if (reports.length === 0) {
        alert('暂无数据可导出');
        return;
    }
    
    // 创建CSV内容
    let csv = '日期,工人姓名,工作类型,工作时长,工作描述,完成进度,提交时间\n';
    
    reports.forEach(report => {
        csv += `${report.date},${report.workerName},${workTypeMap[report.workType] || report.workType},${report.workHours},"${report.workDescription}",${report.workProgress}%,${report.submitTime}\n`;
    });
    
    // 创建下载链接
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `工作报告_${new Date().toLocaleDateString('zh-CN')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
// 数据统计功能（可选扩展）
function getStatistics() {
    const reports = JSON.parse(localStorage.getItem('workReports') || '[]');
    const stats = {
        totalReports: reports.length,
        totalHours: reports.reduce((sum, report) => sum + report.workHours, 0),
        averageProgress: reports.length > 0 ? 
            Math.round(reports.reduce((sum, report) => sum + report.workProgress, 0) / reports.length) : 0,
        workers: [...new Set(reports.map(report => report.workerUsername))].length
    };
    return stats;
}
// 键盘快捷键
document.addEventListener('keydown', function(event) {
    // Ctrl + L 快速退出登录
    if (event.ctrlKey && event.key === 'l') {
        event.preventDefault();
        if (currentUser) {
            logout();
        }
    }
});