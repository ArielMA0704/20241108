<template>
  <q-page class="flex flex-center column">
    <!-- 照片展示區域 -->
    <section class="gallery-container">
      <div class="image-row">
        <div
          v-for="(image, index) in galleryImages"
          :key="index"
          class="image-item"
          :class="{
            expanded: selectedIndex === index,
            collapsed: selectedIndex !== null && selectedIndex !== index,
          }"
          @click="toggleImage(index)"
        >
          <div class="image-wrapper">
            <img :src="image.url" :alt="image.title" class="gallery-image" />
            <div class="image-overlay" v-show="selectedIndex === index">
              <h3 class="image-title">{{ image.title }}</h3>
              <p class="image-description">{{ image.description }}</p>
            </div>
          </div>
        </div>
      </div>
      <!-- 標題和登入按鈕 -->
      <div class="login-container">
        <h2 class="main-title">醫護聲易通 MedBobi</h2>
        <p class="subtitle">{{t ('致力於打造全方位智慧醫療生態系統，運用創新科技整合醫療資源，為您提供更優質、更便捷的醫療服務體驗')}}</p>
        <!-- Google 登入按鈕 -->
        <div class="login-buttons">
          <button class="experience-button" @click="showLoginModal">
        立即登入體驗
      </button>
          <div id="g_id_signin" v-if="showSSO">xu</div>
        </div>
      </div>

    </section>
    <!-- 關於我們區域 -->



    <div class="hero-section">
      <div class="gradient-container">
        <!-- 左側文字區域 -->
        <div
          ref="fadeInElement"
          :class="{ 'fade-in': fadeInAnimated }"
          class="text-content element"
        >
          <div class="brand-name slide-in-left">醫護聲易通 Medbobi</div>
          <div class="slogan">
            {{t ('智慧對話')}} 
             <span>
            {{t ('專業解答')}}
            </span>
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{t ('為您提供最貼心的服務')}}
          </div>
        </div>

        <!-- 右側手機圖示 -->
        <div class="phone-container">
          <div class="phone phone-top"></div>
          <div class="phone phone-bottom"></div>
        </div>
      </div>
    </div>
<!-- AI輔助診斷區塊 -->
<div class="ai-section">
      <!-- 左側圖片 -->
      <div
        ref="slideInLeftElement"
        :class="{ 'slide-in-left': slideInLeftAnimated }"
        class="ai-image-container element"
      >
        <img src="/Macbook Air.png" alt="AI診斷" class="ai-image" />
      </div>
      <!-- 右側內容 -->
      <div
        ref="slideInRightElement"
        :class="{ 'slide-in-right': slideInRightAnimated }"
        class="ai-content element"
      >
        <div class="ai-text">
          <h2 class="ai-title">{{t ('AI輔助診斷') }}</h2>
          <div class="yellow-line-2"></div>
          <ul class="feature-list">
            <li class="feature-item">{{t ('運用LLM協助語音診斷') }}</li>
            <li class="feature-item">{{t ('提升診斷準確度') }}</li>
            <li class="feature-item">{{t ('縮短就診等待時間') }}</li>
            <li class="feature-item">{{t ('即時分析病症資料') }}</li>
          </ul>
        </div>
      </div>
    </div>

 <!-- 服務介紹 -->
    <section class="services-section">
      <h2 class="section-title">{{t ('服務介紹') }}</h2>

      <!-- 服務照片網格 -->
      <div class="doctor-grid">
        
        <div class="doctor-image" @click="goToPage">
          <img
            src="/male-doctor-with-stethoscope-and-clipboard.jpg"
            alt="門診紀錄"
          />
          <div class="overlay">
            <span class="material-symbols-outlined icon">stethoscope</span>
            <!-- 使用正確的圖標名稱 -->
            <span class="iconTitle">{{t ('門診紀錄') }}</span>
          </div>
        </div>
        <div class="doctor-image" @click="goToPage">
          <img
            src="/female-medical-professional-holds-clipboard-in-hospital-room.jpg"
            alt="護理紀錄"
          />
          <div class="overlay">
            <span class="material-symbols-outlined icon"
              >medication_liquid</span
            >
            <!-- 使用正確的圖標名稱 -->
            <span class="iconTitle">{{t ('護理紀錄') }}</span>
          </div>
        </div>
        <div class="doctor-image" @click="goToPage">
          <img src="/team-taking-meeting-notes.jpg" alt="會議紀錄" />
          <div class="overlay">
            <span class="material-symbols-outlined icon">clinical_notes</span>
            <!-- 使用正確的圖標名稱 -->
            <span class="iconTitle">{{t ('開會紀錄') }}</span>
          </div>
        </div>
        <div class="doctor-image" @click="goToPage">
          <img src="/doctor-approaches-patient.jpg" alt="住院摘要" />
          <div class="overlay">
            <span class="material-symbols-outlined icon">home_health</span>
            <!-- 使用正確的圖標名稱 -->
            <span class="iconTitle">{{t ('住院摘要') }}</span>
          </div>
        </div>
        <div class="doctor-image" @click="goToPage">
          <img src="/nurse-helping-patient.jpg" alt="衛教諮詢" />
          <div class="overlay">
            <span class="material-symbols-outlined icon">vaccines</span>
            <!-- 使用正確的圖標名稱 -->
            <span class="iconTitle">{{t ('衛教諮詢') }}</span>
          </div>
        </div>
        <div class="doctor-image" @click="goToPage">
          <img src="/medical-doctors-desk.jpg" alt="其他服務" />
          <div class="overlay">
            <span class="material-symbols-outlined icon">info</span>
            <!-- 使用正確的圖標名稱 -->
            <span class="iconTitle">{{t ('其他服務') }}</span>
          </div>
        </div>
      </div>
    </section>

    <q-page-sticky position="top-right" :offset="[18, 18]">
      <div id="loginPage" />
    </q-page-sticky>
  </q-page>
<!--1108  <LoginView 
        v-if="isLoginModalVisible" 
  @close="hideLoginModal"
  @login-success="handleLoginSuccess"
      />-->>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { api } from "boot/axios";
import { useQuasar } from "quasar";
import { setToken, checkLogin } from "boot/account";
import { useLoginStore } from "stores/token";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from 'vue-i18n';
//1108import  LoginView  from './components/LoginView.vue';

export default defineComponent({
  name: "LoginPage",
//1108  components: {
//1108  LoginView,
//1108},

  setup() {
    const $q = useQuasar();
    const route = useRoute();
    const router = useRouter();
    const showSSO = ref(true);
    const loginStore = useLoginStore();
    const { t, locale } = useI18n();
    
    const toggleLanguage = () => {
      locale.value = locale.value === 'zh-TW' ? 'en' : 'zh-TW';
    };
    // 照片相關狀態
    const selectedIndex = ref(null);
    const galleryImages = ref([
      {
        url: "/pexels-gustavo-fring-3985163.jpg",
        title:t("專業醫療團隊"),
        description: t("我們的專業醫療團隊提供全方位醫療照護服務"),
      },
      {
        url: "/doctor-approaches-patient.jpg",
        title:t( "細心照護"),
        description:t( "以病人為中心的貼心護理服務"),
      },
      {
        url: "/doctors-medical-gear.jpg",
        title: t("醫療諮詢"),
        description: t("提供專業的醫療諮詢與建議"),
      },
      {
        url: "/hospital-room-interior.jpg",
        title: t("完整紀錄"),
        description: t("詳實的醫療記錄管理系統"),
      },
    ]);

    // 照片展示方法
    const toggleImage = (index) => {
      selectedIndex.value = selectedIndex.value === index ? null : index;
    };
    const isLoginModalVisible = ref(false);  // 添加这行
    const loginModalRef = ref(null)

    const showLoginModal = () => {
    isLoginModalVisible.value = true;
  };
  
  const hideLoginModal = () => {
    isLoginModalVisible.value = false;
  };

  const handleLoginSuccess = (userData) => {
    hideLoginModal();
    // 处理登录成功逻辑
  };
    // Google 登入相關方法
    async function googleAuth(evt) {
      await login(evt, "google");
    }

    async function login(resp, iss) {
      try {
        $q.loading.show();
        const post = await api.post("login", {
          resp: resp,
          iss: iss,
        });
        const { data } = post;
        setToken(data.ltt, data.stt);
        loginStore.setValue(
          true,
          JSON.parse(atob(data.stt.split(".")[1])).username
        );
        $q.loading.hide();
        toProjectPage();
      } catch (error) {
        $q.loading.hide();
        $q.notify({
          position: "top",
          message: error.toString(),
          type: "negative",
        });
        console.error("err", error);
      }
    }

    function toProjectPage() {
      router.push('/scene');
    }

    function googleInit() {
      if (window.google) {
        google.accounts.id.initialize({
          client_id:
            "48299599921-oghrh3htslmgsccnavcdv60mm3k8i5tn.apps.googleusercontent.com",
          callback: googleAuth,
          auto_select: true,
          itp_support: true,
          prompt_parent_id: "loginPage",
        });
        google.accounts.id.renderButton(
          document.getElementById("g_id_signin"),
          {
            theme: "filled_blue",
            size: "large",
            width: 250, // 設置按鈕寬度
          }
        );
      } else {
        setTimeout(googleInit, 500);
      }
    }

    onMounted(async () => {
      if (await checkLogin(true)) {
        toProjectPage();
      } else {
        try {
          googleInit();
        } catch (error) {
          $q.notify({
            position: "top",
            message: error.toString(),
            type: "negative",
          });
        }
        google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log(notification);
          }
        });
      }
    });
    const fadeInAnimated = ref(false);
    const slideInLeftAnimated = ref(false);
    const slideInRightAnimated = ref(false);
    
    const fadeInElement = ref(null);
    const slideInLeftElement = ref(null);
    const slideInRightElement = ref(null);

    // 添加 Intersection Observer
    onMounted(() => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === fadeInElement.value) {
              fadeInAnimated.value = true;
            } else if (entry.target === slideInLeftElement.value) {
              slideInLeftAnimated.value = true;
            } else if (entry.target === slideInRightElement.value) {
              slideInRightAnimated.value = true;
            }
            observer.unobserve(entry.target);
          }
        });
      });

      if (fadeInElement.value) observer.observe(fadeInElement.value);
      if (slideInLeftElement.value) observer.observe(slideInLeftElement.value);
      if (slideInRightElement.value) observer.observe(slideInRightElement.value);
    });

    return {
      showSSO,
      selectedIndex,
      galleryImages,
      toggleImage,
      fadeInAnimated,
      slideInLeftAnimated,
      slideInRightAnimated,
      fadeInElement,
      slideInLeftElement,
      slideInRightElement,
      toggleLanguage,
      t,
      isLoginModalVisible,
    showLoginModal,
    hideLoginModal,
    handleLoginSuccess,
    };
  },
});
</script>

<style scoped>

.gallery-container {
  width: 100%;
  padding: 20px;
  overflow: hidden;
  background-color: #f5f5f5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.image-row {
  display: flex;
  gap: 10px;
  height: 600px;
  width: 100%;
  margin-bottom: 2rem;
}
.experience-button {
  border: 2px solid #166868;
  color: #166868;
  background-color: transparent;
  padding: 10px 20px;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 25px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
}

.experience-button:hover {
  background-color: #166868;
  color: white;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
}
.image-item {
  flex: 1;
  position: relative;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.image-wrapper {
  height: 100%;
  position: relative;
  overflow: hidden;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.image-item.expanded {
  flex: 3;
}

.image-item.collapsed {
  flex: 0.5;
}

.image-item:hover .gallery-image {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.expanded .image-overlay {
  opacity: 1;
}

.image-title {
  font-size: 1.5rem;
  margin-bottom: 8px;
  font-weight: bold;
}

.image-description {
  font-size: 1rem;
  line-height: 1.4;
}

.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
  max-width: 800px;
}

.main-title {
  font-size: 3rem;
  color: #166868;
  margin-bottom: 1rem;
  text-align: center;
  font-weight: bold;
}

.subtitle {
  font-size: 2.5 rem;
  color: #666;
  margin-top: 2rem;
  margin-bottom: 2rem;
  text-align: center;
}

.login-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 300px;
}

.hero-section {
  width: 100%;
  min-height: 400px;
  overflow: hidden;
  margin-top: 20px;
}

.gradient-container {
  background: linear-gradient(135deg, #8CD7D7 0%, #166868 100%);
  padding: 100px;
  min-height: 100px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

/* 添加手機相關樣式 */
.phone-container {
  position: relative;
  width: 300px;
  height: 400px;
  margin-right: 40px;
}

.phone {
  position: absolute;
  width: 200px;
  height: 380px;
  background-color: #ffffff;
  border-radius: 20px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.phone-top {
  right: 40px;
  top: 0;
  transform: rotate(-5deg);
  z-index: 2;
}

.phone-bottom {
  right: 80px;
  top: 20px;
  transform: rotate(-15deg);
  opacity: 0.8;
}

/* 添加互動效果 */
.phone-container:hover .phone-top {
  transform: rotate(0deg) translateY(-10px);
}

.phone-container:hover .phone-bottom {
  transform: rotate(-10deg) translateY(10px);
}

/* 添加 AI 區域樣式 */
.ai-section {
  padding: 40px;
  position: relative;
  min-height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  background-color: #fff;
}

.ai-image-container {
  flex: 1;
  max-width: 45%;
  display: flex;
 justify-content: center;
 align-items: center;
}

.ai-image {
  width: 100%;
  height: auto;
  border-radius: 10px;
  transition: transform 0.3s ease;
}

.ai-image:hover {
  transform: scale(1.02);
}


.ai-content {
  flex: 1;
  max-width: 45%;
  padding: 30px;
  background: linear-gradient(135deg, #8CD7D7 0%, #166868 100%);
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.ai-title {
  font-size: 32px;
  font-weight: bold;
  color: #166868;
  margin-bottom: 15px;
  text-align: center;
  text-shadow: 2px 2px 5px rgba(255, 255, 255, 0.4);
}
.ai-text {
  margin-left: 0px;
}

.yellow-line-1 {
  width: 600px;
  height: 4px;
  background-color: #ffe66d;
  
}

.yellow-line-2 {
  width: 300px;
  height: 4px;
  background-color: #ffe66d;
  margin-bottom: 20px;
}

.feature-list {
  list-style: none;
  padding: 0;
}

.feature-item {
  font-size: 20px;
  color: white;
  margin-bottom: 15px;
  padding-left: 20px;
  position: relative;
}

.feature-item::before {
  content: "-";
  position: absolute;
  left: 0;
  color: white;
}
.brand-name {
  font-size: 32px;
  font-weight: bold;
  color: #166868;
  margin-bottom: 15px;
  position: relative;
  display: inline-block;
  text-shadow: 2px 2px 5px rgba(255, 255, 255, 0.4);
}
/* 服務介紹樣式 */
.material-symbols-outlined {
  font-variation-settings: "FILL" 0, "wght" 200, "GRAD" 0, "opsz" 24;
}

.section-title {
  font-size: 2.25rem;
  font-weight: bold;
  text-align: center;
  color: #166868;
  text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2);
  border-width: 0;
}

.services-section {
  background-color: #f5f5f5;
  width: 100%;
  padding-bottom: 50px;
}

.doctor-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 使用三列的網格 */
  gap: 1.5rem;
  max-width: 1200px; /* 可根據需要調整最大寬度 */
  width: 100%;
  justify-self: center;
}

.icon-container {
  position: relative;
  display: inline-block;
}

.image {
  width: 300px; /* 調整圖片大小 */
  height: auto;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  opacity: 1;
  transition: opacity 0.3s ease;
}

.doctor-image:hover .overlay {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.5);
}

.doctor-image:hover {
  box-shadow: 0px 0px 9.5px 5px rgba(0, 0, 0, 0.3);
}

.icon {
  margin-right: 5px; /* 圖標與文字之間的距離 */
  font-size: 50px; /* 調整圖標大小 */
  text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2);
}

.iconTitle {
  font-size: 24px;
  text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2);
  font-weight: bold;
}

.doctor-image {
  width: 400px;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 15px;
  position: relative;
  display: inline-block;
  box-shadow: 0px 0px 10px 5px rgba(0, 0, 0, 0.15);
}

.doctor-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.service-process {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.brand-name::after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: #ffe66d;
}

/* 添加動畫相關樣式 */
.fade-in {
  animation: fadeIn 1s ease-in forwards;
}

.slide-in-left {
  opacity: 0;
  transform: translateX(-50px);
  animation: slideInLeft 0.8s ease forwards;
  animation-delay: 0.3s; /* 延遲執行 */
}

.slide-in-right {
  opacity: 0;
  transform: translateX(50px);
  animation: slideInRight 0.8s ease forwards;
  animation-delay: 0.6s; /* 延遲執行 */
}

.slogan {
  font-size: 24px;
  color: #ffffff;
  line-height: 1.6;
  margin-top: 20px;
}


/* 動畫關鍵幀 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 768px) {
  .image-row {
    height: 300px;
  }

  .image-title {
    font-size: 1.2rem;
  }

  .image-description {
    font-size: 0.9rem;
  }

  .image-item.expanded {
    flex: 2;
  }

  .main-title {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 1rem;
  }
  .ai-section {
    flex-direction: column;
    padding: 20px;
  }

 .ai-content {
    max-width: 100%;
    padding: 30px;
    min-height: 350px;
  }

  .ai-title {
    font-size: 28px;
  }

  .feature-item {
    font-size: 18px;
  }
  .gradient-container {
    flex-direction: column;
    text-align: center;
  }

  .phone-container {
    margin: 40px auto;
    transform: scale(0.8);
  }


}
</style>