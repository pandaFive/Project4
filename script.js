const config = {
    url:  "https://api.recursionist.io/builder/computers",
    cpuData: [],
    gpuData: [],
    memoryData: [],
    hddData: [],
    ssdData: [],
    cpuBrand: document.getElementById("cpuBrand"),
    cpuModel: document.getElementById("cpuModel"),
    gpuBrand: document.getElementById("gpuBrand"),
    gpuModel: document.getElementById("gpuModel"),
    memoryNum: document.getElementById("memoryNum"),
    memoryCapacity: document.getElementById("memoryCapacity"),
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

// APIを取得する関数取得したデータはconfig.dataに保存される
function getAPI(part){
    fetch("https://api.recursionist.io/builder/computers?type=" + part)
        .then(response => response.json()
        .then(data =>{
            initialOption(data, part)
            if(part === "cpu") config.cpuData = data;
            else if(part === "gpu") config.gpuData = data;
            else if(part === "ram") config.memoryData = data;
            else if(part === "hdd") config.hddData = data;
            else config.ssdData = data;
        }));
}

// optionの初期化をする関数
function initialOption(data, part){
    if(part === "cpu"){
        addOption(data, "Model", config.cpuModel);
        addOption(data, "Brand", config.cpuBrand);
    }
    else if(part === "gpu"){
        addOption(data, "Model", config.gpuModel);
        addOption(data, "Brand", config.gpuBrand);
    }
    else if(part === "ram"){
        addOption(data, "Model", config.memoryModel);
        addOption(data, "Brand", config.memoryBrand);
        addOption(data, "num", config.memoryNum);
        addOption(data, "capacity", config.memoryCapacity);
    }
    else if(part === "hdd"){
        addOption(data, "Brand", config.storageBrand);
        addOption(data, "capacity", config.storageCapacity);
        addOption(data, "Model", config.storageModel);
    }
    else{
        addOption(data, "Brand", config.storageBrand);
        addOption(data, "capacity", config.storageCapacity);
        addOption(data, "Model", config.storageModel);
    }
}

// 初期化関数(optionの初期化とconfig.dataのsetをする)
function initializer(){
    getAPI("cpu");
    getAPI("gpu");
    getAPI("ram");
    getAPI("hdd");
    getAPI("ssd");
}
initializer();

// optionを文字列として生成する関数
function createOption(APIData, element){
    // 重複を取り除くためのmap
    let arr = []
    res = `<option></option>`
    // partがssdの時戦闘の空白選択肢を削除
    if(APIData[0].Type === "SSD") res = "";
    for (let i = 0; i < APIData.length; i++){
        let current = APIData[i];
        let currentElement = current[element]
        if (!arr.includes(currentElement)){
            res += `<option>${currentElement}</option>`
            arr.push(currentElement)
        }
    }
    return res;
}

// optionを追加する
function addOption(data, element, parent){
    parent.innerHTML += createOption(data, element);
}

// optionを変更する関数(元の状態は削除される)
function changeOption(data, element, parent){
    parent.innerHTML = createOption(data, element);
}

// clear button の機能実装
config.clear.addEventListener("click", function(){
    config.results.innerHTML = "";
    config.pcNumber = 1;
})

// memoryの文字列を解析してmemoryの本数をとる関数
function getMemoryCount(model){
    return model.substring(model.lastIndexOf(" ")+1, model.lastIndexOf("x"));
}

// memoryの合計容量をとる関数 内部でgetMemoryCountを使用
function getTotalMemoryCapacity(model){
    let indexToUnit = model.length-2
    let count = getMemoryCount(model)

    let unit = model.substring(indexToUnit);
    let total = (parseInt(count) * parseInt(model.substring(model.lastIndexOf("x")+1, indexToUnit))).toString();
    return total + unit
}

// storage文字列を解析する関数capacityを取得する
function getStorageCapacity(model){
    return model.substring(model.lastIndexOf(" ")+1);
}

// 結果のタイプ Game or Workと各部品のbenchmark(int)を入力して結果を出力
function resultCalculator(type, cpu, gpu, memory, storage){
    const cpuPer = 0.6;
    const gpuPer = 0.25;
    let memoryPer = 0.125;
    let storagePer = 0.025;

    if (type == "Work"){
        memoryPer = 0.1;
        storagePer = 0.05;
    }

    return cpu*cpuPer + gpu* gpuPer + memory*memoryPer + storage*storagePer;
}

/*
初期化する関数をできた途中の変更を反映する関数を作る必要がある
またmemoryとstorageの数と容量をどうやって実装するかも考える必要があります
*/