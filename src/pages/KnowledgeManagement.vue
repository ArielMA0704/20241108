<template>
  <q-page class="flex flex-center column">
    <div
      style="width: 90%"
      class="flex row no-wrap justify-start items-start content-start"
    >
      <div class="col-grow">
        <q-table
          flat
          bordered
          ref="tableRef"
          :rows="rows"
          :columns="columns"
          row-key="id"
          separator="cell"
          v-model:pagination="pagination"
          v-model:loading="loading"
          class="my-sticky-header-table"
          @request="onRequest"
        >
          <template v-slot:top-left>
            目前已上傳 {{ referencePermission.usuage }} 份文件，剩餘{{
              referencePermission.remain
            }}份文件
          </template>
          <template v-slot:top-right>
            <div class="flex no-wrap">
              <q-btn label="Add Knowledge Base" no-caps @click="addKB" />
              <q-input
                v-model="searchKBname"
                filled
                dense
                clearable
                class="q-ml-sm"
                label="知識庫名稱"
                @update:model-value="searchKBnameCB"
              />
            </div>
          </template>
          <!-- <template v-slot:header-cell-username="props">
            <q-th :props="props">
              <div class="flex column">
                <div>{{ props.col.label }}</div>
                <q-input
                  v-model="searchUsername"
                  filled
                  dense
                  clearable
                  class="q-mt-sm"
                  @update:model-value="searchUsernameCB"
                />
              </div>
            </q-th>
          </template> -->
          <!-- <template v-slot:header-cell-role="props">
            <q-th :props="props">
              <div class="flex column">
                <div>{{ props.col.label }}</div>
                <q-select
                  filled
                  dense
                  v-model="searchRole"
                  :options="roleOptions"
                  class="q-mt-sm"
                  clearable
                  @update:model-value="
                    onRequest({
                      pagination: pagination,
                    })
                  "
                />
              </div>
            </q-th>
          </template> -->
          <template v-slot:body-cell-kbname="props">
            <q-td :props="props" class="flex column items-start justify-center">
              <div>
                <q-btn
                  icon="edit"
                  flat
                  @click="openKBSetting(props.row)"
                  padding="sm"
                />
                <q-btn
                  icon="delete"
                  color="red"
                  flat
                  class="q-ml-sm"
                  @click="deleteKB(props.row.id)"
                  padding="sm"
                />
              </div>
              <div>
                {{ props.value }}
              </div>
            </q-td>
          </template>
        </q-table>
      </div>
      <div
        style="
          height: calc(100vh - 100px);
          width: 50%;
          position: relative;
          border: 1px solid rgba(0, 0, 0, 0.12);
          border-radius: 4px;
        "
        v-if="showDetail"
        class="q-ml-md"
      >
        <q-btn
          icon="close"
          color="red"
          padding="sm"
          style="position: absolute; right: 10px; top: 10px"
          @click="showDetail = false"
        />
        <div class="q-mt-md q-ml-md">
          <div v-if="kbNameEditing" class="flex row items-center no-wrap">
            <q-input v-model="newKBName" filled />
            <q-btn label="儲存" class="q-ml-md" @click="saveKBName" />
            <q-btn
              label="取消"
              color="red"
              class="q-ml-md"
              @click="kbNameEditing = false"
            />
          </div>
          <div v-else class="flex items-center">
            <div class="text-h5">{{ currentKB.kbname }}</div>
            <q-btn
              icon="edit"
              flat
              round
              @click="
                newKBName = currentKB.kbname;
                kbNameEditing = true;
              "
            />
          </div>
          <div class="q-mt-md flex items-center no-wrap">
            <q-file
              v-model="docUploadFiles"
              multiple
              filled
              counter
              accept=".pdf"
              v-bind:max-files="referencePermission.remain"
            />
            <q-btn
              icon="add"
              class="q-mb-md q-mx-md"
              color="green"
              @click="addKBD"
              :disable="docUploadFiles == 0"
            />
          </div>

          <div v-if="currentKBDlist.length == 0" class="q-mt-md">
            No Document(s) now!
          </div>
          <q-list v-else bordered class="q-mt-md q-mr-md">
            <q-item v-for="item in currentKBDlist" :key="item.id">
              <q-item-section avatar>
                <q-btn
                  icon="delete"
                  color="red"
                  padding="sm"
                  @click="deleteKBD(item.id)"
                />
              </q-item-section>

              <q-item-section>{{ item.name }}</q-item-section>
              <q-item-section>
                <div>
                  <q-chip
                    :color="
                      item.status == 'FAIL'
                        ? 'red'
                        : item.status == 'CREATED'
                        ? 'green'
                        : 'orange'
                    "
                    text-color="white"
                    :label="item.status"
                  />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- <div class="q-mt-md q-ml-md">
          <div class="text-h5">{{ currentUser.username }}</div>
          <div class="text-h6 q-mt-md flex items-center">
            <div>角色:</div>
            <q-select
              filled
              dense
              v-model="currentUser.role"
              :options="roleOptions"
              class="q-ml-md"
              @update:model-value="updateUserInfo"
              v-if="loginUser != currentUser.username"
            />
            <div v-else class="q-ml-sm">{{ currentUser.role }}</div>
          </div>
          <div class="text-h6">
            回覆長度: {{ currentUser.permission.reply_tokens }}
          </div>
          <div>
            <div class="text-h6">參考資料:</div>

            <div class="q-ml-md">
              <div class="flex items-center">
                <div>已上傳:</div>
                <q-input
                  v-model.number="currentUser.permission.references.usuage"
                  type="number"
                  style="width: 100px"
                  class="q-ml-sm"
                  dense
                  filled
                  readonly
                />
              </div>
              <div class="flex items-center q-mt-md">
                <div>最大上傳數:</div>
                <q-input
                  v-model.number="currentUser.permission.references.limit"
                  type="number"
                  style="width: 100px"
                  class="q-ml-sm"
                  dense
                  filled
                  @update:model-value="updateUserInfo"
                />
              </div>
            </div>
          </div>
          <div class="text-h6 q-mt-md flex items-center">
            <div>剩餘AI次數(-1 代表未限制使用):</div>
            <q-input
              v-model.number="currentUser.permission.ai_point"
              type="number"
              style="width: 100px"
              class="q-ml-sm"
              dense
              filled
              @update:model-value="updateUserInfo"
              @blur="checkResetOrNot"
            />
          </div>
        </div> -->
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
  name: "KnowledgeManagementPage",
  setup() {
    const $q = useQuasar();
    const route = useRoute();
    const tableRef = ref();
    const columns = ref([
      {
        name: "kbname",
        label: "知識庫名稱",
        align: "center",
        sortable: false,
        field: "kbname",
      },
      {
        name: "doc_count",
        label: "文件數",
        align: "center",
        sortable: false,
        field: "doc_count",
      },
    ]);
    const rows = ref([]);
    const pagination = ref({
      page: 1,
      rowsPerPage: 50,
      rowsNumber: 0,
      sortBy: "generate_time",
      descending: true,
    });
    const loading = ref(false);
    const showDetail = ref(false);
    const searchKBname = ref("");
    const currentKB = ref({
      kbname: "",
    });
    const currentKBDlist = ref([]);
    const kbNameEditing = ref(false);
    const newKBName = ref("");

    const docUploadFiles = ref([]);
    const referencePermission = ref({
      usuage: 0,
      remain: 10,
      limit: 10,
    });

    const onRequest = async (props) => {
      const { page, rowsPerPage, sortBy, descending } = props.pagination;
      loading.value = true;
      // emulate server
      // update rowsCount with appropriate value
      pagination.value.rowsNumber = await getRowsNumberCount();

      // get all rows if "All" (0) is selected
      const fetchCount =
        rowsPerPage === 0 ? pagination.value.rowsNumber : rowsPerPage;
      // calculate starting row of data
      const startRow = (page - 1) * rowsPerPage;
      // fetch data from "server"
      rows.value = await fetchFromServer(
        startRow,
        fetchCount,
        sortBy,
        descending
      );
      // clear out existing data and add new
      // rows.value.splice(0, rows.value.length, ...returnedData);
      // don't forget to update local pagination object
      pagination.value.page = page;
      pagination.value.rowsPerPage = rowsPerPage;
      pagination.value.sortBy = sortBy;
      pagination.value.descending = descending;
      // ...and turn of loading indicator
      loading.value = false;
      // info.value = rows.value[0];
    };

    async function getRowsNumberCount() {
      try {
        const get = await api.get("/KnowledgeBase/KBcount", {
          params: {
            kbName: searchKBname.value == "" ? null : searchKBname.value,
          },
          headers: {
            Authorization: "Bearer " + getToken(),
          },
        });
        const { data } = get;
        return data;
        // return 0;
      } catch (error) {
        if (error.response.status == 401) {
          logout();
        } else {
          throw new Error(error);
        }
      }
    }

    async function fetchFromServer(startRow, count, sortBy, descending) {
      try {
        const get = await api.get("/KnowledgeBase/KB", {
          params: {
            offset: startRow,
            rowsPerPage: count,
            kbName: searchKBname.value == "" ? null : searchKBname.value,
          },
          headers: {
            Authorization: "Bearer " + getToken(),
          },
        });
        const { data } = get;
        // console.log(data);
        return data.slice();
        // return [];
      } catch (error) {
        if (error.response.status == 401) {
          logout();
        } else {
          throw new Error(error);
        }
      }
    }

    async function addKB() {
      $q.dialog({
        title: "建立知識庫",
        message: "知識庫名稱",
        prompt: {
          model: "",
          isValid: (val) => val.length > 2,
          type: "text", // optional
        },
        cancel: true,
        persistent: true,
      }).onOk(async (data) => {
        // console.log('>>>> OK, received', data)
        try {
          const post = await api.post(
            "/KnowledgeBase/createKB",
            {
              kbName: data,
            },
            {
              headers: {
                Authorization: "Bearer " + getToken(),
              },
            }
          );
          const { dataRtn } = post;
          onRequest({
            pagination: pagination.value,
          });
        } catch (error) {
          throw new Error(error);
        }
      });
    }

    async function deleteKB(id) {
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
                await api.delete("/KnowledgeBase/deleteKB", {
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
                await getUserPermission();
                onRequest({
                  pagination: pagination.value,
                });
              } catch (error) {
                $q.notify({
                  position: "top",
                  type: "negative",
                  message: "刪除失敗",
                });
                throw new Error(error);
              }
            },
          },
        ],
      });
    }

    async function addKBD() {
      try {
        const formdata = new FormData();
        formdata.append("KB_id", currentKB.value.id);
        docUploadFiles.value.forEach((e) => {
          formdata.append("files", e);
        });
        const post = await api.post("/KnowledgeBase/addKBD", formdata, {
          headers: {
            Authorization: "Bearer " + getToken(),
          },
        });
        const { data } = post;
        if (data.fail_list) {
          data.fail_list.forEach((e) => {
            $q.notify({
              message: e,
              type: "negative",
              position: "top",
            });
          });
        }

        await getUserPermission();
        await getKBDlist(currentKB.value.id);
        await onRequest({
          pagination: pagination.value,
        });
        docUploadFiles.value = [];
      } catch (error) {
        throw Error(error);
      }
    }

    async function deleteKBD(id) {
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
                await api.delete("/KnowledgeBase/deleteKBD", {
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
                await getUserPermission();
                await getKBDlist(currentKB.value.id);
                onRequest({
                  pagination: pagination.value,
                });
              } catch (error) {
                $q.notify({
                  position: "top",
                  type: "negative",
                  message: "刪除失敗",
                });
                throw new Error(error);
              }
            },
          },
        ],
      });
    }

    async function getKBDlist(kb_id) {
      try {
        const get = await api.get("/KnowledgeBase/KBD", {
          params: {
            KB_id: kb_id,
            // kbdName: searchKBname.value == "" ? null : searchKBname.value,
          },
          headers: {
            Authorization: "Bearer " + getToken(),
          },
        });
        const { data } = get;
        currentKBDlist.value = data;
      } catch (error) {
        throw Error(error);
      }
    }

    async function getUserPermission() {
      await checkLogin();
      const token = getToken();
      const userInfo = JSON.parse(atob(token.split(".")[1]));
      const refPermission = userInfo.permission.references;
      referencePermission.value = {
        usuage: refPermission.usuage,
        remain: refPermission.limit - refPermission.usuage,
        limit: refPermission.limit,
      };
    }

    onMounted(async () => {
      if (await checkLogin()) {
        const token = getToken();
        await onRequest({
          pagination: pagination.value,
        });
        getUserPermission();
      }
    });

    return {
      tableRef,
      columns,
      rows,
      pagination,
      loading,
      showDetail,
      onRequest,
      searchKBname,
      searchKBnameCB() {
        if (searchUsername.value) {
          if (searchUsername.value.length >= 2) {
            onRequest({
              pagination: pagination.value,
            });
          }
        } else {
          onRequest({
            pagination: pagination.value,
          });
        }
      },
      addKB,
      deleteKB,
      currentKB,
      currentKBDlist,
      kbNameEditing,
      newKBName,
      async saveKBName() {
        try {
          const post = await api.post(
            "/KnowledgeBase/updateKB",
            {
              id: currentKB.value.id,
              newKBName: newKBName.value,
            },
            {
              headers: {
                Authorization: "Bearer " + getToken(),
              },
            }
          );
          const { data } = post;
          if (data) {
            currentKB.value.kbname = newKBName.value;
            newKBName.value = "";
            kbNameEditing.value = false;
            onRequest({ pagination: pagination.value });
          }
        } catch (error) {
          throw Error(error);
        }
      },
      async openKBSetting(row) {
        try {
          // const get = await api.get("/Account/User", {
          //   params: {
          //     id: id,
          //   },
          //   headers: {
          //     Authorization: "Bearer " + getToken(),
          //   },
          // });
          // const { data } = get;
          // let defaultPermission = {
          //   reply_tokens: 1000,
          //   references: {
          //     usuage: 0,
          //     limit: 10,
          //   },
          //   ai_point: -1,
          // };
          // data.permission = { ...defaultPermission, ...data.permission };
          // currentUser.value = { ...currentUser.value, ...data };
          currentKB.value = row;
          await getKBDlist(currentKB.value.id);
          showDetail.value = true;
          // console.log(loginUser.value != currentUser.value.username);
        } catch (error) {
          throw new Error(error);
        }
      },
      docUploadFiles,
      referencePermission,
      addKBD,
      deleteKBD,
    };
  },
});
</script>
<style lang="sass" scoped>
.my-sticky-header-table
  /* height or max-height is important */
  height: calc(100vh - 100px)

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: #fff

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px

  /* prevent scrolling behind sticky top row on focus */
  tbody
    /* height of all previous header rows */
    scroll-margin-top: 48px
.search-input
  flex: 1 0 auto
</style>
