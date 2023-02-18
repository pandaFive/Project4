const config = {
    url:  "https://api.recursionist.io/builder/computers",
    cpuBrand: document.getElementById("cpuBrand"),
    cpuModel: document.getElementById("cpuModel"),
    gpuBrand: document.getElementById("gpuBrand"),
    gpuModel: document.getElementById("gpuModel"),
    memoryNum: document.getElementById("memoryNum"),
    memoryBrand: document.getElementById("memoryBrand"),
    memoryModel: document.getElementById("memoryModel"),
    storageType: document.getElementById("storageType"),
    storageCapacity: document.getElementById("storageCapacity"),
    storageBrand: document.getElementById("storageBrand"),
    storageModel: document.getElementById("storageModel"),
    add: document.getElementById("addBtn"),
    clear: document.getElementById("clearBtn"),
    results: document.getElementById("results"),
    pcNumber: 1,
}

// optionを文字列として生成する関数
function createOption(n, part){
    // 重複を取り除くためのmap
    let arr = []
    res = `<option></option>`
    for (let i = 0; i < n.length; i++){
        let current = n[i][part]
        if (!arr.includes(current)){
            res += `<option>${current}</option>`
            arr.push(current)
        }
    }
    return res;
}

// optionを実装する関数(項目ごとの依存関係を解決することはない)
function addOption(parts, element, parent){
    fetch(config.url + "?type=" + parts).then(response => response.json().then(data =>{
        parent.innerHTML = createOption(data, element)
        console.log(data[0])
    }))
}

// addOption("cpu", "Brand", config.cpuBrand);
// addOption("cpu", "Model", config.cpuModel);
// addOption("gpu", "Brand", config.gpuBrand);
addOption("ram", "Model", config.memoryModel);
addOption("ssd", "Model", config.storageModel);


// clear button の機能実装
config.clear.addEventListener("click", function(){
    config.results.innerHTML = "";
    config.pcNumber = 1;
})


// getMemoryCountをテストする処理
// fetch(config.url + "?type=ram").then(response => response.json().then(data =>{
//     for (let i in data) {
//         current = data[i]
//         console.log(getMemoryCount(data[i]["Model"]));
//     }
// }))
// memoryの文字列を解析してmemoryの本数をとる関数
function getMemoryCount(model){
    return model.substring(model.lastIndexOf(" ")+1, model.lastIndexOf("x"));
}

// getTotalMemoryCapacityをテストする処理
// fetch(config.url + "?type=ram").then(response => response.json().then(data =>{
//     for (let i in data) {
//         current = data[i]
//         console.log(getTotalMemoryCapacity(data[i]["Model"]));
//     }
// }))
// memoryの合計容量をとる関数 内部でgetMemoryCountを使用
function getTotalMemoryCapacity(model){
    let indexToUnit = model.length-2
    let count = getMemoryCount(model)

    let unit = model.substring(indexToUnit);
    let total = (parseInt(count) * parseInt(model.substring(model.lastIndexOf("x")+1, indexToUnit))).toString();
    return total + unit
}


// getStorageCapacityをテストする処理
// fetch(config.url + "?type=" + "ssd").then(response => response.json().then(data =>{
//     for(let i in data) {
//         current = data[i]
//         console.log(getStorageCapacity(data[i]["Model"]))
//     }
// }))
// storage文字列を解析する関数capacityを取得する
function getStorageCapacity(model){
    return model.substring(model.lastIndexOf(" ")+1);
}


/*
一々fetchで読み込む形に変更
他にやり方があるかもしれないが取り敢えずそれでいく
optionの生成は取り敢えず関数を作ったのでOK
後はpartsごとにelementの変更による連携と
結果の計算関数を作る
*/