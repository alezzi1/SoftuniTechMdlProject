const kinveyBaseUrl = "https://baas.kinvey.com/";
const kinveyAppKey = "kid_HyI6vATc";
const kinveyAppSecret = "5e35540b0af04582b1c1e32136737d5b";

function showView(viewName) {
    $('main > section').hide();
    $('#' + viewName).show();
}
function showHideMenuLinks() {
    $("linkHome").show();
    if (sessionStorage.getItem('authToken') == null) {
        
        $("#linkPost").hide();
        $("#linkNewPost").hide();
        $("#linkLogIn").show();
        $("#linkSingIn").show();
        $("#linkLogOut").hide();
    } else {
        
        $("#linkPost").show();
        $("#linkNewPost").show();
        $("#linkLogIn").hide();
        $("#linkSingIn").hide();
        $("#linkLogOut").show();
    }
}
function showInfo(message) {
    $('#infoBox').text(message);
    $('#infoBox').show();
    setTimeout(function () { $('infoBox').fadeOut() }, 2500);
}
function showError(errorMsg) {
    $('#errorBox').text("Error: " + errorMsg);
    $('#errorBox').show();
    setTimeout(function () { $('errorBox').fadeOut() }, 2500);
}
$(function () {
    showHideMenuLinks();
    showView('viewHome');
    $("#linkHome").click(showHomeView);
    $("#linkPost").click(showPostView);
    $("#linkNewPost").click(showNewPostView);
    $("#linkLogIn").click(showLogInView);
    $("#linkSingIn").click(showSingInView);
    $("#linkLogOut").click(logout);

    $("#formLogin").submit(function(e) { e.preventDefault(); login(); });
    $("#formRegister").submit(function(e) { e.preventDefault(); register(); });
    $("#formCreatePost").submit(function(e) { e.preventDefault(); createPost(); });
    $(document).on({
        ajaxStart: function() { $("#loadingBox").show()},
        ajaxStop: function() { $("#loadingBox").hide()}
    });
});
function showHomeView() {
    showView('viewHome');
}
function showLogInView() {
    showView('viewLogIn');
}
function login() {
    const kinveyLoginUrl = kinveyBaseUrl + "user/" + kinveyAppKey + "/";
    const kinveyAuthHeaders = {
        'Authorization': "Basic " + btoa(kinveyAppKey + ":" + kinveyAppSecret)
    };
    let userData = {
        username: $('#loginUser').val(),
        password: $('#loginPass').val()
    };
    $.ajax({
        method: "POST",
        url: kinveyLoginUrl,
        headers: kinveyAuthHeaders,
        Data: userData,
        success: loginSuccess,
        error: handleAjaxError
    });
    function loginSuccess(response) {
        let userAuth = response._kmd.authtoken;
        sessionStorage.setItem('authToken',userAuth);
        showHideMenuLinks();
        showPostView();
        showInfo('Login sucessful.');
    }
}
function handleAjaxError(response) {
    let errorMsg = JSON.stringify(response);
    if (response.readyState === 0)
        errorMsg = "Cannot connect due network error.";
    if (response.responseJSON && response.responseJSON.description)
        errorMsg = response.responseJSON.description;
    showError(errorMsg);
}
function showSingInView() {
    showView('viewSingIn');
}
function register() {
    const kinveyRegisterUrl = kinveyBaseUrl + "user/" + kinveyAppKey + "/";
    const kinveyAuthHeaders = {
        'Authorization': "Basic " + btoa(kinveyAppKey + ":" + kinveyAppSecret)
    };
    let userData = {
        username: $('#registerUser').val(),
        password: $('#registerPass').val()
    };
    $.ajax({
        method: "POST",
        url: kinveyRegisterUrl,
        headers: kinveyAuthHeaders,
        data: userData,
        success: registerSuccess,
        error: handleAjaxError
    });
    function registerSuccess(response) {
        let userAuth = response._kmd.authtoken;
        sessionStorage.setItem('authToken', userAuth);
        showHideMenuLinks();
        showPostView();
        showInfo('User registration successful.');
    }
}
function showPostView() {
    $('#Posts').empty();
    showView('viewPost');
    const kinveyBooksUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + "/Posts";
    const kinveyAuthHeaders = {
        'Authorization': "Kinvey " + sessionStorage.getItem('authToken')
    };
    $.ajax({
        method: "GET",
        url: kinveyBooksUrl,
        headers: kinveyAuthHeaders,
        success: loadGamesSuccess,
        error: handleAjaxError
    });
}
function loadGamesSuccess(Posts) {
    showInfo('Posts loaded.');
    if (Posts.length == 0) {
        $('#Posts').text('No new posts on the site.');
    } else {
        let PostsTable = $('<table>')
            .append($('<tr>').append(
                '<th>Game name</th>',
                '<th>Genre</th>',
                '<th>Release Date</th>',
                '<th>Developer</th>',
                '<th>Our Raiting</th>',
                '<th>Post</th>')
            );
        for (let Post of Posts) {
            PostsTable.append($('<tr>').append(
                $('<td>').text(Post.name),
                $('<td>').text(Post.genre),
                $('<td>').text(Post.release),
                $('<td>').text(Post.developer),
                $('<td>').text(Post.raiting),
                $('<td>').text(Post.post))
            );
        }
        $('#Posts').append(PostsTable);
    }
}
function showNewPostView() {
    showView('viewNewPost');
}
function createPost() {
    const kinveyBooksUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + "/Posts";
    const kinveyAuthHeaders ={
        'Authorization': "Kinvey " + sessionStorage.getItem('authToken')
    };
    let bookData = {
        name: $('#gameName').val(),
        genre: $('#gameGenre').val(),
        release: $('#gameDate').val(),
        developer: $('#developer').val(),
        raiting: $('#raiting').val(),
        post: $('#post').val()
    };
    $.ajax({
        method: "POST",
        url: kinveyBooksUrl,
        headers: kinveyAuthHeaders,
        data: bookData,
        success: createPostsSuccess(),
        error: handleAjaxError
    });
    function createPostsSuccess(response) {
        showPostView();
        showInfo('Game review added');
    }
}
function logout() {
    sessionStorage.clear();
    showHideMenuLinks();
    showView();
}