/* 这个文件是备用JavaScript文件，主要逻辑已集成在HTML文件的<script>标签中 */

// 以下是一些额外的功能或优化，可以根据需要添加

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查浏览器兼容性
    checkBrowserCompatibility();
    
    // 添加键盘快捷键支持
    addKeyboardShortcuts();
    
    // 添加页面可见性变化监听
    addVisibilityChangeListeners();
});

// 检查浏览器兼容性
function checkBrowserCompatibility() {
    // 检查localStorage支持
    if (!typeof(Storage) !== 'undefined') {
        console.warn('您的浏览器不支持localStorage，数据将无法保存');
        showToast('警告：您的浏览器不支持本地存储，数据将无法保存');
    }
    
    // 检查其他特性支持...
}

// 添加键盘快捷键支持
function addKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        // Ctrl/Cmd + S: 保存数据
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            updateLocalStorage();
            showToast('数据已保存');
        }
        
        // Ctrl/Cmd + R: 重置页面
        if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
            // 让浏览器默认处理页面刷新
        }
        
        // ESC: 关闭弹窗
        if (event.key === 'Escape') {
            closeAddressModal();
            closeImageModal();
        }
    });
}

// 添加页面可见性变化监听
function addVisibilityChangeListeners() {
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden') {
            // 页面隐藏时自动保存数据
            updateLocalStorage();
        }
    });
}

// 图片压缩函数（如果需要）
function compressImage(file, maxWidth, maxHeight, quality) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;
            img.onload = function() {
                let width = img.width;
                let height = img.height;
                
                // 计算缩放比例
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }
                
                // 创建Canvas
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                // 绘制图像
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // 转换为Blob
                canvas.toBlob(function(blob) {
                    resolve(blob);
                }, file.type, quality);
            };
            img.onerror = function() {
                reject(new Error('图片加载失败'));
            };
        };
        reader.onerror = function() {
            reject(new Error('文件读取失败'));
        };
    });
}

// 导出数据为JSON文件
function exportData() {
    // 获取所有数据
    updateLocalStorage();
    const storedData = localStorage.getItem('newYearLotteryData');
    if (!storedData) {
        showToast('没有可导出的数据');
        return;
    }
    
    // 创建Blob对象
    const blob = new Blob([storedData], { type: 'application/json' });
    
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newYearLottery_${new Date().toISOString().slice(0, 10)}.json`;
    
    // 触发下载
    document.body.appendChild(a);
    a.click();
    
    // 清理
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 0);
    
    showToast('数据导出成功');
}

// 导入数据从JSON文件
function importData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function(event) {
            try {
                const data = JSON.parse(event.target.result);
                
                // 验证数据格式
                if (!data.participants || !Array.isArray(data.participants)) {
                    throw new Error('无效的数据格式');
                }
                
                // 保存到本地存储
                localStorage.setItem('newYearLotteryData', JSON.stringify(data));
                
                // 刷新页面
                location.reload();
                
                resolve();
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = function() {
            reject(new Error('文件读取失败'));
        };
    });
}

// 分享功能（如果需要）
function shareResult() {
    // 检查Web Share API是否可用
    if (navigator.share) {
        navigator.share({
            title: '2026马年新年抽签送礼',
            text: '我在新年抽签活动中抽中了...',
            url: window.location.href
        }).catch(function(error) {
            console.error('分享失败:', error);
        });
    } else {
        // 复制链接到剪贴板
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(function() {
            showToast('链接已复制到剪贴板');
        }).catch(function(error) {
            console.error('复制失败:', error);
            showToast('复制失败，请手动复制链接');
        });
    }
}