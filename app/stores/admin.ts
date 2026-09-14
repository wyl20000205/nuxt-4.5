import { defineStore } from "pinia"

// 管理端功能模板，先保留最小的账号与改密状态。
export const storeAdmin = defineStore("storeAdmin", {
  state: () => ({
    token_admin: "",
    admin_data: {
      user: "",
      mail: "",
      old_pass: "",
      new_pass: "",
    },
  }),
  actions: {},
  persist: true,
})
