<template>
  <q-page class="flex flex-center column">
    <q-pull-to-refresh @refresh="refresh" style="width: 90%">
      <q-table
        flat
        bordered
        ref="tableRef"
        :grid="gridStatus"
        :rows="rows"
        :columns="columns"
        row-key="id"
        :hide-header="gridStatus"
        v-model:pagination="pagination"
        v-model:loading="loading"
        class="my-sticky-header-table"
        selection="multiple"
        v-model:selected="selected"
        @selection="handleSelection"
        @request="onRequest"
      >
        <template v-slot:top>
          <div class="flex justify-start q-pr-sm" style="flex: 1 0 auto">
            <q-btn icon="arrow_back_ios_new" flat dense to="/scene" />
            <q-input
              filled
              v-model="searchProjectName"
              class="search-input"
              :label="t('專案名稱')"
              clearable
            />
            <!--style="max-width: 600px"-->
            <q-btn
              icon="search"
              flat
              dense
              @click="
                onRequest({
                  pagination: pagination,
                })
              "
            />
          </div>
          <div class="flex justify-end" style="flex: 1 1 auto">
            <!-- <div class="flex items-center">
              <div>List</div>
              <q-toggle v-model="gridStatus" label="Grid" />
            </div> -->
            <div class="q-ml-md flex justify-end">
              <q-btn
                label="New Project"
                @click="getProjectName"
                class="q-my-xs"
              />
              <q-btn
                label="Delete Project(s)"
                no-caps
                class="q-ml-md q-my-xs bg-red text-white"
                @click="deleteProjects"
              />
            </div>
          </div>
        </template>
        <template v-slot:body-cell-project_name="props">
          <q-td :props="props">
            <div class="flex items-center">
              <q-btn
                label="open"
                class="q-mr-sm"
                size="sm"
                :to="'/task/' + sceneType + '/' + props.row.id"
              />
              <div>{{ props.value }}</div>
            </div>
          </q-td>
        </template>
        <template v-slot:header-selection="scope">
          <q-checkbox v-model="scope.selected" />
        </template>
        <template v-slot:body-selection="scope">
          <q-checkbox
            :model-value="scope.selected"
            @update:model-value="
              (val, evt) => {
                Object.getOwnPropertyDescriptor(scope, 'selected').set(
                  val,
                  evt
                );
              }
            "
          />
        </template>
        <template v-slot:item="props">
          <div class="q-pa-xs col-xs-6 col-sm-3 col-md-2 col-xl-1">
            <q-card @click="toDetail(props.row.id)" class="full-height">
              <!-- class="full-height" -->
              <q-card-section>
                <q-checkbox
                  dense
                  v-model="props.selected"
                  @update:model-value="
                    (val, evt) => {
                      Object.getOwnPropertyDescriptor(props, 'selected').set(
                        val,
                        evt
                      );
                    }
                  "
                />
              </q-card-section>
              <q-card-section>
                <div v-for="col in props.cols" :key="col.name" class="q-mb-sm">
                  <div>
                    {{ t(col.label) }}
                  </div>
                  <div
                    style="
                      display: -webkit-box;
                      -webkit-line-clamp: var(--line-clamp, 3);
                      -webkit-box-orient: vertical;
                      overflow: hidden;
                    "
                  >
                    {{ col.value }}
                  </div>
                </div>
              </q-card-section>
              <!-- <q-card-actions align="center">
                <q-btn flat label="open" :to="'/task/' + props.row.id" />
              </q-card-actions> -->
            </q-card>
          </div>
        </template>
      </q-table>
    </q-pull-to-refresh>
    <!-- <q-page-sticky position="top-left" :offset="[18, 18]">
      <q-btn
        fab
        icon="arrow_back_ios_new"
        color="primary"
        padding="sm"
        to="/scene"
      />
    </q-page-sticky> -->
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, toRaw, nextTick } from "vue";
import { api } from "boot/axios";
import { useQuasar } from "quasar";
import { setToken, checkLogin, getToken, logout } from "boot/account";
import dateFormat from "dateformat";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "ProjectPage",
  components: {},
  setup() {
    const $q = useQuasar();
    const route = useRoute();
    const router = useRouter();
    const { t } = useI18n({ useScope: "global" });
    const tableRef = ref();
    const columns = ref([
      {
        name: "project_name",
        label: "專案名稱",
        align: "center",
        sortable: false,
        field: "project_name",
      },
      // {
      //   name: "stt_status",
      //   label: "語音辨識狀態",
      //   align: "center",
      //   sortable: false,
      //   field: "stt_status",
      // },
      // {
      //   name: "llm_status",
      //   label: "語言模型狀態",
      //   align: "center",
      //   sortable: false,
      //   field: "llm_status",
      // },
      {
        name: "generate_time",
        label: "創建時間",
        align: "center",
        sortable: true,
        field: "generate_time",
        format: (val) => {
          const date = new Date(val);
          return dateFormat(date, "yyyy/mm/dd HH:MM");
        },
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
    const selected = ref([]);
    let storedSelectedRow;

    const gridStatus = ref(true);

    const sceneType = ref(null);
    const searchProjectName = ref("");

    const onRequest = async (props) => {
      let scene = sceneType.value;
      console.log(scene);
      const { page, rowsPerPage, sortBy, descending } = props.pagination;
      loading.value = true;
      // emulate server
      // update rowsCount with appropriate value
      pagination.value.rowsNumber = await getRowsNumberCount(scene);

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
        descending,
        scene
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
    async function getRowsNumberCount(scene) {
      const filter = {
        // uid: uidSearch.value,
      };
      try {
        const get = await api.get("/userProjectsCount", {
          params: {
            scene: scene,
            projectNameSearch:
              searchProjectName.value == "" ? null : searchProjectName.value,
          },
          headers: {
            Authorization: "Bearer " + getToken(),
          },
        });
        const { data } = get;
        return data;
      } catch (error) {
        if (error.response.status == 401) {
          logout();
        } else {
          throw new Error(error);
        }
      }
    }
    async function fetchFromServer(startRow, count, sortBy, descending, scene) {
      // select * From public.main
      // Limit 5 offset 5
      const filter = {
        // uid: uidSearch.value,
      };
      try {
        const get = await api.get("/userProjects", {
          params: {
            offset: startRow,
            rowsPerPage: count,
            scene: scene,
            projectNameSearch:
              searchProjectName.value == "" ? null : searchProjectName.value,
          },
          headers: {
            Authorization: "Bearer " + getToken(),
          },
        });
        const { data } = get;
        // console.log(data);
        return data.slice();
      } catch (error) {
        if (error.response.status == 401) {
          logout();
        } else {
          throw new Error(error);
        }
      }
    }

    async function createProject(projName) {
      try {
        const post = await api.post(
          "/createProject",
          {
            project_name: projName,
            scene: sceneType.value,
          },
          {
            headers: {
              Authorization: "Bearer " + getToken(),
            },
          }
        );
        const { data } = post;
        const link = document.createElement("a");
        link.href =
          window.location.hash.split("/")[0] +
          "/task/" +
          sceneType.value +
          "/" +
          data.toString();
        link.click();
      } catch (error) {
        // if (error.response.status == 401) {
        //   logout();
        // } else {
        //   throw new Error(error);
        // }
        throw new Error(error);
      }
    }

    onMounted(async () => {
      if (await checkLogin()) {
        sceneType.value = route.params.sceneType;
        onRequest({
          pagination: pagination.value,
        });
      }
    });

    return {
      t,
      tableRef,
      columns,
      rows,
      pagination,
      loading,
      selected,
      onRequest,
      handleSelection({ rows, added, evt }) {
        // ignore selection change from header of not from a direct click event
        if (rows.length !== 1 || evt === void 0) {
          return;
        }

        const oldSelectedRow = storedSelectedRow;
        const [newSelectedRow] = rows;
        const { ctrlKey, shiftKey } = evt;

        if (shiftKey !== true) {
          storedSelectedRow = newSelectedRow;
        }

        // wait for the default selection to be performed
        nextTick(() => {
          if (shiftKey === true) {
            const tableRows = tableRef.value.filteredSortedRows;
            let firstIndex = tableRows.indexOf(oldSelectedRow);
            let lastIndex = tableRows.indexOf(newSelectedRow);

            if (firstIndex < 0) {
              firstIndex = 0;
            }

            if (firstIndex > lastIndex) {
              [firstIndex, lastIndex] = [lastIndex, firstIndex];
            }

            const rangeRows = tableRows.slice(firstIndex, lastIndex + 1);
            const rangeRowsID = Array.from(rangeRows, (x) => x.id);
            // we need the original row object so we can match them against the rows in range
            const selectedRows = selected.value.map(toRaw);
            const selectRowsID = Array.from(selectedRows, (x) => x.id);

            selected.value =
              added === true
                ? selectedRows.concat(
                    rangeRows.filter(
                      (row) => selectRowsID.includes(row.id) === false
                    )
                  )
                : selectedRows.filter(
                    (row) => rangeRowsID.includes(row.id) === false
                  );
          }
          // else if (ctrlKey !== true && added === true) {
          //   selected.value = [newSelectedRow];
          // }
        });
      },
      gridStatus,
      getProjectName() {
        $q.dialog({
          title: "新增專案",
          message: "專案名稱",
          prompt: {
            model: dateFormat(new Date(), "yyyy/mm/dd HH:MM"),
            type: "text", // optional
          },
          cancel: true,
          persistent: true,
        }).onOk((data) => {
          // console.log('>>>> OK, received', data)
          createProject(data);
        });
      },
      refresh(done) {
        onRequest({
          pagination: pagination.value,
        });
        done();
      },
      toDetail(page) {
        router.push("/task/" + sceneType.value + "/" + page);
      },
      sceneType,
      deleteProjects() {
        let arr = Array.from(selected.value, (x) => x.id);
        if (arr.length > 0) {
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
                    await api.delete("/project", {
                      data: arr,
                      headers: {
                        Authorization: "Bearer " + getToken(),
                      },
                    });
                    onRequest({
                      pagination: pagination.value,
                    });
                    selected.value = [];
                  } catch (error) {
                    throw Error(error);
                  }
                },
              },
            ],
          });
        }
      },
      searchProjectName,
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
