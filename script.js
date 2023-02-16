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
    storage: document.getElementById("storage"),
    storageBrand: document.getElementById("storageBrand"),
    storageModel: document.getElementById("storageModel"),
}

// optionを文字列として生成する関数
function createOption(n, part){
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

function addOption(parts, element, parent){
    fetch(config.url + "?type=" + parts).then(response => response.json().then(data =>{
        parent.innerHTML = createOption(data, element)
    }))
}

addOption("cpu", "Brand", config.cpuBrand);
addOption("cpu", "Model", config.cpuModel);
addOption("gpu", "Brand", config.gpuBrand);
addOption("ram", "Model", config.memoryModel);

/*
一々fetchで読み込む形に変更
他にやり方があるかもしれないが取り敢えずそれでいく
optionの生成は取り敢えず関数を作ったのでOK
後はpartsごとにelementの変更による連携と
結果の計算関数を作る
*/