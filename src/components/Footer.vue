<template>
    <footer class="footer">
      <div class="footer-container">
        <!-- 公司資訊 -->
        <div class="footer-section">
          <h2 class="company-title">MedBobi</h2>
          <h3 class="company-subtitle">醫護易聲通 </h3>
          <div class="contact-info">
            <p>總機：+886-2-0122-1234</p>
            <p>傳真：+886-2-0122-1234</p>
            <p>手機：+886-2-0122-1234</p>
            <p>Email：@.com.tw</p>
          </div>
        </div>
  
        <!-- 院區資訊 -->
        <div class="footer-section">
          <div class="section-title">院區資訊</div>
          <div class="section-underline"></div>
          <div class="hospital-info">
            <h3>中興院區</h3>
            <p>新竹縣竹東鎮中興路四段195號</p>
          </div>
          <div class="hospital-info">
            <h3>光復院區</h3>
            <p>新竹市光復路二段321號1館</p>
          </div>
        </div>
  
        <!-- 服務項目 -->
        <div class="footer-section">
          <div class="section-title">服務內容</div>
          <div class="section-underline"></div>
          <ul class="service-list">
            <li>門診紀錄</li>
            <li>護理紀錄</li>
            <li>會議紀錄</li>
            <li>住院摘要</li>
            <li>阿茲海默症衛教</li>
          </ul>
        </div>
      </div>
    </footer>
  </template>
  
  <script>
  export default {
    name: 'FooterComp'
  }
  </script>
  
  <style scoped>
  .footer {
    background-color: #19867E;
    color: white;
    padding: 3rem 0;
    width: 100%;
    
  }
  
  .footer-container {
    max-width: 100%;
    padding: 0 2rem;
    display: grid;
    grid-template-columns: 1.5fr 1fr 1fr;
    gap: 4rem;
  }
  
  .footer-section {
    display: flex;
    flex-direction: column;
    padding: 0 1rem;
  }
  
  .company-title {
    font-size: 2rem;
    font-weight: bold;
    margin: 0;
    color: #FFE66D;
  }
  
  .company-subtitle {
    font-size: 1.2rem;
    margin: 0.5rem 0 1.5rem 0;
    padding-bottom: 1rem;
    border-bottom: 2px solid #FFE66D;
    width: 80%;
  }
  
  .section-title {
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    color: #FFE66D;
  }
  
  .section-underline {
    width: 60%;
    height: 2px;
    background-color: #FFE66D;
    margin-bottom: 1.5rem;
  }
  
  .contact-info {
    margin-top: 1rem;
  }
  
  .contact-info p {
    margin: 0.5rem 0;
    font-size: 1rem;
    line-height: 1.5;
  }
  
  .hospital-info {
    margin-bottom: 1.5rem;
  }
  
  .hospital-info h3 {
    font-size: 1.1rem;
    margin: 0 0 0.5rem 0;
    color: white;
  }
  
  .hospital-info p {
    margin: 0;
    font-size: 1rem;
    line-height: 1.5;
  }
  
  .service-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .service-list li {
    margin: 0.8rem 0;
    font-size: 1rem;
    line-height: 1.5;
  }
  
  /* 響應式設計 */
  @media (max-width: 1024px) {
    .footer-container {
      grid-template-columns: 1fr 1fr;
      gap: 3rem;

    }
  
    .footer-section:first-child {
      grid-column: 1 / -1;
    }
  }
  
  @media (max-width: 768px) {
    .footer-container {
      grid-template-columns: 1fr;
      gap: 2.5rem;
      padding: 0 1.5rem;
    }
  
    .footer-section {
      align-items: center;
      text-align: center;
      padding: 0;
    }
  
    .company-subtitle,
    .section-underline {
      width: 80%;
    }
  
    .contact-info,
    .hospital-info,
    .service-list {
      width: 100%;
      text-align: center;
    }
  }
  
  @media (max-width: 480px) {
    .footer {
      padding: 2rem 0;
    }
  
    .footer-container {
      gap: 2rem;
      padding: 0 1rem;
    }
  
    .company-title {
      font-size: 1.75rem;
    }
  
    .company-subtitle,
    .section-title {
      font-size: 1.1rem;
    }
  
    .contact-info p,
    .hospital-info p,
    .service-list li {
      font-size: 0.95rem;
    }
  }
  
  /* 動畫效果 */
  .footer-section {
    opacity: 0;
    animation: fadeIn 0.5s ease-in forwards;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .footer-section:nth-child(1) {
    animation-delay: 0.1s;
  }
  
  .footer-section:nth-child(2) {
    animation-delay: 0.3s;
  }
  
  .footer-section:nth-child(3) {
    animation-delay: 0.5s;
  }
  </style>