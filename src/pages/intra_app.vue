<template>
  <q-page class="flex flex-center column">
    <a
      href="itms-services://?action=download-manifest&url=https://aicpublic.blob.core.windows.net/ghi/manifest.plist"
    >
      <q-img
        src="Download_on_the_App_Store_Badge_CNTC_RGB_blk_100217.svg"
        class="imgSize"
        fit="contain"
      />
    </a>
    <a href="https://aicpublic.blob.core.windows.net/ghi/ghi_system.apk">
      <q-img src="google-play-badge.png" class="imgSize" fit="contain" />
    </a>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from "vue";
import { api, baseURL } from "boot/axios";
import { useQuasar } from "quasar";
import { getToken, checkLogin } from "boot/account";
import { useLoginStore } from "stores/token";
import { useRouter, useRoute } from "vue-router";
export default defineComponent({
  name: "IntraAppPage",
  setup() {
    return {};
  },
});
</script>
<style lang="sass" scoped>
.imgSize
  width: 250px
  max-height: 100px
</style>
