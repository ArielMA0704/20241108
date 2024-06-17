import { Cookies } from "quasar";
import { api } from "boot/axios";
import { computed } from "vue";
import { useSttStore, useLttStore, useLoginStore } from "stores/token";

const STTstore = useSttStore();
const LTTstore = useLttStore();
const sttGetValue = computed(() => STTstore.getValue);
const lttGetValue = computed(() => LTTstore.getValue);
const loginStore = useLoginStore();

function setToken(LTT, STT) {
  LTTstore.setValue(
    LTT,
    new Date(JSON.parse(atob(LTT.split(".")[1])).exp * 1000)
  );
  //   Cookies.set("ARAL_LTT", LTT, {
  //     expires: new Date(JSON.parse(atob(LTT.split(".")[1])).exp * 1000),
  //   });
  STTstore.setValue(
    STT,
    new Date(JSON.parse(atob(STT.split(".")[1])).exp * 1000)
  );
  //   Cookies.set("ARAL_STT", STT, {
  //     expires: new Date(JSON.parse(atob(STT.split(".")[1])).exp * 1000),
  //   });
}

function getToken() {
  //   if (Cookies.has("ARAL_STT")) {
  //     // console.log("STT");
  //     return Cookies.get("ARAL_STT");
  //   } else if (Cookies.has("ARAL_LTT")) {
  //     // console.log("LTT");
  //     return Cookies.get("ARAL_LTT");
  //   } else {
  //     return null;
  //   }
  if (sttGetValue.value !== null) {
    console.log("STT");
    return sttGetValue.value;
  } else {
    console.log("LTT");
    return lttGetValue.value;
  }
  // return sttGetValue.value !== null ? sttGetValue.value : lttGetValue.value;
}

async function checkLogin(loginPage = false) {
  //   console.log(window.location.hash);
  //   console.log(Cookies.getAll());
  const token = getToken();
  // console.log(token);
  if (token) {
    try {
      const get = await api.get("checkLogin", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });
      const { data } = get;
      setToken(data.LTT, data.STT);
      return true;
    } catch (error) {
      if (error.response) {
        if (error.response.status == 401) {
          if (!loginPage) {
            logout();
          }
        } else {
          throw new Error(error);
          // console.log(error);
        }
      } else {
        throw new Error(error);
      }
    }
  } else {
    if (!loginPage) {
      const link = document.createElement("a");
      link.href = window.location.hash.split("/")[0] + "/";
      link.click();
    }
  }
}

function logout() {
  //   Cookies.remove("ARAL_STT");
  //   Cookies.remove("ARAL_LTT");
  STTstore.setValue(null, new Date());
  LTTstore.setValue(null, new Date());
  loginStore.setValue(false, null);
  const link = document.createElement("a");
  link.href = window.location.hash.split("/")[0] + "/";
  link.click();
}

export { setToken, getToken, checkLogin, logout };
