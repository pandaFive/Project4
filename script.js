const config = {
    url:  "https://api.recursionist.io/builder/computers",
    cpuData: [],
    gpuData: [],
    memoryData: [],
    storageData: [],
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
        addOption(data, "Model", config.cpuModel);
        addOption(data, "Brand", config.cpuBrand);
        config.cpuData = data;
    }
    else if(part === "gpu"){
        addOption(data, "Model", config.gpuModel);
        addOption(data, "Brand", config.gpuBrand);
        config.gpuData = data;
    }
    else if(part === "ram"){
        data = addNumAndCapacity(data);
        addOption(data, "Model", config.memoryModel);
        addOption(data, "Brand", config.memoryBrand);
        addOption(data, "num", config.memoryNum);
        addOption(data, "capacity", config.memoryCapacity);
        config.memoryData = data;
    }
    else if(part === "hdd"){
        data = addNumAndCapacity(data);
        config.storageData = data;
    }
    else{
        data = addNumAndCapacity(data);
        data = data.concat(config.storageData)
        data.sort(function(a,b) {
            if (getCapacityGBNum(a.capacity) > getCapacityGBNum(b.capacity)) return -1;
            if (getCapacityGBNum(a.capacity) < getCapacityGBNum(b.capacity)) return 1;
            return 0
        });
        addOption(data, "Brand", config.storageBrand);
        addOption(data, "capacity", config.storageCapacity);
        addOption(data, "Model", config.storageModel);
        config.storageData = data;
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
    let cpu = config.cpuModel.value
    let gpu = config.gpuModel.value
    let ram = config.memoryModel.value
    let storage = config.storageModel.value

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
                        <p>CPU: <strong>${config.cpuBrand.value}</strong><br> ${getModel(config.cpuModel.value)}</p>
                        <p>GPU: <strong>${config.gpuBrand.value}</strong><br> ${getModel(config.gpuModel.value)}</p>
                        <p>Memory: <strong>${config.memoryBrand.value}</strong><br> ${getModel(config.memoryModel.value)}</p>
                        <p>Storage: <strong>${config.storageBrand.value}</strong><br> ${getModel(config.storageModel.value)}</p>
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
    let modelHTML = part === "cpu"? config.cpuModel: config.gpuModel;
    let brandHTML = part === "cpu"? config.cpuBrand: config.gpuBrand

    modelHTML.addEventListener("change", function(){
        let data = part === "cpu"? config.cpuData: config.gpuData;

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
    let data = part === "cpu"? config.cpuData: config.gpuData;

    brand = part === "cpu"? config.cpuBrand.value: config.gpuBrand.value;
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
    let brand = part === "cpu"? config.cpuBrand: config.gpuBrand;
    let model = part === "cpu"? config.cpuModel: config.gpuModel;
    brand.addEventListener("change", function(){
        changeOption(dataProcessorForCpuOrGpu(part), "Model",  model);
    })
}
changeCpuOrGpuModel("cpu");
changeCpuOrGpuModel("gpu");


// memory storageのvalueが変化したときの挙動を実装する関数
function behaviorChangeRamModelOrStorageModel(part){
    let model = part === "ram"? config.memoryModel:config.storageModel;

    parent.addEventListener("change", function(){
        value = getModel(model.value);
        data = part === "ram"? config.memoryData: config.storageData;
        brand = part === "ram"? config.memoryBrand: config.storageBrand;
        capacity = part === "ram"? config.memoryCapacity: config.storageCapacity;

        for(let i = 0; i < data.length; i++){
            let current = data[i];
            if (current["Model"] === value){
                brand.value = current["Brand"];
                capacity.value = current["capacity"];
                if (part === "ram"){
                    config.memoryNum.value = current["num"];
                }
                else{
                    config.storageType.value = current["Type"];
                }
            }
        }
    })
}
behaviorChangeRamModelOrStorageModel("ram");
behaviorChangeRamModelOrStorageModel("storage");

// ram model ようのoption array を作る関数
function dataProcessorForRamModel(){
    let data = config.memoryData;

    let num = config.memoryNum.value;
    let capacity = config.memoryCapacity.value;
    let brand = config.memoryBrand.value;

    let res = []

    for(let i = 0; i < data.length; i++){
        let current = data[i];
        if ((num === "" || current["num"] === num) && (capacity === "" || current["capacity"] === capacity) && (brand === "" || current["Brand"] === brand)){
            res.push(current);
        }
    }
    return res;
}

// ram model ようのoption array を作る関数
function dataProcessorForStorageModel(){
    let data = config.storageData;

    let type = config.storageType.value;
    let capacity = config.storageCapacity.value;
    let brand = config.storageBrand.value;

    let res = []

    for(let i = 0; i < data.length; i++){
        let current = data[i];
        if ((type === "" || current["Type"] === type) && (capacity === "" || current["capacity"] === capacity) && (brand === "" || current["Brand"] === brand)){
            res.push(current);
        }
    }
    return res;
}

// 汎用memory option changer
function changeRamOption(element){
    let target;
    let value = "";
    let otherOneStr = "";
    let otherOne = "";
    let otherTwoStr = "";
    let otherTwo = "";

    switch (element){
        case "Brand":
            target = config.memoryBrand;
            value = config.memoryBrand.value;
            otherOneStr = "num";
            otherOne = config.memoryNum.value;
            otherTwoStr = "capacity";
            otherTwo = config.memoryCapacity.value;
            break;
        case "num":
            target = config.memoryNum;
            value = config.memoryNum.value;
            otherOneStr = "Brand";
            otherOne = config.memoryBrand.value;
            otherTwoStr = "capacity";
            otherTwo = config.memoryCapacity.value;
            break;
        case "capacity":
            target = config.memoryCapacity;
            value = config.memoryCapacity.value;
            otherOneStr = "Brand";
            otherOne = config.memoryBrand.value;
            otherTwoStr = "num";
            otherTwo = config.memoryNum.value;
            break
    }

    let data = config.memoryData;
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

// TODO: capacity num の降順表示をする。また後で。
// ramのevent listenerを実装
config.memoryBrand.addEventListener("change", function(){
    changeOption(dataProcessorForRamModel(), "Model", config.memoryModel)
    changeRamOption("num");
    changeRamOption("capacity");
})
config.memoryNum.addEventListener("change", function(){
    changeOption(dataProcessorForRamModel(), "Model", config.memoryModel)
    changeRamOption("Brand");
    changeRamOption("capacity");
})
config.memoryCapacity.addEventListener("change", function(){
    changeOption(dataProcessorForRamModel(), "Model", config.memoryModel)
    changeRamOption("Brand");
    changeRamOption("num");
})

// 汎用 storage option changer
function changeStorageOption(element){
    let target;
    let value = "";
    let otherOneStr = "";
    let otherOne = "";
    let otherTwoStr = "";
    let otherTwo = "";

    switch (element){
        case "Brand":
            target = config.storageBrand;
            value = config.storageBrand.value;
            otherOneStr = "Type";
            otherOne = config.storageType.value;
            otherTwoStr = "capacity";
            otherTwo = config.storageCapacity.value;
            break;
        case "Type":
            target = config.storageType;
            value = config.storageType.value;
            otherOneStr = "Brand";
            otherOne = config.storageBrand.value;
            otherTwoStr = "capacity";
            otherTwo = config.storageCapacity.value;
            break;
        case "capacity":
            target = config.storageCapacity;
            value = config.storageCapacity.value;
            otherOneStr = "Brand";
            otherOne = config.storageBrand.value;
            otherTwoStr = "Type";
            otherTwo = config.storageType.value;
            break
    }

    let data = config.storageData;
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

// storageのevent listenerを実装
config.storageBrand.addEventListener("change", function(){
    changeOption(dataProcessorForStorageModel(), "Model", config.storageModel)
    changeStorageOption("Type");
    changeStorageOption("capacity");
})
config.storageType.addEventListener("change", function(){
    changeOption(dataProcessorForStorageModel(), "Model", config.storageModel)
    changeStorageOption("Brand");
    changeStorageOption("capacity");
})
config.storageCapacity.addEventListener("change", function(){
    changeOption(dataProcessorForStorageModel(), "Model", config.storageModel)
    changeStorageOption("Brand");
    changeStorageOption("Type");
})



function dataProcessorForStorageModel(){
    let data = config.storageData;

    let type = config.storageType.value;
    let capacity = config.storageCapacity.value;
    let brand = config.storageBrand.value;

    let res = []

    for(let i = 0; i < data.length; i++){
        current = data[i];
        if ((type === "" || current["Type"] === type) && (capacity === "" || current["capacity"] === capacity) && (brand === "" || current["Brand"] === brand)){
            res.push(current);
        }
    }
    return res;
}
config.storageBrand.addEventListener("change", function(){
    changeOption(dataProcessorForStorageModel(), "Model", config.storageModel)
})
config.storageType.addEventListener("change", function(){
    changeOption(dataProcessorForStorageModel(), "Model", config.storageModel)
})
config.storageCapacity.addEventListener("change", function(){
    changeOption(dataProcessorForStorageModel(), "Model", config.storageModel)
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

/*
項目間の依存関係を実装する
*/