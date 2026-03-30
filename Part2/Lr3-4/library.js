const fs = require("fs");
const path = require("path");

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
            issuedCopies: this.#issuedCopies
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
        try {
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
        } catch (error) {
            console.error("Ошибка сохранения данных:", error.message);
        }
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
        try {
            amount = Number(amount);

            if (!title || !author || !isbn || !Number.isInteger(amount) || amount <= 0) {
                throw new Error("Некорректные данные для добавления книги.");
            }

            let existingBook = this.findBookByISBN(isbn);

            if (existingBook) {
                existingBook.addCopies(amount);
                this.saveData();
                console.log(`Добавлено ${amount} экз. книги "${title}". Теперь всего: ${existingBook.totalCopies}`);
            } else {
                const newBook = new Book(this.generateBookId(), title, author, isbn, amount, 0);
                this.#books.push(newBook);
                this.saveData();
                console.log(`Книга "${title}" добавлена в библиотеку. Количество: ${amount}`);
            }
        } catch (error) {
            console.error("Ошибка addBook:", error.message);
        }
    }

    delBook(isbn, amount) {
        try {
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
                this.#books = this.#books.filter(b => b.isbn !== isbn);
                console.log(`Книга с ISBN ${isbn} полностью удалена из библиотеки.`);
            } else {
                console.log(`Удалено ${amount} экз. книги "${book.title}". Осталось всего: ${book.totalCopies}`);
            }

            this.saveData();
        } catch (error) {
            console.error("Ошибка delBook:", error.message);
        }
    }

    findBook(query) {
        try {
            if (!query) {
                throw new Error("Нужно указать ISBN, название или автора.");
            }

            const lowerQuery = String(query).toLowerCase();

            const result = this.#books.filter(book =>
                book.isbn === query ||
                book.title.toLowerCase().includes(lowerQuery) ||
                book.author.toLowerCase().includes(lowerQuery)
            );

            if (result.length === 0) {
                console.log("Книги не найдены.");
                return;
            }

            console.log("Найденные книги:");
            result.forEach(book => {
                console.log(`- ${book.title} | ${book.author} | ISBN: ${book.isbn} | Всего: ${book.totalCopies} | Выдано: ${book.issuedCopies} | Доступно: ${book.availableCopies}`);
            });
        } catch (error) {
            console.error("Ошибка findBook:", error.message);
        }
    }

    getBooks() {
        try {
            if (this.#books.length === 0) {
                console.log("Список книг пуст.");
                return;
            }

            console.log("Список книг в библиотеке:");
            this.#books.forEach(book => {
                console.log(`- ${book.title} | ${book.author} | ISBN: ${book.isbn} | Всего: ${book.totalCopies} | Выдано: ${book.issuedCopies} | Доступно: ${book.availableCopies}`);
            });
        } catch (error) {
            console.error("Ошибка getBooks:", error.message);
        }
    }

    addUser(surname, name, cardNumber) {
        try {
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

            console.log(`Пользователь ${user.fullName} добавлен.`);
        } catch (error) {
            console.error("Ошибка addUser:", error.message);
        }
    }

    delUser(cardNumber) {
        try {
            const user = this.findUserByCard(cardNumber);

            if (!user) {
                throw new Error(`Пользователь с номером карточки ${cardNumber} не найден.`);
            }

            if (user.books.length > 0) {
                throw new Error("Нельзя удалить пользователя, у которого на руках есть книги.");
            }

            this.#users = this.#users.filter(u => u.cardNumber !== cardNumber);
            this.saveData();

            console.log(`Пользователь с номером карточки ${cardNumber} удалён.`);
        } catch (error) {
            console.error("Ошибка delUser:", error.message);
        }
    }

    getUsers() {
        try {
            if (this.#users.length === 0) {
                console.log("Список пользователей пуст.");
                return;
            }

            console.log("Список пользователей:");
            this.#users.forEach(user => {
                console.log(`- ${user.fullName} | Карточка: ${user.cardNumber} | Книг на руках: ${user.books.length}`);
            });
        } catch (error) {
            console.error("Ошибка getUsers:", error.message);
        }
    }

    getUserBooks(cardNumber) {
        try {
            const user = this.findUserByCard(cardNumber);

            if (!user) {
                throw new Error(`Пользователь с номером карточки ${cardNumber} не найден.`);
            }

            if (user.books.length === 0) {
                console.log(`У пользователя ${user.fullName} нет книг на руках.`);
                return;
            }

            console.log(`Книги у пользователя ${user.fullName}:`);
            user.books.forEach(book => {
                console.log(`- ${book.title} | ${book.author} | ISBN: ${book.isbn}`);
            });
        } catch (error) {
            console.error("Ошибка getUserBooks:", error.message);
        }
    }

    issueBook(cardNumber, isbn) {
        try {
            const user = this.findUserByCard(cardNumber);
                        
            if (!user) {
                throw new Error(`Пользователь с номером карточки ${cardNumber} не найден.`);
            }
            
            if (user.hasBook(isbn)) {
    			throw new Error("Пользователь уже взял эту книгу.");
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
            console.log(`Книга "${book.title}" выдана пользователю ${user.fullName}.`);
        } catch (error) {
            console.error("Ошибка issueBook:", error.message);
        }
    }

    returnBook(cardNumber, isbn) {
        try {
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
            console.log(`Книга "${book.title}" возвращена пользователем ${user.fullName}.`);
        } catch (error) {
            console.error("Ошибка returnBook:", error.message);
        }
    }
}

function printHelp() {
    console.log(`
Доступные команды:

КНИГИ:
node library.js addBook "Название" "Автор" ISBN количество
node library.js delBook ISBN количество
node library.js findBook запрос
node library.js getBooks
node library.js issueBook номер_карточки ISBN
node library.js returnBook номер_карточки ISBN

ПОЛЬЗОВАТЕЛИ:
node library.js addUser "Фамилия" "Имя" номер_карточки
node library.js delUser номер_карточки
node library.js getUsers
node library.js userBooks номер_карточки

ДОПОЛНИТЕЛЬНО:
node library.js help
    `);
}

function main() {
    const library = new Library();
    const [,, command, ...args] = process.argv;

    switch (command) {
        case "addBook":
            library.addBook(args[0], args[1], args[2], args[3]);
            break;

        case "delBook":
            library.delBook(args[0], args[1]);
            break;

        case "findBook":
            library.findBook(args.join(" "));
            break;

        case "getBooks":
            library.getBooks();
            break;

        case "issueBook":
            library.issueBook(args[0], args[1]);
            break;

        case "returnBook":
            library.returnBook(args[0], args[1]);
            break;

        case "addUser":
            library.addUser(args[0], args[1], args[2]);
            break;

        case "delUser":
            library.delUser(args[0]);
            break;

        case "getUsers":
            library.getUsers();
            break;

        case "userBooks":
            library.getUserBooks(args[0]);
            break;

        case "help":
        default:
            printHelp();
            break;
    }
}

main();