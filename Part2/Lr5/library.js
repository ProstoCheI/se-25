const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());

const BOOKS_FILE = path.join(__dirname, "books.json");
const USERS_FILE = path.join(__dirname, "users.json");

class Book {
    #id;
    #title;
    #author;
    #isbn;
    #totalCopies;
    #issuedCopies;

    constructor(id, title, author, isbn, totalCopies = 1, issuedCopies = 0) {
        if (!id || !title || !author || !isbn) {
            throw new Error("Недостаточно данных для создания книги.");
        }

        if (!Book.validateISBN(isbn)) {
            throw new Error(`Некорректный ISBN: ${isbn}`);
        }

        if (!Number.isInteger(totalCopies) || totalCopies < 0) {
            throw new Error("Количество экземпляров должно быть целым числом >= 0.");
        }

        if (!Number.isInteger(issuedCopies) || issuedCopies < 0) {
            throw new Error("Количество выданных экземпляров должно быть целым числом >= 0.");
        }

        if (issuedCopies > totalCopies) {
            throw new Error("Выданных экземпляров не может быть больше общего количества.");
        }

        this.#id = id;
        this.#title = title;
        this.#author = author;
        this.#isbn = isbn;
        this.#totalCopies = totalCopies;
        this.#issuedCopies = issuedCopies;
    }

    static validateISBN(isbn) {
        const cleaned = String(isbn).replace(/[-\s]/g, "");
        return /^\d{10}(\d{3})?$/.test(cleaned);
    }

    get id() {
        return this.#id;
    }

    get title() {
        return this.#title;
    }

    set title(value) {
        if (!value || typeof value !== "string") {
            throw new Error("Название книги должно быть непустой строкой.");
        }
        this.#title = value;
    }

    get author() {
        return this.#author;
    }

    set author(value) {
        if (!value || typeof value !== "string") {
            throw new Error("Автор книги должен быть непустой строкой.");
        }
        this.#author = value;
    }

    get isbn() {
        return this.#isbn;
    }

    set isbn(value) {
        if (!Book.validateISBN(value)) {
            throw new Error("Некорректный ISBN.");
        }
        this.#isbn = value;
    }

    get totalCopies() {
        return this.#totalCopies;
    }

    set totalCopies(value) {
        if (!Number.isInteger(value) || value < 0) {
            throw new Error("Общее количество экземпляров должно быть целым числом >= 0.");
        }
        if (value < this.#issuedCopies) {
            throw new Error("Общее количество экземпляров не может быть меньше выданных.");
        }
        this.#totalCopies = value;
    }

    get issuedCopies() {
        return this.#issuedCopies;
    }

    get availableCopies() {
        return this.#totalCopies - this.#issuedCopies;
    }

    issueCopy() {
        if (this.availableCopies <= 0) {
            throw new Error(`Нет доступных экземпляров книги "${this.#title}".`);
        }
        this.#issuedCopies++;
    }

    returnCopy() {
        if (this.#issuedCopies <= 0) {
            throw new Error(`Все экземпляры книги "${this.#title}" уже находятся в библиотеке.`);
        }
        this.#issuedCopies--;
    }

    addCopies(amount) {
        if (!Number.isInteger(amount) || amount <= 0) {
            throw new Error("Количество добавляемых экземпляров должно быть целым числом > 0.");
        }
        this.#totalCopies += amount;
    }

    removeCopies(amount) {
        if (!Number.isInteger(amount) || amount <= 0) {
            throw new Error("Количество удаляемых экземпляров должно быть целым числом > 0.");
        }

        if (this.#totalCopies - amount < this.#issuedCopies) {
            throw new Error("Нельзя удалить экземпляры: часть книг сейчас выдана.");
        }

        this.#totalCopies -= amount;
    }

    toJSON() {
        return {
            id: this.#id,
            title: this.#title,
            author: this.#author,
            isbn: this.#isbn,
            totalCopies: this.#totalCopies,
            issuedCopies: this.#issuedCopies,
            availableCopies: this.availableCopies
        };
    }
}

class User {
    #surname;
    #name;
    #cardNumber;
    #books;

    constructor(surname, name, cardNumber, books = []) {
        if (!surname || !name || !cardNumber) {
            throw new Error("Недостаточно данных для создания пользователя.");
        }

        this.#surname = surname;
        this.#name = name;
        this.#cardNumber = cardNumber;
        this.#books = Array.isArray(books) ? books : [];
    }

    get surname() {
        return this.#surname;
    }

    set surname(value) {
        if (!value || typeof value !== "string") {
            throw new Error("Фамилия должна быть непустой строкой.");
        }
        this.#surname = value;
    }

    get name() {
        return this.#name;
    }

    set name(value) {
        if (!value || typeof value !== "string") {
            throw new Error("Имя должно быть непустой строкой.");
        }
        this.#name = value;
    }

    get cardNumber() {
        return this.#cardNumber;
    }

    get books() {
        return [...this.#books];
    }

    get fullName() {
        return `${this.#surname} ${this.#name}`;
    }

    getBook(bookInfo) {
        this.#books.push(bookInfo);
    }

    returnBook(isbn) {
        const index = this.#books.findIndex(book => book.isbn === isbn);
        if (index === -1) {
            throw new Error(`У пользователя нет книги с ISBN ${isbn}.`);
        }
        this.#books.splice(index, 1);
    }

    hasBook(isbn) {
        return this.#books.some(book => book.isbn === isbn);
    }

    toJSON() {
        return {
            surname: this.#surname,
            name: this.#name,
            cardNumber: this.#cardNumber,
            books: this.#books
        };
    }
}

class Admin extends User {
    constructor(surname, name, cardNumber, books = []) {
        super(surname, name, cardNumber, books);
    }

    get role() {
        return "admin";
    }

    getPermissions() {
        return [
            "addBook",
            "delBook",
            "findBook",
            "issueBook",
            "returnBook",
            "addUser",
            "delUser",
            "getUsers",
            "getBooks"
        ];
    }
}

class Library {
    #books;
    #users;

    constructor() {
        this.#books = [];
        this.#users = [];
        this.loadData();
    }

    loadData() {
        try {
            if (!fs.existsSync(BOOKS_FILE)) {
                fs.writeFileSync(BOOKS_FILE, "[]", "utf8");
            }
            if (!fs.existsSync(USERS_FILE)) {
                fs.writeFileSync(USERS_FILE, "[]", "utf8");
            }

            const booksRaw = JSON.parse(fs.readFileSync(BOOKS_FILE, "utf8"));
            const usersRaw = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));

            this.#books = booksRaw.map(
                b => new Book(b.id, b.title, b.author, b.isbn, b.totalCopies, b.issuedCopies)
            );

            this.#users = usersRaw.map(
                u => new User(u.surname, u.name, u.cardNumber, u.books)
            );
        } catch (error) {
            console.error("Ошибка загрузки данных:", error.message);
            this.#books = [];
            this.#users = [];
        }
    }

    saveData() {
        fs.writeFileSync(
            BOOKS_FILE,
            JSON.stringify(this.#books.map(book => book.toJSON()), null, 4),
            "utf8"
        );

        fs.writeFileSync(
            USERS_FILE,
            JSON.stringify(this.#users.map(user => user.toJSON()), null, 4),
            "utf8"
        );
    }

    generateBookId() {
        return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
    }

    findBookByISBN(isbn) {
        return this.#books.find(book => book.isbn === isbn);
    }

    findUserByCard(cardNumber) {
        return this.#users.find(user => user.cardNumber === cardNumber);
    }

    addBook(title, author, isbn, amount) {
        amount = Number(amount);

        if (!title || !author || !isbn || !Number.isInteger(amount) || amount <= 0) {
            throw new Error("Некорректные данные для добавления книги.");
        }

        let existingBook = this.findBookByISBN(isbn);

        if (existingBook) {
            existingBook.addCopies(amount);
            this.saveData();
            return {
                message: `Добавлено ${amount} экз. книги "${title}".`,
                book: existingBook.toJSON()
            };
        } else {
            const newBook = new Book(this.generateBookId(), title, author, isbn, amount, 0);
            this.#books.push(newBook);
            this.saveData();
            return {
                message: `Книга "${title}" добавлена в библиотеку.`,
                book: newBook.toJSON()
            };
        }
    }

    delBook(isbn, amount) {
        amount = Number(amount);

        if (!isbn || !Number.isInteger(amount) || amount <= 0) {
            throw new Error("Некорректные данные для удаления книги.");
        }

        const book = this.findBookByISBN(isbn);
        if (!book) {
            throw new Error(`Книга с ISBN ${isbn} не найдена.`);
        }

        if (amount > book.totalCopies) {
            throw new Error("Нельзя удалить больше экземпляров, чем есть в библиотеке.");
        }

        book.removeCopies(amount);

        if (book.totalCopies === 0) {
            const removedTitle = book.title;
            this.#books = this.#books.filter(b => b.isbn !== isbn);
            this.saveData();
            return {
                message: `Книга "${removedTitle}" полностью удалена из библиотеки.`
            };
        }

        this.saveData();
        return {
            message: `Удалено ${amount} экз. книги "${book.title}".`,
            book: book.toJSON()
        };
    }

    findBook(query) {
        if (!query) {
            throw new Error("Нужно указать ISBN, название или автора.");
        }

        const lowerQuery = String(query).toLowerCase();

        const result = this.#books.filter(book =>
            book.isbn === query ||
            book.title.toLowerCase().includes(lowerQuery) ||
            book.author.toLowerCase().includes(lowerQuery)
        );

        return result.map(book => book.toJSON());
    }

    getBooks() {
        return this.#books.map(book => book.toJSON());
    }

    getBookByISBN(isbn) {
        const book = this.findBookByISBN(isbn);
        if (!book) {
            throw new Error(`Книга с ISBN ${isbn} не найдена.`);
        }
        return book.toJSON();
    }

    addUser(surname, name, cardNumber) {
        if (!surname || !name || !cardNumber) {
            throw new Error("Некорректные данные для добавления пользователя.");
        }

        const existingUser = this.findUserByCard(cardNumber);
        if (existingUser) {
            throw new Error(`Пользователь с номером карточки ${cardNumber} уже существует.`);
        }

        const user = new User(surname, name, cardNumber);
        this.#users.push(user);
        this.saveData();

        return {
            message: `Пользователь ${user.fullName} добавлен.`,
            user: user.toJSON()
        };
    }

    delUser(cardNumber) {
        const user = this.findUserByCard(cardNumber);

        if (!user) {
            throw new Error(`Пользователь с номером карточки ${cardNumber} не найден.`);
        }

        if (user.books.length > 0) {
            throw new Error("Нельзя удалить пользователя, у которого на руках есть книги.");
        }

        this.#users = this.#users.filter(u => u.cardNumber !== cardNumber);
        this.saveData();

        return {
            message: `Пользователь с номером карточки ${cardNumber} удалён.`
        };
    }

    getUsers() {
        return this.#users.map(user => ({
            surname: user.surname,
            name: user.name,
            fullName: user.fullName,
            cardNumber: user.cardNumber,
            booksCount: user.books.length
        }));
    }

    getUser(cardNumber) {
        const user = this.findUserByCard(cardNumber);

        if (!user) {
            throw new Error(`Пользователь с номером карточки ${cardNumber} не найден.`);
        }

        return {
            surname: user.surname,
            name: user.name,
            fullName: user.fullName,
            cardNumber: user.cardNumber,
            books: user.books
        };
    }

    getUserBooks(cardNumber) {
        const user = this.findUserByCard(cardNumber);

        if (!user) {
            throw new Error(`Пользователь с номером карточки ${cardNumber} не найден.`);
        }

        return {
            fullName: user.fullName,
            cardNumber: user.cardNumber,
            books: user.books
        };
    }

    issueBook(cardNumber, isbn) {
        const user = this.findUserByCard(cardNumber);
        if (!user) {
            throw new Error(`Пользователь с номером карточки ${cardNumber} не найден.`);
        }

        const book = this.findBookByISBN(isbn);
        if (!book) {
            throw new Error(`Книга с ISBN ${isbn} не найдена.`);
        }

        book.issueCopy();

        user.getBook({
            title: book.title,
            author: book.author,
            isbn: book.isbn
        });

        this.saveData();

        return {
            message: `Книга "${book.title}" выдана пользователю ${user.fullName}.`,
            user: {
                fullName: user.fullName,
                cardNumber: user.cardNumber
            },
            book: book.toJSON()
        };
    }

    returnBook(cardNumber, isbn) {
        const user = this.findUserByCard(cardNumber);
        if (!user) {
            throw new Error(`Пользователь с номером карточки ${cardNumber} не найден.`);
        }

        const book = this.findBookByISBN(isbn);
        if (!book) {
            throw new Error(`Книга с ISBN ${isbn} не найдена в библиотеке.`);
        }

        user.returnBook(isbn);
        book.returnCopy();

        this.saveData();

        return {
            message: `Книга "${book.title}" возвращена пользователем ${user.fullName}.`,
            user: {
                fullName: user.fullName,
                cardNumber: user.cardNumber
            },
            book: book.toJSON()
        };
    }
}

const library = new Library();

function success(res, data, status = 200) {
    return res.status(status).json({
        success: true,
        ...data
    });
}

function fail(res, error, status = 400) {
    return res.status(status).json({
        success: false,
        error: error.message || String(error)
    });
}

app.get("/", (req, res) => {
    res.json({
        message: "Сервер библиотеки работает.",
        routes: {
            books: {
                getAll: "GET /books",
                search: "GET /books/search?query=Пушкин",
                getByIsbn: "GET /books/:isbn",
                add: "POST /books",
                addCopies: "PUT /books/:isbn/add",
                deleteCopies: "DELETE /books/:isbn"
            },
            users: {
                getAll: "GET /users",
                getByCard: "GET /users/:cardNumber",
                getUserBooks: "GET /users/:cardNumber/books",
                add: "POST /users",
                delete: "DELETE /users/:cardNumber"
            },
            library: {
                issueBook: "POST /library/issue",
                returnBook: "POST /library/return"
            }
        }
    });
});


app.get("/books", (req, res) => {
    try {
        const books = library.getBooks();
        success(res, { books });
    } catch (error) {
        fail(res, error);
    }
});

app.get("/books/search", (req, res) => {
    try {
        const { query } = req.query;
        const books = library.findBook(query);
        success(res, { books });
    } catch (error) {
        fail(res, error);
    }
});

app.get("/books/:isbn", (req, res) => {
    try {
        const { isbn } = req.params;
        const book = library.getBookByISBN(isbn);
        success(res, { book });
    } catch (error) {
        fail(res, error, 404);
    }
});

app.post("/books", (req, res) => {
    try {
        const { title, author, isbn, amount } = req.body;
        const result = library.addBook(title, author, isbn, amount);
        success(res, result, 201);
    } catch (error) {
        fail(res, error);
    }
});

app.put("/books/:isbn/add", (req, res) => {
    try {
        const { isbn } = req.params;
        const { amount } = req.body;

        const book = library.findBookByISBN(isbn);
        if (!book) {
            throw new Error(`Книга с ISBN ${isbn} не найдена.`);
        }

        const numericAmount = Number(amount);
        book.addCopies(numericAmount);
        library.saveData();

        success(res, {
            message: `Количество экземпляров книги "${book.title}" увеличено.`,
            book: book.toJSON()
        });
    } catch (error) {
        fail(res, error);
    }
});

app.delete("/books/:isbn", (req, res) => {
    try {
        const { isbn } = req.params;
        const { amount } = req.body;
        const result = library.delBook(isbn, amount);
        success(res, result);
    } catch (error) {
        fail(res, error);
    }
});


app.get("/users", (req, res) => {
    try {
        const users = library.getUsers();
        success(res, { users });
    } catch (error) {
        fail(res, error);
    }
});

app.get("/users/:cardNumber", (req, res) => {
    try {
        const { cardNumber } = req.params;
        const user = library.getUser(cardNumber);
        success(res, { user });
    } catch (error) {
        fail(res, error, 404);
    }
});

app.get("/users/:cardNumber/books", (req, res) => {
    try {
        const { cardNumber } = req.params;
        const result = library.getUserBooks(cardNumber);
        success(res, result);
    } catch (error) {
        fail(res, error, 404);
    }
});

app.post("/users", (req, res) => {
    try {
        const { surname, name, cardNumber } = req.body;
        const result = library.addUser(surname, name, cardNumber);
        success(res, result, 201);
    } catch (error) {
        fail(res, error);
    }
});

app.delete("/users/:cardNumber", (req, res) => {
    try {
        const { cardNumber } = req.params;
        const result = library.delUser(cardNumber);
        success(res, result);
    } catch (error) {
        fail(res, error);
    }
});

app.post("/library/issue", (req, res) => {
    try {
        const { cardNumber, isbn } = req.body;
        const result = library.issueBook(cardNumber, isbn);
        success(res, result);
    } catch (error) {
        fail(res, error);
    }
});

app.post("/library/return", (req, res) => {
    try {
        const { cardNumber, isbn } = req.body;
        const result = library.returnBook(cardNumber, isbn);
        success(res, result);
    } catch (error) {
        fail(res, error);
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});