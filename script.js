const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";
let temporaryMessage = "";

document.addEventListener("DOMContentLoaded", function () {
  const submitInput = document.getElementById("inputBook");
  submitInput.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  const submitButtonInfo = document.getElementById("inputBookIsComplete");
  submitButtonInfo.addEventListener("input", function (event) {
    event.preventDefault();
    buttonInfo();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function buttonInfo() {
  let textInfo = document.getElementById("submitButtonInfo");
  const checkbox = document.getElementById("inputBookIsComplete").checked;
  if (checkbox) {
    textInfo.innerText = "Sudah Selesai Dibaca";
    console.log();
  } else {
    textInfo.innerText = "Belum Selesai Dibaca";
  }
}

function addBook() {
  const bookTitle = document.getElementById("inputBookTitle").value;
  const bookAuthor = document.getElementById("inputBookAuthor").value;
  const bookYear = document.getElementById("inputBookYear").value;
  const bookIsCompleted = document.getElementById(
    "inputBookIsComplete"
  ).checked;

  const generatedId = generateId();
  const bookObject = generateBookObject(
    generatedId,
    bookTitle,
    bookAuthor,
    bookYear,
    bookIsCompleted
  );
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

document.addEventListener(RENDER_EVENT, function () {
  let completeBookAmount = 0;
  let incompleteBookAmount = 0;
  for (const bookItem of books) {
    if (!bookItem.isComplete) incompleteBookAmount++;
    else completeBookAmount++;
  }

  const incompleteBookshelfList = document.getElementById(
    "incompleteBookshelfList"
  );
  incompleteBookshelfList.innerHTML =
    incompleteBookAmount == 0 ? "<p>Tidak Ada Buku</p>" : "";

  const completeBookshelfList = document.getElementById(
    "completeBookshelfList"
  );
  completeBookshelfList.innerHTML =
    completeBookAmount == 0 ? "<p>Tidak Ada Buku</p>" : "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isComplete) incompleteBookshelfList.append(bookElement);
    else completeBookshelfList.append(bookElement);
  }
});

function makeBook(bookObject) {
  const textTitle = document.createElement("h2");
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = "Penulis: " + bookObject.author;

  const textYear = document.createElement("p");
  textYear.innerText = "Tahun: " + bookObject.year;

  const bookData = document.createElement("div");
  bookData.classList.add("book-data");
  bookData.append(textTitle, textAuthor, textYear);

  const bookAction = document.createElement("div");
  bookAction.classList.add("book-action");

  const bookItem = document.createElement("article");
  bookItem.classList.add("book-item");
  bookItem.append(bookData, bookAction);
  bookItem.setAttribute("id", `book-${bookObject.id}`);

  if (bookObject.isComplete) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");
    undoButton.innerHTML = '<i class="fa-solid fa-rotate-left"></i>';

    undoButton.addEventListener("click", function () {
      undoBookFromComplete(bookObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");
    trashButton.innerHTML = '<i class="fa-solid fa-trash"></i>';

    trashButton.addEventListener("click", function () {
      removeBookFromComplete(bookObject.id);
    });

    bookAction.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("check-button");
    checkButton.innerHTML = '<i class="fa-solid fa-check"></i>';

    checkButton.addEventListener("click", function () {
      addBookToComplete(bookObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");
    trashButton.innerHTML = '<i class="fa-solid fa-trash"></i>';

    trashButton.addEventListener("click", function () {
      removeBookFromComplete(bookObject.id);
    });

    bookAction.append(checkButton, trashButton);
  }

  return bookItem;
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }

  return null;
}

document
  .getElementById("searchBook")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const searchKey = document
      .getElementById("searchBookTitle")
      .value.toLowerCase();
    let bookItem = document.querySelectorAll(".book-item");

    bookItem.forEach((item) => {
      const itemValue = item.firstChild.firstChild.textContent.toLowerCase();

      if (itemValue.indexOf(searchKey) != -1) {
        item.setAttribute("style", "display: flex;");
      } else {
        item.setAttribute("style", "display: none;");
      }
    });
  });

function addBookToComplete(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBookFromComplete(bookId) {
  const bookTarget = findBookIndex(bookId);
  temporaryMessage = books[bookTarget].title;

  if (bookTarget == -1) return;

  if (
    confirm("Apakah benar ingin menghapus buku " + temporaryMessage + "?") ==
    true
  ) {
    books.splice(bookTarget, 1);
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromComplete(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }

  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function searchBook() {}
