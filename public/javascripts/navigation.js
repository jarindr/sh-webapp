    setMenuClicked();

    function setMenuClicked() { //function for menu on state
        var curentFile = window.location.pathname.split("/").pop();
        if (curentFile == "") curentFile = "Default.aspx";
        $('ul.nav > li > a[href="/' + curentFile + '"]').parent().addClass('active');
    }