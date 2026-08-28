import { defineStore } from 'pinia'

export let storeAdmin = defineStore('storeAdmin', {
    state() {
        return {
            token_admin: '',
            admin_data: {
                user: '',
                mail: '',
                old_pass: '',
                new_pass: '',
            },
        }
    },
    actions: {

    },
    persist: true,
})
