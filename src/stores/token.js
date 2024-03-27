import { defineStore } from "pinia";

export const useSttStore = defineStore("STT", {
  state: () => ({
    value: 0,
    expire: 0,
  }),

  getters: {
    getValue(state) {
      const now = new Date();
      // console.log(now.getTime());
      // console.log(new Date(state.expire), now, now < new Date(state.expire), new Date(state.expire) < now);
      var expire
      if (typeof state.expire === 'string') {
        expire = Date.parse(state.expire)
      } else {
        expire = state.expire
      }
      if (now < expire) {
        return state.value;
      } else {
        console.log('now=', now);
        console.log('state.expire=', state.expire);
        console.log('expire=', expire);
        console.log('state.value=', state.value);
        return null;
      }
    },
  },

  actions: {
    setValue(value, expire) {
      this.value = value;
      this.expire = expire;
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: "STT",
        storage: localStorage,
      },
    ],
  },
});

export const useLttStore = defineStore("LTT", {
  state: () => ({
    value: 0,
    expire: 0,
  }),

  getters: {
    getValue(state) {
      const now = new Date();
      var expire
      if (typeof state.expire === 'string') {
        expire = Date.parse(state.expire)
      } else {
        expire = state.expire
      }
      if (now < expire) {
        return state.value;
      } else {
        console.log('now=', now);
        console.log('state.expire=', state.expire);
        console.log('expire=', expire);
        console.log('state.value=', state.value);
        return null;
      }
    },
  },

  actions: {
    setValue(value, expire) {
      this.value = value;
      this.expire = expire;
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: "LTT",
        storage: localStorage,
      },
    ],
  },
});

export const useLoginStore = defineStore("login", {
  state: () => ({
    login: false,
    user: null
  }),

  getters: {},

  actions: {
    setValue(value, user) {
      this.login = value;
      this.user = user;
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: "login",
        storage: localStorage,
      },
    ],
  },
});
