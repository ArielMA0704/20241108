<template>
    <div class="login-modal-overlay" @click.self="closeModal">
      <div class="login-container">
        <div class="login-box">
          <div class="back-button">
            <button @click="goBack">←</button>
          </div>
          <h1 class="login-title">歡迎登入</h1>
          
          <div class="login-buttons">
            <button 
              class="login-btn google-btn"
              @click="loginWithGoogle"
            >
              使用Google帳戶登入
            </button>
            
            <button 
              class="login-btn Apple-btn"
              @click="loginWithFacebook"
            >
              透過Apple帳戶登入
            </button>
          </div>
        </div>
      </div>
    </div>
    </template>
    
    <script>
    
    
    export default {
      name: 'LoginView',
      methods: {
        goBack() {
          this.$emit('close')
        },
        loginWithGoogle() {
          console.log('Google登入')
        },
        loginWithFacebook() {
          console.log('Facebook登入')
        }
      }
    }
    </script>
    
    <style scoped>
    .login-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1001;
  }
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #f5f5f5;
      border-radius: 12px;
      width: 90%; /* 增加容器寬度 */
    max-width: 800px; /* 增加最大寬度 */
    height: 60vh; /* 設置高度為視窗高度的60% */
    min-height: 400px; /* 設置最小高度 */
    }
    
    .login-box {
      background: white;
    padding: 4rem; /* 增加內邊距 */
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center; /* 垂直居中內容 */
    }
    
    .back-button {
      position: absolute;
      top: 2rem;
      left: 2rem;
    }
    
    .back-button button {
      background: none;
      border: none;
      font-size: 2rem;
      cursor: pointer;
      padding: 0.5rem;
      color: #666;
      transition: color 0.3s ease;
    }
    
    .back-button button:hover {
      color: #333;
    }
    
    .login-title {
      text-align: center;
      margin-bottom: 4rem;
      color: #333;
      font-size: 2.5rem;
      font-weight: bold;
      border-bottom: 3px solid #0D9488;
      padding-bottom: 1rem;
      width: 80%;
      margin: 0 auto 2rem auto;
    }
    
    .login-buttons {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    
    .login-btn {
      padding: 1rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      color: white;
      font-weight: 500;
    }
    
    .google-btn {
      background-color: #DB4437;
    }
    
    .google-btn:hover {
      background-color: #C53929;
      transform: translateY(-2px);
    }
    
    .Apple-btn {
      background-color: black;
    }
    
    .Apple-btn:hover {
      background-color: black;
      transform: translateY(-2px);
    }
    
    /* 響應式設計 */
    @media (max-width: 480px) {
      .login-box {
        margin: 1rem;
        padding: 1.5rem;
      }
    
      .login-title {
        font-size: 1.5rem;
      }
    
      .login-btn {
        padding: 0.8rem;
      }
    }
    </style>
    