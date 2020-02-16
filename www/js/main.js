const app = {
    KEY: "PROFILES",
    deleteMe: null,
    profiles: [],
    savedProfiles: [],
    imgBaseURL: "http://griffis.edumedia.ca/mad9022/tundra/profiles/",
    BaseURL: "http://griffis.edumedia.ca/mad9022/tundra/get.profiles.php?gender=female",
    init: () => {
      //get profiles from URL
      app.getProfiles();
      //add click listeners for navigation
      app.addListeners();
      app.addGestures();
    },
    getProfiles: () => {
        var uri_dec = decodeURIComponent(app.BaseURL);
        console.log("Decoded URI: " + uri_dec);
        fetch(uri_dec)
        .then(response => response.json())
        .then(data => {
            app.profiles = data.profiles;
            console.log("PROFILES:",app.profiles);
        });
        setTimeout(() => {
            app.loadProfile();
        }, 400);
    },
    addListeners: () => {
      document.getElementById("btnHome").addEventListener("click", app.nav);
      document.getElementById("btnSaved").addEventListener("click", app.nav);
      document.getElementById("btnSaved").addEventListener("click", app.profileList);
    },
    loadProfile: () => {
        app.profiles.forEach(profile => {
            if(app.profiles.indexOf(profile) == 0){
                document.getElementById("cards").classList.remove("goLeft");
                document.getElementById("cards").classList.remove("goRight");
                document.getElementById("savedMsg").style.display = "none";
                document.getElementById("deleteMsg").style.display = "none";
                setTimeout(() => {
                    let srcImg = `${app.imgBaseURL}/${profile.avatar}`;
                    document.getElementById("imageProfile").setAttribute("src",srcImg);
                    document.getElementById("name").textContent = `${profile.first} ${profile.last}`;
                    document.getElementById("gender").textContent = profile.gender;
                    document.getElementById("distance").textContent = profile.distance;
                    let card = document.getElementById('cards');
                    card.setAttribute("data-index", profile.id);
                }, 200);
            }
        })
    },
    addGestures: ev => {
        let card = document.getElementById('cards');
        let tiny = new tinyshell(card);

        tiny.addEventListener("swipeleft", deleteCard);
        function deleteCard(ev) {
            console.log(ev);
            console.log("DELETE CARD");
            let div = ev.currentTarget;
            div.classList.add("goLeft");
            document.getElementById("deleteMsg").style.display = "block";
            setTimeout(() => {
                app.profiles.shift();
                console.log("Remaining PROFILES:",app.profiles);
                if(app.profiles.length < 3){
                    app.getProfiles();
                    console.log("New FetchCall After Delete");
                }else{
                    setTimeout(() => {
                        app.loadProfile(); 
                    }, 500);
                }
            }, 200);
        }
        tiny.addEventListener("swiperight", saveCard);
        function saveCard(ev) {
            console.log(ev.currentTarget);
            console.log("CARD SAVED");
            let div = ev.currentTarget;
            div.classList.add("goRight");
            document.getElementById("savedMsg").style.display = "block";
            app.profiles.findIndex(function(item, index){
                if(app.profiles.indexOf(item) == 0){
                let savedProfile = {
                    id: item.id,
                    fname: item.first,
                    lName: item.last,
                    img: item.avatar
                  };
                app.savedProfiles.push(savedProfile);
                sessionStorage.setItem(app.KEY, JSON.stringify(app.savedProfiles) );
                console.log(app.savedProfiles);
                
                app.profiles.shift();
                console.log("Remaining PROFILES:",app.profiles);
                    if(app.profiles.length < 3){
                        app.getProfiles();
                        console.log("New Fetchcall after Save");
                    }else{
                        setTimeout(() => {
                            app.loadProfile(); 
                        }, 500);
                    }
                }
            })
            setTimeout(() => {
                app.profileUpdate();
            }, 200);
        }
    },
    profileUpdate: ev => {
        if (sessionStorage.getItem(app.KEY)) {
            let str = sessionStorage.getItem(app.KEY);
            console.log(str);
            app.savedProfiles = JSON.parse(str);
        }
        if(app.profiles.length == 0){
            document.getElementById("defaultMsg").style.display = "block";
            document.getElementById("savedProfiles").style.display = "none";
        }else{
            document.getElementById("defaultMsg").style.display = "none";
            document.getElementById("savedProfiles").style.display = "block";
            let ul = document.getElementById("savedProfiles");
                ul.innerHTML = "";
            app.savedProfiles.forEach(item =>{
                console.log(item);
                let ul = document.getElementById("savedProfiles");
                    let li = document.createElement("li");
                    li.setAttribute("class", "list-item listCard");
                    let div = document.createElement("div");
                    div.setAttribute("class", "action-left");
                        let img = document.createElement("img");
                        let srcImg = `${app.imgBaseURL}/${item.img}`;
                        img.setAttribute("src", srcImg);            
                        img.setAttribute("alt", "profile");
                        img.setAttribute("class", "avatar");
                    div.appendChild(img);
                    let divText = document.createElement("div");
                    divText.setAttribute("class", "list-text text-padding");
                        let pName = document.createElement("p");
                        pName.textContent = `${item.fname} ${item.lName}`;
                    divText.appendChild(pName);
                    let divIcon = document.createElement("div");
                    divIcon.setAttribute("class", "action-right");
                        let icon = document.createElement("i");
                        icon.setAttribute("class", "icon delete");
                    divIcon.appendChild(icon);
                    li.appendChild(div);
                    li.appendChild(divText);
                    li.appendChild(divIcon);
                    li.setAttribute("card-index", item.id);
                    let tiny = new tinyshell(li);
                    tiny.addEventListener("swiperight", removeCard);
                    function removeCard(ev) {
                        console.log(ev);
                        console.log("CARD REMOVED");
                        ev.currentTarget.classList.add("sendRight");
                        let cardId = ev.currentTarget.getAttribute("card-index");
                        console.log("Removed card ID:",cardId);
                        app.deleteMe = cardId;
                        setTimeout(() => {
                                app.savedProfiles.forEach(function(item, index){
                                    if(item.id == app.deleteMe){
                                        app.savedProfiles.splice(app.savedProfiles.indexOf(item), 1);
                                        sessionStorage.setItem(app.KEY, JSON.stringify(app.savedProfiles) );
                                        console.log("Remaining SAVED PROFILES:",app.savedProfiles);
                                        app.profileUpdate();
                                    }
                                })
                            if(app.savedProfiles.length == 0){
                                document.getElementById("defaultMsg").style.display = "block";
                                document.getElementById("savedProfiles").style.display = "none";
                            }else{
                                app.profileUpdate();
                            }
                        }, 500);
                        console.log(app.savedProfiles);
                    }
                ul.appendChild(li);
            });
        }
    },
    nav: ev => {
      let btn = ev.target;
      let target = btn.getAttribute("data-target");
      console.log("Navigate to", target);
      if(target== "saved"){
        document.getElementById("btnHome").classList.remove("current");
      }
      document.querySelector(".page.active").classList.remove("active");
      document.getElementById(target).classList.add("active");
    }
  };
  const ready = "cordova" in window ? "deviceready" : "DOMContentLoaded";
  document.addEventListener(ready, app.init);