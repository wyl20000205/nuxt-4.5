import { defineStore } from "pinia";

// 管理端功能模板，先保留最小的账号与改密状态。
export const storeAdmin = defineStore("storeAdmin", {
  state: () => ({
    token_admin: "",
    admin_data: {
      user: "",
      mail: "",
      old_pass: "",
      new_pass: "",
      item_nav: [
        { icon: "icon-a-042_fujin", text: "首页", display: 1 },
        { icon: "icon-a-042_faxian", text: "帖子", display: 1 },
        { icon: "icon-a-042_wode-09", text: "用户", display: 1 },
        { icon: "icon-a-042_kanyikan", text: "设置", display: 1 },
        { icon: "icon-a-042_tianjia", text: "退出", display: 1 },
      ],
    },
  }),
  actions: {},
});
