const config = {
    url:  "https://api.recursionist.io/builder/computers",
    cpu:{data:[], Brand: document.getElementById("cpuBrand"), Model: document.getElementById("cpuModel")},
    gpu:{data:[], Brand: document.getElementById("gpuBrand"), Model: document.getElementById("gpuModel")},
    ram:{data:[], Brand: document.getElementById("memoryBrand"), Model: document.getElementById("memoryModel"), capacity: document.getElementById("memoryCapacity"), Num: document.getElementById("memoryNum")},
    storage:{data:[], Brand: document.getElementById("storageBrand"), Model: document.getElementById("storageModel"), capacity: document.getElementById("storageCapacity"), type: document.getElementById("storageType")},
    add: document.getElementById("addBtn"),
    clear: document.getElementById("clearBtn"),
    results: document.getElementById("results"),
    pcNumber: 1,
}
config.gpuModel
// 初期化関数(optionの初期化とconfig.dataのsetをする)
function initializer(){
    getAPI("cpu");
    getAPI("gpu");
    getAPI("ram");
    getAPI("hdd");
    getAPI("ssd");
}
initializer();

// APIを取得する関数取得したデータはconfig.dataに保存される
function getAPI(part){
    fetch("https://api.recursionist.io/builder/computers?type=" + part)
        .then(response => response.json()
        .then(data =>{
            initialOption(data, part)
        }));
}

// optionの初期化をする関数
function initialOption(data, part){
    if(part === "cpu"){
        addOption(data, "Model", config.cpu.Model);
        addOption(data, "Brand", config.cpu.Brand);
        config.cpu.data = data;
    }
    else if(part === "gpu"){
        addOption(data, "Model", config.gpu.Model);
        addOption(data, "Brand", config.gpu.Brand);
        config.gpu.data = data;
    }
    else if(part === "ram"){
        data = addNumAndCapacity(data);
        addOption(data, "Model", config.ram.Model);
        addOption(data, "Brand", config.ram.Brand);
        addOption(data, "num", config.ram.Num);
        addOption(data, "capacity", config.ram.capacity);
        config.ram.data = data;
    }
    else if(part === "hdd"){
        data = addNumAndCapacity(data);
        config.storage.data = data;
    }
    else{
        data = addNumAndCapacity(data);
        data = data.concat(config.storage.data)
        data.sort(function(a,b) {
            if (getCapacityGBNum(a.capacity) > getCapacityGBNum(b.capacity)) return -1;
            if (getCapacityGBNum(a.capacity) < getCapacityGBNum(b.capacity)) return 1;
            return 0
        });
        addOption(data, "Brand", config.storage.Brand);
        addOption(data, "capacity", config.storage.capacity);
        addOption(data, "Model", config.storage.Model);
        config.storage.data = data;
    }
}

// stringのTBとGBを単位をGBにそろえてintで返す
function getCapacityGBNum(capacityString){
    let num = parseInt(capacityString.substring(0, capacityString.length-2));
    if (capacityString.indexOf("T") !== -1){
        return 1000*num;
    }
    return num;
}

// ramとstorageのdataにcapacityを追加しramにはさらにnum(本数)を追加する
function addNumAndCapacity(data){
    let type = data[0]["Type"];
    if(type === "RAM"){
        for(let i = 0; i < data.length; i++){
            let current = data[i];
            current["num"] = getMemoryCount(current["Model"]);
            current["capacity"] = getTotalMemoryCapacity(current["Model"]);
        }
    }
    else if(type === "SSD" || type === "HDD"){
        for(let i = 0; i < data.length; i++){
            let current = data[i];
            current["capacity"] = getStorageCapacity(current["Model"]);
        }
    }
    return data;
}

// optionを追加する
function addOption(data, element, parent){
    parent.innerHTML += createOption(data, element);
}

// optionを文字列として生成する関数
function createOption(APIData, element){
    // 重複を取り除くためのmap
    let arr = []
    res = `<option></option>`

    for (let i = 0; i < APIData.length; i++){
        let current = APIData[i];
        let currentElement = current[element]
        if (!arr.includes(currentElement)){
            if (element === "Model"){
                res += `<option value="${currentElement + " " + current.Benchmark}">${currentElement}</option>`
            }
            else res += `<option>${currentElement}</option>`
            arr.push(currentElement)
        }
    }
    return res;
}

// optionを変更する関数(元の状態は削除される)
function changeOption(data, element, parent){
    parent.innerHTML = createOption(data, element);
}


/*
button関係の処理の実装
*/

config.add.addEventListener("click", function(){
    checkAdd();
})

// add button が有効なのか判定し有効ならそのまま続行、無効ならalert
function checkAdd(){
    let cpu = config.cpu.Model.value
    let gpu = config.gpu.Model.value
    let ram = config.ram.Model.value
    let storage = config.storage.Model.value

    if (cpu === "" || gpu === "" || ram === "" || storage === ""){
        alert("Modelが選択されていないパーツがあります")
        return;
    }
    else{
        let cpuBenchmark = getBenchmark(cpu);
        let gpuBenchmark = getBenchmark(gpu);
        let ramBenchmark = getBenchmark(ram);
        let storageBenchmark = getBenchmark(storage);

        let game = resultCalculator("game", cpuBenchmark, gpuBenchmark, ramBenchmark, storageBenchmark);
        let work = resultCalculator("work", cpuBenchmark, gpuBenchmark, ramBenchmark, storageBenchmark);

        config.results.innerHTML += createResult(game, work)
        config.pcNumber++;
    }
}

// 各step のmodelのvalueからbenchmarkをintで取得する関数
function getBenchmark(value){
    let res = value.substring(value.lastIndexOf(" ")+1);
    return parseInt(res);
}

// 各step のmodelのvalueからmodelをstringで取得する関数
function getModel(value){
    return value.substring(0, value.lastIndexOf(" "));
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

    return (cpu*cpuPer + gpu* gpuPer + memory*memoryPer + storage*storagePer).toFixed(2);
}

// resultのhtml(string)を生成する
function createResult(game, work){
    res = `
                <div class="my-3 ml-2 mr-0 row">
                    <!-- ナンバリング -->
                    <h5 class="col-sm-1">PC${config.pcNumber}</h5>
                    <!-- PCの構成 -->
                    <div class="col-sm-6">
                        <h6>PC${config.pcNumber} configuration</h6>
                        <p>CPU: <strong>${config.cpu.Brand.value}</strong><br> ${getModel(config.cpu.Model.value)}</p>
                        <p>GPU: <strong>${config.gpu.Brand.value}</strong><br> ${getModel(config.gpu.Model.value)}</p>
                        <p>Memory: <strong>${config.ram.Brand.value}</strong><br> ${getModel(config.ram.Model.value)}</p>
                        <p>Storage: <strong>${config.storage.Brand.value}</strong><br> ${getModel(config.storage.Model.value)}</p>
                    </div>
                    <!-- PCのスペック -->
                    <div class="col-sm-5">
                        <h6>PC${config.pcNumber} specs</h6>
                        <p>Gaming : ${game}%</p>
                        <p>Work : ${work}%</p>
                    </div>
                </div>
    `
    return res;
}

// clear button の機能実装
config.clear.addEventListener("click", function(){
    config.results.innerHTML = "";
    config.pcNumber = 1;
})


/*
依存関係の解決について
*/

// cpuかgpuのモデルがチェンジした時の挙動、パーツ名"cpu" or "gpu"を引数に取る
function changeCpuModelOrGpuModel(part){
    let parent = part === "cpu"? config.cpu: config.gpu;
    let modelHTML = parent.Model;
    let brandHTML = parent.Brand;

    modelHTML.addEventListener("change", function(){
        let data = parent.data;

        let model = getModel(modelHTML.value);
        let brand = ""
        for(let i = 0; i < data.length; i++){
            current = data[i]
            if (current["Model"] === model){
                brand = current["Brand"]
                break;
            }
        }
        brandHTML.value = brand;
    })
}
changeCpuModelOrGpuModel("cpu");
changeCpuModelOrGpuModel("gpu");

// cpuまたはgpuのbrandのvalueによってarrayを変化させる関数
function dataProcessorForCpuOrGpu(part){
    let parent = part === "cpu"? config.cpu: config.gpu;
    let data = parent.data;

    let brand = parent.Brand.value;
    if (brand === "") return data;

    res = [];
    for(let i = 0; i < data.length; i++){
        current = data[i];
        if(current["Brand"] === brand){
            res.push(current);
        }
    }
    return res;
}

// cpuとgpuのbrandが変化したときmodelのoptionを変える関数
function changeCpuOrGpuModel(part){
    let parent = part === "cpu"? config.cpu: config.gpu;
    let brand = parent.Brand;
    let model = parent.Model;
    brand.addEventListener("change", function(){
        changeOption(dataProcessorForCpuOrGpu(part), "Model",  model);
    })
}
changeCpuOrGpuModel("cpu");
changeCpuOrGpuModel("gpu");


// memory storageのmodelのvalueが変化したときの挙動を実装する関数
function behaviorChangeRamModelOrStorageModel(part){
    let parent = part === "ram"? config.ram: config.storage;
    let model = parent.Model;

    model.addEventListener("change", function(){
        value = getModel(model.value);
        data = parent.data;
        brand = parent.Brand;
        capacity = parent.capacity;

        for(let i = 0; i < data.length; i++){
            let current = data[i];
            if (current["Model"] === value){
                brand.value = current["Brand"];
                capacity.value = current["capacity"];
                if (part === "ram"){
                    config.ram.Num.value = current["num"];
                }
                else{
                    config.storage.type.value = current["Type"];
                }
            }
        }
    })
}
behaviorChangeRamModelOrStorageModel("ram");
behaviorChangeRamModelOrStorageModel("storage");

// ramかstorageのmodelのoptionを変更する為のarrayを生成する関数
function dataProcessorForStorageOrRamModel(part){
    let parent = part === "ram"? config.ram: config.storage;

    let data = parent.data;
    let brand = parent.Brand.value;
    let capacity = parent.capacity.value;

    let other = part === "ram"? parent.Num.value: parent.type.value;
    let othersStr = part === "ram"? "num": "Type";
    let res = []
    for (let i = 0; i < data.length; i++){
        let current = data[i];
        if ((other === "" || current[othersStr] === other) && (capacity === "" || current["capacity"]) && (brand === "" || current["Brand"] === brand)){
            res.push(current);
        }
    }
    return res
}

// 汎用 storage or memory option changer
function changeStorageOrRamOption(part, element){
    let parent = part === "ram"? config.ram: config.storage;
    let target;
    let value = "";
    let otherOneStr = "";
    let otherOne = "";
    let otherTwoStr = "";
    let otherTwo = "";

    let numOrType = part === "ram"? parent.Num: parent.type;
    let numOrTypeStr = part === "ram"? "num": "Type"

    switch (element){
        case "Brand":
            target = parent.Brand;
            value = parent.Brand.value;
            otherOneStr = numOrTypeStr;
            otherOne = numOrType.value;
            otherTwoStr = "capacity";
            otherTwo = parent.capacity.value;
            break;
        case numOrTypeStr:
            target = numOrType;
            value = numOrType.value;
            otherOneStr = "Brand";
            otherOne = parent.Brand.value;
            otherTwoStr = "capacity";
            otherTwo = parent.capacity.value;
            break;
        case "capacity":
            target = parent.capacity;
            value = parent.capacity.value;
            otherOneStr = "Brand";
            otherOne = parent.Brand.value;
            otherTwoStr = numOrTypeStr;
            otherTwo = numOrType.value;
            break
    }

    let data = parent.data;
    let res = []

    for(let i = 0; i < data.length; i++){
        let current = data[i]
        if((otherOne === "" || current[otherOneStr] === otherOne) && (otherTwo === "" || current[otherTwoStr] === otherTwo)){
            res.push(current)
        }
    }

    changeOption(res, element, target);
    target.value = value;
}

// ramのevent listenerを実装
config.ram.Brand.addEventListener("change", function(){
    changeOption(dataProcessorForStorageOrRamModel("ram"), "Model", config.ram.Model)
    changeStorageOrRamOption("ram", "num");
    changeStorageOrRamOption("ram", "capacity");
})
config.ram.Num.addEventListener("change", function(){
    changeOption(dataProcessorForStorageOrRamModel("ram"), "Model", config.ram.Model)
    changeStorageOrRamOption("ram", "Brand");
    changeStorageOrRamOption("ram", "capacity");
})
config.ram.capacity.addEventListener("change", function(){
    changeOption(dataProcessorForStorageOrRamModel("ram"), "Model", config.ram.Model)
    changeStorageOrRamOption("ram", "Brand");
    changeStorageOrRamOption("ram", "num");
})

// storageのevent listenerを実装
config.storage.Brand.addEventListener("change", function(){
    changeOption(dataProcessorForStorageOrRamModel("storage"), "Model", config.storage.Model)
    changeStorageOrRamOption("storage", "Type");
    changeStorageOrRamOption("storage", "capacity");
})
config.storage.type.addEventListener("change", function(){
    changeOption(dataProcessorForStorageOrRamModel("storage"), "Model", config.storage.Model)
    changeStorageOrRamOption("storage", "Brand");
    changeStorageOrRamOption("storage", "capacity");
})
config.storage.capacity.addEventListener("change", function(){
    changeOption(dataProcessorForStorageOrRamModel("storage"), "Model", config.storage.Model)
    changeStorageOrRamOption("storage", "Brand");
    changeStorageOrRamOption("storage", "Type");
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
    // Gold 8TB (256MB Cache 2017)などから余計な情報を取り除く
    let unitIndex = model.indexOf("TB") == -1? model.indexOf("GB"): model.indexOf("TB");
    model = model.substring(0, unitIndex+2)

    return model.substring(model.lastIndexOf(" ")+1);
}