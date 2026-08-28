<script setup lang="ts">
  import readFileXlsx from "read-excel-file/browser";
  import writeFileXlsx from "write-excel-file/browser";

  // console.log(readFileXlsx,writeFileXlsx);

  //读取是写入：
  let files = ref<File[]>([]);

  let load_file = (e: Event) => {
    let t = e.target as HTMLInputElement;
    if (!t.files) return;
    files.value.push(...t.files);
    console.log(files);
  };

  let show_file = async () => {
    const file = files.value[0];
    if (!file) return;
    let t = await readFileXlsx(file); //获取一张表内的所有分表
    if(!t[0]) return
    let { sheet, data } = t[0]; // data 是一个表内的二维数组 包括空值None
    console.log(sheet, data);
    for (let row of data) for (let col of row) console.log(col);
  };

  //接着是写入： 如果想自定义则是 使用 {value:'yumao',backgroundColor:'#FFF000'}

  // const writeStream = fs.createWriteStream('/path/to/output-file.xlsx')
  // await writeExcelFile(sheetData).toStream(writeStream)

  // let col = [['name','age','sales','total'],
  //          ['yumao',18,3123,{}],
  //         ['hualuo',32,112,{}]]
  // let write_status =  writeFileXlsx(col).toFile('test.xls')
  const source = [
    ["yumao", 18, 3123],
    ["hualuo", 32, 112],
  ];
  const exportXlsx = async () => {
    const col = [
      ["name", "age", "sales", "total"],
      ...source.map((row, index) => {
        const excelRow = index + 2; // 第一行是标题，所以数据从第2行开始
        return [
          ...row,
          {
            type: "Formula" as const,
            value: `=SUM(B${excelRow}:C${excelRow})`,
          },
        ];
      }),
    ];
    await writeFileXlsx(col).toFile("销售数据.xlsx");
  };
</script>

<template>
  <div id="pages_read_write_xlsx">
    <input type="file" id="file_inp" @change="load_file" multiple />
    <p @click="show_file" style="cursor: pointer">获取</p>
  </div>
</template>

<style lang="less"></style>
