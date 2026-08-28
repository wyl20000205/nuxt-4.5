import { defineStore } from "pinia";

export let useUserStore = defineStore("storeUser", {
  state() {
    return {
      token_user: '',
    };
  },
  actions: {},
  persist: true,
});
