(function () {

    let baseUrl = "https://baas.kinvey.com";
    let appKey = "kid_HyI6vATc";
    let appSecret = "5e35540b0af04582b1c1e32136737d5b";
    let _guestCredentials = "9a4f7319-7a0b-4f05-848a-e0ef7c237bb5.Qh/NzEG4MKzIqJ5+1dRPsL3s5EWpzRAB7gYPkY+W5yY=";

    let authService = new AuthorizationService(baseUrl, appKey, appSecret, _guestCredentials);
    let requester = new Requester(authService);

    const appUrl = kinveyServiceBaseUrl + "user/" + kinveyAppID;

    function showView(viewID) {
        $('main > section').hide();

        $('#' + viewID).show();
    }

    $(function () {
        showHideNavigationLinks();
        showView('viewHome');
        $('#link-home').click(showHomeView);
        $('#link-login').click(showLoginView);
        $('#link-register').click(showRegisterView);
        $('#link-list-books').click(listBooks);
        $('#link-create-books').click(showCreateBookView);
        $('#link-logout').click(logout);

        $('#formLogin').submit(function (e) {
            e.preventDefault();
            login()
        });
        $('#formRegister').submit(function (e) {
            e.preventDefault();
            register();
        });
        $('#form-createBook').submit(function (e) {
            e.preventDefault();
            createBook();
        });
        $('body').on("submit", ".formCreateComment", function (e) {
            e.preventDefault();
            let context = $(e.target);
            let bookData = context.find(".bookData").val();
            let commentText = context.find('.commentText').val();

            let commentAuthor = context.find(".commentAuthor").val();
            addBookComment(JSON.parse(bookData), commentText, commentAuthor);
        });
    });
    $(document).on({
        ajaxStart: function () {
            $('#loadingBox').show()
        },
        ajaxStop: function () {
            $('#loadingBox').hide()
        }
    })

    function showHideNavigationLinks() {
        let loggedIn = sessionStorage.getItem('authToken') != null;
        if (loggedIn) {

            $('#link-login').hide();
            $('#link-register').hide();
            $('#link-list-books').show();
            $('#form-createBook').show();
            $('#link-logout').show();


        }
        else {
            $('#link-register').show();
            $('#link-login').show();
            $('#link-home').show();
            $('#link-logout').hide();
            $('#link-list-books').hide();
            $('#form-createBook').hide();

        }
    }

    function showHomeView() {
        showView('viewHome')
    }

    function showLoginView() {
        showView('viewLogin')
    }

    function login() {
        let authBase64 = btoa(kinveyAppID + ':' + kinveyAppSecret);
        let appUrl = kinveyServiceBaseUrl + "user/" + kinveyAppID + '/login';
        $.ajax({
            method: "POST",
            url: appUrl,
            headers: {"Authorization": "Basic " + authBase64},
            data: {
                username: $('#loginUser').val(),
                password: $('#loginPass').val()
            },
            success: loginSuccess,
            error: handleAjaxError
        });
        function loginSuccess(data, status) {
            let userAuth = data._kmd.authtoken;
            sessionStorage.setItem('authToken', userAuth);
            listBooks();
            showHideNavigationLinks();
            showInfo('Login successful')
        }
    }

    function showInfo(message) {
        $('#infoBox').text(message);
        $('#infoBox').show();
        setTimeout(function () {
            $('#infoBox').fadeOut()
        }, 3000);
    }

    function showRegisterView() {
        showView('viewRegister');
    }

    function register() {
        let authBase64 = btoa(kinveyAppID + ':' + kinveyAppSecret);
        let appUrl = kinveyServiceBaseUrl + "user/" + kinveyAppID + '/';
        $.ajax({
            method: "POST",
            url: appUrl,
            data: {
                username: $('#registerUser').val(),
                password: $('#registerPass').val()
            },
            headers: {"Authorization": "Basic " + authBase64},
            success: function (response) {
                let userAuth = response._kmd.authtoken;
                sessionStorage.setItem('authToken', userAuth);
                showHideNavigationLinks();
                showInfo('User registration successful')
            },
            error: handleAjaxError
        });
    }


    function showListBooksView() {
        showView('viewListBook')
    }

    function showCreateBookView() {
        showView('viewCreateBook')
    }

    function createBook() {
        const kinveyBooksURL = kinveyServiceBaseUrl + 'appdata/' + kinveyAppID + '/books';
        const kinveyAuthHeaders = {"Authorization": "Kinvey " + sessionStorage.getItem('authToken')};
        let bookData = {
            title: $('#bookTitle').val(),
            author: $('#bookAuthor').val(),
            description: $('#bookAuthor').val(),

        };
        $.ajax({
            method: 'POST',
            url: kinveyBooksURL,
            headers: kinveyAuthHeaders,
            data: bookData,
            success: createBooksSuccess,
            error: handleAjaxError
        })
        function createBooksSuccess(books) {
            listBooks();
            showInfo('Book created.')

        }
    }

    function logout() {
        $.ajax({
            method: "POST",
            url: appUrl + '_logout',
            headers: {"Authorization": "Kinvey " + sessionStorage.clear()},
        });
        showHideNavigationLinks();
        showView('homeView')
    }

    function handleAjaxError(response) {
        let errorMessage = JSON.stringify(response);
        if (response.readyState == 0) {
            errorMessage = 'Cannot connect due to network error.';
        }
        if (response.responseJSON && response.responseJSON.description) {
            errorMessage = response.responseJSON.description;
        }
        showError(errorMessage)
    }

    function showError(errorMsg) {
        $('#errorBox').text('Error: ' + errorMsg);
        $('#errorBox').show();
    }

    function listBooks() {
        $('#books').empty();
        showView('viewListBook');

        const kinveyBooksURL = kinveyServiceBaseUrl + 'appdata/' + kinveyAppID + '/books';
        const kinveyAuthHeaders = {"Authorization": "Kinvey " + sessionStorage.getItem('authToken')};
        $.ajax({
            method: 'GET',
            url: kinveyBooksURL,
            headers: kinveyAuthHeaders,
            success: loadBooksSuccess,
            error: handleAjaxError
        })
        function loadBooksSuccess(books) {
            showInfo('Books loaded.')
            if (books.lenght == 0) $('#books').text('No books in the library')

            else {

                let booksTable = $('<table>')
                    .append($('<tr>').append(
                        '<th>Title</th>',
                        '<th>Author</th>',
                        '<th>Description</th>')
                    );
                for (let book of books) {
                    let current = book;
                    let row = $('<tr>').append($('<td></td>').text(book.title)).append($('<td></td>').text(book.author)).append($('<td></td>').text(book.description));

                    row.click(function () {
                        let row = $(this).next();
                        if (row.css('display') == 'none') {
                            row.fadeIn();
                            row.css('display', 'table-cell').css('background', '#85001f')
                            row.find('form div').css('display', 'inline-block');
                        } else {
                            row.fadeOut();
                            row.find($('input[type=text]')).val();
                        }
                    })

                    // generates a form for each book(row) with 3 divs each
                    // with 2 text inputs and 1 submit input

                    booksTable.append(row).append($('<td colspan="3" class="commentRow">').append(function () {
                        for (var ke in book.comments) {
                            if (book.comments.hasOwnProperty(ke)) {
                                $(this).append($("<div></div>").text(book.comments[ke].textComment), $("<div>").text(" --" + book.comments[ke].author));
                            }
                        }
                    }).append($('<form class="formCreateComment" style="display: inline-block">').append($('<div></div>').text("Comment: ").append($('<input type="text" class="commentText" required="true">'))
                    ).append($('<div></div>').text('Author: ').append($('<input type="text" class="commentAuthor" required="true">'))
                        .append($('<input type="hidden" class="bookData">').attr("value", JSON.stringify(book))
                        ).append($('<div></div>').append($('<input type="submit" class="commentSubmit" value="Add Comment">'))
                        )
                    )));

                }
                $('#books').append(booksTable)


            }
        }
    }

    function addBookComment(bookData, commentText, commentAuthor) {
        const kinveyBooksUrl = kinveyServiceBaseUrl + "appdata/" + kinveyAppID + "/books";
        const kinveyHeaders = {
            'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
            'Content-type': 'application/json'
        };
        if (!bookData.comments) {
            bookData.comments = [];
        }
        bookData.comments.push({textComment: commentText, author: commentAuthor});
        let stringy = JSON.stringify(bookData);

        $.ajax({
            method: "PUT",
            url: kinveyBooksUrl + '/' + bookData._id,
            headers: kinveyHeaders,
            data: stringy,
            success: addBookCommentSuccess,
            error: handleAjaxError
        });
        function addBookCommentSuccess(response) {
            listBooks();
            showInfo('Book comment added.')
        }
    }

    function showCommentBox() {
        $('#add-comment').show()
    }
});