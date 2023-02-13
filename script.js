const config = {
    url:  "https://api.recursionist.io/builder/computers"
}

fetch(config.url + "?type=cpu").then(response => response.json().then(data =>{
    console.log(data)
}))