<template>
  <q-page class="flex flex-start">
    <!-- <q-pull-to-refresh @refresh="refresh" class="full-width"> -->
    <div
      class="flex column full-width items-center justify-start"
      style="height: inherit"
    >
      <div
        class="flex column no-wrap full-height justify-start items-start q-mt-md"
        style="width: 90%"
      >
        <div class="full-width">
          <div class="flex items-center no-wrap">
            <q-btn
              icon="arrow_back_ios_new"
              padding="sm"
              dense
              flat
              @click="goback"
            />
            <div
              class="flex row items-center no-wrap full-width"
              v-if="projectNameEditing"
            >
              <q-input v-model="newProjectName" filled />
              <q-btn label="儲存" class="q-ml-md" @click="saveProjectName" />
              <q-btn
                label="取消"
                color="red"
                class="q-ml-md"
                @click="projectNameEditing = false"
              />
            </div>
            <div class="flex items-center no-wrap full-width" v-else>
              <div
                class="text-h5 text-primary"
                style="
                  display: -webkit-box;
                  -webkit-line-clamp: var(--line-clamp, 3);
                  -webkit-box-orient: vertical;
                  overflow: hidden;
                "
              >
                {{ projectName }}
              </div>
              <q-btn
                icon="edit"
                flat
                round
                @click="
                  newProjectName = projectName;
                  projectNameEditing = true;
                "
              />
            </div>
            <q-btn icon="settings" flat round @click="settingDialog = true" />
            <q-btn icon="sym_r_mop" flat round @click="clean_chat_history" />
            <!-- class="q-my-md" -->
          </div>

          <q-dialog v-model="settingDialog" full-width>
            <q-card style="width: 80vw">
              <q-card-section>
                <div class="text-h5">Setting</div>
              </q-card-section>

              <!-- <q-card-section class="q-pt-none">
                <div class="text-h6">語音辨識</div>
            <div class="flex column full-width outline q-pa-md">
              <q-select
                v-model="sttModel"
                :options="sttModelOption"
                label="語音辨識模型"
                @update:model-value="updSttModel"
              />
              <q-select
                v-model="sttLang"
                v-if="sttModel.supportLang"
                :options="sttModel.supportLang"
                label="語音辨識語言"
              />
                          </div>
            </q-card-section> -->
              <q-card-section class="q-pt-none">
                <div class="text-h6">大型語言模型</div>
                <div class="flex column full-width outline q-pa-md">
                  <div v-if="sceneType != 'Custom' && sceneType != null">
                    <q-chip color="primary" text-color="white" size="md">
                      情境：{{ scene_label }}</q-chip
                    >
                  </div>
                  <div
                    class="flex items-center"
                    v-if="sceneType != 'Custom' && sceneType != null"
                  >
                    <q-select
                      label="預設提示 (Prompt)"
                      v-model="defPrompt"
                      :options="filteredPromptOptions"
                      style="min-width: 150px"
                      @update:model-value="prompt = defPrompt.value"
                      use-input
                      hide-selected
                      fill-input
                      input-debounce="0"
                      @filter="filterFn"
                      @input-value="setModel"
                    >
                      <template v-slot:option="scope">
                        <q-item v-bind="scope.itemProps">
                          <q-item-section avatar>
                            <q-icon name="public" v-if="scope.opt.public" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ scope.opt.label }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-italic text-grey">
                            No options slot
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>

                    <q-checkbox
                      label="顯示公開提示"
                      v-model="publicPrompt"
                      @update:model-value="refreshPromptOption"
                    />
                  </div>
                  <div class="flex items-center" v-else>
                    <q-select
                      label="預設提示 (Prompt)"
                      v-model="defPrompt"
                      :options="filteredPromptOptions"
                      style="min-width: 150px"
                      use-input
                      hide-selected
                      fill-input
                      input-debounce="0"
                      @filter="filterFn"
                      @input-value="setModel"
                    >
                      <template v-slot:option="scope">
                        <q-item v-bind="scope.itemProps">
                          <q-item-section avatar>
                            <q-icon name="public" v-if="scope.opt.public" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ scope.opt.label }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-italic text-grey">
                            No options slot
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                    <q-btn
                      label="帶入提示 (Prompt)"
                      @click="prompt = defPrompt.value"
                      class="q-ml-md"
                      no-caps
                    />
                    <q-checkbox
                      label="顯示公開提示"
                      v-model="publicPrompt"
                      @update:model-value="refreshPromptOption"
                    />
                  </div>
                  <div
                    class="q-mt-md flex row items-center justify-between"
                    v-if="!(sceneType != 'Custom' && sceneType != null)"
                  >
                    <div class="hrDiv"><hr /></div>
                    <div>OR</div>
                    <div class="hrDiv"><hr /></div>
                  </div>
                  <q-input
                    type="textarea"
                    label="輸入提示 (Prompt)"
                    autogrow
                    v-model="prompt"
                    filled
                    class="full-width q-mt-md"
                    v-if="!(sceneType != 'Custom' && sceneType != null)"
                  >
                    <template v-slot:append>
                      <q-btn
                        icon="bookmark_add"
                        flat
                        @click="promptSaveDialog = true"
                      />
                    </template>
                  </q-input>

                  <!-- prompt 儲存 dialog -->
                  <q-dialog v-model="promptSaveDialog">
                    <q-card>
                      <q-card-section>
                        <div class="text-h6">設為預設Prompt</div>
                        <q-input
                          label="標題"
                          v-model="newPrompt.label"
                          filled
                          autogrow
                          :rules="[(val) => !!val || '請輸入標題']"
                        >
                          <template v-slot:append>
                            <!-- <q-btn
                              icon="casino"
                              @click="recommendTitle"
                              round
                              flat
                            /> -->
                          </template>
                        </q-input>
                        <q-checkbox
                          label="設為公開"
                          v-model="newPrompt.public"
                        />
                      </q-card-section>
                      <q-card-actions align="right">
                        <q-btn
                          label="取消"
                          v-close-popup
                          class="bg-red text-white"
                        />
                        <q-btn
                          label="確定"
                          v-close-popup
                          @click="promptSave"
                          :disable="!newPrompt.label"
                        />
                      </q-card-actions>
                    </q-card>
                  </q-dialog>

                  <div class="flex column q-mt-md">
                    <div>
                      <q-chip square color="primary" text-color="white">
                        回覆長度 (Tokens)：
                      </q-chip>
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
                    <div class="flex full-width justify-center">
                      <q-slider
                        v-model="replyTokens"
                        :min="20"
                        :max="replyTokens_maxTokens"
                        label
                        :marker-labels="replyTokens_mark_labels"
                        style="width: 99%"
                      />
                    </div>
                  </div>
                  <q-select
                    v-model="llmModel"
                    :options="llmOptions"
                    @update:model-value="initLMsettings"
                    label="LLM"
                  />
                </div>
              </q-card-section>
              <q-card-section>
                <div class="text-h6">知識庫</div>
                <div class="flex column full-width outline q-pa-md">
                  <q-select
                    clearable
                    filled
                    v-model="selectedKB"
                    :options="KBOptions"
                    label="選擇知識庫"
                  />
                </div>
              </q-card-section>
            </q-card>
          </q-dialog>
          <!-- <q-separator /> -->
        </div>

        <div class="flex column q-mb-md fit no-wrap">
          <q-scroll-area ref="chatHistoryScroll" class="full-height outline">
            <!-- class="outline col-grow"
            style="border-radius: 10px" -->
            <div
              v-for="item in chatHistory"
              :key="item.id"
              class="flex column q-mb-md q-pa-sm"
              :style="item.role == 'USER' ? { backgroundColor: '#f4f4f4' } : {}"
            >
              <div v-if="item.role == 'USER'" class="flex items-center">
                <q-avatar>
                  <img src="USER.png" />
                </q-avatar>
                <div class="text-h6 q-ml-md">使用者</div>
              </div>
              <div v-else class="flex items-center">
                <q-avatar>
                  <img src="AI.png" />
                </q-avatar>
                <div class="text-h6 q-ml-md">AI</div>
              </div>
              <!-- <q-img
                  v-if="item.img"
                  :src="item.img"
                  style="max-height: 120px; max-width: 120px"
                  class="q-ma-sm"
                  fit="contain"
                /> -->
              <div
                v-html="item.content"
                class="markdown-body q-pa-sm"
                :style="{ backgroundColor: '#ffffff00' }"
              ></div>
              <!-- <q-separator
                  v-if="chatHistory.indexOf(item) != chatHistory.length - 1"
                  color="starlux-light"
                  size="3px"
                  class="q-my-md"
                /> -->
            </div>
            <div class="q-pa-md" v-if="aiThinking">
              <q-spinner-dots color="primary" size="2em" />
            </div>
          </q-scroll-area>
          <div
            class="q-mt-md outline flex col-grow items-center"
            style="min-height: 50px; height: auto; border-radius: 10px"
          >
            <div class="flex col-shrink">
              <q-file
                v-model:model-value="imageInput"
                style="width: 0px; height: 0px"
                ref="imageUpload"
                @update:model-value="insertImage"
                accept="image/*"
              />
              <q-btn icon="image" flat @click="imageUpload.pickFiles()" />
            </div>
            <div id="editor" class="col"></div>
            <div class="flex col-shrink">
              <q-btn icon="mic" flat @click="recordingDiag = true" />
              <q-btn icon="send" @click="sendChat" flat />
            </div>
          </div>
          <q-dialog v-model="recordingDiag" class="full-width">
            <q-card style="width: 80vw">
              <q-card-section>
                <!-- 語音輸入 -->
                <div class="flex q-ma-sm">
                  <div class="flex">
                    <div class="q-pa-sm" style="border-radius: 10px">
                      <div class="flex items-center">
                        <div class="text-h6 text-bold">語音輸入</div>
                        <!-- <q-chip
                            color="orange"
                            icon="warning"
                            text-color="white"
                            v-if="unSave.audio"
                          >
                            未上傳
                          </q-chip> -->
                      </div>
                      <!-- <div
                          class="text-subtitle2"
                          style="color: rgba(0, 0, 0, 0.6)"
                        >
                          啟動即時辨識，將於錄音開始時，預先清除語音辨識結果
                        </div> -->
                    </div>
                  </div>
                  <div class="flex column full-width outline q-pa-md">
                    <!-- input -->
                    <div
                      class="flex row justify-start items-center"
                      v-if="!recorded"
                    >
                      <q-btn @click="startRecord" v-if="!recording">
                        <q-icon name="radio_button_checked" color="red" />
                        <div class="q-ml-xs">Rec</div>
                      </q-btn>
                      <div v-else>
                        <q-btn @click="stopRecord" icon="stop" label="Stop" />
                        <q-btn
                          @click="pauseRecord"
                          icon="sym_r_pause"
                          label="Pause"
                          v-if="!paused"
                          class="q-ml-md"
                        />
                        <q-btn
                          @click="resumeRecord"
                          icon="sym_r_resume"
                          label="Resume"
                          v-else
                          class="q-ml-md"
                        />
                      </div>
                      <q-btn
                        @click="audioFileInput.pickFiles()"
                        icon="upload"
                        v-if="!recording"
                        class="q-ml-md"
                        label="upload"
                      />
                      <q-file
                        ref="audioFileInput"
                        v-model="audiofile"
                        filled
                        @update:model-value="userUploadFile"
                        v-if="!recording"
                        style="height: 0px; width: 0px; visibility: hidden"
                        accept="audio/*, .mp3, .m4a, .amr, .wav, .flac, .aac, .wma, .aiff, .opus"
                      />
                      <div v-if="recording" class="text-h6 q-ml-md">
                        {{ recordDuration }}
                      </div>
                    </div>

                    <!-- audio -->
                    <div
                      class="flex row items-center full-width"
                      v-if="audioVis && recorded"
                    >
                      <audio
                        :src="nativeUrl"
                        controls
                        id="audioComp"
                        v-if="audioVis"
                        class="audioStyle"
                      ></audio>
                      <q-btn
                        @click="recorded = false"
                        icon="close"
                        flat
                        class="bg-red text-white q-ml-md"
                        padding="xs"
                      />
                      <q-btn
                        icon="download"
                        flat
                        class="q-ml-xs"
                        padding="xs"
                        unelevated
                        @click="downloadAudio"
                      />
                    </div>

                    <div v-if="recorded">
                      <div class="flex row items-center q-mt-md">
                        <q-btn label="進行語音辨識" @click="inference" />
                      </div>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-dialog>
        </div>
      </div>
    </div>
    <!-- </q-pull-to-refresh> -->
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { api, baseURL } from "boot/axios";
import { useQuasar } from "quasar";
import { checkLogin, getToken } from "boot/account";
import { useRouter, useRoute, onBeforeRouteLeave } from "vue-router";
import MarkdownIt from "markdown-it";
import emoji from "markdown-it-emoji";
import markdownItMark from "markdown-it-mark";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import markdownItAttrs from "markdown-it-attrs";
import mime from "mime-types";
import "github-markdown-css/github-markdown-light.css";
import Quill from "quill";
import "quill/dist/quill.core.css";

export default defineComponent({
  name: "IndexPage",
  components: {},
  setup() {
    const controller = new AbortController();
    const $q = useQuasar();
    const route = useRoute();
    const router = useRouter();
    const sceneType = ref(null);
    const scene_label = ref(null);
    let mediaRecorder = null;
    let stream = null;
    let chunks = [];
    const trigger = ref(false);
    const timeSlice = 100;
    let wakeLock = null;
    var mediaTimer = null;
    var dateStarted;
    const recordDuration = ref("00:00");
    var recordDurationSeconds = 0;
    const projectNameEditing = ref(false);

    const recordingDiag = ref(false);
    const nativeUrl = ref("");
    const recording = ref(false);
    const recorded = ref(false);
    const paused = ref(false);
    const audioVis = ref(false);

    const projectName = ref("");
    const newProjectName = ref("");
    const audiofile = ref(null);
    const audioFileInput = ref(null);
    var audioBlob = null;
    var audioBlobName = "";

    const sttModelOption = ref([]);
    const sttModel = ref({
      label: "Whisper",
      value: "AOAI-whisper",
    });
    const sttLang = ref(null);
    const AutoLLM = ref(false);
    const sttResult = ref("");

    const prompt = ref("");
    const publicPrompt = ref(true);
    const newPrompt = ref({
      label: "",
      public: false,
    });
    const promptSaveDialog = ref(false);
    const defPrompt = ref(null);
    const promptOptions = ref([]);
    const filteredPromptOptions = ref([]);
    const llmOptions = ref([]);
    const llmModel = ref("gpt4o");
    const replyTokens = ref(1000);
    const replyTokens_mark_labels = ref([]);
    const replyTokens_maxTokens = ref(3000);
    const llmResult = ref("");
    const llmResultMD = ref("");

    const md = MarkdownIt({
      breaks: true,
      linkify: true,
      typographer: true,
      highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(str, { language: lang }).value;
          } catch (__) {}
        }

        return ""; // use external default escaping
      },
    });
    md.use(emoji);
    md.use(markdownItMark);
    md.use(markdownItAttrs);

    const chatHistory = ref([]);
    const chatHistoryScroll = ref(null);
    const aiThinking = ref(false);
    const userInput = ref(null);

    let checkASR = false;
    let checkLLM = false;
    const unSave = ref({
      audio: false,
      asrResult: false,
      llmResult: false,
    });

    const selectedKB = ref(null);
    const KBOptions = ref([]);

    let quill = null;
    const options = {
      debug: "info",
      modules: {
        toolbar: false,
      },
      placeholder: "Write here.",
      theme: "snow",
    };

    const imageInput = ref(null);

    function calculateTimeDuration(secs) {
      var hr = Math.floor(secs / 3600);
      var min = Math.floor((secs - hr * 3600) / 60);
      var sec = Math.floor(secs - hr * 3600 - min * 60);

      if (min < 10) {
        min = "0" + min;
      }

      if (sec < 10) {
        sec = "0" + sec;
      }

      if (hr <= 0) {
        return min + ":" + sec;
      }

      return hr + ":" + min + ":" + sec;
    }

    function DeltaParser(data) {
      const opsList = data.ops;
      let text = "";
      let images = [];
      let mdText = "";
      for (let i = 0; i < opsList.length; i++) {
        // console.log(typeof opsList[i].insert);
        if (typeof opsList[i].insert === "string") {
          text += opsList[i].insert;
          mdText += opsList[i].insert;
        } else {
          images.push(opsList[i].insert.image);
          mdText += " ![](" + opsList[i].insert.image + "){height=100}";
        }
      }
      // console.log(text);
      // console.log(images);
      // console.log(md.render(mdText));
      return {
        text: text,
        images: images,
        mdText: mdText,
      };
    }

    function stopStream(stream) {
      stream.getTracks().forEach(function (track) {
        track.stop();
      });
    }

    let audioCtx;
    function analysisAudio(stream) {
      if (!audioCtx) {
        audioCtx = new AudioContext();
      }
      const source = audioCtx.createMediaStreamSource(stream);

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      source.connect(analyser);

      analysis();

      function analysis() {
        analyser.getByteFrequencyData(dataArray);
        // 计算能量
        let energy = dataArray.reduce((acc, val) => acc + val, 0);

        // 设置能量阈值
        let energyThreshold = 5000; // 示例阈值，根据您的实际数据进行调整

        // 如果能量超过阈值，则认为存在人声
        if (energy > energyThreshold) {
          trigger.value = true;
        } else {
          trigger.value = false;
          // console.log("未检测到人声");
        }
        if (audioCtx) {
          requestAnimationFrame(analysis);
        }
      }
    }

    async function llmInfenence() {
      try {
        $q.loading.show();
        const post = await api.post(
          "llm",
          {
            projectID: route.params.projectId,
            text: sttResult.value,
            prompt: prompt.value,
            model: llmModel.value.value,
            replyTokens: replyTokens.value,
          },
          {
            headers: {
              Authorization: "Bearer " + getToken(),
            },
          }
        );
        const { data } = post;
        llmResult.value = data;
        llmResultMD.value = md.render(llmResult.value);
        unSave.value.asrResult = false;
        unSave.value.llmResult = false;
        $q.loading.hide();
        checkLLM = true;
        AIstatusCheck();
      } catch (error) {
        console.log(error);
        $q.loading.hide();
        llmResult.value = "語言模型執行失敗了！！！ \n" + error.toString();
        reportMD = false;
      }
    }

    function initLMsettings() {
      let marker_labels = [{ label: 20, value: 20 }];
      for (var i = 1000; i <= llmModel.value.maxTokens; i += 1000) {
        marker_labels.push({
          label: i,
          value: i,
        });
      }
      if (llmModel.value.maxTokens % 1000 != 0) {
        marker_labels.push({
          label: llmModel.value.maxTokens,
          value: llmModel.value.maxTokens,
        });
      }
      replyTokens_mark_labels.value = marker_labels;
      replyTokens_maxTokens.value = llmModel.value.maxTokens;
    }

    async function AIstatusCheck() {
      try {
        const get = await api.get("/projectData", {
          params: {
            projectID: route.params.projectId,
          },
          headers: {
            Authorization: "Bearer " + getToken(),
          },
        });
        const { data } = get;
        if (typeof data !== "string") {
          if (checkASR) {
            if (data.stt_status == "FINISHED") {
              sttResult.value = data.stt_result;
              quill.setText(data.stt_result);

              $q.notify({
                position: "top",
                type: "positive",
                message: "語音辨識完成",
              });
              checkASR = false;
              unSave.value.asrResult = false;
            } else if (data.stt_status == "FAILED") {
              $q.notify({
                position: "top",
                type: "negative",
                message: "語音辨識失敗",
              });
              checkASR = false;
            }
          }
          if (checkLLM) {
            if (data.llm_status == "FINISHED") {
              llmResult.value = data.llm_result;
              llmResultMD.value = md.render(llmResult.value);
              unSave.value.llmResult = false;
              $q.notify({
                position: "top",
                type: "positive",
                message: "語言模型執行完成",
              });
              checkLLM = false;
            } else if (data.llm_status == "FAILED") {
              $q.notify({
                position: "top",
                type: "negative",
                message: "語言模型執行失敗",
              });
              checkLLM = false;
            }
          }
          if (
            (data.stt_status != "FINISHED" &&
              data.stt_status != "FAILED" &&
              data.stt_status != "INIT" &&
              checkASR) ||
            (data.llm_status != "FINISHED" &&
              data.llm_status != "FAILED" &&
              data.llm_status != "INIT" &&
              checkLLM)
          ) {
            setTimeout(AIstatusCheck, 1000);
          }
        }
      } catch (error) {
        // if (error.response.status == 401) {
        //   logout();
        // } else {
        //   throw new Error(error);
        // }
        throw new Error(error);
      }
    }

    function convertChatHistory(ChatHistoryOrg) {
      for (var i = 0; i < ChatHistoryOrg.length; i++) {
        ChatHistoryOrg[i].content = md.render(ChatHistoryOrg[i].content);
      }
      return ChatHistoryOrg;
    }

    async function getProjectData(projectId) {
      try {
        const get = await api.get("/projectData", {
          params: {
            projectID: projectId,
          },
          headers: {
            Authorization: "Bearer " + getToken(),
          },
        });
        const { data } = get;
        if (typeof data === "string") {
          const link = document.createElement("a");
          link.href = window.location.hash.split("/")[0] + "/scene";
          link.click();
        } else {
          console.log(data);
          sceneType.value = data.scene_type;
          if (data.project_name) {
            projectName.value = data.project_name;
          }
          if (data.scene_label) {
            scene_label.value = data.scene_label;
            defPrompt.value = promptOptions.value.filter(
              (res) => res.label == data.scene_label
            )[0];
          }
          if (data.stt_model) {
            let val = sttModelOption.value.filter(
              (res) => res.value == data.stt_model
            )[0];
            if (val != undefined) {
              sttModel.value = val;
              if (data.stt_lang) {
                sttLang.value = data.stt_lang;
              }
            }
            // console.log("sttm", sttModel.value);
            if (data.stt_lang) {
              sttLang.value = data.stt_lang;
            }
          }
          if (data.stt_result) {
            sttResult.value = data.stt_result;
            $q.notify({
              position: "top",
              type: "positive",
              message: "偵測到語音辨識結果，是否帶入?",
              actions: [
                {
                  label: "不帶入",
                  color: "white",
                  handler: () => {
                    /* ... */
                  },
                },
                {
                  label: "帶入",
                  color: "white",
                  handler: () => {
                    quill.setText(data.stt_result);
                  },
                },
              ],
            });
          }
          if (data.prompt) {
            prompt.value = data.prompt;
          }
          if (data.llm_model) {
            let val = llmOptions.value.filter(
              (res) => res.value == data.llm_model
            )[0];
            if (val != undefined) {
              llmModel.value = val;
            } else {
              llmModel.value = llmOptions.value[0];
            }
          } else {
            llmModel.value = llmOptions.value[0];
          }
          initLMsettings();
          if (data.llm_result) {
            llmResult.value = data.llm_result;
            llmResultMD.value = md.render(llmResult.value);
          }
          if (data.stt_status == "FAILED") {
            $q.notify({
              position: "top",
              type: "negative",
              message: "語音辨識失敗",
            });
          } else if (
            data.stt_status != "FINISHED" &&
            data.stt_status != "INIT"
          ) {
            checkASR = true;
          }
          if (data.llm_status == "FAILED") {
            $q.notify({
              position: "top",
              type: "negative",
              message: "語言模型執行失敗",
            });
          } else if (
            data.llm_status != "FINISHED" &&
            data.llm_status != "INIT"
          ) {
            checkLLM = true;
          }
          if (
            (data.stt_status != "FINISHED" &&
              data.stt_status != "FAILED" &&
              data.stt_status != "INIT") ||
            (data.llm_status != "FINISHED" &&
              data.llm_status != "FAILED" &&
              data.llm_status != "INIT")
          ) {
            setTimeout(AIstatusCheck, 1000);
          }
          if (data.audio_path) {
            // console.log("get audio");
            getAudio(data.audio_path);
          }
        }
      } catch (error) {
        // if (error.response.status == 401) {
        //   logout();
        // } else {
        //   throw new Error(error);
        // }
        throw new Error(error);
      }
    }

    async function getChatHistory(projectId) {
      try {
        const get = await api.get("/Project/ChatHistory", {
          params: {
            projectID: projectId,
          },
          headers: {
            Authorization: "Bearer " + getToken(),
          },
        });
        const { data } = get;
        chatHistory.value = convertChatHistory(data);
        setTimeout(() => {
          chatHistoryScroll.value.setScrollPercentage("vertical", 1, 300);
        }, 500);
      } catch (error) {
        throw new Error(error);

        // throw new Error(error);
      }
    }

    async function getAudio(audio_path) {
      // const notif = $q.notify({
      //   group: false, // required to be updatable
      //   // timeout: 0, // we want to be in control when it gets dismissed
      //   spinner: true,
      //   message: "Loading Audio...",
      //   caption: "0%",
      //   position: "top",
      // });
      try {
        recorded.value = true;
        audioVis.value = false;
        // const get = await api.get("/audio", {
        //   signal: controller.signal,
        //   params: {
        //     audio_path: audio_path,
        //   },
        //   headers: {
        //     Authorization: "Bearer " + getToken(),
        //   },
        //   responseType: "stream", // blob
        //   onDownloadProgress: (progressEvent) => {
        //     let percentage = (progressEvent.progress * 100).toFixed(2);
        //     notif({
        //       caption: `${percentage}%`,
        //     });
        //     if (percentage === "100.00") {
        //       notif({
        //         icon: "done", // we add an icon
        //         spinner: false, // we reset the spinner setting so the icon can be displayed
        //         message: "Audio Loaded!",
        //         timeout: 2500, // we will timeout it in 2.5s
        //       });
        //     }
        //   },
        // });
        // const { data, headers } = get;
        // console.log(data);

        // audioBlob = data;
        nativeUrl.value =
          baseURL +
          "audio?audio_path=" +
          encodeURI(audio_path) +
          "&token=" +
          getToken(); // window.URL.createObjectURL(data);
        var splitPath = audio_path.split("/");
        audioBlobName = splitPath[splitPath.length - 1];
        // recorded.value = true;
        audioVis.value = true;
      } catch (error) {
        // if (error.response.status == 401) {
        //   logout();
        // } else {
        //   throw new Error(error);
        // }
        // if (error.code == "ERR_CANCELED") {
        //   notif({
        //     icon: "cancel", // we add an icon
        //     spinner: false, // we reset the spinner setting so the icon can be displayed
        //     type: "negative",
        //     message: "Canceled!",
        //     timeout: 500, // we will timeout it in 2.5s
        //   });
        // }
        console.log(error);
        throw new Error(error);
      }
    }

    async function getOptions(sceneType) {
      try {
        const get = await api.get("/options", {
          params: {
            scene: sceneType,
            public: publicPrompt.value,
          },
          headers: {
            Authorization: "Bearer " + getToken(),
          },
        });
        const { data } = get;
        sttModelOption.value = data.stt_model;
        sttModel.value = data.stt_model.filter((res) => res.default)[0];
        if (data.stt_model.filter((res) => res.default)[0].supportLang) {
          sttLang.value = data.stt_model.filter(
            (res) => res.default
          )[0].supportLang[0];
        }
        promptOptions.value = data.promptSet;
        defPrompt.value = data.promptSet[0];
        llmOptions.value = data.llm_model;
      } catch (error) {
        // if (error.response.status == 401) {
        //   logout();
        // } else {
        //   throw new Error(error);
        // }
        throw new Error(error);
      }
    }

    async function getKBOptions() {
      try {
        const get = await api.get("/KnowledgeBase/retrivableKB", {
          headers: {
            Authorization: "Bearer " + getToken(),
          },
        });
        const { data } = get;
        KBOptions.value = data;
      } catch (error) {
        throw new Error(error);
      }
    }

    async function getUserDefaultReplyTokens() {
      try {
        const get = await api.get("/Account/replyTokens", {
          headers: {
            Authorization: "Bearer " + getToken(),
          },
        });
        const { data } = get;
        replyTokens.value = data;
      } catch (error) {
        throw Error(error);
      }
    }

    async function refreshPromptOption() {
      try {
        const post = await api.get("/refreshPromptOption", {
          params: {
            scene: sceneType.value,
            public: publicPrompt.value,
          },
          headers: {
            Authorization: "Bearer " + getToken(),
          },
        });
        const { data } = post;
        promptOptions.value = data.promptSet;
        if (promptOptions.value.indexOf(defPrompt.value) == -1) {
          defPrompt.value = null;
        }
      } catch (error) {
        throw Error(error);
      }
    }

    onMounted(async () => {
      if (await checkLogin()) {
        await getOptions(route.params.sceneType);
        await getKBOptions();
        await getProjectData(route.params.projectId);
        await getChatHistory(route.params.projectId);
        await getUserDefaultReplyTokens();
        quill = new Quill("#editor", options);
      }
    });

    onBeforeRouteLeave((to, from, next) => {
      if (Object.values(unSave.value).filter((i) => i == true).length > 0) {
        if (confirm("好像還有東西沒儲存，確定要離開?")) {
          window.onbeforeunload = null;
          next();
        } else {
          next(false);
        }
      } else {
        window.onbeforeunload = null;
        next();
      }
    });

    window.onbeforeunload = function () {
      if (Object.values(unSave.value).filter((i) => i == true).length > 0) {
        return "好像還有東西沒儲存，確定要離開?";
      } else {
        return null;
      }
    };

    return {
      sceneType,
      scene_label,
      recordingDiag,
      async startRecord() {
        unSave.value.audio = true;
        if ("wakeLock" in navigator) {
          wakeLock = await navigator.wakeLock.request();
          if (wakeLock) {
            $q.notify({
              position: "top",
              type: "positive",
              message: "Wake Lock 已啟用",
            });
          } else {
            $q.notify({
              position: "top",
              type: "warning",
              message: "Wake Lock 啟用失敗，請保持螢幕開啟",
            });
          }
        } else {
          $q.notify({
            position: "top",
            type: "warning",
            message: "無法啟用 Wake Lock，請保持螢幕開啟",
          });
        }
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
        } catch (error) {
          $q.notify({
            type: "negative",
            position: "top",
            message: error.toString(),
          });
          throw Error(error);
        }
        chunks = [];
        mediaRecorder = new MediaRecorder(stream, {
          // mimeType: "audio/ogg",
          audioBitsPerSecond: 16000,
        });
        analysisAudio(stream);
        recording.value = true;
        dateStarted = new Date().getTime();
        recordDuration.value = "00:00";
        mediaRecorder.start(timeSlice);
        console.log(mediaRecorder.state);
        console.log(
          mediaRecorder.audioBitsPerSecond,
          mediaRecorder.bitsPerSecond
        );
        console.log("Recorder started.");
        mediaRecorder.ondataavailable = async function (event) {
          let data = event.data;
          chunks.push(data);
        };
        mediaTimer = setInterval(function () {
          // get media amplitude
          recordDurationSeconds = (new Date().getTime() - dateStarted) / 1000;
          recordDuration.value = calculateTimeDuration(recordDurationSeconds);
        }, 1000);
      },
      recording,
      async stopRecord() {
        $q.loading.show();
        recording.value = false;
        mediaRecorder.stop();
        console.log(mediaRecorder.state);
        audioCtx = null;
        console.log("Recorder stopped.");
        const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
        chunks = [];
        audioBlob = blob;
        nativeUrl.value = URL.createObjectURL(blob);
        audioBlobName = "recording." + mime.extension(mediaRecorder.mimeType);
        recorded.value = true;
        audioVis.value = true;
        paused.value = false;
        stopStream(stream);
        if (wakeLock) {
          wakeLock.release();
          wakeLock = null;
        }
        clearInterval(mediaTimer);
        $q.loading.hide();
      },
      async pauseRecord() {
        paused.value = true;
        // await mediaRecorder.pauseRecording();
        mediaRecorder.pause();
        clearInterval(mediaTimer);
      },
      async resumeRecord() {
        paused.value = false;
        dateStarted = new Date().getTime();
        var initSeconds = recordDurationSeconds;
        // await mediaRecorder.resumeRecording();
        mediaRecorder.resume();
        mediaTimer = setInterval(function () {
          // get media amplitude
          recordDurationSeconds =
            (new Date().getTime() - dateStarted) / 1000 + initSeconds;
          recordDuration.value = calculateTimeDuration(recordDurationSeconds);
        }, 1000);
      },
      recorded,
      paused,
      audioVis,
      recordDuration,
      nativeUrl,
      projectName,
      newProjectName,
      projectNameEditing,
      async saveProjectName() {
        try {
          const post = await api.post(
            "/Project/saveProjectName",
            {
              projectId: route.params.projectId,
              projectName: newProjectName.value,
            },
            {
              headers: {
                Authorization: "Bearer " + getToken(),
              },
            }
          );
          const { data } = post;
          if (data) {
            projectName.value = data;
          }
          projectNameEditing.value = false;
        } catch (error) {
          throw Error(error);
        }
      },
      audiofile,
      userUploadFile(value) {
        // console.log(audiofile.value.nativeUrl);
        // console.log(Object.keys(audiofile.value));
        unSave.value.audio = true;
        console.log(value);
        // console.log(Object.getOwnPropertyNames(value));
        audioBlob = value;
        nativeUrl.value = URL.createObjectURL(value);
        recorded.value = true;
        audioVis.value = true;
        setTimeout(function () {
          console.log(document.getElementById("audioComp").duration);
        }, 500);
      },
      audioFileInput,
      async inference() {
        try {
          $q.loading.show({
            message: "Uploading ... 0%",
          });
          // let blob = await fetch(nativeUrl.value).then((r) => r.blob());
          let blob;
          if (audioBlob === null) {
            blob = new Blob();
            blob.name = "unknown.unkunon";
          } else {
            blob = audioBlob;
          }
          let fileName = blob.name === undefined ? audioBlobName : blob.name;
          const formdata = new FormData();
          formdata.append("file", blob, fileName);
          formdata.append("model", sttModel.value.value);
          formdata.append(
            "duration",
            (document.getElementById("audioComp") === null) |
              (audioBlob === null)
              ? -1
              : document.getElementById("audioComp").duration
          );
          formdata.append("projectID", route.params.projectId);
          formdata.append("autoLLM", AutoLLM.value);
          if (AutoLLM.value) {
            formdata.append("prompt", prompt.value);
            formdata.append("llm_model", llmModel.value.value);
            formdata.append("replyTokens", replyTokens.value);
            checkLLM = true;
          }
          if (sttLang.value) {
            formdata.append("sttLang", sttLang.value);
          }
          const post = await api.post("stt", formdata, {
            headers: {
              Authorization: "Bearer " + getToken(),
            },
            onUploadProgress: (progressEvent) => {
              let percentage = (progressEvent.progress * 100).toFixed(2);
              $q.loading.show({
                message: `Uploading ... ${percentage}%`,
              });
              if (percentage === "100.00") {
                $q.loading.show({
                  message: `Audio Uploaded!`,
                });
              }
            },
          });
          // const post = await api.get("apitest");
          const { data } = post;
          sttResult.value = data.text;
          quill.setText(data.text);

          unSave.value.audio = false;
          unSave.value.asrResult = false;
          if (data.cancelAutoLLM) {
            AutoLLM.value = false;
          }
          $q.loading.hide();
          checkASR = true;
          AIstatusCheck();
          if (AutoLLM.value == true) {
            llmInfenence();
          }
        } catch (error) {
          console.log("err" + error);
          $q.loading.hide();
          sttResult.value = "語音辨識失敗！！！ \n" + error.toString();
          const text = "語音辨識失敗！！！ \n" + error.toString();
          quill.setText(text);
        }
      },
      // updSttModel(value) {
      //   if (value.supportLang) {
      //     sttLang.value = value.supportLang[0];
      //   } else {
      //     sttLang.value = null;
      //   }
      // },
      // sttModelOption,
      // sttModel,
      // sttLang,
      prompt,
      publicPrompt,
      promptSaveDialog,
      async promptSave() {
        try {
          const post = await api.post(
            "/savePromptAsBookmark",
            {
              title: newPrompt.value.label,
              prompt: prompt.value,
              public: newPrompt.value.public,
            },
            {
              headers: {
                Authorization: "Bearer " + getToken(),
              },
            }
          );
          const { data } = post;
          if (data) {
            $q.notify({
              position: "top",
              type: "positive",
              message: "儲存成功",
            });
            refreshPromptOption();
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
      refreshPromptOption,
      newPrompt,
      defPrompt,
      promptOptions,
      filteredPromptOptions,
      filterFn(val, update, abort) {
        update(() => {
          const needle = val.toLocaleLowerCase();
          filteredPromptOptions.value = promptOptions.value.filter(
            (v) => v.label.toLocaleLowerCase().indexOf(needle) > -1
          );
        });
      },
      llmOptions,
      llmModel,
      initLMsettings,
      replyTokens,
      replyTokens_mark_labels,
      replyTokens_maxTokens,
      async downloadAudio() {
        var bolbUrl = nativeUrl.value;
        if (nativeUrl.value.indexOf("blob:") < 0) {
          bolbUrl += "&stream=false";
        }
        let link = document.createElement("a");
        link.href = bolbUrl;
        link.download = audioBlobName;
        link.click();
      },
      goback() {
        controller.abort();
        router.go(-1);
      },
      unSave,
      setModel(val) {
        defPrompt.value = val;
      },
      settingDialog: ref(false),
      async sendChat() {
        // console.log(userInput.value);
        let res = DeltaParser(quill.getContents());

        chatHistory.value.push({
          role: "USER",
          content: md.render(res.mdText),
          // img: userInputImg.value,
        });
        setTimeout(() => {
          chatHistoryScroll.value.setScrollPercentage("vertical", 1, 300);
        }, 500);
        const formdata = new FormData();
        formdata.append("projectID", route.params.projectId);
        formdata.append("text", res.text);
        res.images.forEach((e) => {
          formdata.append("image", e);
        });

        formdata.append("mdText", res.mdText);
        formdata.append("model", llmModel.value.value);
        formdata.append("prompt", prompt.value);
        formdata.append("replyTokens", replyTokens.value);
        formdata.append("chatHistory", true);
        if (selectedKB.value) {
          formdata.append("referenceID", selectedKB.value.value);
        }
        quill.setText("");

        try {
          aiThinking.value = true;
          const post = await api.post("/AI/LLM", formdata, {
            headers: {
              Authorization: "Bearer " + getToken(),
            },
          });
          const { data } = post;
          // const data = "Currently no AI response!";
          chatHistory.value = convertChatHistory(data);
          aiThinking.value = false;
        } catch (error) {
          chatHistory.value.push({
            type: "system",
            text: md.render("好像出錯了...\n我可能無法回答您"),
            img: null,
          });
          aiThinking.value = false;
        }
      },
      aiThinking,
      userInput,
      chatHistoryScroll,
      chatHistory,
      selectedKB,
      KBOptions,
      clean_chat_history() {
        $q.notify({
          message: "確定要清除對話紀錄?",
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
                  const deleteRequest = await api.delete(
                    "/Project/ChatHistory",
                    {
                      data: route.params.projectId,
                      headers: {
                        Authorization: "Bearer " + getToken(),
                      },
                    }
                  );
                  const { data } = deleteRequest;
                  chatHistory.value = data;
                } catch (error) {
                  throw Error(error);
                }
              },
            },
          ],
        });
      },
      imageUpload: ref(null),
      imageInput,
      insertImage(value) {
        // userInputImg.value = URL.createObjectURL(value);
        const promise = new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve(reader.result);
          };
          reader.readAsDataURL(value);
        });
        promise.then((image) => {
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, "image", image);
          quill.setSelection(range.index + 1, Quill.sources.SILENT);
          imageInput.value = null;
        });
      },
    };
  },
});
</script>
<style lang="sass" scoped>
.outline
  border: 1px solid lightgray
  border-radius: 10px
.audioStyle
  flex: 1 0 auto

.hrDiv
  width: calc(50% - 20px)
</style>
<style lang="sass">
.ql-editor
  max-height: 200px

.ql-editor img
  max-height: 30px
  border: 1px solid blue
</style>
