import { defineStore } from "pinia"

// 用户功能模板，后续页面可以直接扩展 state 和 actions。
export const useUserStore = defineStore("storeUser", {
  state: () => ({
    token_user: "",
  }),
  actions: {},
  persist: true,
})
