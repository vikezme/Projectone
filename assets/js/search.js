{
    // Variables for calling Elements and attaching events listeners
    var searchFormEl = document.querySelector("#search-form")
    var modal = document.querySelector("#modal")
    var modalClose = document.querySelector("#close-btn")

    //The function that will trigger when the submit button is clicked
    function lyricSeach(event) {
        event.preventDefault()
        var searchInput = document.querySelector("#lyric-input")
        var Input = searchInput.value

        if (!Input) {
            showModal("You need a search input value!")
            return
        }

        /*This uses a function recommened by MDN
        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent

        This will replace any spaces between charcters with a +
        */
        var queryString = `output.html?q=${encodeURIComponent(Input).replace(
            /%20/g,
            "+"
        )}`

        location.assign(queryString)
    }

    //This function controls the when to display the modal hidden on the page.
    function showModal(msg) {
        var msgEl = document.querySelector("#message")
        msgEl.textContent = msg
        modal.style.display = "flex"
    }

    //This function closes the modal if the close button is clicked
    modalClose.onclick = function () {
        modal.style.display = "none"
    }

    //This function closes the modal background is clicked
    window.onclick = function (e) {
        if (e.target.parentElement == modal) {
            modal.style.display = "none"
        }
    }

    //The button eventListener
    searchFormEl.addEventListener("submit", lyricSeach)
}
