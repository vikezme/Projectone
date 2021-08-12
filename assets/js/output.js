{
    // API Token Varibles, Add your tokens here for this project to function as expected
    // A live demo can be found at https://www.minusinfinite.id.au/shaztxt
    var ytAppToken = "GOOGLE_CLOUD_API_HERE"
    var genAppToken = "GENIUS_API_HERE"

    // Base API game for the Genius API, this is what allows this project to search for songs and lyrics
    var genApiUrl = "https://api.genius.com/search/?q="

    // Youtube Watch URL, this is used to build a link to video later in this script.
    var ytVidUrl = "https://www.youtube.com/watch?v="

    //HTML selectors for where the Titles, Images and Video link is generated.
    //Also the back button
    var output = document.querySelector("#output")
    var backBtn = document.querySelector("#back-btn")

    //HTML selectors for the the Modal and Model Close button.
    var modal = document.querySelector("#modal")
    var modalClose = document.querySelector("#close-btn")

    //Initialise an array for songs.
    var songs = []

    //Load the Google Client Javascript API, this allows the use of the setApiKey function
    gapi.load("client")

    //This will load access to the Youtube API once the GAPI Client library is loaded.
    async function loadClient() {
        gapi.client.setApiKey(`${ytAppToken}`)
        return gapi.client
            .load(
                "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"
            )
            .then(
                function () {
                    console.log("GAPI client loaded for API")
                },
                function (err) {
                    showModal(`Error loading GAPI client for API: ${err}`)
                }
            )
    }

    // This is a entention of common tasks required when creating new DOM elements.
    // As it will return an Element it is possible to reuse this when needing addtional child elements.
    function buildEl(tagName, elText, cssString, elAttr) {
        let el = document.createElement(tagName)
        el.className = cssString || ""
        el.textContent = elText || ""
        for (let i = 0; i < elAttr.length; i++) {
            el.setAttribute(
                elAttr[i].toString().split("#")[0],
                elAttr[i].toString().split("#")[1]
            )
        }
        return el
    }

    //Get a list of Songs from the Genius API
    //This is set and an Asynchronus functions forcing a hold to allow data to be collected.
    var getSongs = async function (value) {
        songs = []
        await fetch(`${genApiUrl}${value}&access_token=${genAppToken}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error(res.message)
                }
                return res.json()
            })
            .then((data) => {
                //For our project we only wanted 3 songs.
                //By default the API returns 10 and currently doesn't have a limit parameter.
                for (var i = 0; i < 3; i++) {
                    var title = data.response.hits[i].result.full_title
                    var img = data.response.hits[i].result.song_art_image_url
                    songs.push(title, img)
                }
            })
            .catch((err) => {
                showModal(`Issue getting Songs ${err}`)
            })
        return displaySongs(songs)
    }

    //Get Video's based on a given value
    //This is costly on API quoto at 100 quota point per search.
    //Given this app will do at least 3 searches it is possible to exceed 10,000 request quickly.
    var getVideos = async function (value) {
        var vidURL = ""
        await gapi.client.youtube.search
            .list({
                part: ["snippet"],
                maxResults: 1,
                q: `${value}`,
            })
            .then(
                function (response) {
                    vidURL = ytVidUrl + response.result.items[0].id.videoId
                },
                function (err) {
                    showModal(`Issue getting Youtube Links: ${err}`)
                }
            )
        return vidURL
    }

    // function to display songs.
    // This is set to Asynchronus so that it can call getVideos() and return a value
    async function displaySongs(arr) {
        output.textContent = ""
        var videoLink = ""
        //due to how a tile layout works in Bulma is is required to have a nexted For loop
        for (var i = 0; i < arr.length; i += 2) {
            //this builds the Box Component
            var el = buildEl("div", "", "tile is-child box", [])
            //this for will build the Video link, Title and Image inside the box.
            for (var j = 0; j < 1; j++) {
                await getVideos(arr[i]).then((result) => {
                    videoLink = result
                })
                var link = buildEl("a", arr[i], "", [`href#${videoLink}`])
                var titleEl = buildEl("h2", "", "title", [])
                var imgEl = buildEl("img", "", "", [`src#${arr[i + 1]}`])
                titleEl.appendChild(link)
                el.appendChild(titleEl)
                el.appendChild(imgEl)
            }
            //append the above to the DOM at the location of the Output.
            output.appendChild(el)
        }
    }

    //this function gets the Query when the output.html page is opened
    var getQuery = function () {
        var searchArr = ""

        if (!document.location.search) {
            showModal("No Search Query")
            return
        }

        searchArr = document.location.search.split("&")

        var query = searchArr[0].split("=").pop()

        getSongs(query)
    }

    //setup the back button to go to the index.html page
    backBtn.addEventListener("click", (e) => {
        location.assign("index.html")
    })

    //modal controls
    function showModal(msg) {
        var msgEl = document.querySelector("#message")
        msgEl.textContent = msg
        modal.style.display = "flex"
    }

    modalClose.onclick = function () {
        modal.style.display = "none"
    }

    window.onclick = function (e) {
        if (e.target.parentElement == modal) {
            modal.style.display = "none"
        }
    }

    //this triggers when the page is loaded.
    //This ensures the Google API Client is loaded then getQuery is called.
    //This allows the script to flow correctly and expectively.
    window.onload = function () {
        loadClient().then(() => {
            getQuery()
        })
    }
}
