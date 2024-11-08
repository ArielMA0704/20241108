<template>
  <q-layout view="hHh lpr lFf">
    <q-header elevated class="bg-teal-600">
      <q-toolbar>
        <q-toolbar-title class="brand">MedBobi</q-toolbar-title>

        <!-- Navigation Items -->
        <div class="nav-buttons gt-sm">
          <q-btn
            v-for="item in navItems"
            :key="item.title"
            flat
            no-caps
            padding="sm lg"
            :label="item.title"
          >
            <q-menu v-if="item.subItems" auto-close>
              <q-list style="min-width: 200px">
                <q-item
                  v-for="subItem in item.subItems"
                  :key="subItem.title"
                  clickable
                  v-close-popup
                  @click="navigate(subItem.link)"
                >
                  <q-item-section>{{ subItem.title }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>

        <!-- Mobile Menu Button -->
        <q-btn
          flat
          dense
          round
          icon="menu"
          class="lt-md"
          @click="drawerRight = !drawerRight"
        />

        <!-- Language Selector -->
        <q-btn-dropdown
          flat
          :label="selectedLanguage"
          style="margin-right: 16px"
        >
          <q-list>
            <q-item
              v-for="lang in languages"
              :key="lang.code"
              clickable
              v-close-popup
              @click="selectLanguage(lang)"
            >
              <q-item-section>
                <q-item-label>{{ lang.name }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <!-- User Actions -->
        <q-btn icon="home" to="/scene" flat v-if="loginStatus" />
        <q-btn
          icon="person"
          flat
          v-if="loginStatus"
          @click="userSetting = true"
        />
        <q-btn icon="logout" flat v-if="loginStatus" @click="logoutFunc" />
      </q-toolbar>

      <!-- User Settings Dialog -->
      <q-dialog v-model="userSetting" @before-show="initUserSetting">
        <q-card>
          <q-card-section>
            <div class="text-h6">User Setting</div>
            <div class="text-subtitle1">{{ username }}</div>
            <div class="flex column">
              <q-btn
                :label="t('managePromptBookmarks')"
                to="/promptManagement"
                no-caps
              />
              <q-btn
                :label="t('管理知識庫')"
                to="/knowledgeManagement"
                class="q-mt-sm"
                no-caps
              />
              <q-btn
                :label="t('管理後台')"
                no-caps
                to="/ManagementSystem"
                v-if="userRole == 'ADMIN'"
                class="q-mt-sm"
              />
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>
    </q-header>

    <!-- Mobile Navigation Drawer -->
    <q-drawer v-model="drawerRight" side="right" bordered>
      <q-list>
        <q-expansion-item
          v-for="item in navItems"
          :key="item.title"
          :label="item.title"
          :caption="item.subItems ? '展開子選單' : ''"
        >
          <q-list v-if="item.subItems">
            <q-item
              v-for="subItem in item.subItems"
              :key="subItem.title"
              clickable
              @click="navigate(subItem.link)"
            >
              <q-item-section>{{ subItem.title }}</q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from "vue";
import { logout, checkLogin, getToken, setToken } from "boot/account";
import { useLoginStore } from "stores/token";
import ReconnectingWebSocket from "reconnecting-websocket";
import { useQuasar } from "quasar";
import { api, baseURL } from "boot/axios";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
const langList = import.meta.glob("../../node_modules/quasar/lang/*.js");

export default defineComponent({
  name: "MainLayout",

  setup() {
    const router = useRouter();
    const loginStore = useLoginStore();
    const loginStatus = computed(() => loginStore.login);
    const $q = useQuasar();
    const route = useRoute();
    const username = computed(() => loginStore.user);
    const userRole = ref(null);
    const userSetting = ref(false);
    const { locale, t } = useI18n({ useScope: "global" });
    const drawerRight = ref(false);

    // 導航項目
    const navItems = ref([
      { 
        title: t('首頁'), 
        link: '/'
      },
      { 
        title: t('關於我們'), 
        link: '/about',
        subItems: [
          { title: '公司簡介', link: '/about/intro' },
          { title: '經營理念', link: '/about/philosophy' },
          { title: '團隊成員', link: '/about/team' }
        ]
      },
      { 
        title: t('服務項目'), 
        link: '/services',
        subItems: [
          { title: '門診紀錄', link: '/services/clinic' },
          { title: '護理紀錄', link: '/services/nursing' },
          { title: '會議紀錄', link: '/services/meeting' },
          { title: '住院摘要', link: '/services/hospitalization' },
          { title: '衛教諮詢', link: '/services/consultation' }
        ]
      },
      { 
        title: t('聯絡我們'), 
        link: '/contact'
      }
    ]);

    // 語言選項
    const languages = ref([
      { code: 'zh-TW', name: '中文' },
      { code: 'en-US', name: 'English' },
    ]);
    
    const selectedLanguage = computed(() => {
      return locale.value === 'zh-TW' ? '中文' : 'English';
    });

    function selectLanguage(lang) {
      locale.value = lang.code;
      langList[`../../node_modules/quasar/lang/${lang.code}.js`]().then(
        (lang) => {
          $q.lang.set(lang.default);
        }
      );
    }

    function navigate(link) {
      router.push(link);
    }

    // 其他原有功能...
    function wsConnect(username) {
      var ws = new ReconnectingWebSocket(
        baseURL.replace("https", "wss") + "ws/" + username
      );
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        $q.notify({
          position: "top",
          type: data.type,
          message: data.msg,
        });
      };
    }

    onMounted(async () => {
      if (route.path != "/intraApp") {
        if (await checkLogin()) {
          var token = getToken();
          loginStore.setValue(
            true,
            JSON.parse(atob(token.split(".")[1])).username
          );
          wsConnect(username.value);
        } else {
          loginStore.setValue(false, null);
        }
      }
    });

    return {
      navItems,
      languages,
      selectedLanguage,
      selectLanguage,
      navigate,
      drawerRight,
      loginStatus,
      username,
      userSetting,
      userRole,
      t,
      logoutFunc() {
        loginStatus.value = false;
        google.accounts.id.disableAutoSelect();
        logout();
      },
      initUserSetting() {
        const token = getToken();
        if (token) {
          const userInfo = JSON.parse(atob(token.split(".")[1]));
          userRole.value = userInfo.role;
        }
      },
    };
  },
});
</script>

<style scoped>
.brand {
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-buttons {
  display: flex;
  gap: 0.5rem;
}

@media (max-width: 1023px) {
  .nav-buttons {
    display: none;
  }
}
</style>