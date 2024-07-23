<template>
  <q-page class="flex justify-start content-start column q-pa-md">
    <q-select
      filled
      clearable
      v-model="tags"
      multiple
      :options="tagsOptions"
      use-chips
      stack-label
      label="Tags"
      @update:model-value="getScene"
      dense
    >
      <template v-slot:append>
        <q-btn icon="save" flat padding="sm" @click="setDefaultSceneGroup" />
      </template>
    </q-select>

    <div class="flex row full-width justify-start items-stretch">
      <!-- q-gutter-sm -->
      <div
        v-for="item in sceneList"
        :key="item.name"
        class="col-xs-6 col-sm q-pa-xs"
      >
        <!-- q-pa-xs -->
        <q-card class="full-height" flat bordered>
          <q-card-actions align="right">
            <q-btn
              flat
              round
              color="red"
              :icon="item.favorite ? 'favorite' : 'favorite_border'"
              @click="toggleFavorite(item)"
            />
          </q-card-actions>
          <q-card-section @click="toProject(item.name)">
            <div class="flex column justify-center items-center content-center">
              <q-avatar size="90px">
                <img :src="item.avatar" />
              </q-avatar>
              <div class="q-mt-md text-center">{{ item.label }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from "vue";
import { api, baseURL } from "boot/axios";
import { useQuasar } from "quasar";
import { getToken, checkLogin, setToken } from "boot/account";
import { useLoginStore } from "stores/token";
import { useRouter, useRoute } from "vue-router";

export default defineComponent({
  name: "SceneSelectionPage",
  setup() {
    const $q = useQuasar();
    const route = useRoute();
    const sceneList = ref([]);
    const tags = ref(["醫師"]);
    const tagsOptions = ref(["醫師", "護理師", "行政人員"]);

    async function getScene() {
      try {
        const get = await api.get("/sceneList", {
          params: {
            category: tags.value,
          },
          paramsSerializer: {
            indexes: null, // use brackets with indexes
          },
          headers: {
            Authorization: "Bearer " + getToken(),
          },
        });
        const { data } = get;
        sceneList.value = data;
      } catch (error) {
        if (error.response.status == 401) {
          logout();
        } else {
          throw new Error(error);
        }
      }
    }

    async function getTags() {
      try {
        const get = await api.get("/tags", {
          headers: {
            Authorization: "Bearer " + getToken(),
          },
        });
        const { data } = get;
        tags.value = data.tags;
        tagsOptions.value = data.tagsOptions;
      } catch (error) {
        throw new Error(error);
      }
    }

    onMounted(async () => {
      if (await checkLogin()) {
        await getTags();
        //getScene
        await getScene();
      }
    });

    return {
      sceneList,
      toProject(name) {
        const link = document.createElement("a");
        link.href = window.location.hash.split("/")[0] + "/project/" + name;
        link.click();
      },
      async toggleFavorite(item) {
        const index = sceneList.value.indexOf(item);
        item.favorite = !item.favorite;

        try {
          const post = await api.post(
            "/Account/setFavorite",
            {
              name: item.name,
              state: item.favorite,
            },
            {
              headers: {
                Authorization: "Bearer " + getToken(),
              },
            }
          );
          // sceneList.value[index] = item;
          const { data } = post;
          await getScene();
          setToken(data.ltt, data.stt);
        } catch (error) {
          throw new Error(error);
        }
      },
      tags,
      tagsOptions,
      getScene,
      async setDefaultSceneGroup() {
        try {
          const post = await api.post(
            "/Account/setDefaultSceneGroup",
            {
              group: tags.value,
            },
            {
              headers: {
                Authorization: "Bearer " + getToken(),
              },
            }
          );
          const { data } = post;
          $q.notify({
            position: "top",
            type: "positive",
            message: "已成功設定預設群組",
          });
          setToken(data.ltt, data.stt);
        } catch (error) {
          $q.notify({
            position: "top",
            type: "negative",
            message: "設定預設群組失敗",
          });
          throw new Error(error);
        }
      },
    };
  },
});
</script>
<style data-type="scss" scoped>
/* @media (min-width: 0px) {
  .row {
    .col-xs-6 {
      width: calc(50% - 8px);
    }
  }
}
@media (min-width: 390px) {
  .row {
    .col-sm-auto {
      width: 118px;
      word-wrap: break-word;
      word-wrap: pre-warp;
    }
  }
} */
</style>
