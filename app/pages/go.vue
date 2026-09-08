<template>
  <div class="w-10 h-[100vh] m-auto mt-20">
    <input type="text" class="border-solid mb-6" v-model="ac.username" />
    <br />
    <input type="password" class="border-solid mb-6" v-model="ac.password" />
    <br />
    <button @click="login">登录</button>
    <button @click="user_say_hello">用户权限</button>
    <input type="file" multiple @change="have_file" />
    <button @click="upload_file">确认上传文件</button>
  </div>
</template>

<script setup lang="ts">
  let ac = ref({
    username: "",
    password: "",
  });
  const selected_files = ref<File[]>([]);
  // const data = await $fetch("/api/go/index/getUserInfo/112");
  // console.log(data);

  // const data = await $fetch("/api/go/upload/file", {
  //     method: "post",
  //   });
  // console.log(data);
 
  const have_file = (event: Event) => {
    const input = event.target as HTMLInputElement;
    selected_files.value = Array.from(input.files ?? []);
  };

  const upload_file = async () => {
    if (selected_files.value.length === 0) {
      console.log("请先选择文件");
      return;
    }

    const form = new FormData();
    for (const file of selected_files.value) {
      form.append("files", file);
    }

    const data = await $fetch("/api/go/upload/file", {
      method: "post",
      body: form,
    });
    console.log(data);
  };

  let login = async () => {
    const data = await $fetch("/api/go/index/login", {
      method: "post",
      body: {
        username: ac.value.username,
        password: ac.value.password,
      },
    });
    console.log(data);
  };
  let user_say_hello = async () => {
    let data = await $fetch("/api/go/user/hello");
    console.log(data);
  };
</script>

<style lang="less" scoped></style>
