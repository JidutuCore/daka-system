// 加载Firebase SDK
function loadFirebaseSDK() {
  return new Promise((resolve) => {
    if (window.firebase) return resolve();
    
    const script1 = document.createElement('script');
    script1.src = 'https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js';
    script1.onload = () => {
      const script2 = document.createElement('script');
      script2.src = 'https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js';
      script2.onload = resolve;
      document.head.appendChild(script2);
    };
    document.head.appendChild(script1);
  });
}

// 初始化Firebase并保存打卡记录
async function saveCheckin(data) {
  await loadFirebaseSDK();
  
  const firebaseConfig = {
    apiKey: "AIzaSyB1c9EJy-gGR5mG4d74BSnyziZqiNUx9rU",
    authDomain: "daka-system.firebaseapp.com",
    projectId: "daka-system",
    storageBucket: "daka-system.appspot.com",
    messagingSenderId: "983975087993",
    appId: "1:983975087993:web:5fc2b2858246836113a9a8"
  };

  // 初始化Firebase
  const app = firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore(app);

  // 保存打卡数据到Firestore
  try {
    await db.collection('checkins').add(data);
    return { success: true };
  } catch (error) {
    console.error('保存打卡记录失败：', error);
    return { success: false, error: error.message };
  }
}