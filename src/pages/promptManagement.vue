<template>
  <q-page class="flex justify-start content-start column q-pa-md full-width">
    <div class="flex row justify-start items-center">
      <q-btn
        icon="arrow_back_ios_new"
        padding="sm"
        flat
        @click="router.go(-1)"
      />
      <div class="text-h6">管理 prompt 書籤</div>
    </div>
    <div style="flex: 1 1 auto" class="flex row full-width">
      <div
        class="q-pa-xs col-xs-6 col-sm-3 col-md-2 col-xl-1"
        style="max-height: 240px"
        v-for="item in promptList"
        :key="item.id"
      >
        <q-card class="full-height flex column">
          <q-card-section style="flex: 1 0 auto" class="full-width">
            <div class="flex column justify-center items-center content-center">
              <q-avatar size="90px">
                <img :src="item.avatar" />
              </q-avatar>
              <div
                class="q-mt-md text-center full-width"
                style="
                  display: -webkit-box;
                  -webkit-line-clamp: var(--line-clamp, 2);
                  -webkit-box-orient: vertical;
                  overflow: hidden;
                "
              >
                {{ item.label }}
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="around" style="flex: 1 0 auto">
            <q-btn icon="delete" flat @click="deletePrompt(item.id)" />
            <q-btn icon="edit" flat @click="editPrompt(item)" />
          </q-card-actions>
        </q-card>
      </div>
    </div>
    <q-dialog v-model="promptEditor">
      <q-card class="full-width">
        <q-card-section class="flex justify-center column items-center">
          <q-avatar size="150px">
            <img :src="editorItem.avatar" />
          </q-avatar>
          <q-btn
            label="變更圖片"
            class="q-mt-md"
            @click="
              avatorEditor = true;
              newImgSrc = null;
            "
          />
        </q-card-section>
        <q-card-section>
          <q-input filled v-model="editorItem.label" label="Title" />
          <q-toggle v-model="editorItem.public" label="設為公開" />
          <q-toggle v-model="editorItem.scene" label="設為場景" />
          <q-input filled v-model="editorItem.prompt" autogrow label="prompt" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn icon="save" label="儲存" @click="saveprompt" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="avatorEditor">
      <q-card>
        <q-card-section>
          <!-- <vue-avatar
            :width="150"
            :height="150"
            :rotation="imgRot"
            :borderRadius="200"
            :scale="imgScale"
            ref="newImg"
            accept="image/*"
          >
          </vue-avatar> -->
          <q-file
            ref="filePicker"
            accept="image/*"
            style="width: 0px; height: 0px"
            @update:model-value="setImage"
          />
          <q-btn
            v-if="newImgSrc == null"
            label="upload image"
            @click="filePicker.pickFiles()"
            class="q-mb-md"
          />
          <div v-else class="flex column items-center">
            <vue-cropper
              ref="newImg"
              :src="newImgSrc"
              :aspect-ratio="1"
              :containerStyle="{ width: '240px' }"
            >
            </vue-cropper>
            <div class="flex items-center full-width">
              <q-chip label="Rotation" />
              <div class="flex full-width justify-center">
                <q-slider
                  v-model="imgRot"
                  :min="0"
                  :max="360"
                  label
                  :label-value="imgRot + '°'"
                  style="width: 95%"
                  @update:model-value="updateRot"
                />
              </div>
            </div>
            <div class="flex items-center full-width">
              <q-chip label="Scale" />
              <div class="flex full-width justify-center">
                <q-slider
                  v-model="imgScale"
                  :min="0.5"
                  :max="3"
                  :step="0.01"
                  label
                  :label-value="imgScale + 'x'"
                  style="width: 95%"
                  @update:model-value="updateScale"
                />
              </div>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="確定" @click="newImgEdited" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from "vue";
import { api, baseURL } from "boot/axios";
import { useQuasar } from "quasar";
import { getToken, checkLogin } from "boot/account";
import { useLoginStore } from "stores/token";
import { useRouter, useRoute } from "vue-router";
import VueCropper from "vue-cropperjs";
import "cropperjs/dist/cropper.css";

export default defineComponent({
  name: "PromptManagementPage",
  components: {
    VueCropper,
  },
  setup() {
    const $q = useQuasar();
    const route = useRoute();
    const router = useRouter();
    const promptList = ref([]);
    const promptEditor = ref(false);
    const editorItem = ref(null);
    const avatorEditor = ref(false);
    const newImg = ref(null);
    const filePicker = ref(null);
    const newImgSrc = ref(null);
    let lastDeg = 0;
    let lastScale = 1;

    async function getPromptList() {
      try {
        const get = await api.get("/promptListByOwner", {
          headers: {
            Authorization: "Bearer " + getToken(),
          },
        });
        const { data } = get;
        promptList.value = data;
      } catch (error) {
        throw Error(error);
      }
    }

    onMounted(async () => {
      if (await checkLogin()) {
        //getPromptList
        getPromptList();
      }
    });

    return {
      router,
      promptList,
      editorItem,
      promptEditor,
      editPrompt(item) {
        editorItem.value = item;
        promptEditor.value = true;
      },
      avatorEditor,
      imgRot: ref(0),
      imgScale: ref(1),
      newImg,
      newImgEdited() {
        editorItem.value.avatar = newImg.value.getCroppedCanvas().toDataURL();
      },
      async saveprompt() {
        try {
          const post = await api.post("/editPromptBookmark", editorItem.value, {
            headers: {
              Authorization: "Bearer " + getToken(),
            },
          });
          const { data } = post;
          if (data) {
            $q.notify({
              position: "top",
              type: "positive",
              message: "儲存成功",
            });
            promptEditor.value = false;
          }
        } catch (error) {
          $q.notify({
            position: "top",
            type: "negative",
            message: "儲存失敗",
          });
          throw Error(error);
        }
      },
      deletePrompt(id) {
        $q.notify({
          message: "確定要刪除?",
          type: "negative",
          position: "top",
          actions: [
            {
              label: "取消",
              color: "white",
            },
            {
              label: "確定",
              color: "red",
              class: "bg-white",
              handler: async () => {
                try {
                  await api.delete("/promptBookmark", {
                    data: id,
                    headers: {
                      Authorization: "Bearer " + getToken(),
                    },
                  });
                  $q.notify({
                    position: "top",
                    type: "positive",
                    message: "刪除成功",
                  });
                  getPromptList();
                } catch (error) {
                  $q.notify({
                    position: "top",
                    type: "negative",
                    message: "刪除失敗",
                  });
                  throw Error(error);
                }
              },
            },
          ],
        });
      },
      filePicker,
      newImgSrc,
      setImage(file) {
        const reader = new FileReader();

        reader.onload = (event) => {
          newImgSrc.value = event.target.result;
        };

        reader.readAsDataURL(file);
      },
      updateRot(deg) {
        newImg.value.rotate(deg - lastDeg);
        lastDeg = deg;
      },
      updateScale(scale) {
        newImg.value.relativeZoom(scale - lastScale);
        lastScale = scale;
      },
    };
  },
});
</script>
