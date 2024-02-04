function sanitize(string) {
  const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      "/": '&#x2F;',
  };
  const reg = /[&<>"'/]/ig;
  return string.replace(reg, (match)=>(map[match]));
}


// Test localStorage
function storageAvailable(type) {
  let storage;
  try {
    storage = window[type];
    const x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      // everything except Firefox
      (e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === "QuotaExceededError" ||
        // Firefox
        e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage &&
      storage.length !== 0
    );
  }
}

// error-safe localStorage
function setItem(id, value) {
    if (storageAvailable("localStorage")) {
        localStorage.setItem(id, value)
        return true
    }
    return false
}

function removeItem(id) {
     if (storageAvailable("localStorage")) {
        localStorage.removeItem(id)
        return true
    }
    return false
}

function getItem(id) {
    return localStorage.getItem(id)
}

function error(text) {
    var container = $("#error-container")
    if ($("#error-container").children() >= 3) {
        container.children().first().remove()
    }
    container.prepend(`<div class='error-text'><span>${sanitize(text)}</span></div>`)
    console.error(text)
}

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

function addNote(text) {
    var id = `noteid-${getRandomInt(0, 999999)}`
    var note = {
        content: text,
        id: id,
        done: false
    }
    setItem(id, JSON.stringify(note))
    $("#ultask").prepend(renderNote(note))
}

function markDone(id) {
    var data = JSON.parse(getItem(id))
    if (!data) {
        error("Data tidak ditemukan!")
    }
    data.done = !data.done
    setItem(id, JSON.stringify(data))
}

function getNote(id) {
    return JSON.parse(getItem(id))
}

function removeNote(id) {
    removeItem(id)
}

document.addEventListener("note.added", (e) => {
    $("#ultask").prepend(renderNote(e.detail))
})

document.addEventListener("note.remove", (e) => {
    // Handle note remove event
    var detail = e.detail
    $(`li > div[data-id="${sanitize(detail.id)}"]`).parent().remove()
    removeNote(id)
})

function getAllNotes() {
    var data = []
    for (let i = 0; i<=localStorage.length; i++) {
        data.push(localStorage.key(i))
    }
    return data
}

function renderNote(note) {
    html = `<li><div data-id="${sanitize(note.id)}">
<input type="image" src="static/Done.webp" class="done input">
<span class='${note.done ? 'note-done': ''}'>${sanitize(note.content)}</span>
<input type="image" src="static/delete.png" class='del right input'>
</div></li>`
    $('#ultask').prepend(html)
    $(`[data-id="${sanitize(note.id)}"] > .done`).on('click', () => {
        markDone(note.id)
        var newNote = getNote(note.id)
        if (!newNote.done) 
            $(`[data-id="${sanitize(note.id)}"] > span`).removeClass('note-done')
        if (newNote.done)
            $(`[data-id="${sanitize(note.id)}"] > span`).addClass('note-done')
    })
    $(`[data-id="${sanitize(note.id)}"] > .del`).on('click', () => {
        $(`li > div[data-id="${sanitize(note.id)}"]`).parent().remove()
        removeNote(note.id)
    })
}

document.addEventListener("DOMContentLoaded", () => {
    if (!storageAvailable("localStorage")) {
        error("Cannot load localStorage!")
        return
    }
    $("#sbmt").on('click', () => {
        var text = $("#inp").val()
        $("#inp").val("")
        addNote(text)
    })


    for (let i of getAllNotes()) {
        let data = JSON.parse(getItem(i))
        if (data) renderNote(data)
    }
})
