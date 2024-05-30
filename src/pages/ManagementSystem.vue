<template>
  <q-page class="flex flex-center column">
    <div
      style="width: 90%"
      class="flex row wrap justify-start items-start content-start"
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
          <template v-slot:header-cell-username="props">
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
          </template>
          <template v-slot:header-cell-role="props">
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
          </template>
          <template v-slot:body-cell-username="props">
            <q-td :props="props" class="flex column items-start">
              <q-btn icon="edit" flat @click="openUserSetting(props.row.id)" />
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
        </div>
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
  name: "ManagementSystemPage",
  setup() {
    const $q = useQuasar();
    const route = useRoute();
    const tableRef = ref();
    const columns = ref([
      {
        name: "username",
        label: "帳號",
        align: "center",
        sortable: false,
        field: "username",
      },
      {
        name: "role",
        label: "角色",
        align: "center",
        sortable: false,
        field: "role",
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
    const searchRole = ref(null);
    const searchUsername = ref("");

    const loginStore = useLoginStore();
    const loginUser = computed(() => loginStore.user);

    const currentUser = ref({
      username: "",
      role: "",
      permission: {
        reply_tokens: "",
        references: {
          usuage: 0,
          limit: 10,
        },
        ai_point: -1,
      },
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
        const get = await api.get("/Account/usersCount", {
          params: {
            role: searchRole.value,
            username: searchUsername.value == "" ? null : searchUsername.value,
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
        const get = await api.get("/Account/users", {
          params: {
            offset: startRow,
            rowsPerPage: count,
            role: searchRole.value,
            username: searchUsername.value == "" ? null : searchUsername.value,
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

    onMounted(async () => {
      if (await checkLogin()) {
        const token = getToken();
        const userInfo = JSON.parse(atob(token.split(".")[1]));
        if (userInfo.role != "ADMIN") {
          const link = document.createElement("a");
          link.href = window.location.hash.split("/")[0] + "/scene";
          link.click();
        }

        onRequest({
          pagination: pagination.value,
        });
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
      searchUsername,
      searchRole,
      roleOptions: ref(["ADMIN", "USER"]),
      searchUsernameCB() {
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
      loginUser,
      currentUser,
      async openUserSetting(id) {
        try {
          const get = await api.get("/Account/User", {
            params: {
              id: id,
            },
            headers: {
              Authorization: "Bearer " + getToken(),
            },
          });
          const { data } = get;
          let defaultPermission = {
            reply_tokens: 1000,
            references: {
              usuage: 0,
              limit: 10,
            },
            ai_point: -1,
          };
          data.permission = { ...defaultPermission, ...data.permission };
          currentUser.value = { ...currentUser.value, ...data };
          showDetail.value = true;
          console.log(loginUser.value != currentUser.value.username);
        } catch (error) {
          throw new Error(error);
        }
      },
      async updateUserInfo() {
        if (typeof currentUser.value.permission.ai_point == "number") {
          try {
            const post = await api.post(
              "/Account/updateUserInfo",
              {
                id: currentUser.value.id,
                permission: currentUser.value.permission,
                role: currentUser.value.role,
              },
              {
                headers: {
                  Authorization: "Bearer " + getToken(),
                },
              }
            );
            const { data } = post;
            if (data) {
              onRequest({
                pagination: pagination.value,
              });
            }
          } catch (error) {
            throw Error(error);
          }
        }
      },
      checkResetOrNot() {
        if (typeof currentUser.value.permission.ai_point != "number") {
          currentUser.value.permission.ai_point = 0;
        }
      },
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
