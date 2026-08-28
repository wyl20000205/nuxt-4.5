
<template>
    <div id="pages_mailer">
        <input type="mail" name="" id="" placeholder="" v-model="mail">
        <br>
        <input type="text" name="" id="" placeholder="" v-model="content">
        <button @click="send_mail">发送</button>
    </div>
</template>

<script setup lang="ts">
let mail = ref('')
let content = ref('')
import api_index from '~/composables/api_index';
let send_mail = async ()=>{
    let data =  api_index.send_mail({mail,content})
    console.log(data);
    
}
</script>

<style lang="less">


</style>