import { defineStore } from "pinia"

// 用户功能模板，后续页面可以直接扩展 state 和 actions。
export const useUserStore = defineStore("storeUser", {
  state: () => ({
    token_user: "",
    item_nav: [
        { icon: "icon-a-042_fujin", text: "首页", display: 1 },
        { icon: "icon-a-042_faxian", text: "帖子", display: 1 },
        { icon: "icon-a-042_faxian", text: "设置", display: 1 },
        { icon: "icon-a-042_tianjia", text: "退出", display: 1 },
      ],
  }),
  actions: {},
})
