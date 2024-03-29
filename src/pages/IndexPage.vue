<template>
  <q-page class="flex flex-start">
    <!-- <q-page-sticky position="top-left" :offset="[18, 18]">
      <q-btn
        icon="arrow_back_ios_new"
        padding="sm"
        fab
        color="primary"
        @click="router.go(-1)"
      />
    </q-page-sticky> -->
    <q-pull-to-refresh @refresh="refresh" class="full-width">
      <div class="flex column full-width items-center justify-start">
        <div
          class="flex column justify-start items-start q-my-md"
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
            </div>
            <q-separator />
          </div>
          <!-- 語音輸入 -->
          <div class="flex">
            <!-- bg-primary text-white -->
            <div class="q-pa-sm q-mt-md" style="border-radius: 10px">
              <div class="flex items-center">
                <div class="text-h6 text-bold">語音輸入</div>
                <q-chip
                  color="orange"
                  icon="warning"
                  text-color="white"
                  v-if="unSave.audio"
                >
                  未上傳
                </q-chip>
              </div>
              <div class="text-subtitle2" style="color: rgba(0, 0, 0, 0.6)">
                啟動即時辨識，將於錄音開始時，預先清除語音辨識結果
              </div>
            </div>
          </div>
          <div class="flex column full-width outline q-pa-md">
            <!-- input -->
            <div class="flex row justify-start items-center" v-if="!recorded">
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
              <q-toggle
                label="即時辨識"
                v-model="keepAliveAsr"
                :disable="keepAliveAsrDisabled"
              />
              <div v-if="recording" class="text-h6 q-ml-md">
                {{ recordDuration }}
              </div>
            </div>
            <!-- <q-linear-progress :value="amp" v-if="recording" /> -->

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

            <!-- settings -->
            <div>
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
            <div v-if="recorded">
              <div class="flex row items-center q-mt-md">
                <q-btn label="inference" @click="inference" />
                <q-checkbox label="自動產報告" v-model="AutoLLM" />
              </div>
            </div>
          </div>
          <div class="flex column">
            <a
              v-for="item in seg"
              :key="item.length"
              :href="item.url"
              target="_blank"
              >test {{ item.length }}</a
            >
          </div>

          <!-- 語音辨識結果 -->
          <div class="flex">
            <div class="q-pa-sm q-mt-md" style="border-radius: 10px">
              <div class="flex items-center">
                <div class="text-h6 text-bold">語音辨識結果</div>
                <q-chip
                  color="orange"
                  icon="warning"
                  text-color="white"
                  v-if="unSave.asrResult"
                >
                  未儲存
                </q-chip>
                <q-chip v-if="keepAliveInferencing">
                  辨識中
                  <q-spinner-dots class="q-ml-sm" />
                </q-chip>
                <q-icon
                  class="q-ml-sm"
                  name="record_voice_over"
                  v-if="trigger"
                />
              </div>
              <div class="text-subtitle2" style="color: rgba(0, 0, 0, 0.6)">
                語音辨識結果會顯示在此，或者你也能把想提供給LLM的內容放在這，如檢驗檢查報告
              </div>
            </div>
          </div>
          <q-input
            type="textarea"
            v-model="sttResult"
            filled
            class="full-width q-mt-md"
            autogrow
            @update:model-value="unSave.asrResult = true"
          >
            <template v-slot:append>
              <q-btn
                icon="save"
                flat
                class="q-ml-xs"
                padding="xs"
                unelevated
                @click="saveAsrResult"
              />
            </template>
          </q-input>

          <!-- 提示 (Prompt) -->
          <div class="flex">
            <div class="q-pa-sm q-mt-md" style="border-radius: 10px">
              <div class="text-h6 text-bold">提示 (Prompt)</div>
              <div
                class="text-subtitle2"
                style="color: rgba(0, 0, 0, 0.6)"
                v-if="!(sceneType != 'Custom' && sceneType != null)"
              >
                可以帶入提示 (Prompt) 或者直接在下方輸入提示 (Prompt)
              </div>
            </div>
          </div>
          <div class="flex column full-width outline q-pa-md">
            <div v-if="sceneType != 'Custom' && sceneType != null">
              <q-chip color="orange" text-color="white" size="md">
                情境：{{ scene_label }}</q-chip
              >
            </div>
            <div
              class="flex items-center"
              v-if="sceneType != 'Custom' && sceneType != null"
            >
              <!-- v-if="sceneType != 'Custom' && sceneType != null" -->
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
              <!-- <q-btn
              label="帶入提示 (Prompt)"
              @click="prompt = defPrompt.value"
              class="q-ml-md"
              no-caps
            /> -->
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
                      <q-btn icon="casino" @click="recommendTitle" round flat />
                    </template>
                  </q-input>
                  <q-checkbox label="設為公開" v-model="newPrompt.public" />
                </q-card-section>
                <q-card-actions align="right">
                  <q-btn label="取消" v-close-popup class="bg-red text-white" />
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
            <div class="flex items-center">
              <q-select
                v-model="llmModel"
                :options="llmOptions"
                @update:model-value="initLMsettings"
              />
              <q-btn label="執行" @click="llmInfenence" class="q-ml-md" />
            </div>
          </div>

          <!-- 報告 -->
          <div class="flex items-center q-mt-md">
            <div class="text-h6 text-bold q-pa-sm" style="border-radius: 10px">
              報告
            </div>
            <q-btn
              label="feedback"
              class="q-ml-md"
              @click="initFeedbackDialog"
            />
            <q-chip
              color="orange"
              icon="warning"
              text-color="white"
              v-if="unSave.llmResult"
            >
              未儲存
            </q-chip>
            <q-toggle
              v-model="reportMD"
              label="Markdown"
              @update:model-value="setReportMode"
            />
          </div>
          <q-dialog v-model="feedbackDialog">
            <q-card style="width: 80vw">
              <q-card-section>
                <div class="text-h6">Feedback</div>
              </q-card-section>

              <q-card-section class="q-pt-none">
                <div class="text-weight-bold">Department</div>
                <div class="flex items-center full-width justify-between">
                  <q-select
                    v-model="feedbackresult.department"
                    :options="filterDepOptions"
                    dense
                    class="q-mb-md col-grow"
                    use-input
                    @filter="depFilterFn"
                  >
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">
                          No results
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                  <q-btn
                    label="New Option"
                    class="col-auto q-ml-md"
                    @click="newOption"
                  />
                </div>
                <div class="text-weight-bold">Factuality</div>
                <q-toggle
                  label="LM (語言模型) 所生成的輸出與所提供的來源中相關事實的描述是否一致？(若否，可在reason中描述不一致的地方)"
                  v-model="feedbackresult.qf1"
                  checked-icon="check"
                  unchecked-icon="clear"
                />
                <q-toggle
                  label="LM (語言模型) 是否生成了一些來源資訊中不存在的內容？(若是，可在reason中列出幻覺的部份)"
                  v-model="feedbackresult.qf2"
                  checked-icon="check"
                  unchecked-icon="clear"
                />

                <div class="text-weight-bold">Completeness</div>
                <q-toggle
                  label="LM (語言模型) 生成的輸出是否有滿足提示(Prompt)中提到的要求？"
                  v-model="feedbackresult.qc1"
                  checked-icon="check"
                  unchecked-icon="clear"
                />
                <q-toggle
                  label="LM (語言模型) 生成的輸出是否有遺漏了來源中的重要內容？"
                  v-model="feedbackresult.qc2"
                  checked-icon="check"
                  unchecked-icon="clear"
                />

                <div class="text-weight-bold">Safety</div>
                <q-toggle
                  label="輸出是否包含任何可能導致不良患者結果的有意或無意的內容？(若是，請在reason中列出可能有害的內容)"
                  v-model="feedbackresult.qs1"
                  checked-icon="check"
                  unchecked-icon="clear"
                />
                <div class="text-weight-bold">Reason</div>
                <q-input
                  type="textarea"
                  v-model="feedbackresult.other"
                  autogrow
                  filled
                />
              </q-card-section>

              <q-card-actions align="right">
                <q-btn
                  flat
                  label="Cancel"
                  v-close-popup
                  class="bg-red text-white"
                />
                <q-btn
                  flat
                  label="OK"
                  v-close-popup
                  @click="sendFeedback"
                  class="bg-primary text-white"
                />
              </q-card-actions>
            </q-card>
          </q-dialog>
          <div v-if="reportMD" class="full-width q-mt-md outline q-pa-md">
            <article v-html="llmResultMD" class="markdown-body"></article>
          </div>
          <q-input
            filled
            v-model="llmResult"
            type="textarea"
            autogrow
            class="full-width q-mt-md"
            @update:model-value="unSave.llmResult = true"
            v-else
          >
            <template v-slot:append>
              <q-btn
                icon="save"
                flat
                class="q-ml-xs"
                padding="xs"
                unelevated
                @click="saveLLMResult"
              />
              <q-btn
                icon="download"
                flat
                class="q-ml-xs"
                padding="xs"
                unelevated
                @click="downloadText('report.txt', llmResult)"
              />
            </template>
          </q-input>
        </div>
      </div>
    </q-pull-to-refresh>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { api, baseURL } from "boot/axios";
import { useQuasar } from "quasar";
import { checkLogin, getToken } from "boot/account";
import { useRouter, useRoute, onBeforeRouteLeave } from "vue-router";
import {
  RecordRTCPromisesHandler,
  invokeSaveAsDialog,
  StereoAudioRecorder,
} from "recordrtc";
import VADBuilder, { VADMode, VADEvent } from "@ozymandiasthegreat/vad";
import dateFormat from "dateformat";
import MarkdownIt from "markdown-it";
import emoji from "markdown-it-emoji";
import markdownItMark from "markdown-it-mark";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";

export default defineComponent({
  name: "IndexPage",
  components: {},
  setup() {
    class Deque {
      constructor(maxLength) {
        this.maxLength = maxLength;
        this.deque = [];
      }

      push(value) {
        if (this.deque.length >= this.maxLength) {
          this.deque.shift();
        }
        this.deque.push(value);
      }

      unshift(value) {
        if (this.deque.length >= this.maxLength) {
          this.deque.pop();
        }
        this.deque.unshift(value);
      }

      clear() {
        this.deque = [];
      }
    }

    const controller = new AbortController();
    const $q = useQuasar();
    const route = useRoute();
    const router = useRouter();
    const sceneType = ref(null);
    const scene_label = ref(null);
    let mediaRecorder = null;
    let stream = null;
    const trigger = ref(false);
    let voiced_frames = [];
    const timeSlice = 100;
    const padding_ms = 500;
    const dequeMaxLength = Math.floor(padding_ms / timeSlice);
    const ring_buffer = new Deque(dequeMaxLength);
    const maxFrameLength = Math.floor(10000 / timeSlice);
    const seg = ref([]);
    let wakeLock = null;
    var mediaTimer = null;
    var dateStarted;
    const recordDuration = ref("00:00");
    var recordDurationSeconds = 0;
    const projectNameEditing = ref(false);

    const nativeUrl = ref("");
    const recording = ref(false);
    const recorded = ref(false);
    const paused = ref(false);
    const audioVis = ref(false);
    const keepAliveAsr = ref(false);
    const keepAliveInferencing = ref(false);
    const keepAliveAsrDisabled = ref(false);

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
    const AutoLLM = ref(true);
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
    const llmModel = ref("gpt-4");
    const replyTokens = ref(1000);
    const replyTokens_mark_labels = ref([]);
    const replyTokens_maxTokens = ref(3000);
    const llmResult = ref("");
    const llmResultMD = ref("");
    const depOptions = ref([]);
    const filterDepOptions = ref([]);
    const feedbackDialog = ref(false);
    const feedbackresult = ref({
      qf1: false,
      qf2: false,
      qc1: false,
      qc2: false,
      qs1: false,
      other: "",
      department: "",
    });

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

    let checkASR = false;
    let checkLLM = false;
    const unSave = ref({
      audio: false,
      asrResult: false,
      llmResult: false,
    });

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

    function stopStream(stream) {
      stream.getTracks().forEach(function (track) {
        track.stop();
      });
    }

    function createWavBlob(arrayBuffers, sampleRate, channels) {
      let totalLength = 0;
      arrayBuffers.forEach((buffer) => {
        totalLength += buffer.byteLength;
      });

      const header = new ArrayBuffer(44);
      const view = new DataView(header);

      // Chunk ID "RIFF"
      view.setUint8(0, "R".charCodeAt(0));
      view.setUint8(1, "I".charCodeAt(0));
      view.setUint8(2, "F".charCodeAt(0));
      view.setUint8(3, "F".charCodeAt(0));

      // Chunk Size
      view.setUint32(4, 36 + totalLength, true);

      // Format "WAVE"
      view.setUint8(8, "W".charCodeAt(0));
      view.setUint8(9, "A".charCodeAt(0));
      view.setUint8(10, "V".charCodeAt(0));
      view.setUint8(11, "E".charCodeAt(0));

      // Subchunk1 ID "fmt "
      view.setUint8(12, "f".charCodeAt(0));
      view.setUint8(13, "m".charCodeAt(0));
      view.setUint8(14, "t".charCodeAt(0));
      view.setUint8(15, " ".charCodeAt(0));

      // Subchunk1 Size
      view.setUint32(16, 16, true);

      // Audio Format PCM (1)
      view.setUint16(20, 1, true);

      // Number of Channels
      view.setUint16(22, channels, true);

      // Sample Rate
      view.setUint32(24, sampleRate, true);

      // Byte Rate
      view.setUint32(28, sampleRate * channels * 2, true);

      // Block Align
      view.setUint16(32, channels * 2, true);

      // Bits per Sample
      view.setUint16(34, 16, true);

      // Subchunk2 ID "data"
      view.setUint8(36, "d".charCodeAt(0));
      view.setUint8(37, "a".charCodeAt(0));
      view.setUint8(38, "t".charCodeAt(0));
      view.setUint8(39, "a".charCodeAt(0));

      // Subchunk2 Size
      view.setUint32(40, totalLength, true);

      const wavData = new Uint8Array(header.byteLength + totalLength);
      console.log(wavData.length);

      wavData.set(new Uint8Array(header), 0);

      let offset = header.byteLength;
      console.log("frame Length", frames.length);
      arrayBuffers.forEach((buffer) => {
        const bufferArray = new Uint8Array(buffer);
        wavData.set(bufferArray, offset);
        offset += bufferArray.length;
      });

      const wavBlob = new Blob([wavData], { type: "audio/wav" });

      return [wavBlob, wavData.length];
    }

    async function VAD_ASR(blob) {
      try {
        keepAliveInferencing.value = true;
        const formdata = new FormData();
        formdata.append("file", blob);
        formdata.append("model", sttModel.value.value);
        formdata.append("prompt", sttResult.value.slice(-100));
        if (sttLang.value) {
          formdata.append("sttLang", sttLang.value);
        }
        const post = await api.post("/AI/vadAsr", formdata, {
          headers: {
            Authorization: "Bearer " + getToken(),
          },
        });
        const { data } = post;
        // console.log(data);
        sttResult.value += data.result;
        keepAliveInferencing.value = false;
      } catch (error) {
        keepAliveInferencing.value = false;
        console.log(error);
        throw Error(error);
      }
    }

    async function askUploadAudio(blob) {
      $q.notify({
        type: "positive",
        position: "top",
        message: "是否將音檔上傳至伺服器?",
        actions: [
          {
            label: "取消",
            color: "white",
            handler: () => {
              /* ... */
            },
          },
          {
            label: "確定",
            color: "white",
            handler: async () => {
              try {
                const formdata = new FormData();
                let fileName =
                  blob.name === undefined ? audioBlobName : blob.name;
                formdata.append("file", blob, fileName);
                formdata.append("projectID", route.params.projectId);

                const notif = $q.notify({
                  group: false, // required to be updatable
                  // timeout: 0, // we want to be in control when it gets dismissed
                  spinner: true,
                  message: "Uploading Audio...",
                  caption: "0%",
                  position: "top",
                });

                const post = await api.post("/Project/saveAudio", formdata, {
                  headers: {
                    Authorization: "Bearer " + getToken(),
                  },
                  onUploadProgress: (progressEvent) => {
                    let percentage = (progressEvent.progress * 100).toFixed(2);
                    notif({
                      caption: `${percentage}%`,
                    });
                    if (percentage === "100.00") {
                      notif({
                        icon: "done", // we add an icon
                        spinner: false, // we reset the spinner setting so the icon can be displayed
                        message: "Audio Uploaded!",
                        timeout: 1000, // we will timeout it in 2.5s
                      });
                    }
                  },
                });
                const { data } = post;
                unSave.value.audio = false;
              } catch (error) {
                throw Error(error);
              }
            },
          },
        ],
      });
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
        if (error.response.status == 401) {
          logout();
        } else {
          throw new Error(error);
        }
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
        await getProjectData(route.params.projectId);
        await getUserDefaultReplyTokens();
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
      router,
      sceneType,
      scene_label,
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

        const VAD = await VADBuilder();
        const vad = new VAD(VADMode.VERY_AGGRESSIVE, 16000);

        keepAliveAsrDisabled.value = true;
        if (keepAliveAsr.value) {
          if (sttResult.value != "") {
            $q.notify({
              type: "warning",
              position: "top",
              message: "啟動即時辨識，將於錄音開始時，預先清除語音辨識結果",
            });
          }
          sttResult.value = "";
          unSave.value.asrResult = true;
        }
        mediaRecorder = new RecordRTCPromisesHandler(stream, {
          type: "audio",
          recorderType: StereoAudioRecorder,
          desiredSampRate: 16000,
          mimeType: "audio/wav",
          timeSlice: timeSlice,
          ondataavailable: async function (event) {
            if (keepAliveAsr.value) {
              const audioData = await event.arrayBuffer();
              // console.log(audioData);
              const frame = new Int16Array(audioData);
              const res = vad.processBuffer(frame);

              if (!trigger.value) {
                ring_buffer.push({
                  frame: audioData,
                  is_speech: res,
                });
                let num_voiced = ring_buffer.deque.filter(
                  (item) => item.is_speech == 1
                ).length;
                if (num_voiced > 0.9 * dequeMaxLength) {
                  trigger.value = true;
                  ring_buffer.deque.forEach((e) => {
                    voiced_frames.push(e.frame);
                  });
                  console.log("Trigger On", voiced_frames.length);
                  ring_buffer.clear();
                }
              } else {
                voiced_frames.push(audioData);
                ring_buffer.push({
                  frame: audioData,
                  is_speech: res,
                });
                let num_unvoiced = ring_buffer.deque.filter(
                  (item) => item.is_speech == 0
                ).length;
                if (num_unvoiced > 0.9 * dequeMaxLength) {
                  trigger.value = false;
                  console.log("Trigger Off", voiced_frames.length);
                  console.log("send voice");
                  var [blob, len] = createWavBlob(voiced_frames, 16000, 2);
                  // console.log(blob, len);
                  VAD_ASR(blob);
                  // var url = URL.createObjectURL(blob);
                  // seg.value.push({
                  //   length: len,
                  //   url: url,
                  // });
                  ring_buffer.clear();
                  voiced_frames = [];
                }
              }
              if (voiced_frames.length > maxFrameLength) {
                var [blob, len] = createWavBlob(voiced_frames, 16000, 2);
                VAD_ASR(blob);
                voiced_frames = [];
              }
            }
          },
        });
        recording.value = true;
        dateStarted = new Date().getTime();
        recordDuration.value = "00:00";
        mediaRecorder.startRecording();

        mediaTimer = setInterval(function () {
          // get media amplitude
          recordDurationSeconds = (new Date().getTime() - dateStarted) / 1000;
          recordDuration.value = calculateTimeDuration(recordDurationSeconds);
        }, 1000);
      },
      recording,
      async stopRecord() {
        $q.loading.show();

        if (trigger.value) {
          trigger.value = false;
          if (voiced_frames.length > 0) {
            console.log("send voice");
            var [mergeblob, len] = createWavBlob(voiced_frames, 16000, 2);
            // console.log(blob, len);
            VAD_ASR(mergeblob);
            // var url = URL.createObjectURL(mergeblob);
            // seg.value.push({
            //   length: len,
            //   url: url,
            // });
            ring_buffer.clear();
            voiced_frames = [];
          }
        }

        recording.value = false;
        await mediaRecorder.stopRecording();
        let blob = await mediaRecorder.getBlob();

        audioBlob = blob;
        nativeUrl.value = URL.createObjectURL(blob);
        audioBlobName = "recording.wav";
        recorded.value = true;
        audioVis.value = true;
        paused.value = false;
        // invokeSaveAsDialog(blob);
        stopStream(stream);
        if (wakeLock) {
          wakeLock.release();
          wakeLock = null;
        }

        clearInterval(mediaTimer);
        keepAliveAsrDisabled.value = false;
        $q.loading.hide();
        if (keepAliveAsr.value) {
          askUploadAudio(blob);
        }
      },
      async pauseRecord() {
        paused.value = true;
        await mediaRecorder.pauseRecording();
        clearInterval(mediaTimer);
      },
      async resumeRecord() {
        paused.value = false;
        dateStarted = new Date().getTime();
        var initSeconds = recordDurationSeconds;
        await mediaRecorder.resumeRecording();
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
      keepAliveAsr,
      keepAliveInferencing,
      keepAliveAsrDisabled,
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
      async saveAsrResult() {
        try {
          const post = await api.post(
            "/Project/saveAsrResult",
            {
              projectId: route.params.projectId,
              asrResult: sttResult.value,
            },
            {
              headers: {
                Authorization: "Bearer " + getToken(),
              },
            }
          );
          const { data } = post;
          $q.notify({
            type: "positive",
            position: "top",
            message: "儲存成功",
          });
          unSave.value.asrResult = false;
        } catch (error) {
          $q.notify({
            type: "negative",
            position: "top",
            message: error.toString(),
          });
          throw Error(error);
        }
      },
      async saveLLMResult() {
        try {
          const post = await api.post(
            "/Project/saveLLMResult",
            {
              projectId: route.params.projectId,
              llmResult: llmResult.value,
            },
            {
              headers: {
                Authorization: "Bearer " + getToken(),
              },
            }
          );
          const { data } = post;
          $q.notify({
            type: "positive",
            position: "top",
            message: "儲存成功",
          });
          unSave.value.llmResult = false;
        } catch (error) {
          $q.notify({
            type: "negative",
            position: "top",
            message: error.toString(),
          });
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
        }
      },
      updSttModel(value) {
        if (value.supportLang) {
          sttLang.value = value.supportLang[0];
        } else {
          sttLang.value = null;
        }
      },
      sttResult,
      sttModelOption,
      sttModel,
      sttLang,
      AutoLLM,
      prompt,
      publicPrompt,
      promptSaveDialog,
      async recommendTitle() {
        try {
          $q.loading.show();
          const post = await api.post(
            "/recommendTitle",
            { text: prompt.value },
            {
              headers: {
                Authorization: "Bearer " + getToken(),
              },
            }
          );
          const { data } = post;
          newPrompt.value.label = data;
          $q.loading.hide();
        } catch (error) {
          $q.loading.hide();
          throw Error(error);
        }
      },
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
      llmInfenence,
      llmOptions,
      llmModel,
      initLMsettings,
      replyTokens,
      replyTokens_mark_labels,
      replyTokens_maxTokens,
      llmResult,
      llmResultMD,
      setReportMode(value, evt) {
        if (value) {
          llmResultMD.value = md.render(llmResult.value);
        }
      },
      reportMD: ref(false),
      depOptions,
      filterDepOptions,
      depFilterFn(val, update, abort) {
        update(() => {
          const needle = val.toLowerCase();
          filterDepOptions.value = depOptions.value.filter(
            (v) => v.toLowerCase().indexOf(needle) > -1
          );
        });
      },
      newOption() {
        $q.dialog({
          title: "New Option",
          message: "What is your department?",
          prompt: {
            model: "",
            type: "text", // optional
          },
          cancel: true,
          persistent: true,
        })
          .onOk((data) => {
            // console.log('>>>> OK, received', data)
            console.log(data);
            const needle = data.toLowerCase();
            if (
              depOptions.value.filter((res) => res.toLowerCase() == needle)
                .length == 0
            ) {
              depOptions.value.push(data);
              feedbackresult.value.department = data;
            }
          })
          .onCancel(() => {
            // console.log('>>>> Cancel')
          })
          .onDismiss(() => {
            // console.log('I am triggered on both OK and Cancel')
          });
      },
      feedbackDialog,
      feedbackresult,
      async sendFeedback() {
        try {
          const post = await api.post(
            "llmFeedback",
            {
              project_id: route.params.projectId,
              model: llmModel.value.value,
              text: sttResult.value,
              prompt: prompt.value,
              llm_result: llmResult.value,
              department: feedbackresult.value.department,
              feedback: feedbackresult.value,
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
            message: "回饋成功",
          });
        } catch (error) {
          console.log("err" + error);
          $q.notify({
            position: "top",
            type: "negative",
            message: "回饋失敗",
          });
        }
      },
      async initFeedbackDialog() {
        try {
          const get = await api.get("/departments", {
            headers: {
              Authorization: "Bearer " + getToken(),
            },
          });
          const { data } = get;
          console.log(data);
          depOptions.value = data;
          feedbackDialog.value = true;
        } catch (error) {
          console.log(error);
        }
      },
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
      downloadText(filename, text) {
        let link = document.createElement("a");
        link.href = "data:text/plain;charset=utf-8," + encodeURIComponent(text);
        link.download = filename;
        link.click();
      },
      async refresh(done) {
        if (await checkLogin()) {
          await getOptions(route.params.sceneType);
          await getProjectData(route.params.projectId);
        }
        done();
      },
      goback() {
        controller.abort();
        router.go(-1);
      },
      seg,
      unSave,
      trigger,
      filterFn(val, update, abort) {
        update(() => {
          const needle = val.toLocaleLowerCase();
          filteredPromptOptions.value = promptOptions.value.filter(
            (v) => v.label.toLocaleLowerCase().indexOf(needle) > -1
          );
        });
      },

      setModel(val) {
        defPrompt.value = val;
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
