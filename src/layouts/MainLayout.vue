<template>
  <q-layout view="hHh lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <!-- <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        /> -->

        <q-toolbar-title> 小智醫師 </q-toolbar-title>

        <!-- <div>Quasar v{{ $q.version }}</div> -->
        <!-- <q-btn
          icon="menu_book"
          href="https://docs.google.com/presentation/d/1wL_j06Y5lCcvbNYDVTFwaP6YBcCxxrasB5AZis01mUY/edit#slide=id.g25c602d94f5_0_285"
          target="_blank"
          flat
        /> -->
        <q-btn icon="home" to="/scene" flat v-if="loginStatus" />
        <q-btn
          icon="person"
          flat
          v-if="loginStatus"
          @click="userSetting = true"
        >
          <!-- <q-menu>
            <div class="row no-wrap q-pa-md">
              <div class="column">
                <q-btn label="Account Setting" />
              </div>
            </div>
          </q-menu> -->
        </q-btn>
        <!-- @click="logoutFunc" -->
        <q-btn icon="logout" flat v-if="loginStatus" @click="logoutFunc" />
      </q-toolbar>
      <q-dialog v-model="userSetting" @before-show="initUserSetting">
        <q-card>
          <q-card-section>
            <div class="text-h6">User Setting</div>
            <div class="text-subtitle1">{{ username }}</div>
            <div class="flex column">
              <q-btn label="管理 prompt 書籤" to="/promptManagement" />
              <q-btn
                label="管理知識庫"
                to="/knowledgeManagement"
                class="q-mt-sm"
              />
              <q-btn
                label="管理後台"
                to="/ManagementSystem"
                v-if="userRole == 'ADMIN'"
                class="q-mt-sm"
              />
            </div>

            <div class="flex q-mt-md">
              <div class="flex columns items-center">
                <div class="text-subtitle1 text-weight-bold">
                  預設回覆長度 (Tokens)：
                </div>
                <q-btn
                  icon="sym_r_info"
                  flat
                  round
                  padding="xs"
                  @click="
                    $q.dialog({
                      title: 'Tokens',
                      message:
                        '一個英文詞可能為 2 至 4 個 token，一個中文字可能為 1 至 3 個 token',
                      ok: false,
                    })
                  "
                />
              </div>
              <div></div>
              <div class="flex full-width justify-center">
                <q-slider
                  v-model="replyTokens"
                  :min="20"
                  :max="3000"
                  label
                  :marker-labels="[
                    { value: 20, label: 20 },
                    { value: 1000, label: 1000 },
                    { value: 2000, label: 2000 },
                    { value: 3000, label: 3000 },
                  ]"
                  switch-label-side
                  style="width: 95%"
                  @change="update_reply_tokens"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>
    </q-header>

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

export default defineComponent({
  name: "MainLayout",

  components: {},

  setup() {
    const leftDrawerOpen = ref(false);
    const loginStore = useLoginStore();
    const loginStatus = computed(() => loginStore.login);
    const $q = useQuasar();
    const route = useRoute();
    const username = computed(() => loginStore.user);
    const userRole = ref(null);
    const userSetting = ref(false);

    const replyTokens = ref(1000);

    function wsConnect(username) {
      var ws = new ReconnectingWebSocket(
        baseURL.replace("https", "wss") + "ws/" + username
      );
      // console.log(ws);
      ws.onmessage = (event) => {
        // console.log(event);
        const data = JSON.parse(event.data);
        $q.notify({
          position: "top",
          type: data.type,
          message: data.msg,
        });
      };
      // ws.onclose = function () {
      //   console.log("connection closed");
      //   wsConnect(username);
      // };
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
          // loginStatus.value = false;
        }
      }
    });

    return {
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      loginStatus,
      logoutFunc() {
        loginStatus.value = false;
        google.accounts.id.disableAutoSelect();
        logout();
      },
      username,
      userSetting,
      userRole,
      isPwd: ref(true),
      initUserSetting() {
        const token = getToken();
        if (token) {
          const userInfo = JSON.parse(atob(token.split(".")[1]));
          const sso = userInfo.sso;
          const permission = userInfo.permission;
          console.log(userInfo);
          userRole.value = userInfo.role;
          if (permission.reply_tokens) {
            replyTokens.value = permission.reply_tokens;
          }
        }
      },
      replyTokens,
      async update_reply_tokens(value) {
        // console.log(value);
        try {
          const post = await api.post(
            "/Account/replyTokens",
            {
              tokens: value,
            },
            {
              headers: {
                Authorization: "Bearer " + getToken(),
              },
            }
          );
          const { data } = post;
          setToken(data.ltt, data.stt);
        } catch (error) {
          throw Error(error);
        }
      },
    };
  },
});
</script>
